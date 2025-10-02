import { create } from 'zustand';
import type { Hospital } from '../types';
import api from '../../utils/api';

interface HospitalState {
  hospitals: Hospital[];
  loading: boolean;
  setHospitals: (hospitals: Hospital[]) => void;
  setLoading: (loading: boolean) => void;
  fetchHospitals: () => Promise<void>;
}


export const useHospitalStore = create<HospitalState>((set) => ({
  hospitals: [],
  loading: false,
  setHospitals: (hospitals) => set({ hospitals }),
  setLoading: (loading) => set({ loading }),

  fetchHospitals: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/hospitals');

      if (response.statusText.toLowerCase() === 'ok') {
        const data = await response.data;
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