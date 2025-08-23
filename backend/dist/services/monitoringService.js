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
            const result = await this.checkWebsite(website.url);
            // Store previous status for comparison
            const previousStatus = website.status;
            // Update website with check results
            await website.updateCheckResult(result.isOnline, result.responseTime);
            // Update stored website data
            this.websiteData.set(website._id.toString(), website);
            // Log the result
            if (result.isOnline) {
                // Create notification if website came back online
                if (previousStatus === 'offline' || previousStatus === 'warning') {
                    try {
                        const user = await User_1.default.findById(website.userId);
                        if (user) {
                            await notificationService_1.default.createWebsiteOnlineNotification(user._id.toString(), website._id.toString(), website.name, website.url);
                        }
                    }
                    catch (notificationError) {
                    }
                }
            }
            else {
                // Create notification if website went offline
                if (previousStatus === 'online') {
                    try {
                        const user = await User_1.default.findById(website.userId);
                        if (user) {
                            await notificationService_1.default.createWebsiteOfflineNotification(user._id.toString(), website._id.toString(), website.name, website.url);
                        }
                    }
                    catch (notificationError) {
                    }
                }
            }
        }
        catch (error) {
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
            return;
        }
        // Clear existing interval if any
        this.stopMonitoring(websiteId);
        // Store website data
        this.websiteData.set(websiteId, website);
        // Convert interval to milliseconds
        const intervalMs = this.getIntervalMs(website.interval);
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
                    await this.performCheck(freshWebsite);
                }
                else {
                    // Stop monitoring if website is no longer active
                    this.stopMonitoring(websiteId);
                }
            }
            catch (error) {
            }
        }, intervalMs);
        this.intervals.set(websiteId, intervalId);
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
        }
        else {
        }
    }
    /**
     * Restart monitoring for a website (useful when interval is changed)
     */
    restartMonitoring(website) {
        const websiteId = website._id.toString();
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
            websites.forEach(website => {
                this.startMonitoring(website);
            });
        }
        catch (error) {
        }
    }
    /**
     * Start monitoring for all users (called on server startup)
     */
    async start() {
        try {
            // Get all users
            const users = await User_1.default.find({});
            // Start monitoring for each user
            for (const user of users) {
                await this.startMonitoringForUser(user._id.toString());
            }
        }
        catch (error) {
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
        }
        catch (error) {
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
     */
    getDetailedStatus() {
        this.websiteData.forEach((website, id) => {
            const hasInterval = this.intervals.has(id);
        });
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
    }
}
exports.default = MonitoringService.getInstance();
//# sourceMappingURL=monitoringService.js.map