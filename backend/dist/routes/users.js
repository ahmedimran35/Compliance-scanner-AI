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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map