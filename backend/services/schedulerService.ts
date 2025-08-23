import cron from 'node-cron';
import ScheduledScan from '../models/ScheduledScan';
import Scan from '../models/Scan';
import User from '../models/User';

class SchedulerService {
  private isRunning = false;

  start() {
    if (this.isRunning) {
      console.log('Scheduler service is already running');
      return;
    }

    this.isRunning = true;
    console.log('Scheduler service started');

    // Run every minute to check for scheduled scans
    cron.schedule('* * * * *', async () => {
      await this.executeScheduledScans();
    });

    // Reset monthly scan counts on the 1st of each month at 00:00
    cron.schedule('0 0 1 * *', async () => {
      await this.resetMonthlyScanCounts();
    });

    console.log('Scheduled tasks configured');
  }

  private async executeScheduledScans() {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentDay = now.getDate();
      const currentDayOfWeek = now.getDay();

      // Find scheduled scans that are due for execution
      const dueScans = await ScheduledScan.find({
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

      console.log(`Found ${dueScans.length} scheduled scans due for execution`);

      for (const scheduledScan of dueScans) {
        try {
          // Create a new scan record
          const scan = new Scan({
            urlId: scheduledScan.urlId,
            projectId: scheduledScan.projectId,
            status: 'pending',
            scanOptions: scheduledScan.scanOptions,
            scheduledScanId: scheduledScan._id
          });

          await scan.save();

          // Update user's scansThisMonth count
          await User.findOneAndUpdate(
            { clerkId: scheduledScan.ownerId },
            { $inc: { scansThisMonth: 1 } }
          );

          console.log(`✅ Started scheduled scan ${scheduledScan._id} for URL ${scheduledScan.urlId}`);

          // Here you would trigger the actual scan execution
          // For now, we'll just mark it as completed
          await Scan.findByIdAndUpdate(scan._id, {
            status: 'completed',
            completedAt: new Date()
          });

        } catch (error) {
          console.error(`❌ Error executing scheduled scan ${scheduledScan._id}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Error executing scheduled scans:', error);
    }
  }

  private async resetMonthlyScanCounts() {
    try {
      console.log('🔄 Resetting monthly scan counts for all users...');
      
      const result = await User.updateMany(
        {},
        { $set: { scansThisMonth: 0 } }
      );

      console.log(`✅ Reset scan counts for ${result.modifiedCount} users`);
    } catch (error) {
      console.error('❌ Error resetting monthly scan counts:', error);
    }
  }
}

const schedulerService = new SchedulerService();
export default schedulerService; 