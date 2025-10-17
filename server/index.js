// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const registerAdmin = require('./admin'); // safe seeder
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
  max: 100
});
app.use('/api/', limiter);

// CORS configuration — consider making origin configurable
const allowedOrigin =  'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true }));

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

// Initialize demo data (unchanged but safe)
async function initializeData() {
  const Hospital = require('./models/Hospital');

  try {
    const hospitalCount = await Hospital.countDocuments();
    if (hospitalCount === 0) {
      const hospitals = [
        { name: 'State Hospital, Ijaiye', location: 'Ijaiye', type: 'State' },
        { name: 'Oba Ademola Mart. Hospital', location: 'Abeokuta', type: 'Specialist' },
        { name: 'General Hospital, Isaga Orile', location: 'Isaga Orile', type: 'General' },
        { name: 'Nafdac', location: 'Ogun State', type: 'General' },
        { name: 'General Hospital, Odeda', location: 'Odeda', type: 'General' },
        { name: 'General Hospital, Owode Egba', location: 'Owode Egba', type: 'General' },
        { name: 'General Hospital, Iberekodo', location: 'Iberekodo', type: 'General' },
        { name: 'Olikoye Ransome Kuti Mem. Hospital', location: 'Abeokuta', type: 'Specialist' },
        { name: 'Comm. Psy. Oke Ilewo', location: 'Abeokuta', type: 'Specialist' },
        { name: 'Dental Centre, Abeokuta', location: 'Abeokuta', type: 'Specialist' },
        { name: "Governor's Office Clinic", location: 'Abeokuta', type: 'Specialist' },
        { name: 'State Hospital, Ijebu Ode', location: 'Ijebu Ode', type: 'State' },
        { name: 'General Hospital, Ijebu Igbo', location: 'Ijebu Igbo', type: 'General' },
        { name: 'General Hospital, Ijebu Ife', location: 'Ijebu Ife', type: 'General' },
        { name: 'General Hospital, Ibiade', location: 'Ibiade', type: 'General' },
        { name: 'General Hospital, Ogbere', location: 'Ogbere', type: 'General' },
        { name: 'General Hospital, Ala Idowa', location: 'Ala Idowa', type: 'General' },
        { name: 'General Hospital, Odogbolu', location: 'Odogbolu', type: 'General' },
        { name: 'General Hospital, Omu Ijebu', location: 'Omu Ijebu', type: 'General' },
        { name: 'General Hospital, Atan Ijebu', location: 'Atan Ijebu', type: 'General' },
        {  name: 'Dental Centre, Ijebu Ode', location: 'Ijebu Ode', type: 'Specialist' },
        {  name: 'Comm. Psy. Ijebu Ode', location: 'Ijebu Ode', type: 'Specialist' },
        {  name: 'General Hospital, Iperu', location: 'Iperu', type: 'General' },
        {  name: 'State Hospital, Isara', location: 'Isara', type: 'State' },
        {  name: 'General Hospital, Ode Lemo', location: 'Ode Lemo', type: 'General' },
        {  name: 'General Hospital, Ikenne', location: 'Ikenne', type: 'General' },
        {  name: 'General Hospital, Ilisan', location: 'Ilisan', type: 'General' },
        {  name: 'Dental Centre, Sagamu', location: 'Sagamu', type: 'Specialist' },
        {  name: 'State Hospital, Ota', location: 'Ota', type: 'State' },
        {  name: 'General Hospital, Ifo', location: 'Ifo', type: 'General' },
        {  name: 'Comm. Psy. Ota', location: 'Ota', type: 'Specialist' },
        {  name: 'State Hospital, Ilaro', location: 'Ilaro', type: 'State' },
        {  name: 'General Hospital, Ayetoro', location: 'Ayetoro', type: 'General' },
        {  name: 'General Hospital, Imeko', location: 'Imeko', type: 'General' },
        {  name: 'General Hospital, Idiroko', location: 'Idiroko', type: 'General' },
        {  name: 'General Hospital, Ipokia', location: 'Ipokia', type: 'General' },
        {  name: 'Comm. Psy. Ilaro', location: 'Ilaro', type: 'Specialist' },
      ];
      await Hospital.insertMany(hospitals);
      console.log('Hospitals initialized');
    } else {
      console.log('Hospitals already initialized');
    }
  } catch (error) {
    console.error('Error initializing data:', error);
    throw error;
  }
}

// Start sequence
async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // optional mongoose options
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // initialize demo data (optional)
    if (process.env.INIT_HOSPITALS === 'true') {
      await initializeData();
    }

    // Seed admin only if flag enabled, or in development (choose your policy)
    const seedFlag = process.env.SEED_ADMIN === 'true';
    if (seedFlag) {
      await registerAdmin(); // returns an object; it will log success or errors
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.log('SEED_ADMIN is not enabled; skipping admin seeding.');
      }
    }

    // Start server after all DB initialization is done
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('Failed to start app:', err);
    process.exit(1);
  }
}

start();
