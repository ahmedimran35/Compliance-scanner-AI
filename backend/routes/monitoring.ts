import express from 'express';
import { Response, NextFunction } from 'express';
import Website, { IWebsite } from '../models/Website';
import monitoringService from '../services/monitoringService';
import { authenticateToken } from '../middlewares/auth';

// Import the AuthenticatedRequest interface from auth middleware
interface AuthenticatedRequest extends express.Request {
  user?: any;
}

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * GET /api/monitoring/websites
 * Get all websites for the authenticated user
 */
router.get('/websites', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const websites = await Website.find({ userId }).sort({ createdAt: -1 });
    
    res.json({ 
      websites: websites.map(website => ({
        _id: website._id,
        name: website.name,
        url: website.url,
        interval: website.interval,
        isActive: website.isActive,
        lastCheck: website.lastCheck,
        status: website.status,
        responseTime: website.responseTime,
        uptime: website.uptime,
        totalChecks: website.totalChecks,
        successfulChecks: website.successfulChecks,
        failedChecks: website.failedChecks,
        createdAt: website.createdAt,
        updatedAt: website.updatedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch websites' });
  }
});

/**
 * POST /api/monitoring/websites
 * Create a new website for monitoring
 */
router.post('/websites', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { name, url, interval } = req.body;

    // Validation
    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }

    if (!['1min', '5min', '30min'].includes(interval)) {
      return res.status(400).json({ error: 'Invalid interval. Must be 1min, 5min, or 30min' });
    }

    // Check if URL is valid
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Check if website already exists for this user
    const existingWebsite = await Website.findOne({ userId, url });
    if (existingWebsite) {
      return res.status(400).json({ error: 'Website with this URL already exists' });
    }

    // Create new website
    const website = new Website({
      userId,
      name: name.trim(),
      url: url.trim(),
      interval: interval || '5min',
      isActive: true
    });

    await website.save();

    // Start monitoring the website
    monitoringService.startMonitoring(website);

    res.status(201).json({ 
      website: {
        _id: website._id,
        name: website.name,
        url: website.url,
        interval: website.interval,
        isActive: website.isActive,
        lastCheck: website.lastCheck,
        status: website.status,
        responseTime: website.responseTime,
        uptime: website.uptime,
        totalChecks: website.totalChecks,
        successfulChecks: website.successfulChecks,
        failedChecks: website.failedChecks,
        createdAt: website.createdAt,
        updatedAt: website.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create website' });
  }
});

/**
 * GET /api/monitoring/websites/:id
 * Get a specific website by ID
 */
router.get('/websites/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const website = await Website.findOne({ _id: id, userId });
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    res.json({ 
      website: {
        _id: website._id,
        name: website.name,
        url: website.url,
        interval: website.interval,
        isActive: website.isActive,
        lastCheck: website.lastCheck,
        status: website.status,
        responseTime: website.responseTime,
        uptime: website.uptime,
        totalChecks: website.totalChecks,
        successfulChecks: website.successfulChecks,
        failedChecks: website.failedChecks,
        createdAt: website.createdAt,
        updatedAt: website.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch website' });
  }
});

/**
 * PUT /api/monitoring/websites/:id
 * Update a website
 */
router.put('/websites/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const { name, url, interval } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validation
    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }

    if (!['1min', '5min', '30min'].includes(interval)) {
      return res.status(400).json({ error: 'Invalid interval. Must be 1min, 5min, or 30min' });
    }

    // Check if URL is valid
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const website = await Website.findOne({ _id: id, userId });
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    // Check if URL is already used by another website
    const existingWebsite = await Website.findOne({ 
      userId, 
      url, 
      _id: { $ne: id } 
    });
    if (existingWebsite) {
      return res.status(400).json({ error: 'Website with this URL already exists' });
    }

    // Store old interval for comparison
    const oldInterval = website.interval;
    const wasActive = website.isActive;

    // Update website
    website.name = name.trim();
    website.url = url.trim();
    website.interval = interval;
    await website.save();

    // Restart monitoring with new settings if interval changed or website was active
    if (oldInterval !== interval || wasActive) {
      await monitoringService.restartMonitoring(id);
    }

    res.json({ 
      website: {
        _id: website._id,
        name: website.name,
        url: website.url,
        interval: website.interval,
        isActive: website.isActive,
        lastCheck: website.lastCheck,
        status: website.status,
        responseTime: website.responseTime,
        uptime: website.uptime,
        totalChecks: website.totalChecks,
        successfulChecks: website.successfulChecks,
        failedChecks: website.failedChecks,
        createdAt: website.createdAt,
        updatedAt: website.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update website' });
  }
});

/**
 * PATCH /api/monitoring/websites/:id/toggle
 * Toggle monitoring status for a website
 */
router.patch('/websites/:id/toggle', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const { isActive } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const website = await Website.findOne({ _id: id, userId });
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    website.isActive = isActive;
    await website.save();

    if (isActive) {
      // Start monitoring with proper interval management
      monitoringService.startMonitoring(website);
    } else {
      // Stop monitoring
      monitoringService.stopMonitoring(id);
    }

    res.json({ 
      website: {
        _id: website._id,
        name: website.name,
        url: website.url,
        interval: website.interval,
        isActive: website.isActive,
        lastCheck: website.lastCheck,
        status: website.status,
        responseTime: website.responseTime,
        uptime: website.uptime,
        totalChecks: website.totalChecks,
        successfulChecks: website.successfulChecks,
        failedChecks: website.failedChecks,
        createdAt: website.createdAt,
        updatedAt: website.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle website status' });
  }
});

/**
 * DELETE /api/monitoring/websites/:id
 * Delete a website
 */
router.delete('/websites/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const website = await Website.findOne({ _id: id, userId });
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    // Stop monitoring
    monitoringService.stopMonitoring(id);

    // Delete website
    await Website.findByIdAndDelete(id);

    res.json({ message: 'Website deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete website' });
  }
});

/**
 * POST /api/monitoring/websites/:id/check
 * Manually trigger a check for a website
 */
router.post('/websites/:id/check', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const website = await Website.findOne({ _id: id, userId });
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    // Perform manual check
    await monitoringService.performCheck(website);

    // Fetch updated website data
    const updatedWebsite = await Website.findById(id);

    res.json({ 
      website: {
        _id: updatedWebsite!._id,
        name: updatedWebsite!.name,
        url: updatedWebsite!.url,
        interval: updatedWebsite!.interval,
        isActive: updatedWebsite!.isActive,
        lastCheck: updatedWebsite!.lastCheck,
        status: updatedWebsite!.status,
        responseTime: updatedWebsite!.responseTime,
        uptime: updatedWebsite!.uptime,
        totalChecks: updatedWebsite!.totalChecks,
        successfulChecks: updatedWebsite!.successfulChecks,
        failedChecks: updatedWebsite!.failedChecks,
        createdAt: updatedWebsite!.createdAt,
        updatedAt: updatedWebsite!.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to perform check' });
  }
});

/**
 * GET /api/monitoring/stats
 * Get monitoring statistics for the user
 */
router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const websites = await Website.find({ userId });
    
    const stats = {
      totalWebsites: websites.length,
      activeWebsites: websites.filter(w => w.isActive).length,
      onlineWebsites: websites.filter(w => w.status === 'online').length,
      offlineWebsites: websites.filter(w => w.status === 'offline').length,
      warningWebsites: websites.filter(w => w.status === 'warning').length,
      averageResponseTime: websites.length > 0 
        ? websites.reduce((sum, w) => sum + w.responseTime, 0) / websites.length 
        : 0,
      averageUptime: websites.length > 0 
        ? websites.reduce((sum, w) => sum + w.uptime, 0) / websites.length 
        : 0,
      totalChecks: websites.reduce((sum, w) => sum + w.totalChecks, 0),
      successfulChecks: websites.reduce((sum, w) => sum + w.successfulChecks, 0),
      failedChecks: websites.reduce((sum, w) => sum + w.failedChecks, 0)
    };

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch monitoring stats' });
  }
});

/**
 * GET /api/monitoring/status
 * Get detailed monitoring status
 */
router.get('/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const websites = await Website.find({ userId });
    const monitoringStatus = monitoringService.getMonitoringStatus();
    

    monitoringService.getDetailedStatus();

    res.json({ 
      monitoringStatus,
      websites: websites.map(website => ({
        _id: website._id,
        name: website.name,
        url: website.url,
        interval: website.interval,
        isActive: website.isActive,
        status: website.status,
        lastCheck: website.lastCheck
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch monitoring status' });
  }
});

export default router; 