import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useHospitalStore } from '../stores/hospitalStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Mail, Lock, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const { user, login, loading } = useAuth();
  const { fetchHospitals } = useHospitalStore();
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.email || !loginForm.password) {
      toast.error('Please fill in all fields');
      return;
    }

    const success = await login(loginForm.email, loginForm.password);
    if (success) {
      toast.success('Login successful!');
    } else {
      toast.error('Invalid credentials or account not approved');
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <img
              src="https://ik.imagekit.io/2mkt1hyrh/Ogun_State_logo.png?updatedAt=1758989862625"
              alt="Logo"
              className="w-20 h-25"
            />
          </div>
        </div>
        
        <h1 className="mt-6 text-center text-3xl font-bold text-gray-900">
          DTP Reporting Platform
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ogun State Hospital Drug Therapy Problem Reporting
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          {!showRegister ? (
            <>
              <form onSubmit={handleLogin} className="space-y-6">
                <Input
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  icon={Lock}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                />

                <Button
                  type="submit"
                  loading={loading}
                  fullWidth
                  size="lg"
                >
                  Sign In
                </Button>
              </form>


              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setShowRegister(true)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Need an account? Register here
                </button>

                <br />

                 <button
                  type="button"
                  onClick={() => navigate('/userguide')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Click here for user guide
                </button>
              </div>
            </>
          ) : (
            <RegisterForm onBack={() => setShowRegister(false)} />
          )}
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>For healthcare professionals in Ogun State hospitals</p>
          <p className="mt-1">New accounts require admin approval</p>
        </div>
      </div>
    </div>
  );
};


const RegisterForm: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { register, loading } = useAuth();
  const { hospitals } = useHospitalStore();
  const navigate = useNavigate();


  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    hospital: '',
    role: '',
    registrationNumber: '',
    phone: ''
  });

  const hospitalOptions = [
    { value: '', label: 'Select Hospital' },
    ...hospitals.map(h => ({ value: h.name, label: h.name }))
  ];

  const roleOptions = ['Select Role', 'pharmacist', 'pharm_tech', 'hospital_admin', 'nafdac_admin'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validate first and last name
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('Please enter both first and last name');
      return;
    }

    // ✅ Validate password
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    // ✅ Validate PCN Registration Number (numeric & ≥6 digits)
    if (!/^\d{6,}$/.test(form.registrationNumber)) {
      toast.error('PCN number must be numeric and at least 6 digits');
      return;
    }

    // ✅ Validate phone number
    if (!/^\+?\d{7,15}$/.test(form.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    // // ✅ Combine first + last name before sending
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;

    const result = await register({
      name: fullName,
      email: form.email,
      password: form.password,
      role: form.role,
      hospital: form.hospital,
      registrationNumber: form.registrationNumber,
      phone: form.phone
    });

    if (result.success) {
      toast.success('Registration successful! Awaiting admin approval.');
      onBack();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Register</h2>
        <p className="text-sm text-gray-600 mt-2">Create your professional account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ✅ First and Last Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={form.firstName}
            onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))}
            placeholder="John"
            required
          />

          <Input
            label="Last Name"
            value={form.lastName}
            onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))}
            placeholder="Doe"
            required
          />
        </div>

        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
          placeholder="john.doe@hospital.gov.ng"
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="+2348012345678"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
            placeholder="••••••••"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            placeholder="••••••••"
            required
          />
        </div>

        <select
          className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={form.role}
          onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))}
          required
        >
          {roleOptions.map((option, index) => (
            <option
              key={index}
              value={index === 0 ? '' : option}
              disabled={index === 0}
            >
              {option}
            </option>
          ))}
        </select>

        <select
          className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={form.hospital}
          onChange={(e) => setForm(prev => ({ ...prev, hospital: e.target.value }))}
          required
        >
          {hospitalOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <Input
          label="Pharmacist Registration Number (PCN)"
          value={form.registrationNumber}
          onChange={(e) => setForm(prev => ({ ...prev, registrationNumber: e.target.value }))}
          placeholder="e.g. 123456"
          helperText="Must be numeric and at least 6 digits"
          required
        />

        <div className="flex space-x-3 pt-4">
          <Button type="button" variant="outline" fullWidth onClick={onBack}>
            Back
          </Button>

          <Button type="button" variant="outline" fullWidth onClick={() => navigate('/userguide')}>
            User Guide
          </Button>

          <Button type="submit" loading={loading} fullWidth icon={UserPlus}>
            Register
          </Button>
        </div>
      </form>
    </>
  );
};
