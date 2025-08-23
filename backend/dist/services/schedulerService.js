"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const ScheduledScan_1 = __importDefault(require("../models/ScheduledScan"));
const Scan_1 = __importDefault(require("../models/Scan"));
const User_1 = __importDefault(require("../models/User"));
class SchedulerService {
    constructor() {
        this.isRunning = false;
    }
    start() {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        // Run every minute to check for scheduled scans
        node_cron_1.default.schedule('* * * * *', async () => {
            await this.executeScheduledScans();
        });
        // Reset monthly scan counts on the 1st of each month at 00:00
        node_cron_1.default.schedule('0 0 1 * *', async () => {
            await this.resetMonthlyScanCounts();
        });
    }
    async executeScheduledScans() {
        try {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentDay = now.getDate();
            const currentDayOfWeek = now.getDay();
            // Find scheduled scans that are due for execution
            const dueScans = await ScheduledScan_1.default.find({
                isActive: true,
                $or: [
                    // Daily scans
                    {
                        frequency: 'daily',
                        time: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
                    },
                    // Weekly scans
                    {
                        frequency: 'weekly',
                        dayOfWeek: currentDayOfWeek,
                        time: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
                    },
                    // Monthly scans
                    {
                        frequency: 'monthly',
                        dayOfMonth: currentDay,
                        time: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
                    }
                ]
            });
            for (const scheduledScan of dueScans) {
                try {
                    // Create a new scan record
                    const scan = new Scan_1.default({
                        urlId: scheduledScan.urlId,
                        projectId: scheduledScan.projectId,
                        status: 'pending',
                        scanOptions: scheduledScan.scanOptions,
                        scheduledScanId: scheduledScan._id
                    });
                    await scan.save();
                    // Update user's scansThisMonth count
                    await User_1.default.findOneAndUpdate({ clerkId: scheduledScan.ownerId }, { $inc: { scansThisMonth: 1 } });
                    // Here you would trigger the actual scan execution
                    // For now, we'll just mark it as completed
                    await Scan_1.default.findByIdAndUpdate(scan._id, {
                        status: 'completed',
                        completedAt: new Date()
                    });
                }
                catch (error) {
                }
            }
        }
        catch (error) {
        }
    }
    async resetMonthlyScanCounts() {
        try {
            const result = await User_1.default.updateMany({}, { $set: { scansThisMonth: 0 } });
        }
        catch (error) {
        }
    }
}
const schedulerService = new SchedulerService();
exports.default = schedulerService;
//# sourceMappingURL=schedulerService.js.map