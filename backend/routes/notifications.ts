import express, { Request, Response, Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import notificationService from '../services/notificationService';
import mongoose from 'mongoose';
import Notification from '../models/Notification';

interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * GET /api/notifications
 * Get notifications for the authenticated user
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const skip = parseInt(req.query.skip as string) || 0;

    const { notifications, total } = await notificationService.getUserNotifications(
      userId,
      limit,
      skip
    );

    res.json({
      notifications,
      total,
      hasMore: total > skip + notifications.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * GET /api/notifications/unread-count
 * Get unread notification count for the authenticated user
 */
router.get('/unread-count', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const count = await notificationService.getUnreadCount(userId);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

/**
 * POST /api/notifications/test
 * Create test notifications for the authenticated user
 */
router.post('/test', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Create test notifications
    const testNotifications = [
      {
        type: 'scan_completed' as const,
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
        type: 'monitoring_alert' as const,
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
        type: 'new_feature' as const,
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
      const notification = new Notification({
        userId: new mongoose.Types.ObjectId(userId),
        ...notificationData
      });
      await notification.save();
      createdNotifications.push(notification);
    }

    res.json({ 
      message: 'Test notifications created successfully',
      notifications: createdNotifications
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create test notifications' });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a notification as read
 */
router.patch('/:id/read', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const notification = await notificationService.markAsRead(id, userId);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ notification });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

/**
 * PATCH /api/notifications/mark-all-read
 * Mark all notifications as read for the authenticated user
 */
router.patch('/mark-all-read', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    await notificationService.markAllAsRead(userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const deleted = await notificationService.deleteNotification(id, userId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

/**
 * DELETE /api/notifications
 * Delete all notifications for the authenticated user
 */
router.delete('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    await notificationService.deleteAllNotifications(userId);
    res.json({ message: 'All notifications deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete all notifications' });
  }
});

export default router; 