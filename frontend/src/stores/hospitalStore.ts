import { create } from 'zustand';
import type { Hospital } from '../types';

interface HospitalState {
  hospitals: Hospital[];
  loading: boolean;
  setHospitals: (hospitals: Hospital[]) => void;
  setLoading: (loading: boolean) => void;
  fetchHospitals: () => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useHospitalStore = create<HospitalState>((set) => ({
  hospitals: [],
  loading: false,

  setHospitals: (hospitals) => set({ hospitals }),
  setLoading: (loading) => set({ loading }),

  fetchHospitals: async () => {
    set({ loading: true });
    try {
      const response = await fetch(`${API_URL}/hospitals`);
      
      if (response.ok) {
        const data = await response.json();
        set({ hospitals: data.hospitals, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Fetch hospitals error:', error);
      set({ loading: false });
    }
  },
}));