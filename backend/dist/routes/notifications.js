"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const notificationService_1 = __importDefault(require("../services/notificationService"));
const mongoose_1 = __importDefault(require("mongoose"));
const Notification_1 = __importDefault(require("../models/Notification"));
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_1.authenticateToken);
/**
 * GET /api/notifications
 * Get notifications for the authenticated user
 */
router.get('/', async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const limit = parseInt(req.query.limit) || 20;
        const skip = parseInt(req.query.skip) || 0;
        const { notifications, total } = await notificationService_1.default.getUserNotifications(userId, limit, skip);
        res.json({
            notifications,
            total,
            hasMore: total > skip + notifications.length
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});
/**
 * GET /api/notifications/unread-count
 * Get unread notification count for the authenticated user
 */
router.get('/unread-count', async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const count = await notificationService_1.default.getUnreadCount(userId);
        res.json({ count });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
});
/**
 * POST /api/notifications/test
 * Create test notifications for the authenticated user
 */
router.post('/test', async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        // Create test notifications
        const testNotifications = [
            {
                type: 'scan_completed',
                title: 'Test Scan Completed',
                message: 'This is a test notification for scan completion.',
                data: {
                    scanId: 'test-scan-id',
                    projectId: 'test-project-id',
                    url: 'https://example.com'
                },
                action: {
                    label: 'View Report',
                    href: '/reports'
                }
            },
            {
                type: 'monitoring_alert',
                title: 'Test Monitoring Alert',
                message: 'This is a test monitoring alert notification.',
                data: {
                    websiteId: 'test-website-id',
                    url: 'https://example.com'
                },
                action: {
                    label: 'Check Status',
                    href: '/monitoring'
                }
            },
            {
                type: 'new_feature',
                title: 'Test New Feature',
                message: 'This is a test notification for new features.',
                action: {
                    label: 'Try Now',
                    href: '/dashboard'
                }
            }
        ];
        const createdNotifications = [];
        for (const notificationData of testNotifications) {
            const notification = new Notification_1.default({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                ...notificationData
            });
            await notification.save();
            createdNotifications.push(notification);
        }
        res.json({
            message: 'Test notifications created successfully',
            notifications: createdNotifications
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create test notifications' });
    }
});
/**
 * PATCH /api/notifications/:id/read
 * Mark a notification as read
 */
router.patch('/:id/read', async (req, res) => {
    try {
        const userId = req.user?._id;
        const { id } = req.params;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const notification = await notificationService_1.default.markAsRead(id, userId);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        res.json({ notification });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});
/**
 * PATCH /api/notifications/mark-all-read
 * Mark all notifications as read for the authenticated user
 */
router.patch('/mark-all-read', async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        await notificationService_1.default.markAllAsRead(userId);
        res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
});
/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.user?._id;
        const { id } = req.params;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const deleted = await notificationService_1.default.deleteNotification(id, userId);
        if (!deleted) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        res.json({ message: 'Notification deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});
/**
 * DELETE /api/notifications
 * Delete all notifications for the authenticated user
 */
router.delete('/', async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        await notificationService_1.default.deleteAllNotifications(userId);
        res.json({ message: 'All notifications deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete all notifications' });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map