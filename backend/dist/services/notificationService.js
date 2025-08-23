"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Notification_1 = __importDefault(require("../models/Notification"));
const mongoose_1 = __importDefault(require("mongoose"));
class NotificationService {
    constructor() { }
    static getInstance() {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }
    /**
     * Create a scan completed notification
     */
    async createScanCompletedNotification(userId, scanId, projectId, url, scanResults) {
        const notification = new Notification_1.default({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            type: 'scan_completed',
            title: 'Scan Completed Successfully',
            message: `Your website scan for ${url} has been completed successfully.`,
            read: false,
            data: {
                scanId,
                projectId,
                url,
                scanResults
            },
            action: {
                label: 'View Report',
                href: `/scans/${scanId}`
            }
        });
        return await notification.save();
    }
    /**
     * Create a scan failed notification
     */
    async createScanFailedNotification(userId, scanId, projectId, url, errorMessage) {
        const notification = new Notification_1.default({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            type: 'scan_failed',
            title: 'Scan Failed',
            message: `Website scan for ${url} failed: ${errorMessage}`,
            read: false,
            data: {
                scanId,
                projectId,
                url,
                errorMessage
            },
            action: {
                label: 'Retry Scan',
                href: `/projects/${projectId}`
            }
        });
        return await notification.save();
    }
    /**
     * Create a monitoring alert notification
     */
    async createMonitoringAlertNotification(userId, websiteId, websiteName, url, alertType) {
        let title;
        let message;
        switch (alertType) {
            case 'slow_response':
                title = 'Slow Response Time Alert';
                message = `${websiteName} (${url}) is experiencing slow response times.`;
                break;
            case 'high_error_rate':
                title = 'High Error Rate Alert';
                message = `${websiteName} (${url}) is experiencing a high error rate.`;
                break;
            case 'downtime':
                title = 'Website Down Alert';
                message = `${websiteName} (${url}) is currently offline.`;
                break;
        }
        const notification = new Notification_1.default({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            type: 'monitoring_alert',
            title,
            message,
            read: false,
            data: {
                websiteId,
                url
            },
            action: {
                label: 'Check Status',
                href: '/monitoring'
            }
        });
        return await notification.save();
    }
    /**
     * Create a website offline notification
     */
    async createWebsiteOfflineNotification(userId, websiteId, websiteName, url) {
        const notification = new Notification_1.default({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            type: 'website_offline',
            title: 'Website Went Offline',
            message: `${websiteName} (${url}) is now offline.`,
            read: false,
            data: {
                websiteId,
                url
            },
            action: {
                label: 'View Details',
                href: '/monitoring'
            }
        });
        return await notification.save();
    }
    /**
     * Create a website online notification
     */
    async createWebsiteOnlineNotification(userId, websiteId, websiteName, url) {
        const notification = new Notification_1.default({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            type: 'website_online',
            title: 'Website Back Online',
            message: `${websiteName} (${url}) is now back online.`,
            read: false,
            data: {
                websiteId,
                url
            },
            action: {
                label: 'View Status',
                href: '/monitoring'
            }
        });
        return await notification.save();
    }
    /**
     * Create a system maintenance notification
     */
    async createSystemMaintenanceNotification(userId, message) {
        const notification = new Notification_1.default({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            type: 'system_maintenance',
            title: 'System Maintenance',
            message,
            read: false,
            action: {
                label: 'Learn More',
                href: '/settings'
            }
        });
        return await notification.save();
    }
    /**
     * Create a new feature notification
     */
    async createNewFeatureNotification(userId, featureName, description) {
        const notification = new Notification_1.default({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            type: 'new_feature',
            title: `New Feature: ${featureName}`,
            message: description,
            read: false,
            action: {
                label: 'Try Now',
                href: '/dashboard'
            }
        });
        return await notification.save();
    }
    /**
     * Create a security alert notification
     */
    async createSecurityAlertNotification(userId, alertType, message, url) {
        const notification = new Notification_1.default({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            type: 'security_alert',
            title: `Security Alert: ${alertType}`,
            message,
            read: false,
            data: {
                url
            },
            action: {
                label: 'Review Security',
                href: '/reports'
            }
        });
        return await notification.save();
    }
    /**
     * Get notifications for a user
     */
    async getUserNotifications(userId, limit = 20, skip = 0) {
        const [notifications, total] = await Promise.all([
            Notification_1.default.find({ userId: new mongoose_1.default.Types.ObjectId(userId) })
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip)
                .lean(),
            Notification_1.default.countDocuments({ userId: new mongoose_1.default.Types.ObjectId(userId) })
        ]);
        return { notifications, total };
    }
    /**
     * Get unread notification count for a user
     */
    async getUnreadCount(userId) {
        return await Notification_1.default.countDocuments({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            read: false
        });
    }
    /**
     * Mark notification as read
     */
    async markAsRead(notificationId, userId) {
        return await Notification_1.default.findOneAndUpdate({ _id: notificationId, userId: new mongoose_1.default.Types.ObjectId(userId) }, { read: true }, { new: true });
    }
    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId) {
        await Notification_1.default.updateMany({ userId: new mongoose_1.default.Types.ObjectId(userId), read: false }, { read: true });
    }
    /**
     * Delete a notification
     */
    async deleteNotification(notificationId, userId) {
        const result = await Notification_1.default.deleteOne({
            _id: notificationId,
            userId: new mongoose_1.default.Types.ObjectId(userId)
        });
        return result.deletedCount > 0;
    }
    /**
     * Delete all notifications for a user
     */
    async deleteAllNotifications(userId) {
        await Notification_1.default.deleteMany({ userId: new mongoose_1.default.Types.ObjectId(userId) });
    }
    /**
     * Clean up old notifications (older than 30 days)
     */
    async cleanupOldNotifications() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        await Notification_1.default.deleteMany({
            createdAt: { $lt: thirtyDaysAgo }
        });
    }
}
exports.default = NotificationService.getInstance();
//# sourceMappingURL=notificationService.js.map