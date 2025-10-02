import React from 'react';
import { FileText, Users, BarChart3, Shield, Smartphone, Clock } from 'lucide-react';

export const UserGuidePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 text-white p-6">
          <h1 className="text-2xl font-bold">User Guide</h1>
          <p className="mt-2 opacity-90">
            Complete guide to using the Ogun State Hospital DTP Reporting Platform
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* Overview */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Drug Therapy Problem (DTP) Reporting Platform helps pharmacists across Ogun State hospitals 
              identify, document, and track medication-related issues to improve patient safety and care quality.
            </p>
            
            <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
              <h3 className="font-medium text-secondary-800 mb-2">Key Benefits</h3>
              <ul className="text-secondary-700 space-y-1">
                <li>• Streamlined reporting process (under 2 minutes)</li>
                <li>• Real-time collaboration between pharmacists and doctors</li>
                <li>• Data-driven insights for healthcare improvement</li>
                <li>• Mobile-friendly design for on-the-go reporting</li>
              </ul>
            </div>
          </section>

          {/* User Roles */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary-600" />
              User Roles & Access
            </h2>
            
            <div className="grid gap-6 md:grid-cols-3">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Pharmacist</h3>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• Submit DTP reports</li>
                  <li>• View own reports</li>
                  <li>• Track report status</li>
                  <li>• Receive feedback</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Hospital Admin</h3>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• View all hospital reports</li>
                  <li>• Filter and search reports</li>
                  <li>• Provide feedback</li>
                  <li>• Export data to CSV/Excel</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">State Admin</h3>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• View all state reports</li>
                  <li>• Advanced analytics</li>
                  <li>• Trend analysis</li>
                  <li>• System-wide insights</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Getting Started */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Account Registration</h3>
                  <p className="text-gray-600 text-sm">
                    Register with your hospital email, pharmacy registration number, and hospital affiliation. 
                    New accounts require admin approval before access is granted.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">First Login</h3>
                  <p className="text-gray-600 text-sm">
                    Once approved, login with your credentials. Your hospital information will be automatically saved for future reports.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Submit Your First Report</h3>
                  <p className="text-gray-600 text-sm">
                    Click "Submit New Report" and follow the 4-step guided process to document your first DTP.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Reporting Process */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary-600" />
              Reporting Process
            </h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-primary-600 pl-4">
                <h3 className="font-medium text-gray-900 mb-2">Step 1: Hospital & Location</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Your hospital is pre-filled from your profile. Add the specific ward if applicable.
                </p>
              </div>
              
              <div className="border-l-4 border-primary-600 pl-4">
                <h3 className="font-medium text-gray-900 mb-2">Step 2: Prescription & Problem</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Detail the prescription (drug names, doses, frequency) and select the DTP category 
                  (wrong drug, wrong dose, interaction, etc.).
                </p>
              </div>
              
              <div className="border-l-4 border-primary-600 pl-4">
                <h3 className="font-medium text-gray-900 mb-2">Step 3: Problem Assessment</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Rate the severity (mild, moderate, severe) and optionally include the prescribing doctor's information.
                </p>
              </div>
              
              <div className="border-l-4 border-primary-600 pl-4">
                <h3 className="font-medium text-gray-900 mb-2">Step 4: Additional Information</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Add comments and supporting photos (max 2). Ensure patient identifiers are removed from photos.
                </p>
              </div>
            </div>
          </section>

          {/* Mobile Usage */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Smartphone className="mr-2 h-5 w-5 text-primary-600" />
              Mobile Usage
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Optimized for Mobile</h3>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• Large, touch-friendly buttons and form fields</li>
                <li>• One-click photo capture using phone camera</li>
                <li>• Step-by-step process prevents information overload</li>
                <li>• Auto-save functionality prevents data loss</li>
                <li>• Works offline - reports sync when connection is restored</li>
              </ul>
            </div>
          </section>

          {/* Security & Privacy */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="mr-2 h-5 w-5 text-primary-600" />
              Security & Privacy
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Data Protection</h3>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• No patient names or identifiers stored</li>
                  <li>• HTTPS encryption for all data transmission</li>
                  <li>• Role-based access control</li>
                  <li>• Regular security audits</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Photo Guidelines</h3>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• Remove all patient identifiers</li>
                  <li>• Block out names, dates of birth</li>
                  <li>• Hide medical record numbers</li>
                  <li>• Focus on prescription details only</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Analytics */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-primary-600" />
              Analytics & Reporting
            </h2>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Hospital Administrators</h3>
                <p className="text-gray-600 text-sm mb-2">
                  View comprehensive reports for your hospital with filtering by date, category, and severity. 
                  Export data to CSV or Excel for further analysis.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">State Administrators</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Access state-wide analytics including trend analysis, category distribution charts, 
                  and comparative hospital performance metrics.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Nafdac Administrators</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Access state-wide adverse drug reaction reports.
                </p>
              </div>
            </div>
          </section>

          {/* Best Practices */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-primary-600" />
              Best Practices
            </h2>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-3">Tips for Effective Reporting</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <ul className="text-green-700 space-y-1 text-sm">
                  <li>• Report DTPs as soon as they're identified</li>
                  <li>• Be specific and detailed in descriptions</li>
                  <li>• Include all relevant medications</li>
                  <li>• Use standard drug names (generic preferred)</li>
                </ul>
                <ul className="text-green-700 space-y-1 text-sm">
                  <li>• Follow up on severe cases promptly</li>
                  <li>• Document patient outcomes when possible</li>
                  <li>• Collaborate with prescribing physicians</li>
                  <li>• Use the system regularly for best results</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Support */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Support & Contact</h2>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Technical Support</h3>
              <p className="text-gray-600 text-sm mb-3">
                For technical issues, account problems, or training requests, contact the system administrators.
              </p>
              
              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm text-gray-700">
                  <strong>Email:</strong> dtp-support@ogunstate.gov.ng<br/>
                  <strong>Phone:</strong> +234 (0) 800 DTP HELP<br/>
                  <strong>Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};