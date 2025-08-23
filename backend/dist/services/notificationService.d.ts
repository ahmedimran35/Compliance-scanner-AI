import { INotification } from '../models/Notification';
declare class NotificationService {
    private static instance;
    private constructor();
    static getInstance(): NotificationService;
    /**
     * Create a scan completed notification
     */
    createScanCompletedNotification(userId: string, scanId: string, projectId: string, url: string, scanResults: any): Promise<INotification>;
    /**
     * Create a scan failed notification
     */
    createScanFailedNotification(userId: string, scanId: string, projectId: string, url: string, errorMessage: string): Promise<INotification>;
    /**
     * Create a monitoring alert notification
     */
    createMonitoringAlertNotification(userId: string, websiteId: string, websiteName: string, url: string, alertType: 'slow_response' | 'high_error_rate' | 'downtime'): Promise<INotification>;
    /**
     * Create a website offline notification
     */
    createWebsiteOfflineNotification(userId: string, websiteId: string, websiteName: string, url: string): Promise<INotification>;
    /**
     * Create a website online notification
     */
    createWebsiteOnlineNotification(userId: string, websiteId: string, websiteName: string, url: string): Promise<INotification>;
    /**
     * Create a system maintenance notification
     */
    createSystemMaintenanceNotification(userId: string, message: string): Promise<INotification>;
    /**
     * Create a new feature notification
     */
    createNewFeatureNotification(userId: string, featureName: string, description: string): Promise<INotification>;
    /**
     * Create a security alert notification
     */
    createSecurityAlertNotification(userId: string, alertType: string, message: string, url?: string): Promise<INotification>;
    /**
     * Get notifications for a user
     */
    getUserNotifications(userId: string, limit?: number, skip?: number): Promise<{
        notifications: INotification[];
        total: number;
    }>;
    /**
     * Get unread notification count for a user
     */
    getUnreadCount(userId: string): Promise<number>;
    /**
     * Mark notification as read
     */
    markAsRead(notificationId: string, userId: string): Promise<INotification | null>;
    /**
     * Mark all notifications as read for a user
     */
    markAllAsRead(userId: string): Promise<void>;
    /**
     * Delete a notification
     */
    deleteNotification(notificationId: string, userId: string): Promise<boolean>;
    /**
     * Delete all notifications for a user
     */
    deleteAllNotifications(userId: string): Promise<void>;
    /**
     * Clean up old notifications (older than 30 days)
     */
    cleanupOldNotifications(): Promise<void>;
}
declare const _default: NotificationService;
export default _default;
//# sourceMappingURL=notificationService.d.ts.map