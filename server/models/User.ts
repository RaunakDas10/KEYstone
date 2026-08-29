import mongoose, { Schema } from 'mongoose';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'freelancer' | 'admin';
  roles?: ('client' | 'freelancer' | 'admin')[];
  freelancerRoles?: string[];
  passwordHash?: string;
  emailVerified?: boolean;
  otpCode?: string;
  otpExpiresAt?: Date;
  otpLastSentAt?: Date;
  authProvider?: 'email' | 'google';
  googleId?: string;
  avatar?: string;
  title?: string;
  bio?: string;
  pronouns?: string;
  company?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
  xHandle?: string;
  showLocalTime?: boolean;
  skills?: string[];
  profileCompleted?: boolean;
  trustScore?: number;
  onTimeRate?: number;
  completionRate?: number;
  disputeRate?: number;
  projectsCompleted?: number;
  hourlyRate?: number;
  joinedDate: string;
  verified: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    emailVerified: { type: Boolean, default: false },
    otpCode: { type: String },
    otpExpiresAt: { type: Date },
    otpLastSentAt: { type: Date },
    authProvider: { type: String, enum: ['email', 'google'], default: 'email' },
    googleId: { type: String },
    role: { type: String, enum: ['client', 'freelancer', 'admin'], required: true },
    roles: { type: [String], default: [] },
    freelancerRoles: { type: [String], default: [] },
    avatar: { type: String },
    title: { type: String },
    bio: { type: String },
    pronouns: { type: String },
    company: { type: String },
    location: { type: String },
    website: { type: String },
    linkedin: { type: String },
    github: { type: String },
    instagram: { type: String },
    xHandle: { type: String },
    showLocalTime: { type: Boolean, default: false },
    skills: { type: [String], default: [] },
    profileCompleted: { type: Boolean, default: false },
    trustScore: { type: Number, default: 0 },
    onTimeRate: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    disputeRate: { type: Number, default: 0 },
    projectsCompleted: { type: Number, default: 0 },
    hourlyRate: { type: Number, default: 1000 },
    joinedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    verified: { type: Boolean, default: true },
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

export const UserModel = mongoose.model<IUser>('User', UserSchema);
