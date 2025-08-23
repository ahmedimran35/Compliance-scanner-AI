import mongoose, { Document } from 'mongoose';
export interface IScheduledScan extends Document {
    urlId: mongoose.Types.ObjectId;
    projectId: mongoose.Types.ObjectId;
    ownerId: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    scanOptions: {
        gdpr: boolean;
        accessibility: boolean;
        security: boolean;
        performance: boolean;
        seo: boolean;
        customRules: string[];
    };
    isActive: boolean;
    lastRun?: Date;
    nextRun: Date;
    createdAt: Date;
    updatedAt: Date;
    calculateNextRun(): Date;
    updateNextRun(): void;
}
declare const _default: mongoose.Model<IScheduledScan, {}, {}, {}, mongoose.Document<unknown, {}, IScheduledScan, {}, {}> & IScheduledScan & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=ScheduledScan.d.ts.map