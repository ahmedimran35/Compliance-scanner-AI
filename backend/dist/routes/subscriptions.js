"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stripeService_1 = __importDefault(require("../services/stripeService"));
const auth_1 = require("../middlewares/auth");
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(auth_1.authenticateToken);
/**
 * GET /api/subscriptions/plans
 * Get available subscription plans
 */
router.get('/plans', async (req, res) => {
    try {
        const plans = stripeService_1.default.getSubscriptionPlans();
        res.json({ plans });
    }
    catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
});
/**
 * POST /api/subscriptions/create-checkout-session
 * Create a Stripe checkout session
 */
router.post('/create-checkout-session', async (req, res) => {
    try {
        const userId = req.user?._id;
        const { planId } = req.body;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        if (!planId) {
            return res.status(400).json({ error: 'Plan ID is required' });
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const session = await stripeService_1.default.createCheckoutSession(user, planId);
        res.json({ sessionId: session.id, url: session.url });
    }
    catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});
/**
 * POST /api/subscriptions/create-portal-session
 * Create a customer portal session
 */
router.post('/create-portal-session', async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!user.stripeCustomerId) {
            return res.status(400).json({ error: 'No subscription found' });
        }
        const session = await stripeService_1.default.createPortalSession(user);
        res.json({ url: session.url });
    }
    catch (error) {
        console.error('Error creating portal session:', error);
        res.status(500).json({ error: 'Failed to create portal session' });
    }
});
/**
 * GET /api/subscriptions/status
 * Get user's subscription status
 */
router.get('/status', async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const limits = {
            free: { scans: 10, projects: 3 },
            pro: { scans: 100, projects: 20 },
            enterprise: { scans: -1, projects: -1 }
        };
        const currentLimit = limits[user.subscriptionTier];
        res.json({
            subscription: {
                tier: user.subscriptionTier,
                status: user.subscriptionStatus,
                currentPeriodStart: user.currentPeriodStart,
                currentPeriodEnd: user.currentPeriodEnd,
                stripeCustomerId: user.stripeCustomerId,
                stripeSubscriptionId: user.stripeSubscriptionId
            },
            usage: {
                scansThisMonth: user.usageStats.scansThisMonth,
                projectsCreated: user.usageStats.projectsCreated,
                lastResetDate: user.usageStats.lastResetDate
            },
            limits: currentLimit,
            canPerformScan: user.canPerformScan(),
            canCreateProject: user.canCreateProject(),
            canAccessPremiumFeatures: user.canAccessPremiumFeatures()
        });
    }
    catch (error) {
        console.error('Error fetching subscription status:', error);
        res.status(500).json({ error: 'Failed to fetch subscription status' });
    }
});
/**
 * POST /api/subscriptions/webhook
 * Handle Stripe webhooks
 */
router.post('/webhook', express_1.default.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
        event = require('stripe').webhooks.constructEvent(req.body, sig, endpointSecret || '');
    }
    catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    try {
        await stripeService_1.default.handleWebhook(event);
        res.json({ received: true });
    }
    catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
});
exports.default = router;
//# sourceMappingURL=subscriptions.js.map