import { create } from 'zustand';
import type { User } from '../types';
import api from '../../utils/api';

interface UserState {
  users: User[];
  loading: boolean;
  setUsers: (users: User[]) => void;
  setLoading: (loading: boolean) => void;
  fetchUsers: () => Promise<void>;
  fetchPendingUsers: () => Promise<void>;
  approveUser: (userId: string, token: string) => Promise<void>;
  fetchAdminUsers: () => Promise<void>;
  deleteUser: (userId: string, token: string) => Promise<void>;
}



export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,
  setUsers: (users) => set({ users }),
  setLoading: (loading) => set({ loading }),



  fetchUsers: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/users/');

      if (response.status === 200) {
        const data = await response.data;
        set({ users: data.users, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      set({ loading: false });
    }
  },

  fetchPendingUsers: async () => {
    set({ loading: true });
    try {
      const response = await api.get(`/users/pending`);

      if (response.status === 200) {
        const data = await response.data;
        set({ users: data.users, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Fetch pending users error:', error);
      set({ loading: false });
    }
  },

  approveUser: async (userId: string, token: string) => {
    try {
      const response = await api.patch(`/users/${userId}/approve`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.status === 200) {

            set((state) => ({
              users: state.users.map((user) =>
                user._id === userId ? { ...user, approved: true } : user
              ),
            }));
            get().fetchUsers();
        }
    } catch (error) {
      console.error('Approve user error:', error);
    }     
    },

    fetchAdminUsers: async () => {
      set({ loading: true });
      try {
        const response = await api.get(`/users/hospital-admins`);

        if (response.status === 200) {
          const data = await response.data;
          set({ users: data.users, loading: false });
        } else {
          set({ loading: false });
        }
      } catch (error) {
        console.error('Fetch admin users error:', error);
        set({ loading: false });
      }
    },  

    deleteUser: async (userId: string, token: string) => {
      try {
        const response = await api.delete(`/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          set((state) => ({
            users: state.users.filter((user) => user._id !== userId),
          }));
          get().fetchUsers();
          
        }
      } catch (error) {
        console.error('Delete user error:', error);
      }
    },

}));
