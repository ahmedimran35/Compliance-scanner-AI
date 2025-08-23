import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/users';
import userProfileRoutes from './routes/user';
import projectRoutes from './routes/projects';
import scanRoutes from './routes/scans';
import scheduledScanRoutes from './routes/scheduledScans';
import monitoringRoutes from './routes/monitoring';
import notificationRoutes from './routes/notifications';
import paymentRoutes from './routes/payments';
import schedulerService from './services/scheduler';
import monitoringService from './services/monitoringService';
import User from './models/User';
import assistantRoutes from './routes/assistant';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Compression for faster responses (safe optional require)
let compressionMiddleware: any = (_req: any, _res: any, next: any) => next();
try {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const compression = require('compression');
	compressionMiddleware = compression();
} catch {
	console.warn('compression module not installed, continuing without response compression');
}
app.use(compressionMiddleware);

// Middleware
const isProd = process.env.NODE_ENV === 'production';
app.use(cors({
  origin: isProd ? (process.env.ALLOWED_ORIGIN || 'http://localhost:3000') : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/user', userProfileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/scheduled-scans', scheduledScanRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/assistant', assistantRoutes);

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    const allowLocalFallback = process.env.ALLOW_LOCAL_MONGO === 'true';

    if (!mongoURI) {
      console.error('MONGODB_URI is not set. Please set it to your MongoDB Atlas connection string.');
      if (!allowLocalFallback) {
        process.exit(1);
      }
      console.log('ALLOW_LOCAL_MONGO=true detected. Connecting to local MongoDB as a fallback...');
      await mongoose.connect('mongodb://localhost:27017/compliance-scanner');
      console.log('Local MongoDB connected successfully');
      return;
    }

    console.log('Connecting to MongoDB using MONGODB_URI...');
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
    } as any);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);

    const uri = process.env.MONGODB_URI || '';
    if (uri.includes('mongodb.net')) {
      console.error('Hint: If this is MongoDB Atlas, ensure your server IP is whitelisted and credentials are correct.');
    }

    const allowLocalFallback = process.env.ALLOW_LOCAL_MONGO === 'true';
    if (allowLocalFallback) {
      console.log('ALLOW_LOCAL_MONGO=true detected. Trying local MongoDB as a fallback...');
      try {
        await mongoose.connect('mongodb://localhost:27017/compliance-scanner');
        console.log('Local MongoDB connected successfully');
        return;
      } catch (localError) {
        console.error('Local MongoDB connection also failed:', localError);
      }
    }

    // Do not silently fallback to local unless explicitly allowed
    process.exit(1);
  }
};

// Initialize monitoring for all active websites
const initializeMonitoring = async () => {
  try {
    console.log('🔍 Initializing monitoring service...');
    
    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to initialize monitoring for`);
    
    // Start monitoring for each user
    for (const user of users) {
      await monitoringService.startMonitoringForUser((user as any)._id.toString());
    }
    
    console.log('✅ Monitoring service initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing monitoring service:', error);
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
      console.log(`API available at http://localhost:${PORT}/api`);
      console.log(`Monitoring API available at http://localhost:${PORT}/api/monitoring`);
      console.log(`Network access: http://0.0.0.0:${PORT}`);
      
      // Start the scheduler service
      schedulerService.start();
      
      // Initialize monitoring service
      initializeMonitoring();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 