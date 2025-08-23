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

export default mongoose.model<IUser>('User', UserSchema); 