"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const ScheduledScan_1 = __importDefault(require("../models/ScheduledScan"));
const URL_1 = __importDefault(require("../models/URL"));
const Project_1 = __importDefault(require("../models/Project"));
const router = (0, express_1.Router)();
// Create a new scheduled scan
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { urlId, frequency, time, dayOfWeek, dayOfMonth, scanOptions } = req.body;
        // Verify URL exists and belongs to user
        const url = await URL_1.default.findById(urlId).populate('projectId');
        if (!url) {
            return res.status(404).json({ error: 'URL not found' });
        }
        const project = await Project_1.default.findOne({
            _id: url.projectId,
            ownerId: req.user.clerkId
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        // Create the scheduled scan
        const scheduledScan = new ScheduledScan_1.default({
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
        scheduledScan.nextRun = scheduledScan.calculateNextRun();
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get all scheduled scans for a user
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const scheduledScans = await ScheduledScan_1.default.find({
            ownerId: req.user.clerkId
        })
            .populate('urlId', 'url name')
            .populate('projectId', 'name')
            .sort({ createdAt: -1 });
        res.json(scheduledScans);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get scheduled scans for a specific project
router.get('/project/:projectId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        // Verify project belongs to user
        const project = await Project_1.default.findOne({
            _id: projectId,
            ownerId: req.user.clerkId
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const scheduledScans = await ScheduledScan_1.default.find({
            projectId,
            ownerId: req.user.clerkId
        })
            .populate('urlId', 'url name')
            .sort({ createdAt: -1 });
        res.json(scheduledScans);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update a scheduled scan
router.put('/:scheduledScanId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { scheduledScanId } = req.params;
        const { frequency, time, dayOfWeek, dayOfMonth, scanOptions, isActive } = req.body;
        const scheduledScan = await ScheduledScan_1.default.findOne({
            _id: scheduledScanId,
            ownerId: req.user.clerkId
        });
        if (!scheduledScan) {
            return res.status(404).json({ error: 'Scheduled scan not found' });
        }
        // Update fields
        if (frequency !== undefined)
            scheduledScan.frequency = frequency;
        if (time !== undefined)
            scheduledScan.time = time;
        if (dayOfWeek !== undefined)
            scheduledScan.dayOfWeek = dayOfWeek;
        if (dayOfMonth !== undefined)
            scheduledScan.dayOfMonth = dayOfMonth;
        if (scanOptions !== undefined)
            scheduledScan.scanOptions = scanOptions;
        if (isActive !== undefined)
            scheduledScan.isActive = isActive;
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete a scheduled scan
router.delete('/:scheduledScanId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { scheduledScanId } = req.params;
        const scheduledScan = await ScheduledScan_1.default.findOne({
            _id: scheduledScanId,
            ownerId: req.user.clerkId
        });
        if (!scheduledScan) {
            return res.status(404).json({ error: 'Scheduled scan not found' });
        }
        await ScheduledScan_1.default.findByIdAndDelete(scheduledScanId);
        res.json({ message: 'Scheduled scan deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Toggle scheduled scan active status
router.patch('/:scheduledScanId/toggle', auth_1.authenticateToken, async (req, res) => {
    try {
        const { scheduledScanId } = req.params;
        const scheduledScan = await ScheduledScan_1.default.findOne({
            _id: scheduledScanId,
            ownerId: req.user.clerkId
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=scheduledScans.js.map