import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  ownerId: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  ownerId: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
ProjectSchema.index({ ownerId: 1, createdAt: -1 });

export default mongoose.model<IProject>('Project', ProjectSchema); 