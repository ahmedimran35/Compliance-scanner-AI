"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const Website_1 = __importDefault(require("../models/Website"));
const notificationService_1 = __importDefault(require("./notificationService"));
const User_1 = __importDefault(require("../models/User"));
class MonitoringService {
    constructor() {
        this.intervals = new Map();
        this.websiteData = new Map(); // Store website data for intervals
    }
    static getInstance() {
        if (!MonitoringService.instance) {
            MonitoringService.instance = new MonitoringService();
        }
        return MonitoringService.instance;
    }
    /**
     * Check if a website is online
     */
    async checkWebsite(url) {
        const startTime = Date.now();
        try {
            const response = await axios_1.default.get(url, {
                timeout: 10000, // 10 second timeout
                validateStatus: (status) => status < 500, // Consider 4xx as online but with issues
                headers: {
                    'User-Agent': 'ComplianceScanner-Monitoring/1.0'
                }
            });
            const responseTime = Date.now() - startTime;
            return {
                isOnline: true,
                responseTime,
                statusCode: response.status
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                isOnline: false,
                responseTime,
                error: error.message || 'Connection failed'
            };
        }
    }
    /**
     * Perform a check for a specific website
     */
    async performCheck(website) {
        try {
            console.log(`Checking website: ${website.name} (${website.url}) - Interval: ${website.interval}`);
            const result = await this.checkWebsite(website.url);
            // Store previous status for comparison
            const previousStatus = website.status;
            // Update website with check results
            await website.updateCheckResult(result.isOnline, result.responseTime);
            // Update stored website data
            this.websiteData.set(website._id.toString(), website);
            // Log the result
            if (result.isOnline) {
                console.log(`✅ ${website.name} is ONLINE - Response time: ${result.responseTime}ms`);
                // Create notification if website came back online
                if (previousStatus === 'offline' || previousStatus === 'warning') {
                    try {
                        const user = await User_1.default.findById(website.userId);
                        if (user) {
                            await notificationService_1.default.createWebsiteOnlineNotification(user._id.toString(), website._id.toString(), website.name, website.url);
                        }
                    }
                    catch (notificationError) {
                        console.error('Failed to create online notification:', notificationError);
                    }
                }
            }
            else {
                console.log(`❌ ${website.name} is OFFLINE - Error: ${result.error}`);
                // Create notification if website went offline
                if (previousStatus === 'online') {
                    try {
                        const user = await User_1.default.findById(website.userId);
                        if (user) {
                            await notificationService_1.default.createWebsiteOfflineNotification(user._id.toString(), website._id.toString(), website.name, website.url);
                        }
                    }
                    catch (notificationError) {
                        console.error('Failed to create offline notification:', notificationError);
                    }
                }
            }
        }
        catch (error) {
            console.error(`Error checking website ${website.name}:`, error);
            // Set warning status if there's an error
            await website.setWarningStatus();
        }
    }
    /**
     * Start monitoring a website with its specific interval
     */
    startMonitoring(website) {
        const websiteId = website._id.toString();
        if (!website.isActive) {
            console.log(`⏸️  Monitoring not started for ${website.name} - website is inactive`);
            return;
        }
        // Clear existing interval if any
        this.stopMonitoring(websiteId);
        // Store website data
        this.websiteData.set(websiteId, website);
        // Convert interval to milliseconds
        const intervalMs = this.getIntervalMs(website.interval);
        console.log(`🔄 Starting monitoring for ${website.name} (${websiteId}) with ${website.interval} interval (${intervalMs}ms)`);
        // Perform initial check
        this.performCheck(website);
        // Set up recurring checks with the specific interval for this website
        const intervalId = setInterval(async () => {
            try {
                // Fetch fresh website data to get latest settings
                const freshWebsite = await Website_1.default.findById(websiteId);
                if (freshWebsite && freshWebsite.isActive) {
                    // Update stored data
                    this.websiteData.set(websiteId, freshWebsite);
                    console.log(`⏰ Running scheduled check for ${freshWebsite.name} (${freshWebsite.interval})`);
                    await this.performCheck(freshWebsite);
                }
                else {
                    // Stop monitoring if website is no longer active
                    console.log(`🛑 Stopping monitoring for ${website.name} - website is no longer active`);
                    this.stopMonitoring(websiteId);
                }
            }
            catch (error) {
                console.error(`❌ Error in monitoring interval for ${website.name}:`, error);
            }
        }, intervalMs);
        this.intervals.set(websiteId, intervalId);
        console.log(`✅ Started monitoring ${website.name} with ${website.interval} interval (${intervalMs}ms) - Total active: ${this.intervals.size}`);
    }
    /**
     * Stop monitoring a website
     */
    stopMonitoring(websiteId) {
        const intervalId = this.intervals.get(websiteId);
        if (intervalId) {
            clearInterval(intervalId);
            this.intervals.delete(websiteId);
            const website = this.websiteData.get(websiteId);
            this.websiteData.delete(websiteId);
            console.log(`🛑 Stopped monitoring website ${websiteId} (${website?.name || 'Unknown'}) - Remaining active: ${this.intervals.size}`);
        }
        else {
            console.log(`ℹ️  No active monitoring found for website ${websiteId}`);
        }
    }
    /**
     * Restart monitoring for a website (useful when interval is changed)
     */
    restartMonitoring(website) {
        const websiteId = website._id.toString();
        console.log(`🔄 Restarting monitoring for ${website.name} with new interval: ${website.interval}`);
        // Stop current monitoring
        this.stopMonitoring(websiteId);
        // Start with new settings
        this.startMonitoring(website);
    }
    /**
     * Start monitoring all active websites for a user
     */
    async startMonitoringForUser(userId) {
        try {
            const websites = await Website_1.default.find({ userId, isActive: true });
            console.log(`Starting monitoring for ${websites.length} websites for user ${userId}`);
            websites.forEach(website => {
                this.startMonitoring(website);
            });
            console.log(`✅ Started monitoring ${websites.length} websites for user ${userId}`);
        }
        catch (error) {
            console.error(`Error starting monitoring for user ${userId}:`, error);
        }
    }
    /**
     * Start monitoring for all users (called on server startup)
     */
    async start() {
        try {
            console.log('🚀 Initializing monitoring service...');
            // Get all users
            const users = await User_1.default.find({});
            console.log(`Found ${users.length} users to initialize monitoring for`);
            // Start monitoring for each user
            for (const user of users) {
                await this.startMonitoringForUser(user._id.toString());
            }
            console.log('✅ Monitoring service initialized successfully');
        }
        catch (error) {
            console.error('❌ Error initializing monitoring service:', error);
        }
    }
    /**
     * Stop monitoring all websites for a user
     */
    async stopMonitoringForUser(userId) {
        try {
            const websites = await Website_1.default.find({ userId });
            websites.forEach(website => {
                this.stopMonitoring(website._id.toString());
            });
            console.log(`🛑 Stopped monitoring all websites for user ${userId}`);
        }
        catch (error) {
            console.error(`Error stopping monitoring for user ${userId}:`, error);
        }
    }
    /**
     * Convert interval string to milliseconds
     */
    getIntervalMs(interval) {
        switch (interval) {
            case '1min':
                return 60 * 1000; // 1 minute
            case '5min':
                return 5 * 60 * 1000; // 5 minutes
            case '30min':
                return 30 * 60 * 1000; // 30 minutes
            default:
                console.warn(`Unknown interval: ${interval}, defaulting to 5min`);
                return 5 * 60 * 1000; // Default to 5 minutes
        }
    }
    /**
     * Get monitoring status for all websites
     */
    getMonitoringStatus() {
        const active = this.intervals.size;
        const total = this.websiteData.size;
        // Create a map of website IDs to their intervals
        const intervals = new Map();
        this.websiteData.forEach((website, id) => {
            intervals.set(id, website.interval);
        });
        return { active, total, intervals };
    }
    /**
     * Get detailed monitoring info for debugging
     */
    getDetailedStatus() {
        console.log('=== Monitoring Service Status ===');
        console.log(`Active intervals: ${this.intervals.size}`);
        console.log(`Tracked websites: ${this.websiteData.size}`);
        this.websiteData.forEach((website, id) => {
            const hasInterval = this.intervals.has(id);
            console.log(`- ${website.name} (${id}): ${website.interval} - ${hasInterval ? 'ACTIVE' : 'INACTIVE'}`);
        });
        console.log('================================');
    }
    /**
     * Clean up all monitoring intervals (useful for graceful shutdown)
     */
    cleanup() {
        this.intervals.forEach((intervalId, websiteId) => {
            clearInterval(intervalId);
        });
        this.intervals.clear();
        this.websiteData.clear();
        console.log('🧹 Cleaned up all monitoring intervals');
    }
}
exports.default = MonitoringService.getInstance();
//# sourceMappingURL=monitoringService.js.map