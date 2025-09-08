import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/adminAuth';
import { sanitizeInput, validateEmail, checkValidation } from '../middlewares/validation';
import Feedback from '../models/Feedback';
import User from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = Router();



// POST /api/feedback - Submit new feedback
router.post('/', sanitizeInput, validateEmail, checkValidation, async (req: Request, res: Response) => {
  try {
    console.log('📝 Received feedback submission:', req.body);
    const { type, rating, title, description, email, category } = req.body;

    // Validation
    if (!title || !description || !email) {
      console.log('❌ Validation failed: missing required fields');
      return res.status(400).json({ error: 'Title, description, and email are required' });
    }

    if (rating < 0 || rating > 5) {
      console.log('❌ Validation failed: invalid rating');
      return res.status(400).json({ error: 'Rating must be between 0 and 5' });
    }

    console.log('✅ Validation passed, creating feedback...');

    // Create feedback
    const feedback = new Feedback({
      type: type || 'general',
      rating,
      title: title.trim(),
      description: description.trim(),
      email: email.trim(),
      category: category || 'General',
      status: 'pending',
      priority: 'medium'
    });

    await feedback.save();

    console.log(`✅ New feedback submitted: ${feedback.title} by ${feedback.email}`);
    console.log(`📊 Feedback ID: ${feedback._id}`);

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: {
        id: feedback._id,
        title: feedback.title,
        type: feedback.type,
        status: feedback.status
      }
    });
  } catch (error) {
    console.error('❌ Error submitting feedback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to submit feedback', details: errorMessage });
  }
});

// POST /api/feedback/authenticated - Submit feedback from authenticated user
router.post('/authenticated', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, rating, title, description, email, category } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    if (rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 0 and 5' });
    }

    // Use the email from the form, fallback to user's email if not provided
    const feedbackEmail = email || req.user.email;

    // Create feedback with user info
    const feedback = new Feedback({
      userId: req.user._id,
      clerkId: req.user.clerkId,
      type: type || 'general',
      rating,
      title: title.trim(),
      description: description.trim(),
      email: feedbackEmail,
      category: category || 'General',
      status: 'pending',
      priority: 'medium'
    });

    await feedback.save();

    console.log(`✅ New authenticated feedback submitted: ${feedback.title} by ${req.user.email}`);

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: {
        id: feedback._id,
        title: feedback.title,
        type: feedback.type,
        status: feedback.status
      }
    });
  } catch (error) {
    console.error('❌ Error submitting authenticated feedback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to submit feedback', details: errorMessage });
  }
});

// GET /api/feedback/admin - Get all feedback for admin (ADMIN ONLY)
router.get('/admin', requireAdmin, async (req: Request, res: Response) => {
  try {
    console.log('📝 Fetching admin feedback...');
    
    const { status, priority, type, category, page = 1, limit = 20 } = req.query;
    
    // Build filter
    const filter: any = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (type) filter.type = type;
    if (category) filter.category = category;

    // Pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    // Get feedback with user info
    const feedback = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate('userId', 'firstName lastName email');

    // Get total count
    const total = await Feedback.countDocuments(filter);

    console.log(`📋 Found ${feedback.length} feedback items`);

    res.json({
      feedback,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('❌ Error fetching admin feedback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to fetch feedback', details: errorMessage });
  }
});

// PUT /api/feedback/admin/:id - Update feedback status and notes (ADMIN ONLY)
router.put('/admin/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, priority, adminNotes } = req.body;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Update fields
    if (status) feedback.status = status;
    if (priority) feedback.priority = priority;
    if (adminNotes !== undefined) feedback.adminNotes = adminNotes;

    await feedback.save();

    console.log(`✅ Feedback ${id} updated: status=${feedback.status}, priority=${feedback.priority}`);

    res.json({
      message: 'Feedback updated successfully',
      feedback: {
        id: feedback._id,
        title: feedback.title,
        status: feedback.status,
        priority: feedback.priority,
        adminNotes: feedback.adminNotes
      }
    });
  } catch (error) {
    console.error('❌ Error updating feedback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to update feedback', details: errorMessage });
  }
});

// GET /api/feedback/stats - Get feedback statistics (ADMIN ONLY)
router.get('/stats', requireAdmin, async (req: Request, res: Response) => {
  try {
    console.log('📊 Fetching feedback statistics...');
    
    // Get total feedback count
    const totalFeedback = await Feedback.countDocuments();
    
    // Get feedback by status
    const statusStats = await Feedback.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get feedback by type
    const typeStats = await Feedback.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    // Get feedback by priority
    const priorityStats = await Feedback.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    // Get average rating
    const ratingStats = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' }, totalRatings: { $sum: 1 } } }
    ]);
    
    // Get recent feedback (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentFeedback = await Feedback.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const stats = {
      total: totalFeedback,
      recent: recentFeedback,
      status: statusStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as any),
      type: typeStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as any),
      priority: priorityStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as any),
      rating: ratingStats[0] ? {
        average: Math.round(ratingStats[0].avgRating * 10) / 10,
        total: ratingStats[0].totalRatings
      } : { average: 0, total: 0 }
    };

    console.log('📊 Feedback statistics generated');
    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching feedback statistics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to fetch feedback statistics', details: errorMessage });
  }
});

export default router;
