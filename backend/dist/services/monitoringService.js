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
        this.websiteData = new Map();
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
            // Update our internal tracking
            this.websiteData.set(website._id.toString(), {
                interval: website.interval,
                lastCheck: new Date()
            });
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
     * Start monitoring a website with proper interval management
     */
    startMonitoring(website) {
        const websiteId = website._id.toString();
        if (!website.isActive) {
            console.log(`Monitoring not started for ${website.name} - website is inactive`);
            this.stopMonitoring(websiteId);
            return;
        }
        // Clear existing interval if any
        this.stopMonitoring(websiteId);
        // Convert interval to milliseconds
        const intervalMs = this.getIntervalMs(website.interval);
        console.log(`Starting monitoring for ${website.name} with ${website.interval} interval (${intervalMs}ms)`);
        // Perform initial check
        this.performCheck(website);
        // Set up recurring checks with proper interval management
        const intervalId = setInterval(async () => {
            try {
                // Fetch fresh website data to ensure we have the latest settings
                const freshWebsite = await Website_1.default.findById(website._id);
                if (!freshWebsite) {
                    console.log(`Website ${website.name} no longer exists, stopping monitoring`);
                    this.stopMonitoring(websiteId);
                    return;
                }
                if (!freshWebsite.isActive) {
                    console.log(`Website ${website.name} is no longer active, stopping monitoring`);
                    this.stopMonitoring(websiteId);
                    return;
                }
                // Check if interval has changed
                const currentData = this.websiteData.get(websiteId);
                if (currentData && currentData.interval !== freshWebsite.interval) {
                    console.log(`Interval changed for ${website.name}: ${currentData.interval} -> ${freshWebsite.interval}`);
                    // Restart monitoring with new interval
                    this.stopMonitoring(websiteId);
                    this.startMonitoring(freshWebsite);
                    return;
                }
                // Perform the check
                await this.performCheck(freshWebsite);
            }
            catch (error) {
                console.error(`Error in monitoring interval for ${website.name}:`, error);
            }
        }, intervalMs);
        this.intervals.set(websiteId, intervalId);
        this.websiteData.set(websiteId, {
            interval: website.interval,
            lastCheck: new Date()
        });
        console.log(`✅ Started monitoring ${website.name} with ${website.interval} interval`);
    }
    /**
     * Stop monitoring a website
     */
    stopMonitoring(websiteId) {
        const intervalId = this.intervals.get(websiteId);
        if (intervalId) {
            clearInterval(intervalId);
            this.intervals.delete(websiteId);
            this.websiteData.delete(websiteId);
            console.log(`🛑 Stopped monitoring website ${websiteId}`);
        }
    }
    /**
     * Restart monitoring for a website (useful when interval changes)
     */
    async restartMonitoring(websiteId) {
        try {
            const website = await Website_1.default.findById(websiteId);
            if (website) {
                this.stopMonitoring(websiteId);
                this.startMonitoring(website);
            }
        }
        catch (error) {
            console.error(`Error restarting monitoring for website ${websiteId}:`, error);
        }
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
        const details = Array.from(this.websiteData.entries()).map(([id, data]) => ({
            id,
            interval: data.interval,
            lastCheck: data.lastCheck
        }));
        return { active, total: active, details };
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
    /**
     * Get detailed monitoring information for debugging
     */
    getDetailedStatus() {
        console.log('📊 Current Monitoring Status:');
        console.log(`Active intervals: ${this.intervals.size}`);
        this.websiteData.forEach((data, websiteId) => {
            console.log(`  - Website ${websiteId}: ${data.interval} interval, last check: ${data.lastCheck.toISOString()}`);
        });
    }
}
exports.default = MonitoringService.getInstance();
//# sourceMappingURL=monitoringService.js.map