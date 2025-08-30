const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');
const hospitalRoutes = require('./routes/hospitals');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hospitals', hospitalRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});


// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dtp_platform')
.then(() => {
  console.log('Connected to MongoDB');
  initializeData();
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Initialize demo data
async function initializeData() {
  const User = require('./models/User');
  const Hospital = require('./models/Hospital');
  
  try {
    // Check if demo users exist
    const existingUser = await User.findOne({ email: 'pharmacist@demo.com' });
    if (!existingUser) {
      const bcrypt = require('bcryptjs');
      
      // Create demo users
      const demoUsers = [
        {
          name: 'Dr. Adebayo Johnson',
          email: 'pharmacist@demo.com',
          password: await bcrypt.hash('demo', 10),
          hospital: 'Federal Medical Centre, Abeokuta',
          registrationNumber: 'PCN/2019/12345',
          role: 'pharmacist',
          approved: true
        },
        {
          name: 'Mrs. Folake Adeyemi',
          email: 'admin@demo.com',
          password: await bcrypt.hash('demo', 10),
          hospital: 'Federal Medical Centre, Abeokuta',
          role: 'hospital_admin',
          approved: true
        },
        {
          name: 'Prof. Olumide Adebisi',
          email: 'state@demo.com',
          password: await bcrypt.hash('demo', 10),
          hospital: 'Ogun State Ministry of Health',
          role: 'state_admin',
          approved: true
        }
      ];
      
      await User.insertMany(demoUsers);
      console.log('Demo users created');
    }
    
    // Initialize hospitals
    const hospitalCount = await Hospital.countDocuments();
    if (hospitalCount === 0) {
      const hospitals = [
        { name: 'Federal Medical Centre, Abeokuta', location: 'Abeokuta', type: 'Federal' },
        { name: 'State Hospital, Abeokuta', location: 'Abeokuta', type: 'State' },
        { name: 'State Hospital, Ijebu-Ode', location: 'Ijebu-Ode', type: 'State' },
        { name: 'State Hospital, Sagamu', location: 'Sagamu', type: 'State' },
        { name: 'General Hospital, Ilaro', location: 'Ilaro', type: 'General' },
        { name: 'General Hospital, Ota', location: 'Ota', type: 'General' },
        { name: 'General Hospital, Ikenne', location: 'Ikenne', type: 'General' },
        { name: 'Babcock University Teaching Hospital', location: 'Ilishan-Remo', type: 'Private' },
        { name: 'Olabisi Onabanjo University Teaching Hospital', location: 'Sagamu', type: 'Teaching' },
        { name: 'Neuropsychiatric Hospital, Aro', location: 'Abeokuta', type: 'Specialist' }
      ];
      
      await Hospital.insertMany(hospitals);
      console.log('Hospitals initialized');
    }
    
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});