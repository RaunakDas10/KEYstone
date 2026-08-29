import mongoose, { Schema } from 'mongoose';

export interface IMilestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  amount: number;
  deadline: string;
  reviewDays?: number;
  acceptanceCriteria: string[];
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'failed';
  fundState: 'IN_CUSTODY' | 'FROZEN' | 'WITHDRAWABLE' | 'REFUNDED' | 'PAID' | 'DISPUTED';
  cancellationKillFee?: number;
}

export interface IDeliverableItem {
  id: string;
  description: string;
  milestoneId?: string;
  appliesTo: 'CHECKPOINT' | 'FINAL';
  status: 'PENDING' | 'COMPLETED';
  markedCompleteAt?: string;
}

export interface ICheckpointSubmission {
  id: string;
  milestoneId: string;
  submittedAt: string;
  demoUrl?: string;
  githubUrl?: string;
  description: string;
  notes?: string;
  completionPercentage: number;
  attachments?: { name: string; url: string; size: string }[];
  status: 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'disputed';
  completedDeliverableIds?: string[];
  scopeComplete?: boolean;
  reviewDays?: number;
  reviewDueAt?: string;
  feedback?: string;
  reviewedAt?: string;
}

export interface IFreelancerApplication {
  id: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  freelancerAvatar?: string;
  freelancerTitle?: string;
  freelancerBio?: string;
  freelancerPronouns?: string;
  freelancerCompany?: string;
  freelancerLocation?: string;
  freelancerWebsite?: string;
  freelancerLinkedin?: string;
  freelancerGithub?: string;
  freelancerInstagram?: string;
  freelancerXHandle?: string;
  freelancerShowLocalTime?: boolean;
  freelancerSkills?: string[];
  trustScore?: number;
  completionRate?: number;
  projectsCompleted?: number;
  hourlyRate?: number;
  verified: boolean;
  submittedAt: string;
}

export interface IProject {
  id: string;
  title: string;
  category: string;
  description: string;
  skills: string[];
  budget: number;
  currency: string;
  startDate: string;
  deadline: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  freelancerId?: string;
  freelancerName?: string;
  freelancerAvatar?: string;
  freelancerTitle?: string;
  access?: 'invited' | 'open';
  applicationDeadline?: string;
  applications: IFreelancerApplication[];
  selectedAt?: string;
  status: 'draft' | 'selection_pending' | 'active' | 'in_review' | 'completed' | 'disputed' | 'cancelled' | 'cancelled_by_customer';
  fundState: 'IN_CUSTODY' | 'FROZEN' | 'WITHDRAWABLE' | 'REFUNDED' | 'PAID' | 'DISPUTED';
  amountInCustody: number;
  amountFrozen: number;
  amountWithdrawable: number;
  amountPaid: number;
  amountRefunded: number;
  checkpointReviewDays: number;
  finalReviewDays: number;
  deliverables: IDeliverableItem[];
  deliverablesLockedAt?: string;
  milestones: IMilestone[];
  currentMilestoneIndex: number;
  submissions: ICheckpointSubmission[];
  createdAt: string;
  lastActivityAt: string;
  inactivityDays: number;
  autoUnlockEligible: boolean;
  disputeId?: string;
  freelancerRating?: number;
  freelancerReview?: string;
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    id: { type: String, required: true },
    projectId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    amount: { type: Number, required: true },
    deadline: { type: String, required: true },
    reviewDays: { type: Number, default: 7 },
    acceptanceCriteria: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'submitted', 'approved', 'failed'],
      default: 'pending',
    },
    fundState: {
      type: String,
      enum: ['IN_CUSTODY', 'FROZEN', 'WITHDRAWABLE', 'REFUNDED', 'PAID', 'DISPUTED'],
      default: 'IN_CUSTODY',
    },
    cancellationKillFee: { type: Number },
  },
  { _id: false }
);

const CheckpointSubmissionSchema = new Schema<ICheckpointSubmission>(
  {
    id: { type: String, required: true },
    milestoneId: { type: String, required: true },
    submittedAt: { type: String, required: true },
    demoUrl: { type: String },
    githubUrl: { type: String },
    description: { type: String, required: true },
    notes: { type: String },
    completionPercentage: { type: Number, default: 100 },
    attachments: [
      {
        name: { type: String },
        url: { type: String },
        size: { type: String },
        _id: false,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'submitted', 'under_review', 'approved', 'rejected', 'disputed'],
      default: 'under_review',
    },
    completedDeliverableIds: { type: [String], default: [] },
    scopeComplete: { type: Boolean, default: false },
    reviewDays: { type: Number, default: 7 },
    reviewDueAt: { type: String },
    feedback: { type: String },
    reviewedAt: { type: String },
  },
  { _id: false }
);

const FreelancerApplicationSchema = new Schema<IFreelancerApplication>(
  {
    id: { type: String, required: true },
    freelancerId: { type: String, required: true },
    freelancerName: { type: String, required: true },
    freelancerEmail: { type: String, required: true },
    freelancerAvatar: { type: String },
    freelancerTitle: { type: String },
    freelancerBio: { type: String },
    freelancerPronouns: { type: String },
    freelancerCompany: { type: String },
    freelancerLocation: { type: String },
    freelancerWebsite: { type: String },
    freelancerLinkedin: { type: String },
    freelancerGithub: { type: String },
    freelancerInstagram: { type: String },
    freelancerXHandle: { type: String },
    freelancerShowLocalTime: { type: Boolean },
    freelancerSkills: { type: [String], default: [] },
    trustScore: { type: Number },
    completionRate: { type: Number },
    projectsCompleted: { type: Number },
    hourlyRate: { type: Number },
    verified: { type: Boolean, default: false },
    submittedAt: { type: String, required: true },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: { type: String, default: 'Engineering' },
    description: { type: String, default: '' },
    skills: { type: [String], default: [] },
    budget: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    startDate: { type: String, required: true },
    deadline: { type: String, required: true },
    clientId: { type: String, required: true, index: true },
    clientName: { type: String, required: true },
    clientAvatar: { type: String },
    freelancerId: { type: String, index: true },
    freelancerName: { type: String },
    freelancerAvatar: { type: String },
    freelancerTitle: { type: String },
    access: { type: String, enum: ['invited', 'open'], default: 'open' },
    applicationDeadline: { type: String },
    applications: { type: [FreelancerApplicationSchema], default: [] },
    selectedAt: { type: String },
    status: {
      type: String,
      enum: ['draft', 'selection_pending', 'active', 'in_review', 'completed', 'disputed', 'cancelled', 'cancelled_by_customer'],
      default: 'active',
    },
    fundState: {
      type: String,
      enum: ['IN_CUSTODY', 'FROZEN', 'WITHDRAWABLE', 'REFUNDED', 'PAID', 'DISPUTED'],
      default: 'IN_CUSTODY',
    },
    amountInCustody: { type: Number, default: 0 },
    amountFrozen: { type: Number, default: 0 },
    amountWithdrawable: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    amountRefunded: { type: Number, default: 0 },
    checkpointReviewDays: { type: Number, default: 7, min: 2, max: 21 },
    finalReviewDays: { type: Number, default: 7, min: 2, max: 30 },
    deliverables: {
      type: [{
        id: { type: String, required: true },
        description: { type: String, required: true },
        milestoneId: { type: String },
        appliesTo: { type: String, enum: ['CHECKPOINT', 'FINAL'], required: true },
        status: { type: String, enum: ['PENDING', 'COMPLETED'], default: 'PENDING' },
        markedCompleteAt: { type: String },
        _id: false,
      }],
      default: [],
    },
    deliverablesLockedAt: { type: String },
    milestones: { type: [MilestoneSchema], default: [] },
    currentMilestoneIndex: { type: Number, default: 0 },
    submissions: { type: [CheckpointSubmissionSchema], default: [] },
    createdAt: { type: String, default: () => new Date().toISOString() },
    lastActivityAt: { type: String, default: () => new Date().toISOString() },
    inactivityDays: { type: Number, default: 0 },
    autoUnlockEligible: { type: Boolean, default: false },
    disputeId: { type: String },
    freelancerRating: { type: Number },
    freelancerReview: { type: String },
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

export const ProjectModel = mongoose.model<IProject>('Project', ProjectSchema);
