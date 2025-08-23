"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    subscriptionTier: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free'
    },
    stripeCustomerId: {
        type: String,
        sparse: true
    },
    stripeSubscriptionId: {
        type: String,
        sparse: true
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'inactive', 'cancelled', 'past_due'],
        default: 'active'
    },
    currentPeriodStart: {
        type: Date
    },
    currentPeriodEnd: {
        type: Date
    },
    usageStats: {
        scansThisMonth: {
            type: Number,
            default: 0
        },
        projectsCreated: {
            type: Number,
            default: 0
        },
        lastResetDate: {
            type: Date,
            default: Date.now
        }
    }
}, {
    timestamps: true
});
// Indexes for efficient queries
UserSchema.index({ subscriptionTier: 1 });
UserSchema.index({ subscriptionStatus: 1 });
UserSchema.index({ 'usageStats.lastResetDate': 1 });
// Method to check if user can perform a scan
UserSchema.methods.canPerformScan = function () {
    const limits = {
        free: { scans: 10, projects: 3 },
        pro: { scans: 100, projects: 20 },
        enterprise: { scans: -1, projects: -1 } // Unlimited
    };
    const tier = this.subscriptionTier;
    const limit = limits[tier];
    if (limit.scans !== -1 && this.usageStats.scansThisMonth >= limit.scans) {
        return { allowed: false, reason: `Monthly scan limit of ${limit.scans} reached. Upgrade to Pro for more scans.` };
    }
    return { allowed: true };
};
// Method to check if user can create a project
UserSchema.methods.canCreateProject = function () {
    const limits = {
        free: { scans: 10, projects: 3 },
        pro: { scans: 100, projects: 20 },
        enterprise: { scans: -1, projects: -1 } // Unlimited
    };
    const tier = this.subscriptionTier;
    const limit = limits[tier];
    if (limit.projects !== -1 && this.usageStats.projectsCreated >= limit.projects) {
        return { allowed: false, reason: `Project limit of ${limit.projects} reached. Upgrade to Pro for more projects.` };
    }
    return { allowed: true };
};
// Method to check if user can access premium features
UserSchema.methods.canAccessPremiumFeatures = function () {
    return this.subscriptionTier === 'pro' || this.subscriptionTier === 'enterprise';
};
// Method to increment scan usage
UserSchema.methods.incrementScanUsage = function () {
    this.usageStats.scansThisMonth += 1;
    return this.save();
};
// Method to increment project usage
UserSchema.methods.incrementProjectUsage = function () {
    this.usageStats.projectsCreated += 1;
    return this.save();
};
// Method to reset monthly usage (called by cron job)
UserSchema.methods.resetMonthlyUsage = function () {
    const now = new Date();
    const lastReset = new Date(this.usageStats.lastResetDate);
    // Reset if it's a new month
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
        this.usageStats.scansThisMonth = 0;
        this.usageStats.lastResetDate = now;
    }
    return this.save();
};
exports.default = mongoose_1.default.model('User', UserSchema);
//# sourceMappingURL=User.js.map