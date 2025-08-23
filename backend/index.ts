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
      if (!allowLocalFallback) {
        process.exit(1);
      }
      await mongoose.connect('mongodb://localhost:27017/compliance-scanner');
      return;
    }

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
    } as any);
  } catch (error) {

    const uri = process.env.MONGODB_URI || '';
    if (uri.includes('mongodb.net')) {
    }

    const allowLocalFallback = process.env.ALLOW_LOCAL_MONGO === 'true';
    if (allowLocalFallback) {
      try {
        await mongoose.connect('mongodb://localhost:27017/compliance-scanner');
        return;
      } catch (localError) {
      }
    }

    // Do not silently fallback to local unless explicitly allowed
    process.exit(1);
  }
};

// Initialize monitoring for all active websites
const initializeMonitoring = async () => {
  try {
    
    // Get all users
    const users = await User.find({});
    
    // Start monitoring for each user
    for (const user of users) {
      await monitoringService.startMonitoringForUser((user as any)._id.toString());
    }
    
  } catch (error) {
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
      
      // Start the scheduler service
      schedulerService.start();
      
      // Initialize monitoring service
      initializeMonitoring();
    });
  } catch (error) {
    process.exit(1);
  }
};

startServer(); 