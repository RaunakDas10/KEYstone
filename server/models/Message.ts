import mongoose, { Schema } from 'mongoose';

export interface IMessage {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'freelancer' | 'admin';
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isSystemEvent?: boolean;
  systemEventType?: string;
  attachments?: { name: string; url: string }[];
}

const MessageSchema = new Schema<IMessage>(
  {
    id: { type: String, required: true, unique: true, index: true },
    projectId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ['client', 'freelancer', 'admin'], required: true },
    senderAvatar: { type: String },
    content: { type: String, required: true },
    timestamp: { type: String, default: () => new Date().toISOString() },
    isSystemEvent: { type: Boolean, default: false },
    systemEventType: { type: String },
    attachments: [
      {
        name: { type: String },
        url: { type: String },
        _id: false,
      },
    ],
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

export const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);
