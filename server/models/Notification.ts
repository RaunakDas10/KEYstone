import mongoose, { Schema } from 'mongoose';

export interface INotification {
  id: string;
  userId: string;
  type: 'payment' | 'checkpoint' | 'project' | 'message' | 'dispute' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  link?: string;
  projectId?: string;
}

const NotificationSchema = new Schema<INotification>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['payment', 'checkpoint', 'project', 'message', 'dispute', 'system'],
      default: 'system',
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: String, default: () => new Date().toISOString() },
    read: { type: Boolean, default: false },
    link: { type: String },
    projectId: { type: String, index: true },
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

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);
