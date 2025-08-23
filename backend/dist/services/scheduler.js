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
    }
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
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
            for (const scheduledScan of dueScans) {
                try {
                    await this.executeScheduledScan(scheduledScan);
                }
                catch (error) {
                }
            }
        }
        catch (error) {
        }
    }
    async executeScheduledScan(scheduledScan) {
        try {
            // Create a new scan record
            const scan = new Scan_1.default({
                urlId: scheduledScan.urlId._id,
                projectId: scheduledScan.projectId,
                status: 'pending',
                scanOptions: scheduledScan.scanOptions,
            });
            await scan.save();
            // Start the scan asynchronously
            this.performScan(scan._id.toString(), scheduledScan.urlId.url, scheduledScan.scanOptions)
                .catch(error => {
            });
            // Update the scheduled scan's next run time
            scheduledScan.updateNextRun();
            await scheduledScan.save();
        }
        catch (error) {
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
        }
        catch (error) {
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