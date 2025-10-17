// src/pages/StateAdminDashboard.tsx
import React, { useEffect,  useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useReportStore } from '../stores/reportStore';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Download, BarChart3, TrendingUp, FileText, Guitar as Hospital, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { dtpCategories, severityLevels, ogunStateHospitals } from '../data/hospitals';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import fileDownload from 'js-file-download';
import { AdminList } from '../components/AdminList';
import { toast } from 'sonner';
import Lightbox from '../components/Lightbox';
import type { DTPReport } from '../types';

export const StateAdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const { 
    reports: filteredReports = [], 
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

  useEffect(() => {
    if (token) {
      fetchReports(token);
      fetchAnalytics(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filters]);

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

    const csvData = filteredReports.map(report => [
      format(new Date(report.createdAt), 'yyyy-MM-dd'),
      report.hospitalName,
      report.pharmacistName,
      report.ward || '-',
      report.dtpCategory + (report.customCategory ? ` - ${report.customCategory}` : ''),
      report.severity,
      report.status,
      `"${(report.prescriptionDetails || '').replace(/"/g, '""')}"`,
      `"${(report.comments || '').replace(/"/g, '""')}"`
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    fileDownload(csv, `ogun-state-dtp-reports-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    toast.success('Report exported successfully!');
  };

  const getCategoryStats = () => analyticsData?.categoryStats || [];
  const getTrendData = () => analyticsData?.trendStats?.map((stat: any) => ({
    month: format(new Date(stat.date), 'MMM yyyy'),
    count: stat.count
  })) || [];
  const getHospitalStats = () => analyticsData?.hospitalStats?.map((stat: any) => ({
    hospital: stat.hospital.length > 30 ? stat.hospital.substring(0, 30) + '...' : stat.hospital,
    count: stat.count
  })) || [];

  // open lightbox for a report: normalize photo URLs
  const openImagesForReport = (report: DTPReport, start = 0) => {
    const images: string[] = (report.photos || [])
      .map((p: any) => {
        if (!p) return null;
        if (typeof p === 'string') return p;
        return p.url || p.secure_url || p.thumbnailUrl || p.thumbnail || null;
      })
      .filter(Boolean) as string[];

    if (!images.length) {
      toast('No images for this report');
      return;
    }

    setLightboxImages(images);
    setLightboxStartIndex(Math.min(start, images.length - 1));
    setLightboxOpen(true);
  };

  if (loading || analyticsLoading) {
    return (
      <div className="p-6 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              State Administration Dashboard
            </h1>
            <p className="mt-2 text-gray-600">Ogun State Hospital DTP Monitoring</p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <Button
              variant="secondary"
              icon={Download}
              onClick={handleExportCSV}
              disabled={filteredReports.length === 0}
            >
              Export Data
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'reports', name: 'All Reports', icon: FileText },
              { id: 'analytics', name: 'Analytics', icon: TrendingUp }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon size={16} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-primary-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-2xl font-semibold text-gray-900">{filteredReports.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Hospital className="h-8 w-8 text-secondary-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Hospitals</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {new Set(filteredReports.map(r => r.hospitalName)).size}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Severe Cases</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {filteredReports.filter(r => r.severity === 'severe').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-accent-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {filteredReports.filter(r => 
                      new Date(r.createdAt).getMonth() === new Date().getMonth()
                    ).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin List */}
          <AdminList />

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">DTP Categories</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getCategoryStats()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1E88E5" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#43A047" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
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

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <Button
                variant="outline"
                onClick={() => setFilters({ hospital: '', category: '', severity: '', dateFrom: '', dateTo: '' })}
              >
                Clear All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Select
                label="Hospital"
                value={filters.hospital || ''}
                onChange={(e) => setFilters({ ...filters, hospital: e.target.value })}
                options={[
                  { value: '', label: 'All Hospitals' },
                  ...ogunStateHospitals.map(h => ({ value: h.name, label: h.name }))
                ]}
              />

              <Select
                label="Category"
                value={filters.category || ''}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                options={[
                  { value: '', label: 'All Categories' },
                  ...dtpCategories.map(cat => ({ value: cat, label: cat }))
                ]}
              />

              <Select
                label="Severity"
                value={filters.severity || ''}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                options={[
                  { value: '', label: 'All Severities' },
                  ...severityLevels.map(level => ({ value: level.value, label: level.label }))
                ]}
              />

              <Input
                label="From Date"
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />

              <Input
                label="To Date"
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                All Reports ({filteredReports.length})
              </h3>
            </div>

            {filteredReports.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                <p className="text-gray-600">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {filteredReports.map((report: any) => (
                  <div key={report._id} className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{report.dtpCategory}</h4>
                        <p className="text-sm text-gray-600">
                          {report.hospitalName} • {report.pharmacistName} • 
                          {report.pharmacistLastName} • {report.pharmacistPhone}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${report.severity === 'severe' ? 'bg-red-100 text-red-800' :
                            report.severity === 'moderate' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'}
                        `}>
                          {report.severity}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-2">{report.prescriptionDetails}</p>
                    <p className="text-xs text-gray-500 mb-3">
                      {format(new Date(report.createdAt), 'MMM d, yyyy HH:mm')}
                    </p>

                    {/* Images: thumbnails + open lightbox */}
                    {Array.isArray(report.photos) && report.photos.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {report.photos.map((p: any, i: number) => {
                          const url = typeof p === 'string' ? p : (p.thumbnailUrl || p.url || p.secure_url || p.thumbnail);
                          if (!url) return null;
                          return (
                            <button
                              key={i}
                              onClick={() => openImagesForReport(report, i)}
                              className="rounded-md overflow-hidden border"
                              title="View image"
                              aria-label={`Open image ${i + 1}`}
                            >
                              <img src={url} alt={`report-${report._id}-img-${i}`} className="h-20 w-28 object-cover" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">DTP Categories</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getCategoryStats()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1E88E5" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#43A047" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
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

      {/* Lightbox (reusable) */}
      <Lightbox
        images={lightboxImages}
        startIndex={lightboxStartIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
};

export default StateAdminDashboard;
