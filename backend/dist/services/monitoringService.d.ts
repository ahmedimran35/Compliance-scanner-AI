import { IWebsite } from '../models/Website';
declare class MonitoringService {
    private static instance;
    private intervals;
    private websiteData;
    static getInstance(): MonitoringService;
    /**
     * Check if a website is online
     */
    private checkWebsite;
    /**
     * Perform a check for a specific website
     */
    performCheck(website: IWebsite): Promise<void>;
    /**
     * Start monitoring a website with its specific interval
     */
    startMonitoring(website: IWebsite): void;
    /**
     * Stop monitoring a website
     */
    stopMonitoring(websiteId: string): void;
    /**
     * Restart monitoring for a website (useful when interval is changed)
     */
    restartMonitoring(website: IWebsite): void;
    /**
     * Start monitoring all active websites for a user
     */
    startMonitoringForUser(userId: string): Promise<void>;
    /**
     * Start monitoring for all users (called on server startup)
     */
    start(): Promise<void>;
    /**
     * Stop monitoring all websites for a user
     */
    stopMonitoringForUser(userId: string): Promise<void>;
    /**
     * Convert interval string to milliseconds
     */
    private getIntervalMs;
    /**
     * Get monitoring status for all websites
     */
    getMonitoringStatus(): {
        active: number;
        total: number;
        intervals: Map<string, string>;
    };
    /**
     * Get detailed monitoring info for debugging
     */
    getDetailedStatus(): void;
    /**
     * Clean up all monitoring intervals (useful for graceful shutdown)
     */
    cleanup(): void;
}
declare const _default: MonitoringService;
export default _default;
//# sourceMappingURL=monitoringService.d.ts.map