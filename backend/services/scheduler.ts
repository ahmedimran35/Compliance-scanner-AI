import ScheduledScan from '../models/ScheduledScan';
import { WebsiteScanner } from './scanner';
import Scan, { IScan } from '../models/Scan';
import mongoose from 'mongoose';

class SchedulerService {
  private interval: NodeJS.Timeout | null = null;

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

  private async checkScheduledScans() {
    try {
      const now = new Date();
      
      // Find all active scheduled scans that are due
      const dueScans = await ScheduledScan.find({
        isActive: true,
        nextRun: { $lte: now }
      }).populate('urlId');


      for (const scheduledScan of dueScans) {
        try {
          await this.executeScheduledScan(scheduledScan);
        } catch (error) {
        }
      }
    } catch (error) {
    }
  }

  private async executeScheduledScan(scheduledScan: any) {
    try {

      // Create a new scan record
      const scan = new Scan({
        urlId: scheduledScan.urlId._id,
        projectId: scheduledScan.projectId,
        status: 'pending',
        scanOptions: scheduledScan.scanOptions,
      }) as IScan;

      await scan.save();

      // Start the scan asynchronously
      this.performScan((scan._id as mongoose.Types.ObjectId).toString(), scheduledScan.urlId.url, scheduledScan.scanOptions)
        .catch(error => {
        });

      // Update the scheduled scan's next run time
      (scheduledScan as any).updateNextRun();
      await scheduledScan.save();

    } catch (error) {
      throw error;
    }
  }

  private async performScan(scanId: string, url: string, options: any) {
    try {
      // Update scan status to scanning
      await Scan.findByIdAndUpdate(scanId, { status: 'scanning' });

      // Perform the scan
      const scanner = new WebsiteScanner(url);
      const results = await scanner.scan(options);

      // Update scan with results
      await Scan.findByIdAndUpdate(scanId, {
        status: 'completed',
        results,
        scanDuration: results.scanDuration || 0,
      });

    } catch (error) {
      
      // Update scan with error
      await Scan.findByIdAndUpdate(scanId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export default new SchedulerService(); 