import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middlewares/auth';
import ScheduledScan from '../models/ScheduledScan';
import URL from '../models/URL';
import Project from '../models/Project';

interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = Router();

// Create a new scheduled scan
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { urlId, frequency, time, dayOfWeek, dayOfMonth, scanOptions } = req.body;

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

    // Create the scheduled scan
    const scheduledScan = new ScheduledScan({
      urlId,
      projectId: project._id,
      ownerId: req.user.clerkId,
      frequency,
      time,
      dayOfWeek,
      dayOfMonth,
      scanOptions,
      isActive: true
    });

    // Calculate nextRun before saving
    scheduledScan.nextRun = (scheduledScan as any).calculateNextRun();
    await scheduledScan.save();

    res.status(201).json({
      message: 'Scheduled scan created successfully',
      scheduledScan: {
        _id: scheduledScan._id,
        frequency: scheduledScan.frequency,
        time: scheduledScan.time,
        nextRun: scheduledScan.nextRun,
        isActive: scheduledScan.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all scheduled scans for a user
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ownerIds = [req.user.clerkId, req.user.email].filter(Boolean);
    const projects = await Project.find({ ownerId: { $in: ownerIds } });
    const projectIds = projects.map(p => p._id);

    const scheduledScans = await ScheduledScan.find({ 
      projectId: { $in: projectIds }
    })
      .populate('urlId', 'url name')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });

    res.json(scheduledScans);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get scheduled scans for a specific project
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

    const scheduledScans = await ScheduledScan.find({ 
      projectId,
    })
      .populate('urlId', 'url name')
      .sort({ createdAt: -1 });

    res.json(scheduledScans);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a scheduled scan
router.put('/:scheduledScanId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { scheduledScanId } = req.params;
    const { frequency, time, dayOfWeek, dayOfMonth, scanOptions, isActive } = req.body;

    const ownerIds = [req.user.clerkId, req.user.email].filter(Boolean);

    const scheduledScan = await ScheduledScan.findOne({
      _id: scheduledScanId,
      ownerId: { $in: ownerIds }
    });

    if (!scheduledScan) {
      return res.status(404).json({ error: 'Scheduled scan not found' });
    }

    // Update fields
    if (frequency !== undefined) scheduledScan.frequency = frequency;
    if (time !== undefined) scheduledScan.time = time;
    if (dayOfWeek !== undefined) scheduledScan.dayOfWeek = dayOfWeek;
    if (dayOfMonth !== undefined) scheduledScan.dayOfMonth = dayOfMonth;
    if (scanOptions !== undefined) scheduledScan.scanOptions = scanOptions;
    if (isActive !== undefined) scheduledScan.isActive = isActive;

    await scheduledScan.save();

    res.json({
      message: 'Scheduled scan updated successfully',
      scheduledScan: {
        _id: scheduledScan._id,
        frequency: scheduledScan.frequency,
        time: scheduledScan.time,
        nextRun: scheduledScan.nextRun,
        isActive: scheduledScan.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a scheduled scan
router.delete('/:scheduledScanId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { scheduledScanId } = req.params;

    const ownerIds = [req.user.clerkId, req.user.email].filter(Boolean);

    const scheduledScan = await ScheduledScan.findOne({
      _id: scheduledScanId,
      ownerId: { $in: ownerIds }
    });

    if (!scheduledScan) {
      return res.status(404).json({ error: 'Scheduled scan not found' });
    }

    await ScheduledScan.findByIdAndDelete(scheduledScanId);

    res.json({ message: 'Scheduled scan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle scheduled scan active status
router.patch('/:scheduledScanId/toggle', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { scheduledScanId } = req.params;

    const ownerIds = [req.user.clerkId, req.user.email].filter(Boolean);

    const scheduledScan = await ScheduledScan.findOne({
      _id: scheduledScanId,
      ownerId: { $in: ownerIds }
    });

    if (!scheduledScan) {
      return res.status(404).json({ error: 'Scheduled scan not found' });
    }

    scheduledScan.isActive = !scheduledScan.isActive;
    await scheduledScan.save();

    res.json({
      message: `Scheduled scan ${scheduledScan.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: scheduledScan.isActive
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 