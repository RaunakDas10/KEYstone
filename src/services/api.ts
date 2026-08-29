import {
  User,
  UserRole,
  Project,
  Milestone,
  CheckpointSubmission,
  LedgerEntry,
  Dispute,
  Message,
  Notification,
  Report,
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  // Health
  checkHealth: () => request<{ status: string; database: string; timestamp: string }>('/health'),

  // Auth / Users
  getUsers: () => request<User[]>('/auth/users'),
  getUser: (id: string) => request<User>(`/auth/users/${id}`),
  login: (role?: UserRole, userId?: string) =>
    request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ role, userId }),
    }),
  updateProfile: (id: string, updates: Partial<User>) =>
    request<User>(`/auth/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Projects
  getProjects: (params?: { clientId?: string; freelancerId?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request<Project[]>(`/projects${query ? `?${query}` : ''}`);
  },
  getProject: (id: string) => request<Project>(`/projects/${id}`),
  createProject: (project: Partial<Project>) =>
    request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    }),
  applyToProject: (projectId: string, freelancerId: string) =>
    request<Project>(`/projects/${projectId}/applications`, {
      method: 'POST',
      body: JSON.stringify({ freelancerId }),
    }),
  selectFreelancer: (projectId: string, freelancerId: string) =>
    request<Project>(`/projects/${projectId}/select-freelancer`, {
      method: 'POST',
      body: JSON.stringify({ freelancerId }),
    }),
  submitCheckpoint: (
    projectId: string,
    milestoneId: string,
    submission: Omit<CheckpointSubmission, 'id' | 'submittedAt' | 'status'>
  ) =>
    request<Project>(`/projects/${projectId}/milestones/${milestoneId}/submit`, {
      method: 'POST',
      body: JSON.stringify(submission),
    }),
  approveCheckpoint: (projectId: string, milestoneId: string) =>
    request<Project>(`/projects/${projectId}/milestones/${milestoneId}/approve`, {
      method: 'POST',
    }),
  reject90_10: (projectId: string, milestoneId: string) =>
    request<Project>(`/projects/${projectId}/milestones/${milestoneId}/reject-90-10`, {
      method: 'POST',
    }),
  autoUnlock: (projectId: string) =>
    request<Project>(`/projects/${projectId}/auto-unlock`, {
      method: 'POST',
    }),
  rateFreelancer: (projectId: string, rating: number, review: string) =>
    request<Project>(`/projects/${projectId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    }),

  // Ledger
  getLedger: (projectId?: string) =>
    request<LedgerEntry[]>(`/ledger${projectId ? `?projectId=${projectId}` : ''}`),
  createLedgerEntry: (entry: Partial<LedgerEntry>) =>
    request<LedgerEntry>('/ledger', {
      method: 'POST',
      body: JSON.stringify(entry),
    }),

  // Disputes
  getDisputes: () => request<Dispute[]>('/disputes'),
  raiseDispute: (data: { projectId: string; reason: string; description: string; user: User }) =>
    request<Dispute>('/disputes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  resolveDispute: (disputeId: string, clientRefundPct: number) =>
    request<Dispute>(`/disputes/${disputeId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ clientRefundPct }),
    }),

  // Messages
  getMessages: (projectId?: string) =>
    request<Message[]>(`/messages${projectId ? `?projectId=${projectId}` : ''}`),
  sendMessage: (message: Partial<Message>) =>
    request<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    }),

  // Notifications
  getNotifications: (userId?: string) =>
    request<Notification[]>(`/notifications${userId ? `?userId=${userId}` : ''}`),
  createNotification: (notification: Partial<Notification>) =>
    request<Notification>('/notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    }),
  markNotificationRead: (id: string) =>
    request<Notification>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  // Reports
  getReports: () => request<Report[]>('/reports'),
  createReport: (data: {
    reporter: User;
    target: User;
    projectId?: string;
    reason: string;
    description: string;
  }) =>
    request<Report>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Payouts
  withdrawPayout: (amount: number, user: User, method: string) =>
    request<{ success: boolean; amount: number }>('/payouts/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, user, method }),
    }),

  // Seed / Reset
  seedDatabase: (force: boolean = false) =>
    request<{ message: string }>(`/seed?force=${force}`, {
      method: 'POST',
    }),
};
