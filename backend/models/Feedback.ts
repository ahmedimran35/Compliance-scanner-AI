import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  userId?: string;
  clerkId?: string;
  type: 'general' | 'bug' | 'feature' | 'improvement';
  rating: number;
  title: string;
  description: string;
  email: string;
  category: string;
  status: 'pending' | 'reviewed' | 'in-progress' | 'resolved' | 'closed';
  adminNotes?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true,
  },
  clerkId: {
    type: String,
    required: false,
    index: true,
  },
  type: {
    type: String,
    enum: ['general', 'bug', 'feature', 'improvement'],
    required: true,
    default: 'general'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    required: true,
    default: 0
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    default: 'General',
    enum: [
      'General',
      'User Interface',
      'Performance',
      'Security',
      'Scanning',
      'Monitoring',
      'Reports',
      'Notifications',
      'API',
      'Documentation',
      'Other'
    ]
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'in-progress', 'resolved', 'closed'],
    default: 'pending',
    index: true
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  }
}, {
  timestamps: true,
});

// Indexes for efficient querying
FeedbackSchema.index({ status: 1, priority: 1, createdAt: -1 });
FeedbackSchema.index({ type: 1, category: 1 });
FeedbackSchema.index({ rating: 1 });

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);
