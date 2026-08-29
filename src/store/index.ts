import { create } from 'zustand';
import {
  User,
  UserRole,
  Project,
  Milestone,
  CheckpointSubmission,
  FreelancerApplication,
  LedgerEntry,
  Dispute,
  Message,
  Notification,
  FundState,
  Report,
} from '../types';
import {
  SEED_USERS,
  SEED_PROJECTS,
  SEED_LEDGER_ENTRIES,
  SEED_DISPUTES,
  SEED_MESSAGES,
  SEED_NOTIFICATIONS,
} from '../mock/seedData';
import { api } from '../services/api';

const applicationDeadlineHasPassed = (deadline?: string) =>
  Boolean(deadline) && new Date() > new Date(`${deadline}T23:59:59.999`);

const createProfileApplication = (freelancer: User): FreelancerApplication => ({
  id: `app_${Date.now()}`,
  freelancerId: freelancer.id,
  freelancerName: freelancer.name,
  freelancerEmail: freelancer.email,
  freelancerAvatar: freelancer.avatar,
  freelancerTitle: freelancer.title,
  freelancerBio: freelancer.bio,
  freelancerPronouns: freelancer.pronouns,
  freelancerCompany: freelancer.company,
  freelancerLocation: freelancer.location,
  freelancerWebsite: freelancer.website,
  freelancerLinkedin: freelancer.linkedin,
  freelancerGithub: freelancer.github,
  freelancerInstagram: freelancer.instagram,
  freelancerXHandle: freelancer.xHandle,
  freelancerShowLocalTime: freelancer.showLocalTime,
  freelancerSkills: freelancer.skills || [],
  trustScore: freelancer.trustScore,
  completionRate: freelancer.completionRate,
  projectsCompleted: freelancer.projectsCompleted,
  hourlyRate: freelancer.hourlyRate,
  verified: freelancer.verified,
  submittedAt: new Date().toISOString(),
});

const normalizeLegacyOpenProject = (project: Project): Project => {
  if (project.access !== 'open' || project.applicationDeadline || project.selectedAt) return project;
  const applicationDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return {
    ...project,
    freelancerId: undefined,
    freelancerName: undefined,
    freelancerAvatar: undefined,
    freelancerTitle: undefined,
    applicationDeadline,
    applications: [],
    status: 'selection_pending',
  };
};

// ---------------- AUTH STORE ----------------
interface AuthState {
  currentUser: User;
  isAuthenticated: boolean;
  users: User[];
  login: (payload: { email: string; password: string }) => Promise<User>;
  loginWithGoogle: (credential: string, role?: UserRole) => Promise<User>;
  loginAsDemoUser: (role: UserRole) => User;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<User>) => void;
  fetchUsers: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: SEED_USERS.client,
  isAuthenticated: false,
  users: Object.values(SEED_USERS),
  login: async (payload: { email: string; password: string }) => {
    const response = await api.login(payload);
    const user = response.user;
    set({ currentUser: user, isAuthenticated: true, users: [user, ...get().users.filter((item) => item.id !== user.id)] });
    return user;
  },
  loginWithGoogle: async (credential: string, role?: UserRole) => {
    const response = await api.googleLogin(credential, role);
    const user = response.user;
    set({ currentUser: user, isAuthenticated: true, users: [user, ...get().users.filter((item) => item.id !== user.id)] });
    return user;
  },
  loginAsDemoUser: (role: UserRole) => {
    const user = SEED_USERS[role] || SEED_USERS.client;
    set({ currentUser: user, isAuthenticated: true });
    return user;
  },
  logout: () => {
    set({ currentUser: SEED_USERS.client, isAuthenticated: false });
  },
  switchRole: (role: UserRole) => {
    const user = SEED_USERS[role] || SEED_USERS.client;
    set({ currentUser: user });
  },
  updateProfile: (updates: Partial<User>) => {
    const updated = { ...get().currentUser, ...updates };
    set({ currentUser: updated });
    api.updateProfile(updated.id, updates).catch(() => {});
  },
  fetchUsers: async () => {
    try {
      const users = await api.getUsers();
      if (users && users.length > 0) {
        set({ users });
      }
    } catch {
      // Keep seeded fallback
    }
  },
}));

// ---------------- LEDGER STORE ----------------
interface LedgerState {
  entries: LedgerEntry[];
  addEntry: (entry: Omit<LedgerEntry, 'id' | 'hash' | 'timestamp'>) => void;
  fetchEntries: (projectId?: string) => Promise<void>;
}

export const useLedgerStore = create<LedgerState>((set) => ({
  entries: SEED_LEDGER_ENTRIES,
  addEntry: (entryData) => {
    const id = `led_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const hash = `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`;
    const newEntry: LedgerEntry = {
      ...entryData,
      id,
      timestamp,
      hash,
    };
    set((state) => ({ entries: [newEntry, ...state.entries] }));
    api.createLedgerEntry(newEntry).catch(() => {});
  },
  fetchEntries: async (projectId?: string) => {
    try {
      const entries = await api.getLedger(projectId);
      if (entries && entries.length > 0) {
        set({ entries });
      }
    } catch {
      // Keep seeded fallback
    }
  },
}));

// ---------------- MESSAGE STORE ----------------
interface MessageState {
  messages: Message[];
  sendMessage: (projectId: string, content: string, sender: User) => void;
  addSystemEvent: (projectId: string, content: string, eventType: LedgerEntry['eventType']) => void;
  fetchMessages: (projectId?: string) => Promise<void>;
}

export const useMessageStore = create<MessageState>((set) => ({
  messages: SEED_MESSAGES,
  sendMessage: (projectId, content, sender) => {
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      projectId,
      senderId: sender.id,
      senderName: sender.name,
      senderRole: sender.role,
      senderAvatar: sender.avatar,
      content,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, newMessage] }));
    api.sendMessage(newMessage).catch(() => {});
  },
  addSystemEvent: (projectId, content, eventType) => {
    const systemMsg: Message = {
      id: `msg_${Date.now()}`,
      projectId,
      senderId: 'system',
      senderName: 'KEYStone Protocol',
      senderRole: 'admin',
      content,
      timestamp: new Date().toISOString(),
      isSystemEvent: true,
      systemEventType: eventType,
    };
    set((state) => ({ messages: [...state.messages, systemMsg] }));
    api.sendMessage(systemMsg).catch(() => {});
  },
  fetchMessages: async (projectId?: string) => {
    try {
      const messages = await api.getMessages(projectId);
      if (messages && messages.length > 0) {
        set({ messages });
      }
    } catch {
      // Keep seeded fallback
    }
  },
}));

// ---------------- NOTIFICATION STORE ----------------
interface NotificationState {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  addNotification: (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  notificationsFor: (userId: string) => Notification[];
  fetchNotifications: (userId?: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: SEED_NOTIFICATIONS,
  markAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
    api.markNotificationRead(id).catch(() => {});
  },
  addNotification: (notif) => {
    const newNotif: Notification = {
      ...notif,
      id: `notif_${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    set((state) => ({ notifications: [newNotif, ...state.notifications] }));
    api.createNotification(newNotif).catch(() => {});
  },
  notificationsFor: (userId) =>
    get().notifications.filter((n) => n.userId === userId || n.userId === 'all'),
  fetchNotifications: async (userId?: string) => {
    try {
      const notifs = await api.getNotifications(userId);
      if (notifs && notifs.length > 0) {
        set({ notifications: notifs });
      }
    } catch {
      // Keep seeded fallback
    }
  },
}));

// ---------------- PROJECT STORE ----------------
interface ProjectState {
  projects: Project[];
  disputes: Dispute[];
  reports: Report[];
  blockedUserIds: string[];
  activeProjectId: string | null;
  isLoading: boolean;
  dbConnected: boolean;
  setActiveProjectId: (id: string | null) => void;
  fetchInitialData: () => Promise<void>;
  createProject: (projectData: Partial<Project>) => Project;
  applyToProject: (projectId: string, freelancer: User) => Promise<boolean>;
  selectFreelancer: (projectId: string, freelancerId: string) => Promise<boolean>;
  submitCheckpoint: (
    projectId: string,
    milestoneId: string,
    submission: Omit<CheckpointSubmission, 'id' | 'submittedAt' | 'status'>
  ) => void;
  approveCheckpoint: (projectId: string, milestoneId: string) => void;
  rejectWith90_10Resolution: (projectId: string, milestoneId: string) => void;
  autoUnlockProject: (projectId: string) => void;
  raiseDispute: (projectId: string, reason: string, description: string, user: User) => void;
  resolveDisputeByAdmin: (disputeId: string, clientRefundPct: number) => void;
  withdrawPayout: (amount: number, user: User, method: string) => boolean;
  reportUser: (
    target: User,
    projectId: string | undefined,
    reason: string,
    description: string,
    reporter: User
  ) => void;
  toggleUserBlocked: (userId: string) => void;
  rateFreelancer: (projectId: string, rating: number, review: string, client: User) => void;
  sendUserWarning: (target: User, reason: string) => void;
  resetAll: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: SEED_PROJECTS,
  disputes: SEED_DISPUTES,
  reports: [],
  blockedUserIds: [],
  activeProjectId: 'proj_01',
  isLoading: false,
  dbConnected: false,
  setActiveProjectId: (id) => set({ activeProjectId: id }),

  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      const [health, projects, disputes, ledger, messages, notifs, reports] = await Promise.allSettled([
        api.checkHealth(),
        api.getProjects(),
        api.getDisputes(),
        api.getLedger(),
        api.getMessages(),
        api.getNotifications(),
        api.getReports(),
      ]);

      const isConnected = health.status === 'fulfilled' && health.value.database === 'connected';
      set({ dbConnected: isConnected });

      if (projects.status === 'fulfilled' && projects.value?.length > 0) {
        set({ projects: projects.value.map(normalizeLegacyOpenProject) });
      }
      if (disputes.status === 'fulfilled' && disputes.value?.length > 0) {
        set({ disputes: disputes.value });
      }
      if (ledger.status === 'fulfilled' && ledger.value?.length > 0) {
        useLedgerStore.setState({ entries: ledger.value });
      }
      if (messages.status === 'fulfilled' && messages.value?.length > 0) {
        useMessageStore.setState({ messages: messages.value });
      }
      if (notifs.status === 'fulfilled' && notifs.value?.length > 0) {
        useNotificationStore.setState({ notifications: notifs.value });
      }
      if (reports.status === 'fulfilled' && reports.value?.length > 0) {
        set({ reports: reports.value });
      }
    } catch (err) {
      console.warn('[Store] Initial data load fallback:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  createProject: (projectData) => {
    const id = `proj_${Date.now()}`;
    const access = projectData.access || (projectData.freelancerId ? 'invited' : 'open');
    const newProject: Project = {
      id,
      title: projectData.title || 'Untitled Project',
      category: projectData.category || 'General',
      description: projectData.description || '',
      skills: projectData.skills || [],
      budget: projectData.budget || 50000,
      currency: 'INR',
      startDate: projectData.startDate || new Date().toISOString().split('T')[0],
      deadline: projectData.deadline || '2026-10-01',
      clientId: projectData.clientId || 'user_client_1',
      clientName: projectData.clientName || 'Vikram Sharma',
      clientAvatar: projectData.clientAvatar || SEED_USERS.client.avatar,
      freelancerId: projectData.freelancerId,
      freelancerName: projectData.freelancerName,
      freelancerAvatar: projectData.freelancerAvatar,
      freelancerTitle: projectData.freelancerTitle,
      access,
      applicationDeadline: access === 'open' ? projectData.applicationDeadline : undefined,
      applications: [],
      status: access === 'open' ? 'selection_pending' : 'active',
      fundState: 'IN_CUSTODY',
      amountInCustody: projectData.budget || 50000,
      amountFrozen: 0,
      amountWithdrawable: 0,
      amountPaid: 0,
      amountRefunded: 0,
      currentMilestoneIndex: 0,
      inactivityDays: 0,
      autoUnlockEligible: false,
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      milestones: projectData.milestones || [
        {
          id: `ms_${id}_1`,
          projectId: id,
          title: 'Milestone 1: Deliverable',
          description: 'Working demo delivery',
          amount: projectData.budget || 50000,
          deadline: projectData.deadline || '2026-10-01',
          acceptanceCriteria: ['Working demo link', 'Documentation'],
          status: 'pending',
          fundState: 'IN_CUSTODY',
        },
      ],
      submissions: [],
    };

    set((state) => ({ projects: [newProject, ...state.projects] }));

    // Record in MongoDB & local ledger
    useLedgerStore.getState().addEntry({
      projectId: id,
      projectTitle: newProject.title,
      actorId: newProject.clientId,
      actorName: newProject.clientName,
      actorRole: 'client',
      eventType: 'FUND_DEPOSITED',
      previousState: 'IN_CUSTODY',
      newState: 'IN_CUSTODY',
      amount: newProject.budget,
      referenceId: `TXN_DEPOSIT_${Date.now()}`,
      notes: `100% project funds (₹${newProject.budget.toLocaleString()}) secured in KEYStone custody.`,
    });

    useMessageStore.getState().addSystemEvent(
      id,
      `FUNDS SECURED IN CUSTODY: ₹${newProject.budget.toLocaleString()} locked by KEYStone Escrow.`,
      'FUND_DEPOSITED'
    );

    api.createProject(newProject).catch(() => {});

    return newProject;
  },

  applyToProject: async (projectId, freelancer) => {
    const project = get().projects.find((item) => item.id === projectId);
    if (
      !project ||
      freelancer.role !== 'freelancer' ||
      project.access !== 'open' ||
      project.status !== 'selection_pending' ||
      project.freelancerId ||
      applicationDeadlineHasPassed(project.applicationDeadline) ||
      project.applications?.some((application) => application.freelancerId === freelancer.id)
    ) {
      return false;
    }

    const application = createProfileApplication(freelancer);
    set((state) => ({
      projects: state.projects.map((item) =>
        item.id === projectId
          ? { ...item, applications: [...(item.applications || []), application], lastActivityAt: application.submittedAt }
          : item
      ),
    }));

    useNotificationStore.getState().addNotification({
      userId: project.clientId,
      type: 'project',
      title: 'New freelancer profile submitted',
      description: `${freelancer.name} submitted their profile for "${project.title}".`,
      link: `/client/projects/${projectId}`,
    });

    api.applyToProject(projectId, freelancer.id).then((savedProject) => {
      set((state) => ({ projects: state.projects.map((item) => (item.id === projectId ? savedProject : item)) }));
    }).catch(() => {});

    return true;
  },

  selectFreelancer: async (projectId, freelancerId) => {
    const project = get().projects.find((item) => item.id === projectId);
    const application = project?.applications?.find((item) => item.freelancerId === freelancerId);
    if (
      !project ||
      !application ||
      project.access !== 'open' ||
      project.status !== 'selection_pending' ||
      !applicationDeadlineHasPassed(project.applicationDeadline)
    ) {
      return false;
    }

    const selectedAt = new Date().toISOString();
    set((state) => ({
      projects: state.projects.map((item) =>
        item.id === projectId
          ? {
              ...item,
              freelancerId: application.freelancerId,
              freelancerName: application.freelancerName,
              freelancerAvatar: application.freelancerAvatar,
              freelancerTitle: application.freelancerTitle,
              selectedAt,
              status: 'active',
              lastActivityAt: selectedAt,
            }
          : item
      ),
    }));

    useMessageStore.getState().addSystemEvent(
      projectId,
      `FREELANCER SELECTED: ${application.freelancerName} can now begin work and submit project checkpoints.`,
      'PROJECT_STARTED'
    );
    useNotificationStore.getState().addNotification({
      userId: application.freelancerId,
      type: 'project',
      title: 'You were selected for a project',
      description: `${project.clientName} selected you for "${project.title}". Your project workspace is ready.`,
      link: `/freelancer/projects/${projectId}`,
    });

    api.selectFreelancer(projectId, freelancerId).then((savedProject) => {
      set((state) => ({ projects: state.projects.map((item) => (item.id === projectId ? savedProject : item)) }));
    }).catch(() => {});

    return true;
  },

  submitCheckpoint: (projectId, milestoneId, submissionData) => {
    const subId = `sub_${Date.now()}`;
    const newSubmission: CheckpointSubmission = {
      ...submissionData,
      id: subId,
      milestoneId,
      submittedAt: new Date().toISOString(),
      status: 'under_review',
    };

    set((state) => {
      const projects = state.projects.map((p) => {
        if (p.id !== projectId) return p;

        const updatedMilestones = p.milestones.map((m) =>
          m.id === milestoneId ? { ...m, status: 'submitted' as const, fundState: 'FROZEN' as const } : m
        );
        const milestoneAmount = p.milestones.find((m) => m.id === milestoneId)?.amount || 0;

        return {
          ...p,
          fundState: 'FROZEN' as FundState,
          amountInCustody: Math.max(0, p.amountInCustody - milestoneAmount),
          amountFrozen: p.amountFrozen + milestoneAmount,
          milestones: updatedMilestones,
          submissions: [...p.submissions, newSubmission],
          lastActivityAt: new Date().toISOString(),
          inactivityDays: 0,
        };
      });
      return { projects };
    });

    const project = get().projects.find((p) => p.id === projectId);
    if (project) {
      const milestone = project.milestones.find((m) => m.id === milestoneId);
      const amount = milestone?.amount || 0;

      useLedgerStore.getState().addEntry({
        projectId,
        projectTitle: project.title,
        actorId: project.freelancerId || 'user_freelancer_1',
        actorName: project.freelancerName || 'Ananya Roy',
        actorRole: 'freelancer',
        eventType: 'FUNDS_FROZEN',
        previousState: 'IN_CUSTODY',
        newState: 'FROZEN',
        amount,
        referenceId: subId,
        notes: `Working demo submitted for ${milestone?.title}. ₹${amount.toLocaleString()} frozen for review.`,
      });

      useMessageStore.getState().addSystemEvent(
        projectId,
        `CHECKPOINT SUBMITTED: ₹${amount.toLocaleString()} moved to FROZEN status during review.`,
        'FUNDS_FROZEN'
      );

      useNotificationStore.getState().addNotification({
        userId: project.clientId,
        type: 'checkpoint',
        title: 'Working Demo Submitted',
        description: `${project.freelancerName} submitted demo for "${milestone?.title}".`,
        link: `/client/projects/${projectId}`,
      });
    }

    api.submitCheckpoint(projectId, milestoneId, submissionData).catch(() => {});
  },

  approveCheckpoint: (projectId, milestoneId) => {
    set((state) => {
      const projects = state.projects.map((p) => {
        if (p.id !== projectId) return p;

        const milestone = p.milestones.find((m) => m.id === milestoneId);
        const milestoneAmount = milestone?.amount || 0;

        const updatedMilestones = p.milestones.map((m) =>
          m.id === milestoneId ? { ...m, status: 'approved' as const, fundState: 'WITHDRAWABLE' as const } : m
        );

        const updatedSubmissions = p.submissions.map((s) =>
          s.milestoneId === milestoneId
            ? { ...s, status: 'approved' as const, reviewedAt: new Date().toISOString() }
            : s
        );

        const allApproved = updatedMilestones.every((m) => m.status === 'approved');

        return {
          ...p,
          status: allApproved ? ('completed' as const) : p.status,
          fundState: 'WITHDRAWABLE' as FundState,
          amountFrozen: Math.max(0, p.amountFrozen - milestoneAmount),
          amountWithdrawable: p.amountWithdrawable + milestoneAmount,
          milestones: updatedMilestones,
          submissions: updatedSubmissions,
          lastActivityAt: new Date().toISOString(),
        };
      });
      return { projects };
    });

    const project = get().projects.find((p) => p.id === projectId);
    if (project) {
      const milestone = project.milestones.find((m) => m.id === milestoneId);
      const amount = milestone?.amount || 0;

      useLedgerStore.getState().addEntry({
        projectId,
        projectTitle: project.title,
        actorId: project.clientId,
        actorName: project.clientName,
        actorRole: 'client',
        eventType: 'FUNDS_RELEASED',
        previousState: 'FROZEN',
        newState: 'WITHDRAWABLE',
        amount,
        referenceId: `TXN_APPROVED_${Date.now()}`,
        notes: `Client approved demo for ${milestone?.title}. ₹${amount.toLocaleString()} is now WITHDRAWABLE.`,
      });

      useMessageStore.getState().addSystemEvent(
        projectId,
        `CHECKPOINT APPROVED: ₹${amount.toLocaleString()} moved to WITHDRAWABLE state.`,
        'FUNDS_RELEASED'
      );

      if (project.freelancerId) {
        useNotificationStore.getState().addNotification({
          userId: project.freelancerId,
          type: 'payment',
          title: 'Checkpoint Approved & Funds Unlocked!',
          description: `₹${amount.toLocaleString()} from "${project.title}" is now available for withdrawal.`,
          link: '/freelancer/income',
        });
      }
    }

    api.approveCheckpoint(projectId, milestoneId).catch(() => {});
  },

  rejectWith90_10Resolution: (projectId, milestoneId) => {
    set((state) => {
      const projects = state.projects.map((p) => {
        if (p.id !== projectId) return p;

        const milestone = p.milestones.find((m) => m.id === milestoneId);
        const totalMilestoneAmount = milestone?.amount || p.budget;

        const clientRefund = Math.round(totalMilestoneAmount * 0.9);
        const builderComp = Math.round(totalMilestoneAmount * 0.1);

        const updatedMilestones = p.milestones.map((m) =>
          m.id === milestoneId ? { ...m, status: 'failed' as const, fundState: 'REFUNDED' as const } : m
        );

        return {
          ...p,
          status: 'cancelled' as const,
          fundState: 'REFUNDED' as FundState,
          amountFrozen: 0,
          amountInCustody: 0,
          amountRefunded: p.amountRefunded + clientRefund,
          amountWithdrawable: p.amountWithdrawable + builderComp,
          milestones: updatedMilestones,
          lastActivityAt: new Date().toISOString(),
        };
      });
      return { projects };
    });

    const project = get().projects.find((p) => p.id === projectId);
    if (project) {
      const totalAmount = project.budget;
      const clientRefund = Math.round(totalAmount * 0.9);
      const builderComp = Math.round(totalAmount * 0.1);

      useLedgerStore.getState().addEntry({
        projectId,
        projectTitle: project.title,
        actorId: 'system',
        actorName: 'KEYStone 90/10 Protocol Engine',
        actorRole: 'admin',
        eventType: 'RESOLUTION_90_10_EXECUTED',
        previousState: 'FROZEN',
        newState: 'REFUNDED',
        amount: totalAmount,
        referenceId: `TXN_9010_${Date.now()}`,
        notes: `90/10 Resolution Executed: ₹${clientRefund.toLocaleString()} refunded to Client (90%), ₹${builderComp.toLocaleString()} allocated to Freelancer (10%).`,
      });

      useMessageStore.getState().addSystemEvent(
        projectId,
        `90/10 FAIR RESOLUTION EXECUTED: ₹${clientRefund.toLocaleString()} refunded to Client, ₹${builderComp.toLocaleString()} paid to Builder for partial work.`,
        'RESOLUTION_90_10_EXECUTED'
      );

      useNotificationStore.getState().addNotification({
        userId: project.clientId,
        type: 'payment',
        title: '90/10 Fair Resolution Executed',
        description: `₹${clientRefund.toLocaleString()} (90%) refunded to your escrow balance for "${project.title}".`,
        link: `/client/projects/${projectId}`,
      });

      if (project.freelancerId) {
        useNotificationStore.getState().addNotification({
          userId: project.freelancerId,
          type: 'payment',
          title: '90/10 Fair Resolution Executed',
          description: `₹${builderComp.toLocaleString()} (10%) work compensation released for "${project.title}".`,
          link: '/freelancer/income',
        });
      }
    }

    api.reject90_10(projectId, milestoneId).catch(() => {});
  },

  autoUnlockProject: (projectId) => {
    set((state) => {
      const projects = state.projects.map((p) => {
        if (p.id !== projectId) return p;

        const currentMs = p.milestones[p.currentMilestoneIndex] || p.milestones.find((m) => m.status === 'submitted') || p.milestones[0];
        const milestoneAmount = currentMs?.amount || (p.amountFrozen > 0 ? p.amountFrozen : p.amountInCustody);
        const remainingCustody = Math.max(0, p.amountInCustody - milestoneAmount);

        const updatedMilestones = p.milestones.map((m) =>
          m.id === currentMs?.id
            ? { ...m, status: 'approved' as const, fundState: 'WITHDRAWABLE' as const }
            : m
        );

        return {
          ...p,
          status: 'completed' as const,
          fundState: 'WITHDRAWABLE' as FundState,
          amountInCustody: 0,
          amountFrozen: 0,
          amountWithdrawable: p.amountWithdrawable + milestoneAmount,
          amountRefunded: p.amountRefunded + remainingCustody,
          milestones: updatedMilestones,
          autoUnlockEligible: false,
          inactivityDays: 7,
          lastActivityAt: new Date().toISOString(),
        };
      });
      return { projects };
    });

    const project = get().projects.find((p) => p.id === projectId);
    if (project) {
      const currentMs = project.milestones[project.currentMilestoneIndex] || project.milestones.find((m) => m.status === 'submitted') || project.milestones[0];
      const milestoneAmount = currentMs?.amount || project.amountWithdrawable;
      const remainingCustody = project.amountRefunded;

      useLedgerStore.getState().addEntry({
        projectId,
        projectTitle: project.title,
        actorId: 'system',
        actorName: 'KEYStone 7-Day Inactivity Protocol Engine',
        actorRole: 'admin',
        eventType: 'AUTO_UNLOCK_EXECUTED',
        previousState: 'FROZEN',
        newState: 'WITHDRAWABLE',
        amount: milestoneAmount,
        referenceId: `AUTO_UNLOCK_${Date.now()}`,
        notes: `7-Day Client Inactivity Protection: ₹${milestoneAmount.toLocaleString()} released to Freelancer withdrawable balance; remaining ₹${remainingCustody.toLocaleString()} custody refunded to Client bank account.`,
      });

      useMessageStore.getState().addSystemEvent(
        projectId,
        `7-DAY CLIENT INACTIVITY EXECUTED: ₹${milestoneAmount.toLocaleString()} released to Freelancer withdrawable balance, remaining ₹${remainingCustody.toLocaleString()} refunded to Client bank account.`,
        'AUTO_UNLOCK_EXECUTED'
      );

      if (project.freelancerId) {
        useNotificationStore.getState().addNotification({
          userId: project.freelancerId,
          type: 'payment',
          title: '7-Day Client Inactivity Auto-Unlock',
          description: `₹${milestoneAmount.toLocaleString()} from "${project.title}" automatically released to your withdrawable balance.`,
          link: '/freelancer/income',
        });
      }

      useNotificationStore.getState().addNotification({
        userId: project.clientId,
        type: 'system',
        title: '7-Day Inactivity Auto-Unlock & Refund Executed',
        description: `₹${milestoneAmount.toLocaleString()} released to freelancer and remaining ₹${remainingCustody.toLocaleString()} custody refunded to your bank account due to 7 days of review inactivity.`,
        link: `/client/projects/${project.id}`,
      });
    }

    api.autoUnlock(projectId).catch(() => {});
  },

  raiseDispute: (projectId, reason, description, user) => {
    const disputeId = `disp_${Date.now()}`;

    set((state) => {
      const project = state.projects.find((p) => p.id === projectId);
      if (!project) return state;

      const newDispute: Dispute = {
        id: disputeId,
        projectId,
        projectTitle: project.title,
        raisedBy: user.id,
        raisedByName: user.name,
        raisedByRole: user.role,
        againstId: user.role === 'client' ? project.freelancerId || '' : project.clientId,
        againstName: user.role === 'client' ? project.freelancerName || 'Freelancer' : project.clientName,
        reason,
        description,
        evidence: [],
        amountInDispute: project.budget,
        createdAt: new Date().toISOString(),
        status: 'under_review',
      };

      const updatedProjects = state.projects.map((p) =>
        p.id === projectId ? { ...p, status: 'disputed' as const, fundState: 'DISPUTED' as const, disputeId } : p
      );

      return {
        projects: updatedProjects,
        disputes: [newDispute, ...state.disputes],
      };
    });

    const project = get().projects.find((p) => p.id === projectId);
    if (project) {
      useLedgerStore.getState().addEntry({
        projectId,
        projectTitle: project.title,
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        eventType: 'DISPUTE_OPENED',
        previousState: project.fundState,
        newState: 'DISPUTED',
        amount: project.budget,
        referenceId: disputeId,
        notes: `Dispute opened by ${user.name}: "${reason}". Platform governance review initiated.`,
      });

      useMessageStore.getState().addSystemEvent(
        projectId,
        `DISPUTE INITIATED: Funds locked under platform review.`,
        'DISPUTE_OPENED'
      );

      const againstId = user.role === 'client' ? project.freelancerId : project.clientId;
      if (againstId) {
        useNotificationStore.getState().addNotification({
          userId: againstId,
          type: 'dispute',
          title: 'Dispute opened on project',
          description: `${user.name} initiated a dispute on "${project.title}": ${reason}.`,
          link: user.role === 'client' ? '/freelancer/disputes' : '/client/disputes',
        });
      }

      useNotificationStore.getState().addNotification({
        userId: 'user_admin_1',
        type: 'dispute',
        title: 'New dispute requires review',
        description: `${user.name} raised dispute for "${project.title}".`,
        link: '/admin/disputes',
      });
    }

    api.raiseDispute({ projectId, reason, description, user }).catch(() => {});
  },

  resolveDisputeByAdmin: (disputeId, clientRefundPct) => {
    set((state) => {
      const dispute = state.disputes.find((d) => d.id === disputeId);
      if (!dispute) return state;

      const clientRefundAmount = Math.round((dispute.amountInDispute * clientRefundPct) / 100);
      const freelancerAmount = dispute.amountInDispute - clientRefundAmount;

      const updatedDisputes = state.disputes.map((d) =>
        d.id === disputeId
          ? {
              ...d,
              status: 'resolved' as const,
              resolution: {
                clientRefundAmount,
                freelancerAmount,
                summary: `Admin resolved dispute: ${clientRefundPct}% refund to Client (₹${clientRefundAmount.toLocaleString()}), ${100 - clientRefundPct}% payout to Freelancer (₹${freelancerAmount.toLocaleString()}).`,
                resolvedAt: new Date().toISOString(),
                resolvedBy: 'KEYStone Governance Team',
              },
            }
          : d
      );

      const updatedProjects = state.projects.map((p) => {
        if (p.id !== dispute.projectId) return p;
        return {
          ...p,
          status: 'completed' as const,
          fundState: 'PAID' as FundState,
          amountFrozen: 0,
          amountRefunded: clientRefundAmount,
          amountWithdrawable: freelancerAmount,
        };
      });

      return { disputes: updatedDisputes, projects: updatedProjects };
    });

    const dispute = get().disputes.find((d) => d.id === disputeId);
    if (dispute) {
      useLedgerStore.getState().addEntry({
        projectId: dispute.projectId,
        projectTitle: dispute.projectTitle,
        actorId: 'user_admin_1',
        actorName: 'KEYStone Risk & Governance',
        actorRole: 'admin',
        eventType: 'DISPUTE_RESOLVED',
        previousState: 'DISPUTED',
        newState: 'PAID',
        amount: dispute.amountInDispute,
        referenceId: `RESOLVE_${disputeId}`,
        notes: `Dispute resolved by Admin. Client Refund: ₹${dispute.resolution?.clientRefundAmount.toLocaleString()}, Freelancer Payout: ₹${dispute.resolution?.freelancerAmount.toLocaleString()}.`,
      });

      useMessageStore.getState().addSystemEvent(
        dispute.projectId,
        `DISPUTE RESOLVED BY ADMIN: Financial settlement executed.`,
        'DISPUTE_RESOLVED'
      );

      const project = get().projects.find((p) => p.id === dispute.projectId);
      if (project) {
        useNotificationStore.getState().addNotification({
          userId: project.clientId,
          type: 'dispute',
          title: 'Dispute Resolved by Admin',
          description: `Dispute for "${project.title}" resolved. Refund: ₹${dispute.resolution?.clientRefundAmount.toLocaleString()}.`,
          link: '/client/disputes',
        });

        if (project.freelancerId) {
          useNotificationStore.getState().addNotification({
            userId: project.freelancerId,
            type: 'dispute',
            title: 'Dispute Resolved by Admin',
            description: `Dispute for "${project.title}" resolved. Payout: ₹${dispute.resolution?.freelancerAmount.toLocaleString()}.`,
            link: '/freelancer/disputes',
          });
        }
      }
    }

    api.resolveDispute(disputeId, clientRefundPct).catch(() => {});
  },

  withdrawPayout: (amount, user, method) => {
    const available = get()
      .projects.filter((p) => p.freelancerId === user.id)
      .reduce((sum, p) => sum + p.amountWithdrawable, 0);

    if (amount <= 0 || amount > available) return false;

    let remaining = amount;
    set((state) => ({
      projects: state.projects.map((project) => {
        if (project.freelancerId !== user.id || remaining <= 0) return project;
        const debit = Math.min(project.amountWithdrawable, remaining);
        remaining -= debit;
        return {
          ...project,
          amountWithdrawable: project.amountWithdrawable - debit,
          amountPaid: project.amountPaid + debit,
          fundState: project.amountWithdrawable - debit > 0 ? project.fundState : ('PAID' as FundState),
          lastActivityAt: new Date().toISOString(),
        };
      }),
    }));

    useLedgerStore.getState().addEntry({
      projectId: 'platform',
      projectTitle: 'Freelancer Payout',
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      eventType: 'PAYOUT_WITHDRAWN',
      previousState: 'WITHDRAWABLE',
      newState: 'PAID',
      amount,
      referenceId: `TXN_PAYOUT_${Date.now()}`,
      notes: `${method.toUpperCase()} payout settled to ${user.name}.`,
    });

    useNotificationStore.getState().addNotification({
      userId: user.id,
      type: 'payment',
      title: 'Payout completed',
      description: `₹${amount.toLocaleString()} was sent via ${method.toUpperCase()}.`,
      link: '/freelancer/income',
    });

    api.withdrawPayout(amount, user, method).catch(() => {});
    return true;
  },

  reportUser: (target, projectId, reason, description, reporter) => {
    const report: Report = {
      id: `report_${Date.now()}`,
      reporterId: reporter.id,
      reporterName: reporter.name,
      reporterRole: reporter.role,
      targetId: target.id,
      targetName: target.name,
      projectId,
      reason,
      description,
      createdAt: new Date().toISOString(),
      status: 'open',
    };

    set((state) => ({ reports: [report, ...state.reports] }));

    useNotificationStore.getState().addNotification({
      userId: 'all',
      type: 'system',
      title: 'New report submitted',
      description: `${reporter.name} reported ${target.name}.`,
      link: '/admin/reports',
    });

    api.createReport({ reporter, target, projectId, reason, description }).catch(() => {});
  },

  toggleUserBlocked: (userId) =>
    set((state) => ({
      blockedUserIds: state.blockedUserIds.includes(userId)
        ? state.blockedUserIds.filter((id) => id !== userId)
        : [...state.blockedUserIds, userId],
    })),

  rateFreelancer: (projectId, rating, review, client) => {
    const project = get().projects.find((item) => item.id === projectId);
    if (!project || project.clientId !== client.id || project.status !== 'completed' || !project.freelancerId)
      return;

    set((state) => ({
      projects: state.projects.map((item) =>
        item.id === projectId ? { ...item, freelancerRating: rating, freelancerReview: review } : item
      ),
    }));

    useNotificationStore.getState().addNotification({
      userId: project.freelancerId,
      type: 'project',
      title: 'New project rating',
      description: `${client.name} rated your completed project ${rating}/5.`,
      link: `/freelancer/projects/${projectId}`,
    });

    api.rateFreelancer(projectId, rating, review).catch(() => {});
  },

  sendUserWarning: (target, reason) => {
    useNotificationStore.getState().addNotification({
      userId: target.id,
      type: 'system',
      title: 'Official platform warning',
      description: reason,
      link: '/freelancer/settings',
    });
  },

  resetAll: () => {
    set({
      projects: SEED_PROJECTS,
      disputes: SEED_DISPUTES,
      reports: [],
      blockedUserIds: [],
      activeProjectId: 'proj_01',
    });
    api.seedDatabase(true).catch(() => {});
  },
}));

// ---------------- DEMO SCENARIO CONTROL STORE ----------------
export type DemoPreset = 'standard_success' | 'resolution_90_10' | 'inactivity_unlock' | 'dispute_active';

interface DemoState {
  activePreset: DemoPreset;
  setScenario: (preset: DemoPreset) => void;
}

export const useDemoStore = create<DemoState>((set) => ({
  activePreset: 'standard_success',
  setScenario: (preset) => set({ activePreset: preset }),
}));
