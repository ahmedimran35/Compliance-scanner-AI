"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const User_1 = __importDefault(require("../models/User"));
const router = (0, express_1.Router)();
// Get user profile
router.get('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await User_1.default.findOne({ clerkId: req.user.clerkId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            id: user._id,
            clerkId: user.clerkId,
            email: user.email,
            subscriptionTier: user.subscriptionTier,
            subscriptionStatus: user.subscriptionStatus,
            usageStats: user.usageStats,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update user subscription tier (for testing purposes)
router.patch('/subscription-tier', auth_1.authenticateToken, async (req, res) => {
    try {
        const { subscriptionTier } = req.body;
        if (!['free', 'pro', 'enterprise'].includes(subscriptionTier)) {
            return res.status(400).json({ error: 'Invalid tier. Must be "free", "pro", or "enterprise"' });
        }
        const user = await User_1.default.findOneAndUpdate({ clerkId: req.user.clerkId }, { subscriptionTier }, { new: true });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            id: user._id,
            clerkId: user.clerkId,
            email: user.email,
            subscriptionTier: user.subscriptionTier,
            subscriptionStatus: user.subscriptionStatus,
            usageStats: user.usageStats,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });
    }
    catch (error) {
        console.error('Error updating user subscription tier:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=user.js.map