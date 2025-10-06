// src/pages/HospitalAdminDashboard.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useReportStore } from '../stores/reportStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Download, Filter, FileText, TrendingUp, AlertTriangle, Users } from 'lucide-react';
import { format } from 'date-fns';
import { dtpCategories, severityLevels } from '../data/hospitals';
import fileDownload from 'js-file-download';
import { InputPopUp } from '../components/InputPopUp';
import { UserList } from '../components/UserList';
import { toast } from 'sonner';
import Lightbox from '../components/Lightbox'; // <- reusable lightbox component

export const HospitalAdminDashboard: React.FC = () => {
  const { user, token } = useAuth();

  // Use selectors to avoid extra re-renders
  const filteredReports = useReportStore((s) => s.reports) ?? [];
  const loading = useReportStore((s) => s.loading);
  const filters = useReportStore((s) => s.filters);
  const setFilters = useReportStore((s) => s.setFilters);
  const fetchReports = useReportStore((s) => s.fetchReports);
  const addFeedback = useReportStore((s) => s.addFeedback);

  const [showFilters, setShowFilters] = useState(false);

  // Per-report InputPopUp control (store the report id that is being edited)
  const [activeFeedbackReportId, setActiveFeedbackReportId] = useState<string | null>(null);

  // Lightbox state (reusable)
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<Array<string | { url?: string }>>([]);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);

  // Fetch reports once token changes or filters change
  const isFetchingRef = useRef(false);
  useEffect(() => {
    if (!token) return;

    const run = async () => {
      if (isFetchingRef.current) return;
      try {
        isFetchingRef.current = true;
        await fetchReports(token);
      } catch (err) {
        console.error('fetchReports failed', err);
      } finally {
        isFetchingRef.current = false;
      }
    };

    run();
  }, [token, fetchReports, filters]);

  // CSV export
  const handleExportCSV = () => {
    if (!filteredReports || filteredReports.length === 0) {
      toast.error('No reports to export');
      return;
    }
    const headers = [
      'Date',
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
      report.pharmacistName || '',
      report.ward || '-',
      (report.dtpCategory || '') + (report.customCategory ? ` - ${report.customCategory}` : ''),
      report.severity || '',
      report.status || '',
      `"${(report.prescriptionDetails || '').replace(/"/g, '""')}"`,
      `"${(report.comments || '').replace(/"/g, '""')}"`,
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    fileDownload(csv, `hospital-dtp-reports-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    toast.success('Report exported successfully!');
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      severity: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-amber-100 text-amber-800';
      case 'reviewed': return 'bg-secondary-100 text-secondary-800';
      case 'resolved': return 'bg-secondary-100 text-secondary-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'bg-red-100 text-red-800';
      case 'moderate': return 'bg-orange-100 text-orange-800';
      case 'mild': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // tolerant image extractor: supports report.photos (strings), report.photos [{url}], report.images, attachments etc.
  const extractImagesFromReport = (report: any): Array<string | { url?: string }> => {
    if (!report) return [];
    const candidates = report.photos ?? report.images ?? report.attachments ?? report.media ?? [];
    if (!Array.isArray(candidates)) return [];
    return candidates
      .map((p: any) => {
        if (!p) return null;
        if (typeof p === 'string') return p;
        if (typeof p === 'object') return p.url ?? p.path ?? p.src ?? null;
        return null;
      })
      .filter(Boolean) as Array<string | { url?: string }>;
  };

  const openReportImages = (report: any, startIndex = 0) => {
    const imgs = extractImagesFromReport(report);
    if (!imgs || imgs.length === 0) return;
    const normalized = imgs.map(i => (typeof i === 'string' ? i : { url: (i as any).url }));
    setLightboxImages(normalized);
    setLightboxStartIndex(startIndex);
    setLightboxOpen(true);
  };

  if (loading) {
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
            <h1 className="text-2xl font-bold text-gray-900">Hospital Administration</h1>
            <p className="mt-2 text-gray-600">{user?.hospital}</p>
          </div>

          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button variant="outline" icon={Filter} onClick={() => setShowFilters(s => !s)}>Filters</Button>
            <Button variant="secondary" icon={Download} onClick={handleExportCSV} disabled={!filteredReports.length}>Export CSV</Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <TrendingUp className="h-8 w-8 text-amber-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredReports.filter(r => new Date(r.createdAt).getMonth() === new Date().getMonth()).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Severe Cases</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredReports.filter(r => r.severity === 'severe').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-secondary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Pharmacists</p>
              <p className="text-2xl font-semibold text-gray-900">{new Set(filteredReports.map(r => r.pharmacistId)).size}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select label="Category" value={filters.category || ''} onChange={(e) => setFilters({ ...filters, category: e.target.value })} options={[{ value: '', label: 'All Categories' }, ...dtpCategories.map(cat => ({ value: cat, label: cat }))]} />
            <Select label="Severity" value={filters.severity || ''} onChange={(e) => setFilters({ ...filters, severity: e.target.value })} options={[{ value: '', label: 'All Severities' }, ...severityLevels.map(level => ({ value: level.value, label: level.label }))]} />
            <Select label="Status" value={filters.status || ''} onChange={(e) => setFilters({ ...filters, status: e.target.value })} options={[{ value: '', label: 'All Statuses' }, { value: 'submitted', label: 'Submitted' }, { value: 'reviewed', label: 'Reviewed' }, { value: 'resolved', label: 'Resolved' }]} />
            <Input label="From Date" type="date" value={filters.dateFrom || ''} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
            <Input label="To Date" type="date" value={filters.dateTo || ''} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">DTP Reports ({filteredReports.length})</h2>
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-600">{filteredReports.length === 0 ? "No DTP reports have been submitted yet." : "Try adjusting your filters to see more reports."}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReports.map((report) => {
              const images = extractImagesFromReport(report);

              return (
                <div key={report._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{report.dtpCategory}{report.customCategory && ` - ${report.customCategory}`}</h3>
                      <p className="text-sm text-gray-600">By {report.pharmacistName} • {report.ward ? `${report.ward} • ` : ''}{format(new Date(report.createdAt), 'MMM d, yyyy')}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>{report.severity}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>{report.status}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3"><strong>Prescription:</strong> {report.prescriptionDetails}</p>

                  {report.prescribingDoctor && <p className="text-gray-600 text-sm mb-2"><strong>Prescribing Doctor:</strong> {report.prescribingDoctor}</p>}
                  {report.comments && <p className="text-gray-600 text-sm mb-3"><strong>Comments:</strong> {report.comments}</p>}

                  {report.feedback && <div className="bg-secondary-50 p-3 rounded-lg mb-3"><p className="text-sm font-medium text-secondary-800 mb-1">Previous Feedback:</p><p className="text-sm text-secondary-700">{report.feedback}</p></div>}

                  {/* Image thumbnails (if any) */}
                  {images.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {images.map((img, i) => {
                        const src = typeof img === 'string' ? img : (img.url ?? '');
                        return (
                          <button key={i} type="button" onClick={() => openReportImages(report, i)} className="block w-full rounded overflow-hidden" aria-label={`Open image ${i + 1}`}>
                            <img src={src} alt={`report image ${i + 1}`} className="w-full h-20 object-cover rounded border" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.png'; }} />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => setActiveFeedbackReportId(report._id)} disabled={report.status === 'resolved' || report.status === 'reviewed'}>Add Feedback</Button>

                    <Button variant="secondary" size="sm" disabled={report.status === 'resolved' || report.status === 'reviewed'} onClick={() => addFeedback(report._id, 'reviewed', report.feedback || '', token || '')}>
                      { report.status === 'reviewed' ? 'Reviewed' : 'Mark as Reviewed' }
                    </Button>

                    {/* Per-report Input popup */}
                    <InputPopUp
                      open={activeFeedbackReportId === report._id}
                      onCancel={() => setActiveFeedbackReportId(null)}
                      reportId={report._id}
                      token={token || ''}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* UserList */}
        <div className="mt-8 p-6">
          <UserList />
        </div>
      </div>

      {/* Lightbox (global) */}
      <Lightbox images={lightboxImages} startIndex={lightboxStartIndex} open={lightboxOpen} onClose={() => setLightboxOpen(false)} />
    </div>
  );
};

export default HospitalAdminDashboard;
