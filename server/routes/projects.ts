import { Router, type Request, type Response } from 'express';
import { ProjectModel } from '../models/Project';
import { LedgerEntryModel } from '../models/LedgerEntry';
import { MessageModel } from '../models/Message';
import { NotificationModel } from '../models/Notification';

const router = Router();

// GET all projects
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
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
      status: 'active',
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
