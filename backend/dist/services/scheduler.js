"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ScheduledScan_1 = __importDefault(require("../models/ScheduledScan"));
const scanner_1 = require("./scanner");
const Scan_1 = __importDefault(require("../models/Scan"));
class SchedulerService {
    constructor() {
        this.interval = null;
    }
    start() {
        // Check for scheduled scans every minute
        this.interval = setInterval(async () => {
            await this.checkScheduledScans();
        }, 60000); // 1 minute
        console.log('Scheduler service started');
    }
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            console.log('Scheduler service stopped');
        }
    }
    async checkScheduledScans() {
        try {
            const now = new Date();
            // Find all active scheduled scans that are due
            const dueScans = await ScheduledScan_1.default.find({
                isActive: true,
                nextRun: { $lte: now }
            }).populate('urlId');
            console.log(`Found ${dueScans.length} scheduled scans due for execution`);
            for (const scheduledScan of dueScans) {
                try {
                    await this.executeScheduledScan(scheduledScan);
                }
                catch (error) {
                    console.error(`Error executing scheduled scan ${scheduledScan._id}:`, error);
                }
            }
        }
        catch (error) {
            console.error('Error checking scheduled scans:', error);
        }
    }
    async executeScheduledScan(scheduledScan) {
        try {
            console.log(`🚀 Executing scheduled scan for URL: ${scheduledScan.urlId.url}`);
            console.log(`📅 Schedule: ${scheduledScan.frequency} at ${scheduledScan.time}`);
            console.log(`🔍 Scan Options: ${JSON.stringify(scheduledScan.scanOptions)}`);
            // Create a new scan record
            const scan = new Scan_1.default({
                urlId: scheduledScan.urlId._id,
                projectId: scheduledScan.projectId,
                status: 'pending',
                scanOptions: scheduledScan.scanOptions,
            });
            await scan.save();
            console.log(`✅ Created scan record with ID: ${scan._id}`);
            // Start the scan asynchronously
            this.performScan(scan._id.toString(), scheduledScan.urlId.url, scheduledScan.scanOptions)
                .catch(error => {
                console.error('❌ Scheduled scan failed:', error);
            });
            // Update the scheduled scan's next run time
            scheduledScan.updateNextRun();
            await scheduledScan.save();
            console.log(`✅ Scheduled scan ${scheduledScan._id} executed successfully`);
            console.log(`⏰ Next run scheduled for: ${scheduledScan.nextRun}`);
        }
        catch (error) {
            console.error(`❌ Error executing scheduled scan ${scheduledScan._id}:`, error);
            throw error;
        }
    }
    async performScan(scanId, url, options) {
        try {
            // Update scan status to scanning
            await Scan_1.default.findByIdAndUpdate(scanId, { status: 'scanning' });
            // Perform the scan
            const scanner = new scanner_1.WebsiteScanner(url);
            const results = await scanner.scan(options);
            // Update scan with results
            await Scan_1.default.findByIdAndUpdate(scanId, {
                status: 'completed',
                results,
                scanDuration: results.scanDuration || 0,
            });
            console.log(`Scheduled scan completed for ${url} in ${results.scanDuration || 0}ms`);
        }
        catch (error) {
            console.error(`Scheduled scan failed for ${url}:`, error);
            // Update scan with error
            await Scan_1.default.findByIdAndUpdate(scanId, {
                status: 'failed',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}
exports.default = new SchedulerService();
//# sourceMappingURL=scheduler.js.map