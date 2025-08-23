"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }
        // For now, let's decode the token without verification to get the user info
        // This is a temporary solution until we get the proper JWT public key
        const decoded = jsonwebtoken_1.default.decode(token);
        if (!decoded || !decoded.sub) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        // Find or create user in database
        let user = await User_1.default.findOne({ clerkId: decoded.sub });
        if (!user) {
            // Extract email from token with better fallback handling
            let email = '';
            if (decoded.email) {
                email = decoded.email;
            }
            else if (decoded.email_addresses && Array.isArray(decoded.email_addresses) && decoded.email_addresses.length > 0) {
                email = decoded.email_addresses[0].email_address;
            }
            else if (decoded.email_addresses && typeof decoded.email_addresses === 'object') {
                // Handle case where email_addresses is an object
                const emailAddresses = Object.values(decoded.email_addresses);
                if (emailAddresses.length > 0 && typeof emailAddresses[0] === 'object') {
                    email = emailAddresses[0].email_address || '';
                }
            }
            else if (decoded.primary_email_address_id) {
                // Try to get email from primary_email_address_id
                if (decoded.email_addresses && decoded.email_addresses[decoded.primary_email_address_id]) {
                    email = decoded.email_addresses[decoded.primary_email_address_id].email_address;
                }
            }
            // If still no email, use a better placeholder
            if (!email) {
                email = `user_${decoded.sub}@placeholder.com`;
            }
            console.log('🔍 Token debug info:', {
                hasEmail: !!decoded.email,
                hasEmailAddresses: !!decoded.email_addresses,
                emailAddressesType: typeof decoded.email_addresses,
                primaryEmailId: decoded.primary_email_address_id,
                emailAddressesKeys: decoded.email_addresses ? Object.keys(decoded.email_addresses) : null
            });
            // Create new user with unlimited access (no tier restrictions)
            user = new User_1.default({
                clerkId: decoded.sub,
                email: email,
                firstName: decoded.first_name || decoded.firstName || '',
                lastName: decoded.last_name || decoded.lastName || '',
                isSupporter: false,
                totalDonations: 0,
                donationHistory: [],
                projects: 0,
                scansThisMonth: 0,
                maxProjects: -1, // Unlimited
                maxScansPerMonth: -1, // Unlimited
            });
            try {
                await user.save();
            }
            catch (saveError) {
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
            // Update existing users to have unlimited access if they don't already
            if (user.maxProjects !== -1 || user.maxScansPerMonth !== -1) {
                try {
                    const updatedUser = await User_1.default.findOneAndUpdate({ clerkId: decoded.sub }, {
                        maxProjects: -1, // Unlimited
                        maxScansPerMonth: -1, // Unlimited
                        isSupporter: user.isSupporter || false,
                        totalDonations: user.totalDonations || 0,
                        donationHistory: user.donationHistory || []
                    }, { new: true });
                    if (updatedUser) {
                        user = updatedUser;
                    }
                }
                catch (updateError) {
                    // Continue with existing user data
                }
            }
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};
exports.authenticateToken = authenticateToken;
// Removed requireProTier middleware since all features are now free 
//# sourceMappingURL=auth.js.map