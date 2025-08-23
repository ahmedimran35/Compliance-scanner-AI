import mongoose, { Document, Schema } from 'mongoose';

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

const NotificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['scan_completed', 'scan_failed', 'monitoring_alert', 'website_offline', 'website_online', 'system_maintenance', 'new_feature', 'security_alert'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  data: {
    scanId: String,
    websiteId: String,
    projectId: String,
    url: String,
    errorMessage: String,
    scanResults: Schema.Types.Mixed
  },
  action: {
    label: String,
    href: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema); 