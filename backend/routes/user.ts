import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middlewares/auth';
import User from '../models/User';
import notificationService from '../services/notificationService';
import Project from '../models/Project';
import Scan from '../models/Scan';

interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = Router();

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findOne({ clerkId: req.user.clerkId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isSupporter: user.isSupporter,
      maxProjects: user.maxProjects,
      maxScansPerMonth: user.maxScansPerMonth,
      projects: user.projects,
      scansThisMonth: user.scansThisMonth
    });

    const responseData = {
      user: {
        _id: user._id,
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
        updatedAt: user.updatedAt
      }
    };

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { firstName, lastName } = req.body;
    
    const user = await User.findOneAndUpdate(
      { clerkId: req.user.clerkId },
      { firstName, lastName },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        _id: user._id,
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
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/user/donate
 * Handle user donation and update supporter status
 */
router.post('/donate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId, tierId, tierName, amount } = req.body;

    // Validation
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    if (!tierId || !tierName) {
      return res.status(400).json({ error: 'Tier information is required' });
    }

    // Verify the payment with Stripe
    const stripe = new (require('stripe'))(process.env.STRIPE_KEY || 'sk_test_your_stripe_secret_key_here');
    
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Payment session not found' });
      }

      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: 'Payment was not completed' });
      }

      // Verify the session belongs to the authenticated user
      if (session.metadata?.userId !== req.user.clerkId) {
        return res.status(403).json({ error: 'Unauthorized access to payment session' });
      }

      // Use the actual amount from Stripe session
      const actualAmount = session.amount_total ? session.amount_total / 100 : amount || 0;


    } catch (stripeError) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Find user by clerkId
    const user = await User.findOne({ clerkId: req.user.clerkId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

      _id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      currentTotalDonations: user.totalDonations,
      isSupporter: user.isSupporter
    });

    // Get the actual amount from Stripe session for the update
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    const donationAmount = stripeSession.amount_total ? stripeSession.amount_total / 100 : 0;

      sessionId,
      donationAmount,
      tierName,
      newTotalDonations: (user.totalDonations || 0) + donationAmount
    });

    // Update user profile to mark as supporter
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          isSupporter: true,
          supporterTier: tierName,
          supporterSince: new Date(),
          totalDonations: (user.totalDonations || 0) + donationAmount
        },
        $push: {
          donationHistory: {
            amount: donationAmount,
            tierId,
            tierName,
            date: new Date(),
            status: 'completed',
            sessionId
          }
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

      _id: updatedUser._id,
      isSupporter: updatedUser.isSupporter,
      supporterTier: updatedUser.supporterTier,
      totalDonations: updatedUser.totalDonations,
      donationHistoryCount: updatedUser.donationHistory?.length
    });

    // Create a notification for the donation
    try {
      await notificationService.createNewFeatureNotification(
        (updatedUser as any)._id.toString(),
        'Thank You for Your Support! 🎉',
        `You've successfully donated $${donationAmount} and are now a valued supporter of ComplianceScanner AI.`
      );
    } catch (notificationError) {
    }

    res.json({
      success: true,
      message: 'Thank you for your support!',
      user: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        isSupporter: updatedUser.isSupporter,
        supporterTier: updatedUser.supporterTier,
        supporterSince: updatedUser.supporterSince,
        totalDonations: updatedUser.totalDonations
      }
    });
  } catch (error) {
      sessionId: req.body.sessionId,
      tierId: req.body.tierId,
      tierName: req.body.tierName,
      userId: req.user?.clerkId,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ error: 'Failed to process donation' });
  }
});

// Fix user statistics by recalculating from database
router.post('/fix-stats', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    
    // Count actual projects for this user
    const projectCount = await Project.countDocuments({ ownerId: req.user.clerkId });
    
    // Count actual scans this month for this user
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    // Get all projects for this user
    const userProjects = await Project.find({ ownerId: req.user.clerkId });
    const projectIds = userProjects.map(project => project._id);
    
    // Count scans this month
    const scansThisMonth = await Scan.countDocuments({
      projectId: { $in: projectIds },
      createdAt: { $gte: startOfMonth }
    });
    
    
    // Update user with correct counts
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: req.user.clerkId },
      {
        projects: projectCount,
        scansThisMonth: scansThisMonth
      },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    
    res.json({
      message: 'User statistics fixed successfully',
      user: {
        _id: updatedUser._id,
        clerkId: updatedUser.clerkId,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        isSupporter: updatedUser.isSupporter,
        supporterTier: updatedUser.supporterTier,
        supporterSince: updatedUser.supporterSince,
        totalDonations: updatedUser.totalDonations,
        donationHistory: updatedUser.donationHistory,
        projects: updatedUser.projects,
        scansThisMonth: updatedUser.scansThisMonth,
        maxProjects: updatedUser.maxProjects,
        maxScansPerMonth: updatedUser.maxScansPerMonth,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 