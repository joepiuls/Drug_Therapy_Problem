import { create } from 'zustand';
import api from  '../../utils/api';
interface AnalyticsData {
  categoryStats: { category: string; count: number }[];
  severityStats: { severity: string; count: number }[];
  trendStats: { date: string; count: number }[];
  hospitalStats: { hospital: string; count: number }[];
}

interface AnalyticsState {
  data: AnalyticsData | null;
  loading: boolean;
  setData: (data: AnalyticsData) => void;
  setLoading: (loading: boolean) => void;
  fetchAnalytics: (token: string) => Promise<void>;
}


export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  data: null,
  loading: false,

  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),

  fetchAnalytics: async (token: string) => {
    set({ loading: true });
    try {
      const response = await api.get('reports/analytics/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.statusText.toLowerCase() === 'ok') {
        const data = await response.data;
        set({ data, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Fetch analytics error:', error);
      set({ loading: false });
    }
  },
}));