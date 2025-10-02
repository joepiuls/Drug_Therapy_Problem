import type { Hospital } from '../types';

export const ogunStateHospitals: Hospital[] = [
  { id: '1', name: 'State Hospital, Ijaiye', location: 'Ijaiye', type: 'State' },
  { id: '2', name: 'Oba Ademola Mart. Hospital', location: 'Abeokuta', type: 'Specialist' },
  { id: '3', name: 'General Hospital, Isaga Orile', location: 'Isaga Orile', type: 'General' },
  { id: '4', name: 'General Hospital, Odeda', location: 'Odeda', type: 'General' },
  { id: '5', name: 'General Hospital, Owode Egba', location: 'Owode Egba', type: 'General' },
  { id: '6', name: 'General Hospital, Iberekodo', location: 'Iberekodo', type: 'General' },
  { id: '7', name: 'Olikoye Ransome Kuti Mem. Hospital', location: 'Abeokuta', type: 'Specialist' },
  { id: '8', name: 'Comm. Psy. Oke Ilewo', location: 'Abeokuta', type: 'Specialist' },
  { id: '9', name: 'Dental Centre, Abeokuta', location: 'Abeokuta', type: 'Specialist' },
  { id: '10', name: "Governor's Office Clinic", location: 'Abeokuta', type: 'Specialist' },
  { id: '11', name: 'State Hospital, Ijebu Ode', location: 'Ijebu Ode', type: 'State' },
  { id: '12', name: 'General Hospital, Ijebu Igbo', location: 'Ijebu Igbo', type: 'General' },
  { id: '13', name: 'General Hospital, Ijebu Ife', location: 'Ijebu Ife', type: 'General' },
  { id: '14', name: 'General Hospital, Ibiade', location: 'Ibiade', type: 'General' },
  { id: '15', name: 'General Hospital, Ogbere', location: 'Ogbere', type: 'General' },
  { id: '16', name: 'General Hospital, Ala Idowa', location: 'Ala Idowa', type: 'General' },
  { id: '17', name: 'General Hospital, Odogbolu', location: 'Odogbolu', type: 'General' },
  { id: '18', name: 'General Hospital, Omu Ijebu', location: 'Omu Ijebu', type: 'General' },
  { id: '19', name: 'General Hospital, Atan Ijebu', location: 'Atan Ijebu', type: 'General' },
  { id: '20', name: 'Dental Centre, Ijebu Ode', location: 'Ijebu Ode', type: 'Specialist' },
  { id: '21', name: 'Comm. Psy. Ijebu Ode', location: 'Ijebu Ode', type: 'Specialist' },
  { id: '22', name: 'General Hospital, Iperu', location: 'Iperu', type: 'General' },
  { id: '23', name: 'State Hospital, Isara', location: 'Isara', type: 'State' },
  { id: '24', name: 'General Hospital, Ode Lemo', location: 'Ode Lemo', type: 'General' },
  { id: '25', name: 'General Hospital, Ikenne', location: 'Ikenne', type: 'General' },
  { id: '26', name: 'General Hospital, Ilisan', location: 'Ilisan', type: 'General' },
  { id: '27', name: 'Dental Centre, Sagamu', location: 'Sagamu', type: 'Specialist' },
  { id: '28', name: 'State Hospital, Ota', location: 'Ota', type: 'State' },
  { id: '29', name: 'General Hospital, Ifo', location: 'Ifo', type: 'General' },
  { id: '30', name: 'Comm. Psy. Ota', location: 'Ota', type: 'Specialist' },
  { id: '31', name: 'State Hospital, Ilaro', location: 'Ilaro', type: 'State' },
  { id: '32', name: 'General Hospital, Ayetoro', location: 'Ayetoro', type: 'General' },
  { id: '33', name: 'General Hospital, Imeko', location: 'Imeko', type: 'General' },
  { id: '34', name: 'General Hospital, Idiroko', location: 'Idiroko', type: 'General' },
  { id: '35', name: 'General Hospital, Ipokia', location: 'Ipokia', type: 'General' },
  { id: '36', name: 'Comm. Psy. Ilaro', location: 'Ilaro', type: 'Specialist' },
];


export const dtpCategories = [
  'Wrong drug',
  'Wrong dose',
  'Wrong frequency/duration',
  'Drug interaction',
  'Allergy/adverse reaction',
  'Monitoring needed',
  'Drug omission',
  'Other'
];

export const severityLevels = [
  { value: 'mild', label: 'Mild', color: 'text-yellow-600' },
  { value: 'moderate', label: 'Moderate', color: 'text-orange-600' },
  { value: 'severe', label: 'Severe', color: 'text-red-600' }
] as const;