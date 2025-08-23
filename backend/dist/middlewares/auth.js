"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireProTier = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }
        console.log('Processing token for authentication...');
        // For now, let's decode the token without verification to get the user info
        // This is a temporary solution until we get the proper JWT public key
        const decoded = jsonwebtoken_1.default.decode(token);
        if (!decoded || !decoded.sub) {
            console.log('Token decode failed or missing sub:', decoded);
            return res.status(401).json({ error: 'Invalid token' });
        }
        console.log('Token decoded successfully, user ID:', decoded.sub);
        // Find or create user in database
        let user = await User_1.default.findOne({ clerkId: decoded.sub });
        if (!user) {
            console.log('Creating new user for clerkId:', decoded.sub);
            // Extract email from token or use a fallback
            const email = decoded.email || decoded.email_addresses?.[0]?.email_address || `${decoded.sub}@placeholder.com`;
            // Create new user with free tier
            user = new User_1.default({
                clerkId: decoded.sub,
                email: email,
                firstName: decoded.first_name || decoded.firstName || '',
                lastName: decoded.last_name || decoded.lastName || '',
                subscriptionTier: 'free',
                subscriptionStatus: 'active',
                usageStats: {
                    scansThisMonth: 0,
                    projectsCreated: 0,
                    lastResetDate: new Date()
                }
            });
            try {
                await user.save();
                console.log('New user created successfully');
            }
            catch (saveError) {
                console.error('Failed to save user:', saveError);
                // If email is duplicate, try to find existing user
                if (saveError.code === 11000) {
                    user = await User_1.default.findOne({ email: email });
                    if (!user) {
                        return res.status(500).json({ error: 'User creation failed' });
                    }
                }
                else {
                    return res.status(500).json({ error: 'User creation failed' });
                }
            }
        }
        else {
            console.log('Existing user found:', user.email);
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        return res.status(403).json({ error: 'Invalid token' });
    }
};
exports.authenticateToken = authenticateToken;
const requireProTier = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.user.subscriptionTier !== 'pro' && req.user.subscriptionTier !== 'enterprise') {
        return res.status(403).json({
            error: 'Pro tier required',
            message: 'This feature requires a Pro subscription'
        });
    }
    next();
};
exports.requireProTier = requireProTier;
//# sourceMappingURL=auth.js.map