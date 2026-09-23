import {
  User,
  UserRole,
  AITalentSearchResponse,
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
  getGoogleClientId: () => request<{ clientId: string }>('/auth/google-client-id'),
  register: (payload: { name: string; email: string; password: string; role?: UserRole }) =>
    request<{ message: string; email: string; userId: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  verifyOtp: (email: string, otp: string) =>
    request<{ message: string; user: User }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),
  sendOtp: (email: string) =>
    request<{ message: string; email: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  login: (payload: { email: string; password: string }) =>
    request<{ user: User; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  googleLogin: (credential: string, role?: UserRole) =>
    request<{ user: User; message: string }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential, role }),
    }),
  updateProfile: (id: string, updates: Partial<User>) =>
    request<User>(`/auth/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // AI talent search (Gemini stays server-side)
  findTalentWithAI: (query: string, requesterId: string, limit: number = 5) =>
    request<AITalentSearchResponse>('/ai/talent-search', {
      method: 'POST',
      body: JSON.stringify({ query, requesterId, limit }),
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
  updateProject: (projectId: string, updates: Partial<Project> & { actorId: string }) =>
    request<Project>(`/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  inviteFreelancerToProject: (projectId: string, clientId: string, freelancerId: string) =>
    request<Project>(`/projects/${projectId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ clientId, freelancerId }),
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
  respondToProjectInvitation: (projectId: string, freelancerId: string, response: 'accept' | 'reject') =>
    request<Project>(`/projects/${projectId}/invitation/respond`, {
      method: 'POST',
      body: JSON.stringify({ freelancerId, response }),
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
  cancelProject: (projectId: string, actorId: string, reason: string) =>
    request<Project>(`/projects/${projectId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ actorId, reason }),
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
