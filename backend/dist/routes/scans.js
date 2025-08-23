"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const Scan_1 = __importDefault(require("../models/Scan"));
const URL_1 = __importDefault(require("../models/URL"));
const Project_1 = __importDefault(require("../models/Project"));
const User_1 = __importDefault(require("../models/User"));
const scanner_1 = require("../services/scanner");
const notificationService_1 = __importDefault(require("../services/notificationService"));
const router = (0, express_1.Router)();
// Start a scan for a specific URL
router.post('/:urlId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { urlId } = req.params;
        const { scanOptions } = req.body;
        // Verify URL exists and belongs to user
        const url = await URL_1.default.findById(urlId).populate('projectId');
        if (!url) {
            return res.status(404).json({ error: 'URL not found' });
        }
        const ownerIds = [req.user.clerkId, req.user.email].filter(Boolean);
        const project = await Project_1.default.findOne({
            _id: url.projectId,
            ownerId: { $in: ownerIds }
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        // Check tier limits for scans - TEMPORARILY DISABLED FOR TESTING
        const user = await User_1.default.findOne({ clerkId: req.user.clerkId });
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
        const existingScan = await Scan_1.default.findOne({
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
        const scan = new Scan_1.default({
            urlId,
            projectId: project._id,
            status: 'pending',
            scanOptions: finalOptions,
        });
        await scan.save();
        // Update user's scansThisMonth count
        await User_1.default.findOneAndUpdate({ clerkId: req.user.clerkId }, { $inc: { scansThisMonth: 1 } });
        // Start the scan asynchronously
        performScan(scan._id.toString(), url.url, finalOptions).catch(error => {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Test endpoint to verify authentication
router.get('/test-auth', auth_1.authenticateToken, async (req, res) => {
    try {
        res.json({
            message: 'Authentication working!',
            user: req.user,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get recent scans for dashboard
router.get('/recent', auth_1.authenticateToken, async (req, res) => {
    try {
        // Get all projects for the user
        const ownerIds = [req.user.clerkId, req.user.email].filter(Boolean);
        const projects = await Project_1.default.find({ ownerId: { $in: ownerIds } });
        const projectIds = projects.map(project => project._id);
        // Get recent scans from all user's projects
        const scans = await Scan_1.default.find({
            projectId: { $in: projectIds }
        })
            .populate('urlId')
            .populate('projectId')
            .sort({ createdAt: -1 })
            .limit(10); // Limit to last 10 scans
        res.json(scans);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get monthly scan count for dashboard
router.get('/monthly-count', auth_1.authenticateToken, async (req, res) => {
    try {
        // Get all projects for the user
        const ownerIds = [req.user.clerkId, req.user.email].filter(Boolean);
        const projects = await Project_1.default.find({ ownerId: { $in: ownerIds } });
        const projectIds = projects.map(project => project._id);
        // Calculate start of current month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        // Count all scans this month (not just recent ones)
        const monthlyScanCount = await Scan_1.default.countDocuments({
            projectId: { $in: projectIds },
            createdAt: { $gte: startOfMonth }
        });
        res.json({ count: monthlyScanCount });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get scan results
router.get('/:scanId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { scanId } = req.params;
        // Validate scanId is provided
        if (!scanId || scanId === 'undefined') {
            return res.status(400).json({ error: 'Invalid scan ID provided' });
        }
        const ownerIds = [req.user.clerkId, req.user.email].filter(Boolean);
        const scan = await Scan_1.default.findById(scanId).populate({
            path: 'urlId',
            populate: {
                path: 'projectId',
                match: { ownerId: { $in: ownerIds } }
            }
        });
        if (!scan) {
            return res.status(404).json({ error: 'Scan not found' });
        }
        if (!scan.urlId || !scan.urlId.projectId) {
            return res.status(404).json({ error: 'Project not found' });
        }
        // Return scan data directly as expected by frontend
        res.json(scan);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get scan history for a project
router.get('/project/:projectId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        // Verify project belongs to user
        const ownerIds = [req.user.clerkId, req.user.email].filter(Boolean);
        const project = await Project_1.default.findOne({
            _id: projectId,
            ownerId: { $in: ownerIds }
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const scans = await Scan_1.default.find({ projectId })
            .populate('urlId')
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 scans
        res.json(scans);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get scan history for a specific URL
router.get('/url/:urlId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { urlId } = req.params;
        // Verify URL belongs to user
        const ownerIds = [req.user.clerkId, req.user.email].filter(Boolean);
        const url = await URL_1.default.findById(urlId).populate({
            path: 'projectId',
            match: { ownerId: { $in: ownerIds } }
        });
        if (!url || !url.projectId) {
            return res.status(404).json({ error: 'URL not found' });
        }
        const scans = await Scan_1.default.find({ urlId })
            .sort({ createdAt: -1 })
            .limit(20); // Limit to last 20 scans
        res.json(scans);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get all scans for a user
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const ownerIds = [user.clerkId, user.email].filter(Boolean);
        // Find all URLs belonging to the user's projects
        const userProjects = await Project_1.default.find({ ownerId: { $in: ownerIds } });
        const projectIds = userProjects.map(project => project._id);
        // Find all URLs in these projects
        const userUrls = await URL_1.default.find({ projectId: { $in: projectIds } });
        const urlIds = userUrls.map(url => url._id);
        // Honor limit query param
        const limit = Math.min(parseInt(String(req.query.limit)) || 100, 100);
        // Find all scans for these URLs
        const scans = await Scan_1.default.find({ urlId: { $in: urlIds } })
            .populate('urlId', 'url name')
            .populate('projectId', 'name')
            .sort({ createdAt: -1 })
            .limit(limit);
        res.json(scans);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get all URLs for a user
router.get('/urls', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const ownerIds = [user.clerkId, user.email].filter(Boolean);
        // Find all URLs belonging to the user's projects
        const userProjects = await Project_1.default.find({ ownerId: { $in: ownerIds } });
        const projectIds = userProjects.map(project => project._id);
        const urls = await URL_1.default.find({ projectId: { $in: projectIds } })
            .populate('projectId', 'name')
            .sort({ createdAt: -1 });
        res.json(urls);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Async function to perform the actual scan
async function performScan(scanId, url, options) {
    try {
        // Update scan status to scanning
        await Scan_1.default.findByIdAndUpdate(scanId, { status: 'scanning' });
        // Perform the scan
        const scanner = new scanner_1.WebsiteScanner(url);
        const results = await scanner.scan(options);
        // Debug: Log technical details
        // Update scan with results (use scanDuration from scanner results)
        await Scan_1.default.findByIdAndUpdate(scanId, {
            status: 'completed',
            results,
            scanDuration: results.scanDuration || 0,
        });
        // Verify the scan was saved correctly
        const savedScan = await Scan_1.default.findById(scanId).populate('projectId');
        // Create a notification for successful scan
        if (savedScan && savedScan.projectId) {
            const project = savedScan.projectId;
            const user = await User_1.default.findOne({ clerkId: project.ownerId });
            if (user) {
                try {
                    await notificationService_1.default.createScanCompletedNotification(user._id.toString(), scanId, project._id.toString(), url, results);
                }
                catch (notifyError) {
                }
            }
        }
    }
    catch (error) {
        await Scan_1.default.findByIdAndUpdate(scanId, { status: 'failed' });
    }
}
exports.default = router;
//# sourceMappingURL=scans.js.map