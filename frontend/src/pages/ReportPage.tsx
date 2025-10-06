import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useReportStore } from '../stores/reportStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { ChevronLeft, ChevronRight, Upload, Camera, AlertTriangle, Send } from 'lucide-react';
import { dtpCategories, severityLevels } from '../data/hospitals';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface FormData {
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

export const ReportPage: React.FC = () => {
  const { user, token } = useAuth();

  const { submitReport } = useReportStore();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    hospitalName: user?.hospital || '',
    ward: '',
    prescriptionDetails: '',
    dtpCategory: '',
    customCategory: '',
    severity: 'mild',
    prescribingDoctor: '',
    comments: '',
    photos: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalSteps = 4;

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.photos.length > 2) {
      toast.error('Maximum 2 photos allowed');
      return;
    }
    updateFormData('photos', [...formData.photos, ...files]);
  };

  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    updateFormData('photos', newPhotos);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.hospitalName;
      case 2:
        return !!formData.prescriptionDetails && !!formData.dtpCategory;
      case 3:
        return !!formData.severity;
      case 4:
        return true; // Optional step
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Please complete all required fields');
      return;
    }

    setLoading(true);
    try {
      const success = await submitReport(formData, token!);

      if (success) {
        toast.success('DTP report submitted successfully!');
        navigate('/dashboard');
      } else {
        toast.error('Failed to submit report. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = (step: number): string => {
    switch (step) {
      case 1: return 'Hospital & Location';
      case 2: return 'Prescription & Problem';
      case 3: return 'Problem Details';
      case 4: return 'Additional Information';
      default: return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Submit DTP Report</h1>
        <p className="mt-2 text-gray-600">
          Help improve patient safety by reporting drug therapy problems
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of {totalSteps}: {getStepTitle(currentStep)}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Steps */}
      <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8">
        {/* Step 1: Hospital & Location */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Hospital & Location Information
              </h2>
              
              <div className="space-y-4">
                <Input
                  label="Hospital Name *"
                  value={formData.hospitalName}
                  onChange={(e) => updateFormData('hospitalName', e.target.value)}
                  placeholder="Your hospital name"
                  disabled={!!user?.hospital}
                  helperText={user?.hospital ? "Auto-filled from your profile" : undefined}
                />

                <Input
                  label="Ward (Optional)"
                  value={formData.ward}
                  onChange={(e) => updateFormData('ward', e.target.value)}
                  placeholder="e.g., Medical Ward, ICU, Pediatric Ward"
                  helperText="Specify the ward where the problem occurred"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Prescription & Problem */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Prescription & Problem Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prescription Details *
                  </label>
                  <textarea
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={formData.prescriptionDetails}
                    onChange={(e) => updateFormData('prescriptionDetails', e.target.value)}
                    placeholder="e.g., Metformin 500mg twice daily, Lisinopril 10mg once daily for 30 days"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Include drug names, dosages, frequencies, and duration
                  </p>
                </div>

                <Select
                  label="DTP Category *"
                  value={formData.dtpCategory}
                  onChange={(e) => updateFormData('dtpCategory', e.target.value)}
                  options={[
                    { value: '', label: 'Select DTP Category' },
                    ...dtpCategories.map(cat => ({ value: cat, label: cat }))
                  ]}
                />

                {formData.dtpCategory === 'Other' && (
                  <Input
                    label="Please specify *"
                    value={formData.customCategory}
                    onChange={(e) => updateFormData('customCategory', e.target.value)}
                    placeholder="Describe the specific problem"
                    required
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Problem Details */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Problem Assessment
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Severity Level *
                  </label>
                  <div className="space-y-3">
                    {severityLevels.map((level) => (
                      <label key={level.value} className="flex items-center">
                        <input
                          type="radio"
                          name="severity"
                          value={level.value}
                          checked={formData.severity === level.value}
                          onChange={(e) => updateFormData('severity', e.target.value as any)}
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                        />
                        <span className={`ml-3 font-medium ${level.color}`}>
                          {level.label}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          {level.value === 'severe' && '- Immediate intervention required'}
                          {level.value === 'moderate' && '- Requires prompt attention'}
                          {level.value === 'mild' && '- Non-urgent but should be addressed'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <Input
                  label="Prescribing Doctor (Optional)"
                  value={formData.prescribingDoctor}
                  onChange={(e) => updateFormData('prescribingDoctor', e.target.value)}
                  placeholder="Dr. Name or Department"
                  helperText="This helps in providing feedback and education"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Additional Information */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Additional Information
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Comments (Optional)
                  </label>
                  <textarea
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={formData.comments}
                    onChange={(e) => updateFormData('comments', e.target.value)}
                    placeholder="Any additional details, recommendations, or context that might be helpful..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supporting Photos (Optional, Max 2)
                  </label>
                  
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">
                            Privacy Warning
                          </p>
                          <p className="text-sm text-amber-700">
                            Please ensure all patient identifiers (names, dates of birth, medical record numbers) are removed or blocked out before uploading photos.
                          </p>
                        </div>
                      </div>
                    </div>

                    {formData.photos.length < 2 && (
                      <div className="flex space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          icon={Upload}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Upload Photo
                        </Button>
                        
                        <Button
                          type="button"
                          variant="outline"
                          icon={Camera}
                          onClick={() => {
                            // On mobile, this will open camera
                            if (fileInputRef.current) {
                              fileInputRef.current.setAttribute('capture', 'environment');
                              fileInputRef.current.click();
                            }
                          }}
                        >
                          Take Photo
                        </Button>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      multiple
                      className="hidden"
                    />

                    {/* Photo Preview */}
                    {formData.photos.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {formData.photos.map((photo, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-8 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            icon={ChevronLeft}
          >
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={nextStep}
              icon={ChevronRight}
            >
              Next Step
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              loading={loading}
              icon={Send}
              variant="secondary"
            >
              Submit Report
            </Button>
          )}
        </div>
      </div>

      {/* Quick Save Notice */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Your progress is automatically saved as you complete each step
        </p>
      </div>
    </div>
  );
};