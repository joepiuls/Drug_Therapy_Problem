import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Menu, X, Guitar as Hospital, User } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const roleDisplayNames = {
    pharmacist: 'Pharmacist',
    hospital_admin: 'Hospital Admin',
    state_admin: 'State Admin',
    nafdac_admin: 'Nafdac Admin'
  };

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 lg:hidden"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <div className="flex items-center space-x-2">
              <Hospital className="h-6 w-6 text-primary-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
                  DTP Reporting Platform
                </h1>
                <p className="text-xs text-gray-600 hidden lg:block">
                  Ogun State Hospital Drug Therapy Problem Reporting
                </p>
              </div>
            </div>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600">{roleDisplayNames[user.role]}</p>
              </div>
              
              <div className="flex items-center space-x-1">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User size={16} className="text-primary-600" />
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-surface shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Hospital className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-gray-900">DTP Platform</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-gray-600 hover:text-gray-900"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {user && (
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">{roleDisplayNames[user.role]}</p>
                <p className="text-xs text-gray-500">{user.hospital}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-md"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  );
};