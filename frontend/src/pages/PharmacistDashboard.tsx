// src/pages/PharmacistDashboard.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useReportStore } from '../stores/reportStore';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Plus, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import Lightbox from '../components/Lightbox'; // adjust path if needed


export const PharmacistDashboard: React.FC = () => {
  const { user, token } = useAuth();

  // use selectors so component only re-renders on the parts it needs
  const reports = useReportStore((s) => s.reports) ?? [];
  const loading = useReportStore((s) => s.loading);
  const fetchReports = useReportStore((s) => s.fetchReports);

  const location = useLocation();
  const isFetchingRef = useRef(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<Array<string | { url?: string }>>([]);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);

  // Fetch reports when token or route changes. Guard to avoid overlapping calls.
  useEffect(() => {
    if (!token) return;
    const run = async () => {
      if (isFetchingRef.current) return;
      try {
        isFetchingRef.current = true;
        await fetchReports(token);
      } catch (err) {
        // optionally log or toast
        // console.error('fetchReports failed', err);
      } finally {
        isFetchingRef.current = false;
      }
    };
    run();
  }, [token, fetchReports, location.key]);

  // Helper: tolerant extractor for image URLs from a report
  const extractImagesFromReport = (report: any): Array<string | { url?: string }> => {
    if (!report) return [];
    // possible fields: photos, images, attachments, media
    const candidates = report.photos ?? report.images ?? report.attachments ?? report.media ?? [];
    if (!Array.isArray(candidates)) return [];
    return candidates
      .map((p: any) => {
        if (!p) return null;
        if (typeof p === 'string') return p;
        if (typeof p === 'object') {
          // common shapes: { url }, { path }, { src }
          return p.url ?? p.path ?? p.src ?? null;
        }
        return null;
      })
      .filter(Boolean) as Array<string | { url?: string }>;
  };

  const openReportImages = (report: any, startIndex = 0) => {
    const imgs = extractImagesFromReport(report);
    if (!imgs || imgs.length === 0) return;
    // normalize to either string or {url}
    const normalized = imgs.map((i) => (typeof i === 'string' ? i : { url: (i as any).url }));
    setLightboxImages(normalized);
    setLightboxStartIndex(startIndex);
    setLightboxOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-5 w-5 text-amber-600" />;
      case 'reviewed':
        return <CheckCircle className="h-5 w-5 text-secondary-600" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-secondary-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-amber-100 text-amber-800';
      case 'reviewed':
        return 'bg-secondary-100 text-secondary-800';
      case 'resolved':
        return 'bg-secondary-100 text-secondary-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe':
        return 'bg-red-100 text-red-800';
      case 'moderate':
        return 'bg-orange-100 text-orange-800';
      case 'mild':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
            <p className="mt-2 text-gray-600">{user?.hospital}</p>
          </div>

          <div className="mt-4 sm:mt-0">
            <Link to="/report">
              <Button icon={Plus} size="lg">Submit New Report</Button>
            </Link>
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
              <p className="text-2xl font-semibold text-gray-900">{reports.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-amber-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{reports.filter(r => r.status === 'submitted').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-secondary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reviewed</p>
              <p className="text-2xl font-semibold text-gray-900">{reports.filter(r => r.status === 'reviewed').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Severe</p>
              <p className="text-2xl font-semibold text-gray-900">{reports.filter(r => r.severity === 'severe').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">My Reports</h2>
        </div>

        {reports.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
            <p className="text-gray-600 mb-4">Start by submitting your first DTP report to help improve patient safety.</p>
            <Link to="/report">
              <Button icon={Plus}>Submit Your First Report</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reports.map((report) => {
              const images = extractImagesFromReport(report);
              return (
                <div key={report._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(report.status)}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {report.dtpCategory}{report.customCategory && ` - ${report.customCategory}`}
                        </h3>
                        <p className="text-sm text-gray-600">{report.ward ? `${report.ward} • ` : ''}{format(new Date(report.createdAt), 'MMM d, yyyy')}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>{report.severity}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>{report.status}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3 line-clamp-2">{report.prescriptionDetails}</p>

                  {report.comments && <p className="text-gray-600 text-sm mb-3"><strong>Comments:</strong> {report.comments}</p>}

                  {/* Thumbnails */}
                  {images.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {images.map((img, i) => {
                        const src = typeof img === 'string' ? img : (img.url ?? '');
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => openReportImages(report, i)}
                            className="block w-full rounded overflow-hidden"
                            aria-label={`Open image ${i + 1}`}
                          >
                            <img
                              src={src}
                              alt={`report image ${i + 1}`}
                              className="w-full h-20 object-cover rounded border"
                              loading="lazy"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.png'; }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {report.feedback && (
                    <div className="bg-secondary-50 p-3 rounded-lg mt-4">
                      <p className="text-sm font-medium text-secondary-800 mb-1">Admin Feedback:</p>
                      <p className="text-sm text-secondary-700">{report.feedback}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Lightbox
        images={lightboxImages}
        startIndex={lightboxStartIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
};

export default PharmacistDashboard;
