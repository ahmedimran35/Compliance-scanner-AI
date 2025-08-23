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
const subscriptions_1 = __importDefault(require("./routes/subscriptions"));
const scheduler_1 = __importDefault(require("./services/scheduler"));
const monitoringService_1 = __importDefault(require("./services/monitoringService"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
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
app.use('/api/subscriptions', subscriptions_1.default);
// MongoDB connection
const connectDB = async () => {
    try {
        let mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            mongoURI = 'mongodb://localhost:27017/compliance-scanner';
        }
        await mongoose_1.default.connect(mongoURI);
    }
    catch (error) {
        try {
            await mongoose_1.default.connect('mongodb://localhost:27017/compliance-scanner');
        }
        catch (localError) {
            process.exit(1);
        }
    }
};
// Start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            // Start the scheduler service
            scheduler_1.default.start();
            monitoringService_1.default.start();
        });
    }
    catch (error) {
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map