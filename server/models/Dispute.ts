import mongoose, { Schema } from 'mongoose';

export interface IDispute {
  id: string;
  projectId: string;
  projectTitle: string;
  raisedBy: string;
  raisedByName: string;
  raisedByRole: 'client' | 'freelancer' | 'admin';
  againstId: string;
  againstName: string;
  reason: string;
  description: string;
  evidence: { name: string; url: string }[];
  amountInDispute: number;
  createdAt: string;
  status: 'under_review' | 'resolved' | 'closed';
  resolution?: {
    clientRefundAmount: number;
    freelancerAmount: number;
    summary: string;
    resolvedAt: string;
    resolvedBy: string;
  };
}

const DisputeSchema = new Schema<IDispute>(
  {
    id: { type: String, required: true, unique: true, index: true },
    projectId: { type: String, required: true, index: true },
    projectTitle: { type: String, required: true },
    raisedBy: { type: String, required: true },
    raisedByName: { type: String, required: true },
    raisedByRole: { type: String, enum: ['client', 'freelancer', 'admin'], required: true },
    againstId: { type: String, required: true },
    againstName: { type: String, required: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    evidence: [
      {
        name: { type: String },
        url: { type: String },
        _id: false,
      },
    ],
    amountInDispute: { type: Number, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    status: {
      type: String,
      enum: ['under_review', 'resolved', 'closed'],
      default: 'under_review',
    },
    resolution: {
      clientRefundAmount: { type: Number },
      freelancerAmount: { type: Number },
      summary: { type: String },
      resolvedAt: { type: String },
      resolvedBy: { type: String },
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

export const DisputeModel = mongoose.model<IDispute>('Dispute', DisputeSchema);
