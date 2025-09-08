import mongoose, { Document, Schema } from 'mongoose';

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

const UserSchema = new Schema<IUser>({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  isSupporter: {
    type: Boolean,
    default: false,
  },
  supporterTier: {
    type: String,
    required: false,
  },
  supporterSince: {
    type: Date,
    required: false,
  },
  totalDonations: {
    type: Number,
    default: 0,
  },
  donationHistory: [{
    amount: {
      type: Number,
      required: true,
    },
    tierId: {
      type: String,
      required: true,
    },
    tierName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
    sessionId: {
      type: String,
      required: false,
    },
  }],
  projects: {
    type: Number,
    default: 0,
  },
  scansThisMonth: {
    type: Number,
    default: 0,
  },
  maxProjects: {
    type: Number,
    default: -1, // Unlimited for all users
  },
  maxScansPerMonth: {
    type: Number,
    default: -1, // Unlimited for all users
  },
}, {
  timestamps: true,
});

// Pre-save middleware to validate email
UserSchema.pre('save', function(next) {
  const user = this as IUser;
  
  // Check if email is required and valid
  if (!user.email || user.email.trim() === '') {
    return next(new Error('Email is required'));
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(user.email)) {
    return next(new Error('Invalid email format'));
  }
  
  // Check for placeholder emails
  if (user.email.includes('@placeholder.com')) {
    return next(new Error('Placeholder emails are not allowed'));
  }
  
  next();
});

export default mongoose.model<IUser>('User', UserSchema); 