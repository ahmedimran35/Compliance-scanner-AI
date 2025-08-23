import mongoose, { Document, Schema } from 'mongoose';

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

const WebsiteSchema = new Schema<IWebsite>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  url: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  interval: {
    type: String,
    enum: ['1min', '5min', '30min'],
    default: '5min'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastCheck: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'warning'],
    default: 'offline'
  },
  responseTime: {
    type: Number,
    default: 0,
    min: 0
  },
  uptime: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalChecks: {
    type: Number,
    default: 0,
    min: 0
  },
  successfulChecks: {
    type: Number,
    default: 0,
    min: 0
  },
  failedChecks: {
    type: Number,
    default: 0,
    min: 0
  },
  lastDownTime: {
    type: Date
  },
  lastUpTime: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
WebsiteSchema.index({ userId: 1, isActive: 1 });
WebsiteSchema.index({ userId: 1, status: 1 });
WebsiteSchema.index({ lastCheck: 1 });

// Virtual for calculating uptime percentage
WebsiteSchema.virtual('uptimePercentage').get(function() {
  if (this.totalChecks === 0) return 0;
  return (this.successfulChecks / this.totalChecks) * 100;
});

// Method to update check results
WebsiteSchema.methods.updateCheckResult = function(isOnline: boolean, responseTime: number) {
  this.lastCheck = new Date();
  this.responseTime = responseTime;
  this.totalChecks += 1;

  if (isOnline) {
    this.successfulChecks += 1;
    this.status = 'online';
    this.lastUpTime = new Date();
  } else {
    this.failedChecks += 1;
    this.status = 'offline';
    this.lastDownTime = new Date();
  }

  // Calculate uptime percentage
  this.uptime = (this.successfulChecks / this.totalChecks) * 100;

  return this.save();
};

// Method to set warning status
WebsiteSchema.methods.setWarningStatus = function() {
  this.status = 'warning';
  this.lastCheck = new Date();
  return this.save();
};

export default mongoose.model<IWebsite>('Website', WebsiteSchema); 