import { Router, type Request, type Response } from 'express';
import { ProjectModel } from '../models/Project';
import { LedgerEntryModel } from '../models/LedgerEntry';
import { MessageModel } from '../models/Message';
import { NotificationModel } from '../models/Notification';
import { UserModel } from '../models/User';

const router = Router();

const applicationDeadlineHasPassed = (deadline?: string) => {
  if (!deadline) return false;
  return new Date() > new Date(`${deadline}T23:59:59.999`);
};

const migrateLegacyOpenProjects = async () => {
  const applicationDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  await ProjectModel.updateMany(
    {
      access: 'open',
      selectedAt: { $exists: false },
      $or: [{ applicationDeadline: { $exists: false } }, { applicationDeadline: null }],
    },
    {
      $set: { status: 'selection_pending', applicationDeadline, applications: [] },
      $unset: { freelancerId: '', freelancerName: '', freelancerAvatar: '', freelancerTitle: '' },
    }
  );
};

// GET all projects
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    await migrateLegacyOpenProjects();
    const { clientId, freelancerId } = req.query;
    const query: Record<string, any> = {};
    if (clientId) query.clientId = clientId;
    if (freelancerId) query.freelancerId = freelancerId;

    const projects = await ProjectModel.find(query).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET single project
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await migrateLegacyOpenProjects();
    const project = await ProjectModel.findOne({ id: req.params.id });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST create project
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const projectData = req.body;
    const id = projectData.id || `proj_${Date.now()}`;
    const budget = Number(projectData.budget) || 50000;
    const access = projectData.access || (projectData.freelancerId ? 'invited' : 'open');

    const milestones =
      projectData.milestones && projectData.milestones.length > 0
        ? projectData.milestones
        : [
            {
              id: `ms_${id}_1`,
              projectId: id,
              title: 'Milestone 1: Deliverable',
              description: 'Working demo delivery',
              amount: budget,
              deadline: projectData.deadline || '2026-10-01',
              acceptanceCriteria: ['Working demo link', 'Documentation'],
              status: 'pending',
              fundState: 'IN_CUSTODY',
            },
          ];

    const newProject = new ProjectModel({
      ...projectData,
      id,
      budget,
      amountInCustody: budget,
      amountFrozen: 0,
      amountWithdrawable: 0,
      amountPaid: 0,
      amountRefunded: 0,
      fundState: 'IN_CUSTODY',
      access,
      applicationDeadline: access === 'open' ? projectData.applicationDeadline : undefined,
      applications: [],
      status: access === 'open' ? 'selection_pending' : 'active',
      milestones,
      submissions: [],
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    });

    const savedProject = await newProject.save();

    // Create deposit ledger entry
    const ledgerEntry = new LedgerEntryModel({
      id: `led_${Date.now()}`,
      projectId: id,
      projectTitle: savedProject.title,
      actorId: savedProject.clientId,
      actorName: savedProject.clientName,
      actorRole: 'client',
      eventType: 'FUND_DEPOSITED',
      previousState: 'IN_CUSTODY',
      newState: 'IN_CUSTODY',
      amount: budget,
      timestamp: new Date().toISOString(),
      referenceId: `TXN_DEPOSIT_${Date.now()}`,
      hash: `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
      notes: `100% project funds (₹${budget.toLocaleString()}) secured in KEYStone custody.`,
    });
    await ledgerEntry.save();

    // Create system message
    const sysMsg = new MessageModel({
      id: `msg_${Date.now()}`,
      projectId: id,
      senderId: 'system',
      senderName: 'KEYStone Protocol',
      senderRole: 'admin',
      content: `FUNDS SECURED IN CUSTODY: ₹${budget.toLocaleString()} locked by KEYStone Escrow.`,
      timestamp: new Date().toISOString(),
      isSystemEvent: true,
      systemEventType: 'FUND_DEPOSITED',
    });
    await sysMsg.save();

    res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST submit freelancer profile for an open project
router.post('/:id/applications', async (req: Request, res: Response): Promise<void> => {
  try {
    const { freelancerId } = req.body;
    const project = await ProjectModel.findOne({ id: req.params.id });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    if (project.access !== 'open' || project.freelancerId || project.status !== 'selection_pending') {
      res.status(400).json({ error: 'This project is not accepting freelancer profiles.' });
      return;
    }
    if (applicationDeadlineHasPassed(project.applicationDeadline)) {
      res.status(400).json({ error: 'The profile submission deadline has passed.' });
      return;
    }
    if (!freelancerId) {
      res.status(400).json({ error: 'A freelancer profile is required.' });
      return;
    }
    if (project.applications.some((application) => application.freelancerId === freelancerId)) {
      res.status(409).json({ error: 'Your profile has already been submitted for this project.' });
      return;
    }

    const freelancer = await UserModel.findOne({ id: freelancerId, role: 'freelancer' });
    if (!freelancer) {
      res.status(404).json({ error: 'Freelancer profile not found.' });
      return;
    }

    project.applications.push({
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
    project.lastActivityAt = new Date().toISOString();
    await project.save();

    await new NotificationModel({
      id: `notif_${Date.now()}`,
      userId: project.clientId,
      type: 'project',
      title: 'New freelancer profile submitted',
      description: `${freelancer.name} submitted their profile for "${project.title}".`,
      timestamp: 'Just now',
      read: false,
      link: `/client/projects/${project.id}`,
    }).save();

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST select one applicant after the profile submission deadline
router.post('/:id/select-freelancer', async (req: Request, res: Response): Promise<void> => {
  try {
    const { freelancerId } = req.body;
    const project = await ProjectModel.findOne({ id: req.params.id });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    if (project.access !== 'open' || project.status !== 'selection_pending') {
      res.status(400).json({ error: 'This project is not awaiting freelancer selection.' });
      return;
    }
    if (!applicationDeadlineHasPassed(project.applicationDeadline)) {
      res.status(400).json({ error: 'You can select a freelancer only after the profile submission deadline.' });
      return;
    }

    const application = project.applications.find((item) => item.freelancerId === freelancerId);
    if (!application) {
      res.status(400).json({ error: 'Select a freelancer who submitted a profile for this project.' });
      return;
    }

    project.freelancerId = application.freelancerId;
    project.freelancerName = application.freelancerName;
    project.freelancerAvatar = application.freelancerAvatar;
    project.freelancerTitle = application.freelancerTitle;
    project.selectedAt = new Date().toISOString();
    project.status = 'active';
    project.lastActivityAt = new Date().toISOString();
    await project.save();

    await new MessageModel({
      id: `msg_${Date.now()}`,
      projectId: project.id,
      senderId: 'system',
      senderName: 'KEYStone Protocol',
      senderRole: 'admin',
      content: `FREELANCER SELECTED: ${application.freelancerName} can now begin work and submit project checkpoints.`,
      timestamp: new Date().toISOString(),
      isSystemEvent: true,
      systemEventType: 'PROJECT_STARTED',
    }).save();

    await new NotificationModel({
      id: `notif_${Date.now()}`,
      userId: application.freelancerId,
      type: 'project',
      title: 'You were selected for a project',
      description: `${project.clientName} selected you for "${project.title}". Your project workspace is ready.`,
      timestamp: 'Just now',
      read: false,
      link: `/freelancer/projects/${project.id}`,
    }).save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST submit checkpoint
router.post('/:id/milestones/:milestoneId/submit', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: projectId, milestoneId } = req.params;
    const submissionData = req.body;

    const project = await ProjectModel.findOne({ id: projectId });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const subId = `sub_${Date.now()}`;
    const newSubmission = {
      ...submissionData,
      id: subId,
      milestoneId,
      submittedAt: new Date().toISOString(),
      status: 'under_review',
    };

    let milestoneAmount = 0;
    project.milestones = project.milestones.map((m: any) => {
      if (m.id === milestoneId) {
        milestoneAmount = m.amount || 0;
        return { ...m, status: 'submitted', fundState: 'FROZEN' };
      }
      return m;
    });

    project.fundState = 'FROZEN';
    project.amountInCustody = Math.max(0, project.amountInCustody - milestoneAmount);
    project.amountFrozen = project.amountFrozen + milestoneAmount;
    project.submissions.push(newSubmission);
    project.lastActivityAt = new Date().toISOString();
    project.inactivityDays = 0;

    await project.save();

    // Record ledger entry
    const ledger = new LedgerEntryModel({
      id: `led_${Date.now()}`,
      projectId,
      projectTitle: project.title,
      actorId: project.freelancerId || 'user_freelancer_1',
      actorName: project.freelancerName || 'Freelancer',
      actorRole: 'freelancer',
      eventType: 'FUNDS_FROZEN',
      previousState: 'IN_CUSTODY',
      newState: 'FROZEN',
      amount: milestoneAmount,
      timestamp: new Date().toISOString(),
      referenceId: subId,
      hash: `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
      notes: `Working demo submitted. ₹${milestoneAmount.toLocaleString()} frozen for review.`,
    });
    await ledger.save();

    // System message
    await new MessageModel({
      id: `msg_${Date.now()}`,
      projectId,
      senderId: 'system',
      senderName: 'KEYStone Protocol',
      senderRole: 'admin',
      content: `CHECKPOINT SUBMITTED: ₹${milestoneAmount.toLocaleString()} moved to FROZEN status during review.`,
      timestamp: new Date().toISOString(),
      isSystemEvent: true,
      systemEventType: 'FUNDS_FROZEN',
    }).save();

    // Notification
    await new NotificationModel({
      id: `notif_${Date.now()}`,
      userId: project.clientId,
      type: 'checkpoint',
      title: 'Working Demo Submitted',
      description: `${project.freelancerName || 'Freelancer'} submitted demo for review.`,
      timestamp: 'Just now',
      read: false,
      link: `/client/projects/${projectId}`,
    }).save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST approve checkpoint
router.post('/:id/milestones/:milestoneId/approve', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: projectId, milestoneId } = req.params;
    const project = await ProjectModel.findOne({ id: projectId });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    let milestoneAmount = 0;
    project.milestones = project.milestones.map((m: any) => {
      if (m.id === milestoneId) {
        milestoneAmount = m.amount || 0;
        return { ...m, status: 'approved', fundState: 'WITHDRAWABLE' };
      }
      return m;
    });

    project.submissions = project.submissions.map((s: any) => {
      if (s.milestoneId === milestoneId) {
        return { ...s, status: 'approved', reviewedAt: new Date().toISOString() };
      }
      return s;
    });

    const allApproved = project.milestones.every((m: any) => m.status === 'approved');
    if (allApproved) {
      project.status = 'completed';
    }
    project.fundState = 'WITHDRAWABLE';
    project.amountFrozen = Math.max(0, project.amountFrozen - milestoneAmount);
    project.amountWithdrawable = project.amountWithdrawable + milestoneAmount;
    project.lastActivityAt = new Date().toISOString();

    await project.save();

    // Ledger
    await new LedgerEntryModel({
      id: `led_${Date.now()}`,
      projectId,
      projectTitle: project.title,
      actorId: project.clientId,
      actorName: project.clientName,
      actorRole: 'client',
      eventType: 'FUNDS_RELEASED',
      previousState: 'FROZEN',
      newState: 'WITHDRAWABLE',
      amount: milestoneAmount,
      timestamp: new Date().toISOString(),
      referenceId: `TXN_APPROVED_${Date.now()}`,
      hash: `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
      notes: `Client approved demo. ₹${milestoneAmount.toLocaleString()} is now WITHDRAWABLE.`,
    }).save();

    // System message
    await new MessageModel({
      id: `msg_${Date.now()}`,
      projectId,
      senderId: 'system',
      senderName: 'KEYStone Protocol',
      senderRole: 'admin',
      content: `CHECKPOINT APPROVED: ₹${milestoneAmount.toLocaleString()} moved to WITHDRAWABLE state.`,
      timestamp: new Date().toISOString(),
      isSystemEvent: true,
      systemEventType: 'FUNDS_RELEASED',
    }).save();

    // Notification to freelancer
    if (project.freelancerId) {
      await new NotificationModel({
        id: `notif_${Date.now()}`,
        userId: project.freelancerId,
        type: 'payment',
        title: 'Checkpoint Approved & Funds Unlocked!',
        description: `₹${milestoneAmount.toLocaleString()} from "${project.title}" is now available for withdrawal.`,
        timestamp: 'Just now',
        read: false,
        link: '/freelancer/income',
      }).save();
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST 90/10 Fair Resolution
router.post('/:id/milestones/:milestoneId/reject-90-10', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: projectId, milestoneId } = req.params;
    const project = await ProjectModel.findOne({ id: projectId });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const milestone = project.milestones.find((m: any) => m.id === milestoneId);
    const totalMilestoneAmount = milestone?.amount || project.budget;
    const clientRefund = Math.round(totalMilestoneAmount * 0.9);
    const builderComp = Math.round(totalMilestoneAmount * 0.1);

    project.milestones = project.milestones.map((m: any) => {
      if (m.id === milestoneId) {
        return { ...m, status: 'failed', fundState: 'REFUNDED' };
      }
      return m;
    });

    project.status = 'cancelled';
    project.fundState = 'REFUNDED';
    project.amountFrozen = 0;
    project.amountInCustody = 0;
    project.amountRefunded = project.amountRefunded + clientRefund;
    project.amountWithdrawable = project.amountWithdrawable + builderComp;
    project.lastActivityAt = new Date().toISOString();

    await project.save();

    // Ledger
    await new LedgerEntryModel({
      id: `led_${Date.now()}`,
      projectId,
      projectTitle: project.title,
      actorId: 'system',
      actorName: 'KEYStone 90/10 Protocol Engine',
      actorRole: 'admin',
      eventType: 'RESOLUTION_90_10_EXECUTED',
      previousState: 'FROZEN',
      newState: 'REFUNDED',
      amount: totalMilestoneAmount,
      timestamp: new Date().toISOString(),
      referenceId: `TXN_9010_${Date.now()}`,
      hash: `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
      notes: `90/10 Resolution Executed: ₹${clientRefund.toLocaleString()} refunded to Client (90%), ₹${builderComp.toLocaleString()} allocated to Freelancer (10%).`,
    }).save();

    // System Message
    await new MessageModel({
      id: `msg_${Date.now()}`,
      projectId,
      senderId: 'system',
      senderName: 'KEYStone Protocol',
      senderRole: 'admin',
      content: `90/10 FAIR RESOLUTION EXECUTED: ₹${clientRefund.toLocaleString()} refunded to Client, ₹${builderComp.toLocaleString()} paid to Builder for partial work.`,
      timestamp: new Date().toISOString(),
      isSystemEvent: true,
      systemEventType: 'RESOLUTION_90_10_EXECUTED',
    }).save();

    // Notification to Client and Freelancer
    await new NotificationModel({
      id: `notif_${Date.now()}_client`,
      userId: project.clientId,
      type: 'payment',
      title: '90/10 Fair Resolution Executed',
      description: `₹${clientRefund.toLocaleString()} (90%) was refunded to your escrow balance for "${project.title}".`,
      timestamp: 'Just now',
      read: false,
      link: `/client/projects/${projectId}`,
    }).save();

    if (project.freelancerId) {
      await new NotificationModel({
        id: `notif_${Date.now()}_freelancer`,
        userId: project.freelancerId,
        type: 'payment',
        title: '90/10 Fair Resolution Executed',
        description: `₹${builderComp.toLocaleString()} (10%) work compensation released for "${project.title}".`,
        timestamp: 'Just now',
        read: false,
        link: '/freelancer/income',
      }).save();
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST 7-day auto unlock
router.post('/:id/auto-unlock', async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await ProjectModel.findOne({ id: req.params.id });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const frozenOrCustody = project.amountFrozen > 0 ? project.amountFrozen : project.amountInCustody;
    project.fundState = 'WITHDRAWABLE';
    project.amountInCustody = 0;
    project.amountFrozen = 0;
    project.amountWithdrawable = project.amountWithdrawable + frozenOrCustody;
    project.autoUnlockEligible = false;
    project.inactivityDays = 7;
    project.lastActivityAt = new Date().toISOString();

    await project.save();

    await new LedgerEntryModel({
      id: `led_${Date.now()}`,
      projectId: project.id,
      projectTitle: project.title,
      actorId: 'system',
      actorName: 'KEYStone Auto-Unlock Daemon',
      actorRole: 'admin',
      eventType: 'AUTO_UNLOCK_EXECUTED',
      previousState: 'FROZEN',
      newState: 'WITHDRAWABLE',
      amount: frozenOrCustody,
      timestamp: new Date().toISOString(),
      referenceId: `AUTO_UNLOCK_${Date.now()}`,
      hash: `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
      notes: 'Client unresponsive for 7 days. Automated inactivity protection triggered. Funds released to freelancer.',
    }).save();

    await new MessageModel({
      id: `msg_${Date.now()}`,
      projectId: project.id,
      senderId: 'system',
      senderName: 'KEYStone Protocol',
      senderRole: 'admin',
      content: `7-DAY INACTIVITY PROTECTION TRIGGERED: Funds automatically moved to WITHDRAWABLE state.`,
      timestamp: new Date().toISOString(),
      isSystemEvent: true,
      systemEventType: 'AUTO_UNLOCK_EXECUTED',
    }).save();

    if (project.freelancerId) {
      await new NotificationModel({
        id: `notif_${Date.now()}_freelancer`,
        userId: project.freelancerId,
        type: 'payment',
        title: '7-Day Inactivity Auto-Unlock',
        description: `₹${frozenOrCustody.toLocaleString()} automatically unlocked to your withdrawable balance for "${project.title}".`,
        timestamp: 'Just now',
        read: false,
        link: '/freelancer/income',
      }).save();
    }

    await new NotificationModel({
      id: `notif_${Date.now()}_client`,
      userId: project.clientId,
      type: 'system',
      title: '7-Day Inactivity Auto-Unlock Executed',
      description: `Funds for "${project.title}" released to freelancer due to 7 days of review inactivity.`,
      timestamp: 'Just now',
      read: false,
      link: `/client/projects/${project.id}`,
    }).save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST Rate freelancer
router.post('/:id/rate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { rating, review } = req.body;
    const project = await ProjectModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { freelancerRating: rating, freelancerReview: review } },
      { new: true }
    );
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project.freelancerId) {
      await new NotificationModel({
        id: `notif_${Date.now()}`,
        userId: project.freelancerId,
        type: 'project',
        title: 'New project rating',
        description: `${project.clientName} rated your completed project ${rating}/5.`,
        timestamp: 'Just now',
        read: false,
        link: `/freelancer/projects/${project.id}`,
      }).save();
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
