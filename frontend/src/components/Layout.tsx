import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Menu, X, Guitar as HospitalIcon, User as UserIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Modal } from 'antd';
import ResetPassword from '../pages/ResetPassword'; // adjust path if needed

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Layout component
 * - Header (desktop) and mobile sidebar
 * - Integrated Reset Password modal (self mode)
 * - Logout handling + graceful navigation
 *
 * Accessibility & UX:
 * - aria-labels on interactive elements
 * - Escape / clicking overlay closes mobile sidebar
 * - Sidebar closes on navigation
 */

const ROLE_DISPLAY_NAMES: Record<string, string> = {
  pharmacist: 'Pharmacist',
  hospital_admin: 'Hospital Admin',
  state_admin: 'State Admin',
  nafdac_admin: 'NAFDAC Admin'
};

const Logo: React.FC = () => (
  <div className="flex items-center space-x-2">
    <img
      src="https://ik.imagekit.io/2mkt1hyrh/Ogun_State_logo.png?updatedAt=1758989862625"
      alt="Ogun State logo"
      className="w-20 h-20 object-contain"
    />
    <div className="hidden sm:block">
      <h1 className="text-lg font-semibold text-gray-900">DTP Reporting Platform</h1>
      <p className="text-xs text-gray-600 hidden lg:block">Ogun State Hospital Drug Therapy Problem Reporting</p>
    </div>
  </div>
);

const HeaderActions: React.FC<{
  onOpenReset: () => void;
  onLogout: () => void;
  userName?: string;
  role?: string;
}> = ({ onOpenReset, onLogout, userName, role }) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="hidden sm:block text-right">
        <p className="text-sm font-medium text-gray-900">{userName}</p>
        <p className="text-xs text-gray-600">{role ? ROLE_DISPLAY_NAMES[role] : ''}</p>
      </div>

      <div className="flex items-center space-x-1">
        <div
          className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center"
          aria-hidden
        >
          <UserIcon size={16} className="text-primary-600" />
        </div>

        <button
          onClick={onOpenReset}
          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-md"
          title="Reset Password"
          aria-label="Reset password"
        >
          Reset Password
        </button>

        <button
          onClick={onLogout}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
          title="Logout"
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};

const MobileSidebarContent: React.FC<{
  onClose: () => void;
  onOpenReset: () => void;
  onLogout: () => void;
  user?: { name?: string; role?: string; hospital?: string };
}> = ({ onClose, onOpenReset, onLogout, user }) => {
  return (
    <div className="p-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <UserIcon size={20} className="text-primary-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-600">{user?.role ? ROLE_DISPLAY_NAMES[user.role] : ''}</p>
          {user?.hospital && <p className="text-xs text-gray-500">{user.hospital}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => {
            onOpenReset();
            onClose();
          }}
          className="w-full flex items-center space-x-2 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md"
          aria-label="Reset password"
        >
          <UserIcon size={16} />
          <span>Reset Password</span>
        </button>

        <button
          onClick={() => {
            onLogout();
          }}
          className="w-full flex items-center space-x-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-md"
          aria-label="Logout"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);

  // close sidebar on route change for better UX
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (err) {
      // Optionally show a toast here if you have a toast context
      // addToast?.('Logout failed', 'error');
      /* swallow - still navigate to login to ensure user is out */
    } finally {
      setSidebarOpen(false);
      navigate('/login');
    }
  }, [logout, navigate]);

  const openResetModal = useCallback(() => setResetModalVisible(true), []);
  const closeResetModal = useCallback(() => setResetModalVisible(false), []);

  // memoized user info for stable renders
  const userInfo = useMemo(() => {
    return { name: user?.name, role: user?.role, hospital: user?.hospital };
  }, [user]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 lg:hidden"
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Logo />
          </div>

          {/* Header right actions (only shown if user is present) */}
          {user && (
            <HeaderActions
              onOpenReset={openResetModal}
              onLogout={handleLogout}
              userName={userInfo.name}
              role={userInfo.role}
            />
          )}
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <nav
        className={`fixed top-0 left-0 h-full w-80 bg-surface shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="navigation"
        aria-label="Mobile menu"
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HospitalIcon className="h-6 w-6 text-primary-600" />
            <span className="font-semibold text-gray-900">DTP Platform</span>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-gray-600 hover:text-gray-900"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <MobileSidebarContent
          onClose={() => setSidebarOpen(false)}
          onOpenReset={openResetModal}
          onLogout={handleLogout}
          user={userInfo}
        />
      </nav>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-64px)] flex-1">
        {children}
      </main>

      {/* Reset Password Modal (self mode)
          NOTE: AntD v5 uses `open` prop; if your AntD version expects `visible` rename accordingly */}
      <Modal
        title="Change password"
        open={resetModalVisible}
        onCancel={closeResetModal}
        footer={null}
        destroyOnClose
        maskClosable
        aria-labelledby="change-password-title"
      >
        <ResetPassword
          mode="self"
          onSuccess={() => {
            // ResetPassword uses your toast internally; close modal after success
            closeResetModal();
          }}
          onClose={closeResetModal}
          forceLogoutOnSelfChange={true}
        />
      </Modal>
    </div>
  );
};

export default Layout;
