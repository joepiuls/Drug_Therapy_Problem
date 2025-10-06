import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Lock, Key, User } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';


export type ResetPasswordMode = 'self' | 'admin';

interface ResetPasswordProps {
  mode?: ResetPasswordMode;            // default 'self'
  userId?: string;                     // pre-fill when admin is resetting someone
  onSuccess?: (msg?: string) => void;  // callback after success
  onClose?: () => void;                // close modal / panel when used inside modal
  forceLogoutOnSelfChange?: boolean;   // if true, attempt to logout user after self password change
}

/**
 * ResetPassword component
 *
 * - Self reset: requires currentPassword + newPassword + confirmPassword
 * - Admin reset: admins can provide a userId + newPassword (no currentPassword)
 *
 * Uses your app's useAuth/useToast/Input/Button primitives.
 */
const ResetPassword: React.FC<ResetPasswordProps> = ({
  mode = 'self',
  userId: initialUserId = '',
  onSuccess,
  onClose,
  forceLogoutOnSelfChange = false
}) => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userId, setUserId] = useState(initialUserId);

  // UI state
  const [loading, setLoading] = useState(false);
  const [adminMode, setAdminMode] = useState<boolean>(mode === 'admin');

  // Admin-role check (client-side only; server enforces access)
  const adminRoles = ['hospital_admin', 'nafdac_admin', 'state_admin'];
  const isAdmin = !!user && adminRoles.includes(user.role);

  useEffect(() => {
    // If the component was mounted in 'admin' mode but the logged user is NOT admin, fall back to self.
    if (mode === 'admin' && !isAdmin) {
      setAdminMode(false);
    }
    // keep userId prop in sync if it changes externally
    setUserId(initialUserId);
  }, [mode, initialUserId, isAdmin]);

  // If not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const validate = (): boolean => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in the new password fields');
      return false;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match');
      return false;
    }
    if (adminMode) {
      if (!userId) {
        toast.error('Please provide a target user ID to reset');
        return false;
      }
    } else {
      if (!currentPassword) {
        toast.error('Please provide your current password');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  if (!validate()) return;

  if (adminMode) {
    const ok = window.confirm(
      'Are you sure you want to reset the password for this user? This will notify them.'
    );
    if (!ok) return;
  }

  setLoading(true);

  try {
    const payload: Record<string, any> = { newPassword };

    if (adminMode) {
      // prefer initialUserId prop (if provided) otherwise the user typed one
      if (initialUserId) payload.userId = initialUserId;
      else payload.userId = userId;
    } else {
      payload.currentPassword = currentPassword;
    }

    console.debug('Reset password payload:', payload, 'adminMode=', adminMode);

    // axios: api.patch(url, data, config)
    const res = await api.patch(
      '/auth/reset-password',
      payload,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      }
    );

    // success: axios returns here for 2xx
    const data = res.data;
    toast.success(data?.message || (adminMode ? 'User password reset' : 'Password changed successfully'));

    // Clear form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    if (!initialUserId) setUserId('');

    onSuccess?.(data?.message);

    if (onClose && adminMode) onClose();

    if (!adminMode && forceLogoutOnSelfChange) {
      try {
        if (typeof logout === 'function') {
          await logout();
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        // ignore
      } finally {
        navigate('/login');
      }
    } else if (!adminMode) {
      setTimeout(() => navigate('/dashboard'), 900);
    }
  } catch (err: any) {
    console.error('Reset password error', err);

    // Better error message: axios error has response.data with server message
    const serverMsg = err?.response?.data?.message;
    if (serverMsg) {
      toast.error(serverMsg);
    } else if (err?.message) {
      toast.error(err.message);
    } else {
      toast.error('Network error — please try again');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-full">

      <div className="w-full max-w-md mx-auto">
        <div className="bg-white py-6 px-6 shadow rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Reset Password</h2>
          <p className="text-sm text-gray-500 mb-4">
            {adminMode ? 'Reset password for another user' : 'Change your account password'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" aria-live="polite">
            {/* Admin toggle (only show if logged-in user is admin) */}
            {isAdmin && (
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-3 text-sm">
                  <input
                    id="adminModeToggle"
                    type="checkbox"
                    checked={adminMode}
                    onChange={() => setAdminMode((s) => !s)}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                    aria-label="Toggle admin reset mode"
                  />
                  <span>Admin reset mode</span>
                </label>
                <div className="text-xs text-gray-400">
                  {adminMode ? 'Resetting another user' : 'Resetting your own password'}
                </div>
              </div>
            )}

            {/* Admin-specific input */}
            {adminMode && (
              <Input
                label="Target User ID"
                type="text"
                icon={User}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Target user id (or paste here)"
                required
              />
            )}

            {/* Current password (self only) */}
            {!adminMode && (
              <Input
                label="Current password"
                type="password"
                icon={Lock}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
            )}

            <Input
              label="New password"
              type="password"
              icon={Key}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />

            <Input
              label="Confirm new password"
              type="password"
              icon={Key}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              required
            />

            <div className="flex items-center gap-3 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // prefer onClose if present, otherwise go back
                  if (onClose) onClose();
                  else navigate(-1);
                }}
              >
                Cancel
              </Button>

              <Button type="submit" loading={loading} fullWidth>
                {adminMode ? 'Reset user password' : 'Change password'}
              </Button>
            </div>
          </form>
        </div>

        <p className="text-xs text-gray-500 mt-3 text-center">
          Tip: choose a unique password and enable 2FA if available.
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
