import { create } from 'zustand';

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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  data: null,
  loading: false,

  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),

  fetchAnalytics: async (token: string) => {
    set({ loading: true });
    try {
      const response = await fetch(`${API_URL}/reports/analytics/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
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