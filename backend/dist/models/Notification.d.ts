import mongoose, { Document } from 'mongoose';
export interface INotification extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    type: 'scan_completed' | 'scan_failed' | 'monitoring_alert' | 'website_offline' | 'website_online' | 'system_maintenance' | 'new_feature' | 'security_alert';
    title: string;
    message: string;
    read: boolean;
    data?: {
        scanId?: string;
        websiteId?: string;
        projectId?: string;
        url?: string;
        errorMessage?: string;
        scanResults?: any;
    };
    action?: {
        label: string;
        href: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Notification.d.ts.map