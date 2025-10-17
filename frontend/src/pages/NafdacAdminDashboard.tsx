// src/pages/NafdacDashboard.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useReportStore } from '../stores/reportStore';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { LoadingSpinner } from '../components/LoadingSpinner';
import fileDownload from 'js-file-download';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import type { DTPReport } from '../types';
import { dtpCategories, severityLevels, ogunStateHospitals } from '../data/hospitals';
import { toast } from 'sonner';
import Lightbox from '../components/Lightbox';

/* ... keep top-of-file comments if you want ... */

export const NafdacDashboard: React.FC = () => {
  const { token } = useAuth();
  const {
    reports: filteredReports,
    loading,
    filters,
    setFilters,
    fetchReports
  } = useReportStore();

  const {
    data: analyticsData,
    loading: analyticsLoading,
    fetchAnalytics
  } = useAnalyticsStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'analytics'>('overview');

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);

  // Fetch when auth token or filters change
  useEffect(() => {
    if (token) {
      fetchReports(token);
      fetchAnalytics(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filters]);

  // helper to open lightbox for a report
  const openImagesForReport = (report: DTPReport, start = 0) => {
    // normalize possible photo fields (photo objects or URL strings)
    const images: string[] = (report.photos || [])
      .map((p: any) => {
        if (!p) return null;
        if (typeof p === 'string') return p;
        // common shapes: { url, thumbnailUrl, secure_url, publicId, fileId }
        return p.url || p.secure_url || p.thumbnailUrl || p.thumbnail || null;
      })
      .filter(Boolean) as string[];

    if (images.length === 0) {
      toast('No images for this report');
      return;
    }

    setLightboxImages(images);
    setLightboxStartIndex(Math.min(start, Math.max(0, images.length - 1)));
    setLightboxOpen(true);
  };

  // CSV export - keep fields regulators need; escape quotes
  const handleExportCSV = () => {
    if (!filteredReports || filteredReports.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Date',
      'Hospital',
      'Pharmacist',
      'Ward',
      'Category',
      'Severity',
      'Status',
      'Prescription Details',
      'Comments'
    ];

    const csvData = filteredReports.map((report: DTPReport) => {
      const category = report.dtpCategory + (report.customCategory ? ` - ${report.customCategory}` : '');
      const prescription = (report.prescriptionDetails || '').replace(/"/g, '""');
      const comments = (report.comments || '').replace(/"/g, '""');

      return [
        format(new Date(report.createdAt), 'yyyy-MM-dd HH:mm'),
        report.hospitalName || '',
        report.pharmacistName || '',
        report.ward || '',
        category,
        report.severity || '',
        report.status || '',
        `"${prescription}"`,
        `"${comments}"`,
      ].join(',');
    });

    const csv = [headers.join(','), ...csvData].join('\n');
    const filename = `nafdac_dtp_reports_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    fileDownload(csv, filename);
    toast.success('Exported CSV successfully');
  };

  // Analytics helpers - defensively return empty arrays
  const categoryStats = analyticsData?.categoryStats || [];
  const trendStats = analyticsData?.trendStats?.map((s: any) => ({
    month: format(new Date(s.date), 'MMM yyyy'),
    count: s.count
  })) || [];

  const getHospitalStats = () => {
    return analyticsData?.hospitalStats.map(stat => ({
      hospital: stat.hospital.length > 30 ? stat.hospital.substring(0, 30) + '...' : stat.hospital,
      count: stat.count
    })) || [];
  };

  // Severity distribution small summary computed from current filtered reports
  const severitySummary = useMemo(() => {
    const total = filteredReports.length || 0;
    return severityLevels.map(level => {
      const count = filteredReports.filter(r => r.severity === level.value).length;
      const pct = total > 0 ? (count / total) * 100 : 0;
      return { ...level, count, pct };
    });
  }, [filteredReports]);

  // Status overview computed from filteredReports
  const statusOverview = useMemo(() => {
    const total = filteredReports.length || 0;
    const statuses = ['submitted', 'reviewed', 'resolved'];
    return statuses.map(s => {
      const count = filteredReports.filter(r => r.status === s).length;
      const pct = total > 0 ? (count / total) * 100 : 0;
      return { status: s, count, pct };
    });
  }, [filteredReports]);

  // Loading state
  if (loading || analyticsLoading) {
    return (
      <div className="p-6 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // MAIN RENDER
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between space-x-4">
        <div>
          <h1 className="text-2xl font-bold">NAFDAC — DTP Surveillance</h1>
          <p className="text-sm text-gray-600 mt-1">Focused view for regulatory review and action.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleExportCSV} disabled={!filteredReports.length}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            className={`pb-3 text-sm ${activeTab === 'overview' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`pb-3 text-sm ${activeTab === 'reports' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('reports')}
          >
            Reports ({filteredReports.length})
          </button>
          <button
            className={`pb-3 text-sm ${activeTab === 'analytics' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </nav>
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded shadow-sm border">
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-semibold">{filteredReports.length}</p>
            </div>

            <div className="bg-white p-4 rounded shadow-sm border">
              <p className="text-sm text-gray-600">Severe Cases</p>
              <p className="text-2xl font-semibold">
                {filteredReports.filter(r => r.severity === 'severe').length}
              </p>
            </div>

            <div className="bg-white p-4 rounded shadow-sm border">
              <p className="text-sm text-gray-600">Recent (30 days)</p>
              <p className="text-2xl font-semibold">
                {filteredReports.filter(r => {
                  const days = (Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24);
                  return days <= 30;
                }).length}
              </p>
            </div>
          </div>

          {/* Charts: Category & Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded shadow-sm border">
              <h3 className="text-lg font-medium mb-3">DTP Category Distribution</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-40} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1E88E5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow-sm border">
              <h3 className="text-lg font-medium mb-3">Monthly Trend (reports)</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#43A047" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Hospitals */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Reporting Hospitals</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getHospitalStats()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hospital"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#43A047" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* REPORTS (detailed list + filters) */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded shadow-sm border">
            <div className="flex flex-col lg:flex-row gap-3 items-end">
              <div className="flex-1">
                <Select
                  label="Hospital"
                  value={filters.hospital || ''}
                  onChange={(e) => setFilters({ ...filters, hospital: e.target.value })}
                  options={[
                    { value: '', label: 'All Hospitals' },
                    ...ogunStateHospitals.map(h => ({ value: h.name, label: h.name }))
                  ]}
                />
              </div>

              <div className="flex-1">
                <Select
                  label="Category"
                  value={filters.category || ''}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  options={[
                    { value: '', label: 'All Categories' },
                    ...dtpCategories.map(cat => ({ value: cat, label: cat }))
                  ]}
                />
              </div>

              <div className="w-40">
                <Select
                  label="Severity"
                  value={filters.severity || ''}
                  onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                  options={[
                    { value: '', label: 'All' },
                    ...severityLevels.map(l => ({ value: l.value, label: l.label }))
                  ]}
                />
              </div>

              <div className="w-40">
                <Input
                  label="From"
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
              </div>

              <div className="w-40">
                <Input
                  label="To"
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                />
              </div>

              <div>
                <Button
                  variant="outline"
                  onClick={() => setFilters({ hospital: '', category: '', severity: '', dateFrom: '', dateTo: '' })}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white rounded shadow-sm border">
            <div className="px-4 py-3 border-b">
              <h3 className="text-lg font-medium">Reports ({filteredReports.length})</h3>
            </div>

            {filteredReports.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">No reports match the selected filters.</p>
              </div>
            ) : (
              <div className="divide-y max-h-[40vh] overflow-auto">
                {filteredReports.map((r: DTPReport) => (
                  <div key={r._id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-baseline space-x-3">
                          <h4 className="font-semibold text-gray-900">{r.dtpCategory}{r.customCategory ? ` — ${r.customCategory}` : ''}</h4>
                          <span className="text-xs text-gray-500">{format(new Date(r.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{r.hospitalName} • {r.pharmacistName} • 
                          • {r.pharmacistNo} {r.ward ? `• ${r.ward}` : ''}</p>
                      </div>

                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          r.severity === 'severe' ? 'bg-red-100 text-red-800' :
                          r.severity === 'moderate' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {r.severity}
                        </span>
                        <div className="text-xs text-gray-500 mt-2">{r.status}</div>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-gray-700">
                      <strong>Prescription:</strong> {r.prescriptionDetails || '—'}
                    </div>

                    {r.comments && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Comments:</strong> {r.comments}
                      </div>
                    )}

                    {/* PHOTOS: thumbnails + click to open lightbox */}
                    {Array.isArray(r.photos) && r.photos.length > 0 && (
                      <div className="mt-3">
                        <div className="flex gap-2">
                          {r.photos.map((p: any, i: number) => {
                            const url = typeof p === 'string' ? p : (p.thumbnailUrl || p.url || p.secure_url || p.thumbnail);
                            if (!url) return null;
                            return (
                              <button
                                key={i}
                                onClick={() => openImagesForReport(r, i)}
                                className="relative rounded-md overflow-hidden border"
                                title="View image"
                                aria-label={`Open image ${i + 1}`}
                              >
                                <img src={url} alt={`report-${r._id}-img-${i}`} className="h-20 w-28 object-cover" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded shadow-sm border">
              <h3 className="text-lg font-medium mb-3">Severity Distribution</h3>
              <div className="space-y-3">
                {severitySummary.map(s => (
                  <div key={s.value}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{s.label}</span>
                      <span className="text-gray-600">{s.count} ({s.pct.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${s.value === 'severe' ? 'bg-red-500' : s.value === 'moderate' ? 'bg-orange-500' : 'bg-yellow-500'}`} style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow-sm border">
              <h3 className="text-lg font-medium mb-3">Status Overview</h3>
              <div className="space-y-3">
                {statusOverview.map(s => (
                  <div key={s.status}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium capitalize">{s.status}</span>
                      <span className="text-gray-600">{s.count} ({s.pct.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full bg-secondary-500" style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox (reusable component) */}
      <Lightbox
        images={lightboxImages}
        startIndex={lightboxStartIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
};

export default NafdacDashboard;
