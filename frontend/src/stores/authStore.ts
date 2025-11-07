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
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: RegisterData) => Promise<{success: boolean; message: string}>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

interface RegisterData {
  name: string;
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

      login: async (email, password) => {
        set({ loading: true });
        console.log(email, password)
        
        try {
          const { data } = await api.post<{ user: User; token: string }>('/auth/login', { email, password });
          set({ user: data.user, token: data.token, loading: false });
          return { success: true };
        } catch (err: any) {
          const message = err.response?.data?.message ?? 'Login failed';
          set({ loading: false });
          return { success: false, message };
        }
      },

      register: async (userData) => {
        set({ loading: true });
        try {
          const { data } = await api.post<{ message?: string }>('/auth/register', userData);
          set({ loading: false });
          return { success: true, message: data.message ?? 'Registered!' };
        } catch (err: any) {
          set({ loading: false });
          return { success: false, message: err.response?.data?.message ?? 'Registration failed' };
        }
      },

      logout: () => {
        set({ user: null, token: null });
        delete api.defaults.headers.common['Authorization'];
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const { data } = await api.get<{ user: User }>('/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ user: data.user });
        } catch {
          set({ user: null, token: null });
          delete api.defaults.headers.common['Authorization'];
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);