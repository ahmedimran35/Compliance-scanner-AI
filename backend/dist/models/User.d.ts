import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    clerkId: string;
    email: string;
    firstName: string;
    lastName: string;
    subscriptionTier: 'free' | 'pro' | 'enterprise';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStatus: 'active' | 'inactive' | 'cancelled' | 'past_due';
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    usageStats: {
        scansThisMonth: number;
        projectsCreated: number;
        lastResetDate: Date;
    };
    createdAt: Date;
    updatedAt: Date;
    canPerformScan(): {
        allowed: boolean;
        reason?: string;
    };
    canCreateProject(): {
        allowed: boolean;
        reason?: string;
    };
    canAccessPremiumFeatures(): boolean;
    incrementScanUsage(): Promise<IUser>;
    incrementProjectUsage(): Promise<IUser>;
    resetMonthlyUsage(): Promise<IUser>;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map