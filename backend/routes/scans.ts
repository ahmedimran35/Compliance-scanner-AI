import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middlewares/auth';
import Scan, { IScan } from '../models/Scan';
import URL from '../models/URL';
import Project from '../models/Project';
import User from '../models/User';
import { WebsiteScanner } from '../services/scanner';
import notificationService from '../services/notificationService';

interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = Router();

// Start a scan for a specific URL
router.post('/:urlId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { urlId } = req.params;
    const { scanOptions } = req.body;

    // Verify URL exists and belongs to user
    const url = await URL.findById(urlId).populate('projectId');
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    const ownerIds = [req.user.clerkId, req.user.email].filter(Boolean);
    const project = await Project.findOne({ 
      _id: url.projectId, 
      ownerId: { $in: ownerIds }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check tier limits for scans - TEMPORARILY DISABLED FOR TESTING
    const user = await User.findOne({ clerkId: req.user.clerkId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // TEMPORARILY REMOVED: Monthly scan limit check for free users
    // Count scans this month
    // const startOfMonth = new Date();
    // startOfMonth.setDate(1);
    // startOfMonth.setHours(0, 0, 0, 0);

    // const scansThisMonth = await Scan.countDocuments({
    //   projectId: project._id,
    //   createdAt: { $gte: startOfMonth }
    // });

    // if (user.tier === 'free' && scansThisMonth >= 5) {
    //   return res.status(403).json({ 
    //     error: 'Scan limit reached',
    //     message: 'Free tier allows maximum 5 scans per month. Upgrade to Pro for unlimited scans.',
    //     currentCount: scansThisMonth,
    //     maxAllowed: 5
    //   });
    // }

    // Check if there's already a scan in progress for this URL
    const existingScan = await Scan.findOne({
      urlId,
      status: { $in: ['pending', 'scanning'] }
    });

    if (existingScan) {
      return res.status(400).json({ error: 'A scan is already in progress for this URL' });
    }

    // Validate scan options based on tier - TEMPORARILY DISABLED FOR TESTING
    const defaultOptions = {
      gdpr: true,
      accessibility: true,
      security: true,
      performance: false,
      seo: false,
      customRules: []
    };

    const finalOptions = {
      ...defaultOptions,
      ...scanOptions
    };

    // TEMPORARILY REMOVED: Paid features restriction for free users
    // Check if user is trying to use paid features
    // if (user.tier === 'free' && (finalOptions.performance || finalOptions.seo)) {
    //   return res.status(403).json({ 
    //     error: 'Premium features require Pro tier',
    //     message: 'Performance and SEO scanning are Pro features. Upgrade to Pro to access these scans.',
    //     requiredTier: 'pro'
    //   });
    // }

    // Create a new scan record
    const scan = new Scan({
      urlId,
      projectId: project._id,
      status: 'pending',
      scanOptions: finalOptions,
    }) as IScan;

    await scan.save();

    // Update user's scansThisMonth count
    await User.findOneAndUpdate(
      { clerkId: req.user.clerkId },
      { $inc: { scansThisMonth: 1 } }
    );

    // Start the scan asynchronously
    performScan((scan._id as any).toString(), url.url, finalOptions).catch(error => {
      console.error('Scan failed:', error);
    });

    res.status(201).json({
      message: 'Scan started successfully',
      scan: {
        _id: scan._id,
        status: scan.status,
        scanOptions: scan.scanOptions,
        createdAt: scan.createdAt,
      }
    });
  } catch (error) {
    console.error('Error starting scan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint to verify authentication
router.get('/test-auth', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({ 
      message: 'Authentication working!', 
      user: req.user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent scans for dashboard
router.get('/recent', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get all projects for the user
    const ownerIds = [req.user.clerkId, req.user.email].filter(Boolean);
    const projects = await Project.find({ ownerId: { $in: ownerIds } });
    const projectIds = projects.map(project => project._id);

    // Get recent scans from all user's projects
    const scans = await Scan.find({ 
      projectId: { $in: projectIds } 
    })
      .populate('urlId')
      .populate('projectId')
      .sort({ createdAt: -1 })
      .limit(10); // Limit to last 10 scans

    res.json(scans);
  } catch (error) {
    console.error('Error fetching recent scans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get monthly scan count for dashboard
router.get('/monthly-count', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get all projects for the user
    const ownerIds = [req.user.clerkId, req.user.email].filter(Boolean);
    const projects = await Project.find({ ownerId: { $in: ownerIds } });
    const projectIds = projects.map(project => project._id);

    // Calculate start of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Count all scans this month (not just recent ones)
    const monthlyScanCount = await Scan.countDocuments({
      projectId: { $in: projectIds },
      createdAt: { $gte: startOfMonth }
    });

    res.json({ count: monthlyScanCount });
  } catch (error) {
    console.error('Error fetching monthly scan count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get scan results
router.get('/:scanId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { scanId } = req.params;

    // Validate scanId is provided
    if (!scanId || scanId === 'undefined') {
      return res.status(400).json({ error: 'Invalid scan ID provided' });
    }

    const ownerIds = [req.user.clerkId, req.user.email].filter(Boolean);
    const scan = await Scan.findById(scanId).populate({
      path: 'urlId',
      populate: {
        path: 'projectId',
        match: { ownerId: { $in: ownerIds } }
      }
    });

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    if (!scan.urlId || !(scan.urlId as any).projectId) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Return scan data directly as expected by frontend
    res.json(scan);
  } catch (error) {
    console.error('Error fetching scan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get scan history for a project
router.get('/project/:projectId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId } = req.params;

    // Verify project belongs to user
    const ownerIds = [req.user.clerkId, req.user.email].filter(Boolean);
    const project = await Project.findOne({ 
      _id: projectId, 
      ownerId: { $in: ownerIds }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const scans = await Scan.find({ projectId })
      .populate('urlId')
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 scans

    res.json(scans);
  } catch (error) {
    console.error('Error fetching scan history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get scan history for a specific URL
router.get('/url/:urlId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { urlId } = req.params;

    // Verify URL belongs to user
    const ownerIds = [req.user.clerkId, req.user.email].filter(Boolean);
    const url = await URL.findById(urlId).populate({
      path: 'projectId',
      match: { ownerId: { $in: ownerIds } }
    });

    if (!url || !(url.projectId as any)) {
      return res.status(404).json({ error: 'URL not found' });
    }

    const scans = await Scan.find({ urlId })
      .sort({ createdAt: -1 })
      .limit(20); // Limit to last 20 scans

    res.json(scans);
  } catch (error) {
    console.error('Error fetching URL scan history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all scans for a user
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const ownerIds = [user.clerkId, user.email].filter(Boolean);

    // Find all URLs belonging to the user's projects
    const userProjects = await Project.find({ ownerId: { $in: ownerIds } });
    const projectIds = userProjects.map(project => project._id);
    
    // Find all URLs in these projects
    const userUrls = await URL.find({ projectId: { $in: projectIds } });
    const urlIds = userUrls.map(url => url._id);
    
    // Honor limit query param
    const limit = Math.min(parseInt(String((req.query as any).limit)) || 100, 100);

    // Find all scans for these URLs
    const scans = await Scan.find({ urlId: { $in: urlIds } })
      .populate('urlId', 'url name')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.json(scans);
  } catch (error) {
    console.error('Error fetching all scans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all URLs for a user
router.get('/urls', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const ownerIds = [user.clerkId, user.email].filter(Boolean);
    
    // Find all URLs belonging to the user's projects
    const userProjects = await Project.find({ ownerId: { $in: ownerIds } });
    const projectIds = userProjects.map(project => project._id);
    
    const urls = await URL.find({ projectId: { $in: projectIds } })
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });
    
    res.json(urls);
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Async function to perform the actual scan
async function performScan(scanId: string, url: string, options: any) {
  try {
    // Update scan status to scanning
    await Scan.findByIdAndUpdate(scanId, { status: 'scanning' });

    // Perform the scan
    const scanner = new WebsiteScanner(url);
    const results = await scanner.scan(options);

    // Debug: Log technical details
    console.log('Scan results technical details:', results.technicalDetails);
    console.log('Full scan results structure:', Object.keys(results));
    console.log('Server info:', results.technicalDetails?.serverInfo);
    console.log('Technologies:', results.technicalDetails?.technologies);
    console.log('Frameworks:', results.technicalDetails?.frameworks);
    console.log('CMS:', results.technicalDetails?.cms);
    console.log('Hosting:', results.technicalDetails?.hosting);

    // Update scan with results (use scanDuration from scanner results)
    await Scan.findByIdAndUpdate(scanId, {
      status: 'completed',
      results,
      scanDuration: results.scanDuration || 0,
    });

    // Verify the scan was saved correctly
    const savedScan = await Scan.findById(scanId).populate('projectId');
    console.log('Saved scan technical details:', savedScan?.results?.technicalDetails);

    console.log(`Scan completed for ${url} in ${results.scanDuration || 0}ms`);

    // Create a notification for successful scan
    if (savedScan && savedScan.projectId) {
      const project = savedScan.projectId as any;
      console.log('🔔 Creating notification for scan completion...');
      console.log('Project:', project);
      console.log('Project ownerId:', project.ownerId);
      
      const user = await User.findOne({ clerkId: project.ownerId });
      console.log('Found user:', user ? 'Yes' : 'No');
      
      if (user) {
        console.log('🔔 Creating scan completed notification...');
        try {
          await notificationService.createScanCompletedNotification(
            (user as any)._id.toString(),
            scanId,
            project._id.toString(),
            url,
            results
          );
        } catch (notifyError) {
          console.error('Error creating notification:', notifyError);
        }
      }
    }
  } catch (error) {
    console.error('Scan processing error:', error);
    await Scan.findByIdAndUpdate(scanId, { status: 'failed' });
  }
}

export default router; 