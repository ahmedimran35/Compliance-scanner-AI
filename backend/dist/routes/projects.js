"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const Project_1 = __importDefault(require("../models/Project"));
const URL_1 = __importDefault(require("../models/URL"));
const User_1 = __importDefault(require("../models/User"));
const router = (0, express_1.Router)();
// Get all projects for the authenticated user
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const ownerIds = [req.user.clerkId, req.user.email].filter(Boolean);
        const projects = await Project_1.default.find({ ownerId: { $in: ownerIds } })
            .sort({ createdAt: -1 })
            .lean();
        // Get URL counts for each project
        const projectsWithUrlCounts = await Promise.all(projects.map(async (project) => {
            const urlCount = await URL_1.default.countDocuments({ projectId: project._id });
            return {
                ...project,
                urlCount,
            };
        }));
        res.json(projectsWithUrlCounts);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get a specific project with its URLs
router.get('/:projectId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const ownerIds = [req.user.clerkId, req.user.email].filter(Boolean);
        const project = await Project_1.default.findOne({
            _id: projectId,
            ownerId: { $in: ownerIds }
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const urlCount = await URL_1.default.countDocuments({ projectId });
        res.json({
            _id: project._id,
            name: project.name,
            description: project.description,
            urlCount,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create a new project
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { name, description, urls } = req.body;
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Project name is required' });
        }
        // Check tier limits (but allow Quick Scan projects to bypass)
        const user = await User_1.default.findOne({ clerkId: req.user.clerkId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const projectCount = await Project_1.default.countDocuments({ ownerId: req.user.clerkId });
        // Allow Quick Scan projects to bypass the limit
        // Quick Scan projects are identified by having exactly 1 URL and being created via Quick Scan
        const isQuickScanProject = urls && Array.isArray(urls) && urls.length === 1;
        // All users now have unlimited projects - removed tier restrictions
        if (projectCount >= user.maxProjects && !isQuickScanProject && user.maxProjects !== -1) {
            return res.status(403).json({
                error: 'Project limit reached',
                message: `Maximum ${user.maxProjects} project(s) allowed.`,
                currentCount: projectCount,
                maxAllowed: user.maxProjects
            });
        }
        // Validate URLs if provided
        if (urls && Array.isArray(urls)) {
            // All users now have unlimited URLs - removed tier restrictions
            // Keeping validation for data integrity but not restricting by count
        }
        const project = new Project_1.default({
            name: name.trim(),
            description: description?.trim(),
            ownerId: req.user.clerkId,
        });
        await project.save();
        // Update user's project count
        await User_1.default.findOneAndUpdate({ clerkId: req.user.clerkId }, { $inc: { projects: 1 } });
        // Create URLs if provided
        let createdUrls = [];
        if (urls && Array.isArray(urls) && urls.length > 0) {
            const urlPromises = urls.map((urlData) => {
                const url = new URL_1.default({
                    projectId: project._id,
                    url: urlData.url,
                    name: urlData.name,
                    status: 'pending',
                });
                return url.save();
            });
            createdUrls = await Promise.all(urlPromises);
        }
        res.status(201).json({
            message: 'Project created successfully',
            project: {
                ...project.toObject(),
                urlCount: createdUrls.length,
            },
            urls: createdUrls
        });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: 'Invalid project data' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update a project
router.put('/:projectId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name, description } = req.body;
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Project name is required' });
        }
        const project = await Project_1.default.findOneAndUpdate({ _id: projectId, ownerId: req.user.clerkId }, {
            name: name.trim(),
            description: description?.trim(),
        }, { new: true, runValidators: true });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json({
            message: 'Project updated successfully',
            project
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete a project
router.delete('/:projectId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project_1.default.findOne({
            _id: projectId,
            ownerId: req.user.clerkId
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        // Delete all URLs associated with this project
        await URL_1.default.deleteMany({ projectId });
        // Delete the project
        await Project_1.default.findByIdAndDelete(projectId);
        // Update user's project count
        await User_1.default.findOneAndUpdate({ clerkId: req.user.clerkId }, { $inc: { projects: -1 } });
        res.json({ message: 'Project and all associated URLs deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get URLs for a project
router.get('/:projectId/urls', auth_1.authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        // Verify project exists and belongs to user
        const ownerIds = [req.user.clerkId, req.user.email].filter(Boolean);
        const project = await Project_1.default.findOne({
            _id: projectId,
            ownerId: { $in: ownerIds }
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const urls = await URL_1.default.find({ projectId })
            .sort({ createdAt: -1 })
            .lean();
        res.json(urls);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Add URL to a project
router.post('/:projectId/urls', auth_1.authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { url, name } = req.body;
        if (!url || url.trim().length === 0) {
            return res.status(400).json({ error: 'URL is required' });
        }
        // Verify project exists and belongs to user
        const project = await Project_1.default.findOne({
            _id: projectId,
            ownerId: req.user.clerkId
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        // Check tier limits for URLs
        const user = await User_1.default.findOne({ clerkId: req.user.clerkId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const urlCount = await URL_1.default.countDocuments({ projectId });
        // All users now have unlimited URLs - removed tier restrictions
        // Keeping validation for data integrity but not restricting by count
        // Check if URL already exists in this project
        const existingUrl = await URL_1.default.findOne({
            projectId,
            url: url.trim()
        });
        if (existingUrl) {
            return res.status(400).json({ error: 'URL already exists in this project' });
        }
        const newUrl = new URL_1.default({
            projectId,
            url: url.trim(),
            name: name?.trim(),
        });
        await newUrl.save();
        res.status(201).json({
            message: 'URL added successfully',
            url: newUrl
        });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: 'Invalid URL format' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update a URL
router.put('/:projectId/urls/:urlId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { projectId, urlId } = req.params;
        const { url, name } = req.body;
        if (!url || url.trim().length === 0) {
            return res.status(400).json({ error: 'URL is required' });
        }
        // Verify project exists and belongs to user
        const project = await Project_1.default.findOne({
            _id: projectId,
            ownerId: req.user.clerkId
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const urlDoc = await URL_1.default.findOneAndUpdate({ _id: urlId, projectId }, {
            url: url.trim(),
            name: name?.trim(),
        }, { new: true, runValidators: true });
        if (!urlDoc) {
            return res.status(404).json({ error: 'URL not found' });
        }
        res.json({
            message: 'URL updated successfully',
            url: urlDoc
        });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: 'Invalid URL format' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete a URL
router.delete('/:projectId/urls/:urlId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { projectId, urlId } = req.params;
        // Verify project exists and belongs to user
        const project = await Project_1.default.findOne({
            _id: projectId,
            ownerId: req.user.clerkId
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const url = await URL_1.default.findOneAndDelete({
            _id: urlId,
            projectId
        });
        if (!url) {
            return res.status(404).json({ error: 'URL not found' });
        }
        res.json({ message: 'URL deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=projects.js.map