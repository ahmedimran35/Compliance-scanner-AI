import axios, { AxiosResponse } from 'axios';
import Website, { IWebsite } from '../models/Website';
import notificationService from './notificationService';
import User from '../models/User';

interface CheckResult {
  isOnline: boolean;
  responseTime: number;
  statusCode?: number;
  error?: string;
}

class MonitoringService {
  private static instance: MonitoringService;
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private websiteData: Map<string, { interval: string; lastCheck: Date }> = new Map();

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * Check if a website is online
   */
  private async checkWebsite(url: string): Promise<CheckResult> {
    const startTime = Date.now();
    
    try {
      const response: AxiosResponse = await axios.get(url, {
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
    } catch (error: any) {
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
  public async performCheck(website: IWebsite): Promise<void> {
    try {

      
      const result = await this.checkWebsite(website.url);
      
      // Store previous status for comparison
      const previousStatus = website.status;
      
      // Update website with check results
      await website.updateCheckResult(result.isOnline, result.responseTime);
      
      // Update our internal tracking
      this.websiteData.set(website._id.toString(), {
        interval: website.interval,
        lastCheck: new Date()
      });
      
      // Log the result
      if (result.isOnline) {

        
        // Create notification if website came back online
        if (previousStatus === 'offline' || previousStatus === 'warning') {
          try {
            const user = await User.findById(website.userId);
            if (user) {
              await notificationService.createWebsiteOnlineNotification(
                (user as any)._id.toString(),
                website._id.toString(),
                website.name,
                website.url
              );
            }
          } catch (notificationError) {
          }
        }
      } else {

        
        // Create notification if website went offline
        if (previousStatus === 'online') {
          try {
            const user = await User.findById(website.userId);
            if (user) {
              await notificationService.createWebsiteOfflineNotification(
                (user as any)._id.toString(),
                website._id.toString(),
                website.name,
                website.url
              );
            }
          } catch (notificationError) {
          }
        }
      }
      
    } catch (error) {
      
      // Set warning status if there's an error
      await website.setWarningStatus();
    }
  }

  /**
   * Start monitoring a website with proper interval management
   */
  public startMonitoring(website: IWebsite): void {
    const websiteId = website._id.toString();
    
    if (!website.isActive) {
      
      this.stopMonitoring(websiteId);
      return;
    }

    // Clear existing interval if any
    this.stopMonitoring(websiteId);

    // Convert interval to milliseconds
    const intervalMs = this.getIntervalMs(website.interval);
    
    
    
    // Perform initial check
    this.performCheck(website);
    
    // Set up recurring checks with proper interval management
    const intervalId = setInterval(async () => {
      try {
        // Fetch fresh website data to ensure we have the latest settings
        const freshWebsite = await Website.findById(website._id);
        if (!freshWebsite) {
  
          this.stopMonitoring(websiteId);
          return;
        }

        if (!freshWebsite.isActive) {
  
          this.stopMonitoring(websiteId);
          return;
        }

        // Check if interval has changed
        const currentData = this.websiteData.get(websiteId);
        if (currentData && currentData.interval !== freshWebsite.interval) {
  
          // Restart monitoring with new interval
          this.stopMonitoring(websiteId);
          this.startMonitoring(freshWebsite);
          return;
        }

        // Perform the check
        await this.performCheck(freshWebsite);
        
      } catch (error) {
      }
    }, intervalMs);

    this.intervals.set(websiteId, intervalId);
    this.websiteData.set(websiteId, {
      interval: website.interval,
      lastCheck: new Date()
    });
    
    
  }

  /**
   * Stop monitoring a website
   */
  public stopMonitoring(websiteId: string): void {
    const intervalId = this.intervals.get(websiteId);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(websiteId);
      this.websiteData.delete(websiteId);

    }
  }

  /**
   * Restart monitoring for a website (useful when interval changes)
   */
  public async restartMonitoring(websiteId: string): Promise<void> {
    try {
      const website = await Website.findById(websiteId);
      if (website) {
        this.stopMonitoring(websiteId);
        this.startMonitoring(website);
      }
    } catch (error) {
    }
  }

  /**
   * Start monitoring all active websites for a user
   */
  public async startMonitoringForUser(userId: string): Promise<void> {
    try {
      const websites = await Website.find({ userId, isActive: true });
      

      
      websites.forEach(website => {
        this.startMonitoring(website);
      });
      

    } catch (error) {
    }
  }

  /**
   * Stop monitoring all websites for a user
   */
  public async stopMonitoringForUser(userId: string): Promise<void> {
    try {
      const websites = await Website.find({ userId });
      
      websites.forEach(website => {
        this.stopMonitoring(website._id.toString());
      });
      

    } catch (error) {
    }
  }

  /**
   * Convert interval string to milliseconds
   */
  private getIntervalMs(interval: string): number {
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
  public getMonitoringStatus(): { active: number; total: number; details: Array<{ id: string; interval: string; lastCheck: Date }> } {
    const active = this.intervals.size;
    const details = Array.from(this.websiteData.entries()).map(([id, data]) => ({
      id,
      interval: data.interval,
      lastCheck: data.lastCheck
    }));
    
    return { active, total: active, details };
  }

  /**
   * Clean up all monitoring intervals (useful for graceful shutdown)
   */
  public cleanup(): void {
    this.intervals.forEach((intervalId, websiteId) => {
      clearInterval(intervalId);
    });
    this.intervals.clear();
    this.websiteData.clear();

  }

  /**
   * Get detailed monitoring information
   */
  public getDetailedStatus(): void {
    // Production monitoring status
  }
}

export default MonitoringService.getInstance(); 