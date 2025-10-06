import { create } from 'zustand';
import type { DTPReport } from '../types';
import api from '../../utils/api';

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
  addFeedback: (id:string, status: string, feedback: string, token: string) => Promise<boolean>;
  markReportAsResolved: (reportId: string, token: string) => Promise<boolean>;
  updateReport: (reportId: string, updates: any, token: string) => Promise<boolean>;
}



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

      const response = await api.get(`/reports?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        const data = await response.data;

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
      if (key === "photos" && Array.isArray(value)) {
        value.forEach((file: File) => formData.append("photos", file));
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const response = await api.post("/reports", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.data;
    set({
      reports: data.reports,
      pagination: data.pagination,
      loading: false
    });
    return response.status === 200 || response.status === 201;
  } catch (error) {
    console.error("Submit report error:", error);
    return false;
  }
},

  updateReport: async (id: string, updates: any, token: string) => {
    try {
      const response = await api.patch(`/reports/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.status === 200 || response.status === 201) {
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

  markReportAsResolved: async (reportId: string, token: string) => {
    try {
      const response = await api.post(`/reports/${reportId}/resolve`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        // Refresh reports after marking as resolved
        await get().fetchReports(token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Mark report as resolved error:', error);
      return false;
    }
  },

  addFeedback: async (reportId: string, status: string, feedback: string | '', token: string) => {
    try {
      const response = await api.patch(`/reports/${reportId}`, { status, feedback });

      if (response.status === 200 || response.status === 201) {
        // Refresh reports after adding feedback
        await get().fetchReports(token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Add feedback error:', error);
      return false;
    }
  },

}));