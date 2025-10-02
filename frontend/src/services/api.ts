import type { User, DTPReport, RegisterData } from '../types';
import { ogunStateHospitals } from '../data/hospitals';

// Simulate API calls with localStorage
class APIService {
  private getStorageKey(key: string): string {
    return `dtp_platform_${key}`;
  }

  // Authentication
  async login(email: string, password: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.approved);
    
    if (user) {
      localStorage.setItem(this.getStorageKey('currentUser'), JSON.stringify(user));
      localStorage.setItem(this.getStorageKey('token'), 'mock-jwt-token');
      return user;
    }
    return null;
  }

  async register(userData: RegisterData): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = this.getUsers();
    const hospitalExists = ogunStateHospitals.some(h => h.name === userData.hospital);
    
    if (!hospitalExists || users.some(u => u.email === userData.email)) {
      return false;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      hospital: userData.hospital,
      registrationNumber: userData.registrationNumber,
      role: 'pharmacist',
      approved: false, // Requires admin approval
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(this.getStorageKey('users'), JSON.stringify(users));
    return true;
  }

  logout(): void {
    localStorage.removeItem(this.getStorageKey('currentUser'));
    localStorage.removeItem(this.getStorageKey('token'));
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.getStorageKey('currentUser'));
    return userStr ? JSON.parse(userStr) : null;
  }

  // Reports
  async submitDTPReport(reportData: Partial<DTPReport>): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const reports = this.getReports();
    const currentUser = this.getCurrentUser();
    
    if (!currentUser) return false;

    const newReport: DTPReport = {
      id: Date.now().toString(),
      pharmacistId: currentUser.id,
      pharmacistName: currentUser.name,
      hospitalName: currentUser.hospital,
      ward: reportData.ward || '',
      prescriptionDetails: reportData.prescriptionDetails || '',
      dtpCategory: reportData.dtpCategory || '',
      customCategory: reportData.customCategory || '',
      severity: reportData.severity || 'mild',
      prescribingDoctor: reportData.prescribingDoctor || '',
      comments: reportData.comments || '',
      photos: reportData.photos || [],
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    reports.push(newReport);
    localStorage.setItem(this.getStorageKey('reports'), JSON.stringify(reports));
    return true;
  }

  getReports(filters?: {
    hospitalName?: string;
    category?: string;
    severity?: string;
    dateFrom?: string;
    dateTo?: string;
  }): DTPReport[] {
    const reports = JSON.parse(localStorage.getItem(this.getStorageKey('reports')) || '[]');
    
    if (!filters) return reports;

    return reports.filter((report: DTPReport) => {
      if (filters.hospitalName && report.hospitalName !== filters.hospitalName) return false;
      if (filters.category && report.dtpCategory !== filters.category) return false;
      if (filters.severity && report.severity !== filters.severity) return false;
      if (filters.dateFrom && new Date(report.createdAt) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(report.createdAt) > new Date(filters.dateTo)) return false;
      return true;
    });
  }

  getMyReports(): DTPReport[] {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return [];
    
    const reports = this.getReports();
    return reports.filter(report => report.pharmacistId === currentUser.id);
  }

  getHospitalReports(): DTPReport[] {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return [];
    
    const reports = this.getReports();
    return reports.filter(report => report.hospitalName === currentUser.hospital);
  }

  markReportAsReviewed(reportId: string, feedback: string): boolean {
    const reports = this.getReports();
    const reportIndex = reports.findIndex(r => r.id === reportId);
    
    if (reportIndex === -1) return false;

    reports[reportIndex].status = 'reviewed';
    reports[reportIndex].feedback = feedback;
    reports[reportIndex].updatedAt = new Date().toISOString();

    localStorage.setItem(this.getStorageKey('reports'), JSON.stringify(reports));
    return true;
  }

  markReportAsResolved(reportId: string): boolean {
    const reports = this.getReports();
    const reportIndex = reports.findIndex(r => r.id === reportId);
    
    if (reportIndex === -1) return false;

    reports[reportIndex].status = 'resolved';
    reports[reportIndex].updatedAt = new Date().toISOString();

    localStorage.setItem(this.getStorageKey('reports'), JSON.stringify(reports));
    return true;
  }

  // Analytics
  getCategoryStats(): { category: string; count: number }[] {
    const reports = this.getReports();
    const stats: { [key: string]: number } = {};
    
    reports.forEach(report => {
      const category = report.dtpCategory;
      stats[category] = (stats[category] || 0) + 1;
    });

    return Object.entries(stats).map(([category, count]) => ({ category, count }));
  }

  getTrendData(): { date: string; count: number }[] {
    const reports = this.getReports();
    const trends: { [key: string]: number } = {};
    
    reports.forEach(report => {
      const date = new Date(report.createdAt).toLocaleDateString();
      trends[date] = (trends[date] || 0) + 1;
    });

    return Object.entries(trends)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private getUsers(): User[] {
    const usersStr = localStorage.getItem(this.getStorageKey('users'));
    if (!usersStr) {
      // Initialize with demo users
      const demoUsers: User[] = [
        {
          id: 'demo-pharmacist',
          name: 'Dr. Adebayo Johnson',
          email: 'pharmacist@demo.com',
          hospital: 'Federal Medical Centre, Abeokuta',
          registrationNumber: 'PCN/2019/12345',
          role: 'pharmacist',
          approved: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'demo-hospital-admin',
          name: 'Mrs. Folake Adeyemi',
          email: 'admin@demo.com',
          hospital: 'Federal Medical Centre, Abeokuta',
          role: 'hospital_admin',
          approved: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'demo-state-admin',
          name: 'Prof. Olumide Adebisi',
          email: 'state@demo.com',
          hospital: 'Ogun State Ministry of Health',
          role: 'state_admin',
          approved: true,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(this.getStorageKey('users'), JSON.stringify(demoUsers));
      return demoUsers;
    }
    return JSON.parse(usersStr);
  }

  // Initialize with demo data
  initializeDemoData(): void {
    const existingReports = localStorage.getItem(this.getStorageKey('reports'));
    if (existingReports) return;

    const demoReports: DTPReport[] = [
      {
        id: 'demo-1',
        pharmacistId: 'demo-pharmacist',
        pharmacistName: 'Dr. Adebayo Johnson',
        hospitalName: 'Federal Medical Centre, Abeokuta',
        ward: 'Medical Ward',
        prescriptionDetails: 'Metformin 500mg BD, Lisinopril 10mg OD',
        dtpCategory: 'Drug interaction',
        severity: 'moderate',
        prescribingDoctor: 'Dr. Smith',
        comments: 'ACE inhibitor may increase risk of lactic acidosis',
        photos: [],
        status: 'submitted',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'demo-2',
        pharmacistId: 'demo-pharmacist',
        pharmacistName: 'Dr. Adebayo Johnson',
        hospitalName: 'Federal Medical Centre, Abeokuta',
        ward: 'Pediatric Ward',
        prescriptionDetails: 'Amoxicillin 250mg TDS for 7 days',
        dtpCategory: 'Wrong dose',
        severity: 'mild',
        prescribingDoctor: 'Dr. Jones',
        comments: 'Dose too low for patient weight (25kg child)',
        photos: [],
        status: 'reviewed',
        feedback: 'Dose corrected. Thank you for the alert.',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    localStorage.setItem(this.getStorageKey('reports'), JSON.stringify(demoReports));
  }
}

export const apiService = new APIService();