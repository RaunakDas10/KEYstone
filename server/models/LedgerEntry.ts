import mongoose, { Schema } from 'mongoose';

export interface ILedgerEntry {
  id: string;
  projectId: string;
  projectTitle: string;
  actorId: string;
  actorName: string;
  actorRole: 'client' | 'freelancer' | 'admin';
  eventType: string;
  previousState: string;
  newState: string;
  amount: number;
  timestamp: string;
  referenceId: string;
  hash: string;
  notes?: string;
}

const LedgerEntrySchema = new Schema<ILedgerEntry>(
  {
    id: { type: String, required: true, unique: true, index: true },
    projectId: { type: String, required: true, index: true },
    projectTitle: { type: String, required: true },
    actorId: { type: String, required: true },
    actorName: { type: String, required: true },
    actorRole: { type: String, enum: ['client', 'freelancer', 'admin'], required: true },
    eventType: { type: String, required: true },
    previousState: { type: String, required: true },
    newState: { type: String, required: true },
    amount: { type: Number, required: true },
    timestamp: { type: String, default: () => new Date().toISOString() },
    referenceId: { type: String, required: true },
    hash: { type: String, required: true },
    notes: { type: String },
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

export const LedgerEntryModel = mongoose.model<ILedgerEntry>('LedgerEntry', LedgerEntrySchema);
