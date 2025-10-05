import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Lock, Key, User } from 'lucide-react';

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
  const { user, logout } = useAuth();
  const { addToast, ToastContainer } = useToast();
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
      addToast('Please fill in the new password fields', 'error');
      return false;
    }
    if (newPassword.length < 6) {
      addToast('New password must be at least 6 characters', 'error');
      return false;
    }
    if (newPassword !== confirmPassword) {
      addToast('New password and confirmation do not match', 'error');
      return false;
    }
    if (adminMode) {
      if (!userId) {
        addToast('Please provide a target user ID to reset', 'error');
        return false;
      }
    } else {
      if (!currentPassword) {
        addToast('Please provide your current password', 'error');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    // Confirm admin action (simple safeguard)
    if (adminMode) {
      const ok = window.confirm('Are you sure you want to reset the password for this user? This will notify them.');
      if (!ok) return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload: any = { newPassword };
      if (adminMode) payload.userId = userId;
      else payload.currentPassword = currentPassword;

      const res = await fetch('/api/auth/reset-password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        addToast(data?.message || 'Failed to reset password', 'error');
        setLoading(false);
        return;
      }

      addToast(data?.message || (adminMode ? 'User password reset' : 'Password changed successfully'), 'success');

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // only clear userId if it wasn't passed as prop (i.e., admin used the input)
      if (!initialUserId) setUserId('');

      // Callback to parent
      onSuccess?.(data?.message);

      // If admin used the component in a modal, optionally close it
      if (onClose && adminMode) {
        onClose();
      }

      // For self-change: optionally force logout (invalidate session) if requested and logout function exists
      if (!adminMode && forceLogoutOnSelfChange) {
        try {
          // if your useAuth exposes logout, call it — otherwise just redirect to login
          if (typeof logout === 'function') {
            await logout();
          } else {
            // best-effort: remove token and redirect
            localStorage.removeItem('token');
          }
        } catch (err) {
          // ignore logout errors, redirect anyway
        } finally {
          navigate('/login');
        }
      } else if (!adminMode) {
        // redirect back to dashboard after a short delay for good UX
        setTimeout(() => navigate('/dashboard'), 900);
      }
    } catch (err) {
      console.error('Reset password error', err);
      addToast('Network error — please try again', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full">
      <ToastContainer />

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
