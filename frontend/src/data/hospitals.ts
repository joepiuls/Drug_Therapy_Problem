import type { Hospital } from '../types';

export const ogunStateHospitals: Hospital[] = [
  { id: '1', name: 'Federal Medical Centre, Abeokuta', location: 'Abeokuta', type: 'Federal' },
  { id: '2', name: 'State Hospital, Abeokuta', location: 'Abeokuta', type: 'State' },
  { id: '3', name: 'State Hospital, Ijebu-Ode', location: 'Ijebu-Ode', type: 'State' },
  { id: '4', name: 'State Hospital, Sagamu', location: 'Sagamu', type: 'State' },
  { id: '5', name: 'General Hospital, Ilaro', location: 'Ilaro', type: 'General' },
  { id: '6', name: 'General Hospital, Ota', location: 'Ota', type: 'General' },
  { id: '7', name: 'General Hospital, Ikenne', location: 'Ikenne', type: 'General' },
  { id: '8', name: 'Babcock University Teaching Hospital', location: 'Ilishan-Remo', type: 'Private' },
  { id: '9', name: 'Olabisi Onabanjo University Teaching Hospital', location: 'Sagamu', type: 'Teaching' },
  { id: '10', name: 'Neuropsychiatric Hospital, Aro', location: 'Abeokuta', type: 'Specialist' },
  { id: '11', name: 'General Hospital, Ifo', location: 'Ifo', type: 'General' },
  { id: '12', name: 'General Hospital, Odeda', location: 'Odeda', type: 'General' },
  { id: '13', name: 'Rona Hospital', location: 'Abeokuta', type: 'Private' },
  { id: '14', name: 'Sacred Heart Hospital', location: 'Abeokuta', type: 'Private' },
  { id: '15', name: 'Victory Hospital', location: 'Sagamu', type: 'Private' }
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