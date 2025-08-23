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
        const project = await Project_1.default.findOne({
            _id: url.projectId,
            ownerId: req.user.clerkId
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        // Check tier limits for scans - TEMPORARILY DISABLED FOR TESTING
        const user = await User_1.default.findOne({ clerkId: req.user.clerkId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Check if user can perform scan
        const canScan = user.canPerformScan();
        if (!canScan.allowed) {
            return res.status(403).json({
                error: 'Scan limit reached',
                reason: canScan.reason,
                upgradeRequired: true
            });
        }
        // Increment scan usage
        await user.incrementScanUsage();
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
        // Start the scan asynchronously
        performScan(scan._id.toString(), url.url, finalOptions).catch(error => {
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
    }
    catch (error) {
        console.error('Error starting scan:', error);
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
        console.error('Test auth error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get recent scans for dashboard
router.get('/recent', auth_1.authenticateToken, async (req, res) => {
    try {
        // Get all projects for the user
        const projects = await Project_1.default.find({ ownerId: req.user.clerkId });
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
        console.error('Error fetching recent scans:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get monthly scan count for dashboard
router.get('/monthly-count', auth_1.authenticateToken, async (req, res) => {
    try {
        // Get all projects for the user
        const projects = await Project_1.default.find({ ownerId: req.user.clerkId });
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
        console.error('Error fetching monthly scan count:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * GET /api/scans/:id
 * Get scan details with premium feature access control
 */
router.get('/:id', async (req, res) => {
    try {
        const userId = req.user?._id;
        const { id } = req.params;
        const { section } = req.query; // 'technical', 'seo', 'performance', 'security', 'gdpr', 'accessibility'
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Check premium feature access for certain sections
        const premiumSections = ['security', 'seo', 'performance'];
        if (premiumSections.includes(section) && !user.canAccessPremiumFeatures()) {
            return res.status(403).json({
                error: 'Premium feature access required',
                message: 'This analysis section requires a Pro subscription. Upgrade to access full security, SEO, and performance analysis.',
                upgradeRequired: true,
                section: section
            });
        }
        const scan = await Scan_1.default.findById(id).populate('projectId').populate('urlId');
        if (!scan) {
            return res.status(404).json({ error: 'Scan not found' });
        }
        // Check if user owns the scan
        const project = scan.projectId;
        if (project.ownerId !== req.user.clerkId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json({ scan });
    }
    catch (error) {
        console.error('Error fetching scan:', error);
        res.status(500).json({ error: 'Failed to fetch scan' });
    }
});
// Get scan history for a project
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
        const scans = await Scan_1.default.find({ projectId })
            .populate('urlId')
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 scans
        res.json(scans);
    }
    catch (error) {
        console.error('Error fetching scan history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get scan history for a specific URL
router.get('/url/:urlId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { urlId } = req.params;
        // Verify URL belongs to user
        const url = await URL_1.default.findById(urlId).populate({
            path: 'projectId',
            match: { ownerId: req.user.clerkId }
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
        console.error('Error fetching URL scan history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get all scans for a user
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        // Find all URLs belonging to the user's projects
        const userProjects = await Project_1.default.find({ ownerId: user.clerkId });
        const projectIds = userProjects.map(project => project._id);
        // Find all URLs in these projects
        const userUrls = await URL_1.default.find({ projectId: { $in: projectIds } });
        const urlIds = userUrls.map(url => url._id);
        // Find all scans for these URLs
        const scans = await Scan_1.default.find({ urlId: { $in: urlIds } })
            .populate('urlId', 'url name')
            .populate('projectId', 'name')
            .sort({ createdAt: -1 })
            .limit(100); // Limit to last 100 scans for performance
        res.json(scans);
    }
    catch (error) {
        console.error('Error fetching all scans:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get all URLs for a user
router.get('/urls', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        // Find all URLs belonging to the user's projects
        const userProjects = await Project_1.default.find({ ownerId: user.clerkId });
        const projectIds = userProjects.map(project => project._id);
        const urls = await URL_1.default.find({ projectId: { $in: projectIds } })
            .populate('projectId', 'name')
            .sort({ createdAt: -1 });
        res.json(urls);
    }
    catch (error) {
        console.error('Error fetching URLs:', error);
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
        console.log('Scan results technical details:', results.technicalDetails);
        console.log('Full scan results structure:', Object.keys(results));
        console.log('Server info:', results.technicalDetails?.serverInfo);
        console.log('Technologies:', results.technicalDetails?.technologies);
        console.log('Frameworks:', results.technicalDetails?.frameworks);
        console.log('CMS:', results.technicalDetails?.cms);
        console.log('Hosting:', results.technicalDetails?.hosting);
        // Update scan with results (use scanDuration from scanner results)
        await Scan_1.default.findByIdAndUpdate(scanId, {
            status: 'completed',
            results,
            scanDuration: results.scanDuration || 0,
        });
        // Verify the scan was saved correctly
        const savedScan = await Scan_1.default.findById(scanId).populate('projectId');
        console.log('Saved scan technical details:', savedScan?.results?.technicalDetails);
        console.log(`Scan completed for ${url} in ${results.scanDuration || 0}ms`);
        // Create a notification for successful scan
        if (savedScan && savedScan.projectId) {
            const project = savedScan.projectId;
            console.log('🔔 Creating notification for scan completion...');
            console.log('Project:', project);
            console.log('Project ownerId:', project.ownerId);
            const user = await User_1.default.findOne({ clerkId: project.ownerId });
            console.log('Found user:', user ? 'Yes' : 'No');
            if (user) {
                console.log('🔔 Creating scan completed notification...');
                try {
                    await notificationService_1.default.createScanCompletedNotification(user._id.toString(), scanId, project._id.toString(), url, results);
                    console.log('✅ Notification created successfully!');
                }
                catch (notificationError) {
                    console.error('❌ Failed to create notification:', notificationError);
                }
            }
            else {
                console.log('❌ User not found for notification');
            }
        }
        else {
            console.log('❌ Cannot create notification - missing scan or project data');
            console.log('Saved scan:', savedScan ? 'Yes' : 'No');
            console.log('Project ID:', savedScan?.projectId ? 'Yes' : 'No');
        }
    }
    catch (error) {
        console.error(`Scan failed for ${url}:`, error);
        // Update scan with error
        await Scan_1.default.findByIdAndUpdate(scanId, {
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
        // Create a notification for failed scan
        try {
            const failedScan = await Scan_1.default.findById(scanId).populate('projectId');
            if (failedScan && failedScan.projectId) {
                const project = failedScan.projectId;
                const user = await User_1.default.findOne({ clerkId: project.ownerId });
                if (user) {
                    await notificationService_1.default.createScanFailedNotification(user._id.toString(), scanId, project._id.toString(), url, error instanceof Error ? error.message : 'Unknown error');
                }
            }
        }
        catch (notificationError) {
            console.error('Failed to create notification for failed scan:', notificationError);
        }
    }
}
exports.default = router;
//# sourceMappingURL=scans.js.map