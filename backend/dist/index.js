"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const users_1 = __importDefault(require("./routes/users"));
const user_1 = __importDefault(require("./routes/user"));
const projects_1 = __importDefault(require("./routes/projects"));
const scans_1 = __importDefault(require("./routes/scans"));
const scheduledScans_1 = __importDefault(require("./routes/scheduledScans"));
const monitoring_1 = __importDefault(require("./routes/monitoring"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const payments_1 = __importDefault(require("./routes/payments"));
const scheduler_1 = __importDefault(require("./services/scheduler"));
const monitoringService_1 = __importDefault(require("./services/monitoringService"));
const User_1 = __importDefault(require("./models/User"));
const assistant_1 = __importDefault(require("./routes/assistant"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3001', 10);
// Compression for faster responses (safe optional require)
let compressionMiddleware = (_req, _res, next) => next();
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const compression = require('compression');
    compressionMiddleware = compression();
}
catch {
}
app.use(compressionMiddleware);
// Middleware
const isProd = process.env.NODE_ENV === 'production';
app.use((0, cors_1.default)({
    origin: isProd ? (process.env.ALLOWED_ORIGIN || 'http://localhost:3000') : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// API Routes
app.use('/api/users', users_1.default);
app.use('/api/user', user_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/scans', scans_1.default);
app.use('/api/scheduled-scans', scheduledScans_1.default);
app.use('/api/monitoring', monitoring_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/payments', payments_1.default);
app.use('/api/assistant', assistant_1.default);
// MongoDB connection
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        const allowLocalFallback = process.env.ALLOW_LOCAL_MONGO === 'true';
        if (!mongoURI) {
            if (!allowLocalFallback) {
                process.exit(1);
            }
            await mongoose_1.default.connect('mongodb://localhost:27017/compliance-scanner');
            return;
        }
        await mongoose_1.default.connect(mongoURI, {
            serverSelectionTimeoutMS: 15000,
        });
    }
    catch (error) {
        const uri = process.env.MONGODB_URI || '';
        if (uri.includes('mongodb.net')) {
        }
        const allowLocalFallback = process.env.ALLOW_LOCAL_MONGO === 'true';
        if (allowLocalFallback) {
            try {
                await mongoose_1.default.connect('mongodb://localhost:27017/compliance-scanner');
                return;
            }
            catch (localError) {
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
        const users = await User_1.default.find({});
        // Start monitoring for each user
        for (const user of users) {
            await monitoringService_1.default.startMonitoringForUser(user._id.toString());
        }
    }
    catch (error) {
    }
};
// Start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, '0.0.0.0', () => {
            // Start the scheduler service
            scheduler_1.default.start();
            // Initialize monitoring service
            initializeMonitoring();
        });
    }
    catch (error) {
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map