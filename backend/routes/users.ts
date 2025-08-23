import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middlewares/auth';
import User from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = Router();

// Get current user profile
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isSupporter: user.isSupporter,
      supporterTier: user.supporterTier,
      supporterSince: user.supporterSince,
      totalDonations: user.totalDonations,
      donationHistory: user.donationHistory,
      projects: user.projects,
      scansThisMonth: user.scansThisMonth,
      maxProjects: user.maxProjects,
      maxScansPerMonth: user.maxScansPerMonth,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user usage statistics
router.get('/usage', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const usage = {
      projects: {
        current: user.projects,
        max: user.maxProjects,
        unlimited: user.maxProjects === -1,
      },
      scans: {
        current: user.scansThisMonth,
        max: user.maxScansPerMonth,
        unlimited: user.maxScansPerMonth === -1,
      },
      isSupporter: user.isSupporter,
      supporterTier: user.supporterTier,
    };

    res.json(usage);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 