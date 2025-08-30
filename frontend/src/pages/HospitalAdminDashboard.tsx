import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useReportStore } from '../stores/reportStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';
import { Download, Filter, FileText, TrendingUp, AlertTriangle, Users } from 'lucide-react';
import type { DTPReport } from '../types';
import { format } from 'date-fns';
import { dtpCategories, severityLevels } from '../data/hospitals';
import fileDownload from 'js-file-download';

export const HospitalAdminDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { 
    reports: filteredReports, 
    loading, 
    filters, 
    setFilters, 
    fetchReports 
  } = useReportStore();
  const { addToast, ToastContainer } = useToast();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (token) {
      fetchReports(token);
    }
  }, [token, filters]);

  const handleExportCSV = () => {
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
      report.pharmacistName,
      report.ward || '-',
      report.dtpCategory + (report.customCategory ? ` - ${report.customCategory}` : ''),
      report.severity,
      report.status,
      `"${report.prescriptionDetails.replace(/"/g, '""')}"`,
      `"${(report.comments || '').replace(/"/g, '""')}"`
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    fileDownload(csv, `hospital-dtp-reports-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    addToast('Report exported successfully!', 'success');
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
      <ToastContainer />
      
      {/* Header */}
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hospital Administration
            </h1>
            <p className="mt-2 text-gray-600">{user?.hospital}</p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              variant="outline"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
            <Button
              variant="secondary"
              icon={Download}
              onClick={handleExportCSV}
              disabled={filteredReports.length === 0}
            >
              Export CSV
            </Button>
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
                {filteredReports.filter(r =>
                  new Date(r.createdAt).getMonth() === new Date().getMonth()
                ).length}
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
            <Users className="h-8 w-8 text-secondary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Pharmacists</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(filteredReports.map(r => r.pharmacistId)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

            <Select
              label="Status"
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'submitted', label: 'Submitted' },
                { value: 'reviewed', label: 'Reviewed' },
                { value: 'resolved', label: 'Resolved' }
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

          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            DTP Reports ({filteredReports.length})
          </h2>
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-600">
            {filteredReports.length === 0 
                ? "No DTP reports have been submitted yet."
                : "Try adjusting your filters to see more reports."
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReports.map((report) => (
              <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {report.dtpCategory}
                      {report.customCategory && ` - ${report.customCategory}`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      By {report.pharmacistName} • {report.ward ? `${report.ward} • ` : ''}
                      {format(new Date(report.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                      {report.severity}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mb-3">
                  <strong>Prescription:</strong> {report.prescriptionDetails}
                </p>

                {report.prescribingDoctor && (
                  <p className="text-gray-600 text-sm mb-2">
                    <strong>Prescribing Doctor:</strong> {report.prescribingDoctor}
                  </p>
                )}

                {report.comments && (
                  <p className="text-gray-600 text-sm mb-3">
                    <strong>Comments:</strong> {report.comments}
                  </p>
                )}

                {report.feedback && (
                  <div className="bg-secondary-50 p-3 rounded-lg mb-3">
                    <p className="text-sm font-medium text-secondary-800 mb-1">Previous Feedback:</p>
                    <p className="text-sm text-secondary-700">{report.feedback}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    Add Feedback
                  </Button>
                  <Button variant="secondary" size="sm">
                    Mark as Reviewed
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};