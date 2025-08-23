import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    isSupporter: boolean;
    supporterTier?: string;
    supporterSince?: Date;
    totalDonations: number;
    donationHistory: Array<{
        amount: number;
        tierId: string;
        tierName: string;
        date: Date;
        status: string;
        sessionId: string;
    }>;
    projects: number;
    scansThisMonth: number;
    maxProjects: number;
    maxScansPerMonth: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map