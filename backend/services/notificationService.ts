import Notification, { INotification } from '../models/Notification';
import mongoose from 'mongoose';

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Create a scan completed notification
   */
  async createScanCompletedNotification(
    userId: string,
    scanId: string,
    projectId: string,
    url: string,
    scanResults: any
  ): Promise<INotification> {
    const notification = new Notification({
      userId: new mongoose.Types.ObjectId(userId),
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
  async createScanFailedNotification(
    userId: string,
    scanId: string,
    projectId: string,
    url: string,
    errorMessage: string
  ): Promise<INotification> {
    const notification = new Notification({
      userId: new mongoose.Types.ObjectId(userId),
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
  async createMonitoringAlertNotification(
    userId: string,
    websiteId: string,
    websiteName: string,
    url: string,
    alertType: 'slow_response' | 'high_error_rate' | 'downtime'
  ): Promise<INotification> {
    let title: string;
    let message: string;

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

    const notification = new Notification({
      userId: new mongoose.Types.ObjectId(userId),
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
  async createWebsiteOfflineNotification(
    userId: string,
    websiteId: string,
    websiteName: string,
    url: string
  ): Promise<INotification> {
    const notification = new Notification({
      userId: new mongoose.Types.ObjectId(userId),
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
  async createWebsiteOnlineNotification(
    userId: string,
    websiteId: string,
    websiteName: string,
    url: string
  ): Promise<INotification> {
    const notification = new Notification({
      userId: new mongoose.Types.ObjectId(userId),
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
  async createSystemMaintenanceNotification(
    userId: string,
    message: string
  ): Promise<INotification> {
    const notification = new Notification({
      userId: new mongoose.Types.ObjectId(userId),
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
  async createNewFeatureNotification(
    userId: string,
    featureName: string,
    description: string
  ): Promise<INotification> {
    const notification = new Notification({
      userId: new mongoose.Types.ObjectId(userId),
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
  async createSecurityAlertNotification(
    userId: string,
    alertType: string,
    message: string,
    url?: string
  ): Promise<INotification> {
    const notification = new Notification({
      userId: new mongoose.Types.ObjectId(userId),
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
  async getUserNotifications(
    userId: string,
    limit: number = 20,
    skip: number = 0
  ): Promise<{ notifications: INotification[]; total: number }> {
    const [notifications, total] = await Promise.all([
      Notification.find({ userId: new mongoose.Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      Notification.countDocuments({ userId: new mongoose.Types.ObjectId(userId) })
    ]);

    return { notifications, total };
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await Notification.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      read: false
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, userId: new mongoose.Types.ObjectId(userId) },
      { read: true },
      { new: true }
    );
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { userId: new mongoose.Types.ObjectId(userId), read: false },
      { read: true }
    );
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const result = await Notification.deleteOne({
      _id: notificationId,
      userId: new mongoose.Types.ObjectId(userId)
    });
    return result.deletedCount > 0;
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId: string): Promise<void> {
    await Notification.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
  }

  /**
   * Clean up old notifications (older than 30 days)
   */
  async cleanupOldNotifications(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await Notification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo }
    });
  }
}

export default NotificationService.getInstance(); 