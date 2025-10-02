import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PharmacistDashboard } from './PharmacistDashboard';
import { HospitalAdminDashboard } from './HospitalAdminDashboard';
import { StateAdminDashboard } from './StateAdminDashboard';
import { NafdacAdminDashboard } from './NafdacAdminDashboard';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'pharmacist':
      return <PharmacistDashboard />;
    case 'hospital_admin':
      return <HospitalAdminDashboard />;
    case 'state_admin':
      return <StateAdminDashboard />;
    case 'nafdac_admin':
      return <NafdacAdminDashboard />;
    default:
      return <div>Unknown role</div>;
  }
};