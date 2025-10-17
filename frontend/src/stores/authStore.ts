import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import api from '../../utils/api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<{}>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

interface RegisterData {
  name: string;
  lastname: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  hospital: string;
  registrationNumber: string;
}


export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ loading }),

      login: async (email: string, password: string) => {
        set({ loading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const data = await response.data;

          if (response.statusText.toLowerCase() === 'ok') {
            set({ 
              user: data.user, 
              token: data.token,
              loading: false 
            });
            return true;
          } else {
            set({ loading: false });
            return false;
          }
        } catch (error) {
          console.error('Login error:', error);
          set({ loading: false });
          return false;
        }
      },

      register: async (userData: RegisterData) => {
      set({ loading: true });
      try {
        const response = await api.post('/auth/register', userData);
        set({ loading: false });

        // ✅ Return both success and backend message
        return {
          success: true,
          message: response.data.message || 'Registration successful!',
        };
      } catch (error: any) {
        console.error('Registration error:', error);
        set({ loading: false });

        // ✅ Capture backend error message (400, 409, etc.)
        const message =
          error.response?.data?.message ||
          'Registration failed. Please try again.';

        return { success: false, message };
      }
},
          logout: () => {
            set({ user: null, token: null });
          },

          checkAuth: async () => {
            const { token } = get();
            if (!token) return;

            try {
              const response = await api.get('/auth/me', {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (response.statusText.toLowerCase() === 'ok') {
                const data = await response.data;
                set({ user: data.user });
              } else {
                set({ user: null, token: null });
              }
            } catch (error) {
              console.error('Auth check error:', error);
              set({ user: null, token: null });
            }
          },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user 
      }),
    }
  )
);