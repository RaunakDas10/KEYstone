export type UserRole = 'client' | 'freelancer' | 'admin';

export type FundState = 'IN_CUSTODY' | 'FROZEN' | 'WITHDRAWABLE' | 'REFUNDED' | 'PAID' | 'DISPUTED';

export type ProjectStatus = 'draft' | 'selection_pending' | 'active' | 'in_review' | 'completed' | 'disputed' | 'cancelled';
export type ProjectAccess = 'invited' | 'open';

export type CheckpointStatus = 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'disputed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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
  trustScore?: number;
  onTimeRate?: number;
  completionRate?: number;
  disputeRate?: number;
  projectsCompleted?: number;
  hourlyRate?: number;
  joinedDate: string;
  verified: boolean;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  amount: number;
  deadline: string;
  acceptanceCriteria: string[];
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'failed';
  fundState: FundState;
}

export interface CheckpointSubmission {
  id: string;
  milestoneId: string;
  submittedAt: string;
  demoUrl?: string;
  githubUrl?: string;
  description: string;
  notes?: string;
  completionPercentage: number;
  attachments?: { name: string; url: string; size: string }[];
  status: CheckpointStatus;
  feedback?: string;
  reviewedAt?: string;
}

export interface FreelancerApplication {
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

export interface Project {
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
  access?: ProjectAccess;
  applicationDeadline?: string;
  applications?: FreelancerApplication[];
  selectedAt?: string;
  status: ProjectStatus;
  fundState: FundState;
  amountInCustody: number;
  amountFrozen: number;
  amountWithdrawable: number;
  amountPaid: number;
  amountRefunded: number;
  milestones: Milestone[];
  currentMilestoneIndex: number;
  submissions: CheckpointSubmission[];
  createdAt: string;
  lastActivityAt: string;
  inactivityDays: number;
  autoUnlockEligible: boolean;
  disputeId?: string;
  freelancerRating?: number;
  freelancerReview?: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterRole: UserRole;
  targetId: string;
  targetName: string;
  projectId?: string;
  reason: string;
  description: string;
  createdAt: string;
  status: 'open' | 'reviewed' | 'resolved';
}

export type LedgerEventType = 
  | 'FUND_DEPOSITED'
  | 'PROJECT_STARTED'
  | 'CHECKPOINT_SUBMITTED'
  | 'CHECKPOINT_APPROVED'
  | 'CHECKPOINT_REJECTED'
  | 'FUNDS_FROZEN'
  | 'FUNDS_RELEASED'
  | 'FUNDS_REFUNDED'
  | 'RESOLUTION_90_10_EXECUTED'
  | 'AUTO_UNLOCK_EXECUTED'
  | 'DISPUTE_OPENED'
  | 'DISPUTE_RESOLVED'
  | 'PAYOUT_WITHDRAWN';

export interface LedgerEntry {
  id: string;
  projectId: string;
  projectTitle: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  eventType: LedgerEventType;
  previousState: FundState;
  newState: FundState;
  amount: number;
  timestamp: string;
  referenceId: string;
  hash: string;
  notes?: string;
}

export interface Dispute {
  id: string;
  projectId: string;
  projectTitle: string;
  raisedBy: string;
  raisedByName: string;
  raisedByRole: UserRole;
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

export interface Message {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isSystemEvent?: boolean;
  systemEventType?: LedgerEventType;
  attachments?: { name: string; url: string }[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'payment' | 'checkpoint' | 'project' | 'message' | 'dispute' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface PortfolioItem {
  id: string;
  freelancerId: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  demoUrl?: string;
  githubUrl?: string;
  technologies: string[];
  completedAt: string;
  clientRating?: number;
}
