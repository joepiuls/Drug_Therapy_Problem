import { create } from 'zustand';
import type { DTPReport } from '../types';

interface ReportState {
  reports: DTPReport[];
  loading: boolean;
  filters: {
    hospital?: string;
    category?: string;
    severity?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
  setReports: (reports: DTPReport[]) => void;
  setLoading: (loading: boolean) => void;
  setFilters: (filters: any) => void;
  setPagination: (pagination: any) => void;
  fetchReports: (token: string) => Promise<void>;
  submitReport: (reportData: any, token: string) => Promise<boolean>;
  updateReport: (id: string, updates: any, token: string) => Promise<boolean>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useReportStore = create<ReportState>((set, get) => ({
  reports: [],
  loading: false,
  filters: {},
  pagination: {
    current: 1,
    pages: 1,
    total: 0
  },

  setReports: (reports) => set({ reports }),
  setLoading: (loading) => set({ loading }),
  setFilters: (filters) => set({ filters }),
  setPagination: (pagination) => set({ pagination }),

  fetchReports: async (token: string) => {
    set({ loading: true });
    try {
      const { filters, pagination } = get();
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      queryParams.append('page', pagination.current.toString());

      const response = await fetch(`${API_URL}/reports?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        set({ 
          reports: data.reports,
          pagination: data.pagination,
          loading: false 
        });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Fetch reports error:', error);
      set({ loading: false });
    }
  },

  submitReport: async (reportData: any, token: string) => {
    try {
      const formData = new FormData();
      
      Object.entries(reportData).forEach(([key, value]) => {
        if (key === 'photos' && Array.isArray(value)) {
          value.forEach((file: File) => {
            formData.append('photos', file);
          });
        } else if (value !== null && value !== undefined) {
          formData.append(key, value as string);
        }
      });

      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      return response.ok;
    } catch (error) {
      console.error('Submit report error:', error);
      return false;
    }
  },

  updateReport: async (id: string, updates: any, token: string) => {
    try {
      const response = await fetch(`${API_URL}/reports/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        // Refresh reports after update
        await get().fetchReports(token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update report error:', error);
      return false;
    }
  },
}));