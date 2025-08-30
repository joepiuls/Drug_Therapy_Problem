export interface User {
  id: string;
  name: string;
  email: string;
  hospital: string;
  registrationNumber?: string;
  role: 'pharmacist' | 'hospital_admin' | 'state_admin';
  approved: boolean;
  createdAt: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  type: string;
}

export interface DTPReport {
  id: string;
  pharmacistId: string;
  pharmacistName: string;
  hospitalName: string;
  ward?: string;
  prescriptionDetails: string;
  dtpCategory: string;
  customCategory?: string;
  severity: 'mild' | 'moderate' | 'severe';
  prescribingDoctor?: string;
  comments?: string;
  photos?: string[];
  status: 'submitted' | 'reviewed' | 'resolved';
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  hospital: string;
  registrationNumber: string;
}

export interface DTPFormData {
  hospitalName: string;
  ward: string;
  prescriptionDetails: string;
  dtpCategory: string;
  customCategory: string;
  severity: 'mild' | 'moderate' | 'severe';
  prescribingDoctor: string;
  comments: string;
  photos: File[];
}