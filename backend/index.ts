import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Optional helmet import with fallback
let helmet: any;
try {
  helmet = require('helmet');
} catch (error) {
  console.warn('Helmet not available, using basic security headers');
  helmet = null;
}
import userRoutes from './routes/users';
import userProfileRoutes from './routes/user';
import projectRoutes from './routes/projects';
import scanRoutes from './routes/scans';
import scheduledScanRoutes from './routes/scheduledScans';
import monitoringRoutes from './routes/monitoring';
import notificationRoutes from './routes/notifications';
import paymentRoutes from './routes/payments';
import adminRoutes from './routes/admin';
import schedulerService from './services/scheduler';
import monitoringService from './services/monitoringService';
import User from './models/User';
import assistantRoutes from './routes/assistant';
import feedbackRoutes from './routes/feedback';

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

// Security middleware with Helmet (if available)
if (helmet) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "http://localhost:3000", "http://localhost:3001"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));
}

// Additional security headers
app.use((req, res, next) => {
  // Remove powered by header
  res.removeHeader('X-Powered-By');
  
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  next();
});

// Middleware
const isProd = process.env.NODE_ENV === 'production';

// Simplified CORS configuration for development
if (isProd) {
  // Production: strict CORS
  const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'];
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
  }));
} else {
  // Development: permissive CORS
  app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
  }));
}

// Rate limiting middleware (if available)
let rateLimit: any;
try {
  rateLimit = require('express-rate-limit');
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // limit each IP to 2000 requests per windowMs (increased for development)
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply rate limiting to all requests
  app.use(limiter);

  // Stricter rate limiting for API endpoints
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 API requests per windowMs (increased for development)
    message: 'Too many API requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/', apiLimiter);
} catch (error) {
  console.warn('Rate limiting not available, skipping rate limit middleware');
}

// Body parsing middleware with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint for security middleware validation
app.get('/api/test-unauthorized', (req, res) => {
  res.status(401).json({ error: 'Unauthorized access' });
});

app.get('/api/test-authorized', (req, res) => {
  res.json({ message: 'Authorized access granted', timestamp: new Date().toISOString() });
});

// Basic health endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
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
app.use('/api/admin', adminRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/feedback', feedbackRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    const allowLocalFallback = process.env.ALLOW_LOCAL_MONGO === 'true';

    if (!mongoURI) {
      if (!allowLocalFallback) {
        console.log('⚠️  MongoDB URI not provided. Starting server without database connection.');
        return;
      }
      try {
        await mongoose.connect('mongodb://localhost:27017/compliance-scanner');
        console.log('✅ Connected to local MongoDB');
        return;
      } catch (localError) {
        console.log('⚠️  Local MongoDB not available. Starting server without database connection.');
        return;
      }
    }

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
    } as any);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.log('⚠️  MongoDB connection failed. Starting server without database connection.');
    console.log('Error:', error);
  }
};

// Initialize monitoring for all active websites
const initializeMonitoring = async () => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  Skipping monitoring initialization - MongoDB not connected');
      return;
    }
    
    // Get all users
    const users = await User.find({});
    
    // Start monitoring for each user
    for (const user of users) {
      await monitoringService.startMonitoringForUser((user as any)._id.toString());
    }
    
    console.log('✅ Monitoring initialized');
  } catch (error) {
    console.log('⚠️  Monitoring initialization failed:', error);
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      
      // Start the scheduler service
      try {
        schedulerService.start();
        console.log('✅ Scheduler service started');
      } catch (error) {
        console.log('⚠️  Scheduler service failed to start:', error);
      }
      
      // Initialize monitoring service
      initializeMonitoring();
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer(); 