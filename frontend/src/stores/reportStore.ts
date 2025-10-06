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

let currentController: AbortController | null = null;



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

  // inside your reportStore.ts (Zustand style)


fetchReports: async (token: string) => {
  // defensive: don't start without a token
  if (!token) {
    console.debug('fetchReports: missing token, skipping');
    return;
  }

  set({ loading: true });

  // abort any previous in-flight request
  if (currentController) {
    try { currentController.abort(); } catch (_) { /* ignore */ }
    currentController = null;
  }
  currentController = new AbortController();
  const signal = currentController.signal;

  try {
    const { filters = {}, pagination = {} } = get() as any;

    // Defensive defaults
    const page = (pagination && typeof pagination.current === 'number') ? pagination.current : 1;
    const limit = (pagination && typeof pagination.limit === 'number') ? pagination.limit : 10;

    const queryParams = new URLSearchParams();
    // append filters only if truthy
    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));

    // use your axios instance (named `api`) and pass the abort signal
    const response = await api.get(`/reports?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      // axios v0.22+ supports AbortController `signal`
      signal
    });

    // normalize the data shape
    const data = response?.data ?? {};
    const reports = Array.isArray(data.reports) ? data.reports : (Array.isArray(data) ? data : []);
    const returnedPagination = data.pagination ?? { current: page, limit };
    console.log(data);
    

    set({
      reports,
      pagination: returnedPagination,
      loading: false
    });
  } catch (err: any) {
    // Abort vs other errors
    const isAbort = err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED' || err?.message === 'canceled';
    if (isAbort) {
      console.debug('fetchReports aborted');
    } else {
      console.error('Fetch reports error:', err);
      // optionally store error in state: set({ error: err.message || 'Failed to fetch reports' })
    }
  } finally {
    set({ loading: false });
    // clear controller reference
    currentController = null;
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
        "Content-Type": "multipart/form-data",
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