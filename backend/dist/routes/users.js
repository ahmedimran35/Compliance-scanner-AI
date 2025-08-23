"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Get current user profile
router.get('/profile', auth_1.authenticateToken, async (req, res) => {
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
            subscriptionTier: user.subscriptionTier,
            subscriptionStatus: user.subscriptionStatus,
            usageStats: user.usageStats,
            createdAt: user.createdAt,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update user subscription tier (for future Stripe integration)
router.patch('/subscription-tier', auth_1.authenticateToken, async (req, res) => {
    try {
        const { subscriptionTier } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!['free', 'pro', 'enterprise'].includes(subscriptionTier)) {
            return res.status(400).json({ error: 'Invalid subscription tier' });
        }
        user.subscriptionTier = subscriptionTier;
        await user.save();
        res.json({
            message: 'Subscription tier updated successfully',
            subscriptionTier: user.subscriptionTier,
            subscriptionStatus: user.subscriptionStatus,
            usageStats: user.usageStats,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get user usage statistics
router.get('/usage', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Get limits based on subscription tier
        const limits = {
            free: { scans: 10, projects: 3 },
            pro: { scans: 100, projects: 20 },
            enterprise: { scans: -1, projects: -1 }
        };
        const tier = user.subscriptionTier;
        const limit = limits[tier];
        const usage = {
            projects: {
                current: user.usageStats.projectsCreated,
                max: limit.projects,
                unlimited: limit.projects === -1,
            },
            scans: {
                current: user.usageStats.scansThisMonth,
                max: limit.scans,
                unlimited: limit.scans === -1,
            },
            subscriptionTier: user.subscriptionTier,
            subscriptionStatus: user.subscriptionStatus,
        };
        res.json(usage);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map