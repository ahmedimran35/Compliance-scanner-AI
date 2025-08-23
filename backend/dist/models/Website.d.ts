import mongoose, { Document } from 'mongoose';
export interface IWebsite extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    name: string;
    url: string;
    interval: '1min' | '5min' | '30min';
    isActive: boolean;
    lastCheck: Date;
    status: 'online' | 'offline' | 'warning';
    responseTime: number;
    uptime: number;
    totalChecks: number;
    successfulChecks: number;
    failedChecks: number;
    lastDownTime?: Date;
    lastUpTime?: Date;
    createdAt: Date;
    updatedAt: Date;
    updateCheckResult(isOnline: boolean, responseTime: number): Promise<IWebsite>;
    setWarningStatus(): Promise<IWebsite>;
}
declare const _default: mongoose.Model<IWebsite, {}, {}, {}, mongoose.Document<unknown, {}, IWebsite, {}, {}> & IWebsite & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Website.d.ts.map