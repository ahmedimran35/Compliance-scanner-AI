import mongoose, { Schema, Document } from 'mongoose';

export interface IScheduledScan extends Document {
  urlId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  ownerId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  dayOfWeek?: number; // 0-6 (Sunday-Saturday) for weekly
  dayOfMonth?: number; // 1-31 for monthly
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

const ScheduledScanSchema = new Schema<IScheduledScan>({
  urlId: {
    type: Schema.Types.ObjectId,
    ref: 'URL',
    required: true
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  ownerId: {
    type: String,
    required: true,
    index: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  time: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Time must be in HH:MM format'
    }
  },
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6,
    validate: {
      validator: function(this: IScheduledScan, v: number) {
        if (this.frequency === 'weekly' && (v < 0 || v > 6)) {
          return false;
        }
        return true;
      },
      message: 'Day of week must be between 0 and 6'
    }
  },
  dayOfMonth: {
    type: Number,
    min: 1,
    max: 31,
    validate: {
      validator: function(this: IScheduledScan, v: number) {
        if (this.frequency === 'monthly' && (v < 1 || v > 31)) {
          return false;
        }
        return true;
      },
      message: 'Day of month must be between 1 and 31'
    }
  },
  scanOptions: {
    gdpr: {
      type: Boolean,
      default: true
    },
    accessibility: {
      type: Boolean,
      default: true
    },
    security: {
      type: Boolean,
      default: true
    },
    performance: {
      type: Boolean,
      default: false
    },
    seo: {
      type: Boolean,
      default: false
    },
    customRules: [{
      type: String
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastRun: {
    type: Date
  },
  nextRun: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying of active scheduled scans
ScheduledScanSchema.index({ isActive: 1, nextRun: 1 });
ScheduledScanSchema.index({ ownerId: 1, isActive: 1 });

// Pre-save middleware to calculate nextRun
ScheduledScanSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('frequency') || this.isModified('time') || 
      this.isModified('dayOfWeek') || this.isModified('dayOfMonth')) {
    this.nextRun = (this as any).calculateNextRun();
  }
  next();
});

// Method to calculate next run time
ScheduledScanSchema.methods.calculateNextRun = function(): Date {
  const now = new Date();
  const [hours, minutes] = this.time.split(':').map(Number);
  const nextRun = new Date(now);
  nextRun.setHours(hours, minutes, 0, 0);
  
  // If the time has passed today, move to next occurrence
  if (nextRun <= now) {
    if (this.frequency === 'daily') {
      nextRun.setDate(nextRun.getDate() + 1);
    } else if (this.frequency === 'weekly' && this.dayOfWeek !== undefined) {
      const currentDay = nextRun.getDay();
      const daysToAdd = (this.dayOfWeek - currentDay + 7) % 7;
      nextRun.setDate(nextRun.getDate() + daysToAdd);
    } else if (this.frequency === 'monthly' && this.dayOfMonth !== undefined) {
      nextRun.setDate(this.dayOfMonth);
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
    }
  }
  
  return nextRun;
};

// Method to update next run time after execution
ScheduledScanSchema.methods.updateNextRun = function(): void {
  this.lastRun = new Date();
  this.nextRun = this.calculateNextRun();
};

export default mongoose.model<IScheduledScan>('ScheduledScan', ScheduledScanSchema); 