import mongoose, { Schema } from 'mongoose';

export interface IReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterRole: 'client' | 'freelancer' | 'admin';
  targetId: string;
  targetName: string;
  projectId?: string;
  reason: string;
  description: string;
  createdAt: string;
  status: 'open' | 'reviewed' | 'resolved';
}

const ReportSchema = new Schema<IReport>(
  {
    id: { type: String, required: true, unique: true, index: true },
    reporterId: { type: String, required: true },
    reporterName: { type: String, required: true },
    reporterRole: { type: String, enum: ['client', 'freelancer', 'admin'], required: true },
    targetId: { type: String, required: true, index: true },
    targetName: { type: String, required: true },
    projectId: { type: String },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    status: {
      type: String,
      enum: ['open', 'reviewed', 'resolved'],
      default: 'open',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const ReportModel = mongoose.model<IReport>('Report', ReportSchema);
