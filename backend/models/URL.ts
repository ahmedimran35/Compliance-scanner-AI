import mongoose, { Document, Schema } from 'mongoose';

export interface IURL extends Document {
  projectId: mongoose.Types.ObjectId;
  url: string;
  name?: string;
  status?: 'pending' | 'scanning' | 'completed' | 'failed';
  lastScanned?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const URLSchema = new Schema<IURL>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Invalid URL format'
    }
  },
  name: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  status: {
    type: String,
    enum: ['pending', 'scanning', 'completed', 'failed'],
    default: 'pending',
  },
  lastScanned: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
URLSchema.index({ projectId: 1, createdAt: -1 });
URLSchema.index({ projectId: 1, status: 1 });

export default mongoose.model<IURL>('URL', URLSchema); 