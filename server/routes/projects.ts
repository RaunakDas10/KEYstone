import { Router, type Request, type Response } from 'express';
import { ProjectModel } from '../models/Project';
import { LedgerEntryModel } from '../models/LedgerEntry';
import { MessageModel } from '../models/Message';
import { NotificationModel } from '../models/Notification';
import { UserModel } from '../models/User';
import { recalculateTrustScore } from '../services/trustScore';

const router = Router();

const applicationDeadlineHasPassed = (deadline?: string) => {
  if (!deadline) return false;
  return new Date() > new Date(`${deadline}T23:59:59.999`);
};

const deriveProjectFundState = (project: {
  amountInCustody: number;
  amountFrozen: number;
  amountWithdrawable: number;
  amountRefunded: number;
}) => {
  if (project.amountFrozen > 0) return 'FROZEN' as const;
  if (project.amountWithdrawable > 0) return 'WITHDRAWABLE' as const;
  if (project.amountInCustody > 0) return 'IN_CUSTODY' as const;
  if (project.amountRefunded > 0) return 'REFUNDED' as const;
  return 'PAID' as const;
};

const MINIMUM_PROJECT_BUDGET = 500;
const CANCELLATION_KILL_FEE_RATE = 0.3;

const parseReviewDays = (value: unknown, fallback: number, minimum: number, maximum: number) => {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : null;
};

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

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
    if (budget < MINIMUM_PROJECT_BUDGET) {
      res.status(400).json({ error: `Projects must be funded with at least ₹${MINIMUM_PROJECT_BUDGET}.` });
      return;
    }
    const checkpointReviewDays = parseReviewDays(projectData.checkpointReviewDays, 7, 2, 21);
    const finalReviewDays = parseReviewDays(projectData.finalReviewDays, 7, 2, 30);
    if (!checkpointReviewDays || !finalReviewDays) {
      res.status(400).json({ error: 'Checkpoint review must be 2–21 days and final review must be 2–30 days.' });
      return;
    }
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
    const totalMilestoneAmount = milestones.reduce((total: number, milestone: { amount?: number }) => total + Number(milestone.amount || 0), 0);
    if (totalMilestoneAmount !== budget || milestones.some((milestone: { amount?: number }) => Number(milestone.amount || 0) < 1)) {
      res.status(400).json({ error: 'Milestone amounts must be at least ₹1 and add up exactly to the project budget.' });
      return;
    }
    const deliverables = Array.isArray(projectData.deliverables) && projectData.deliverables.length > 0
      ? projectData.deliverables
      : milestones.flatMap((milestone: any) => (milestone.deliverables || milestone.acceptanceCriteria || []).map((description: string, index: number) => ({
          id: `del_${milestone.id || id}_${index + 1}`,
          description,
          milestoneId: milestone.id,
          appliesTo: 'CHECKPOINT',
          status: 'PENDING',
        })));

    const newProject = new ProjectModel({
      ...projectData,
      id,
      budget,
      amountInCustody: budget,
      amountFrozen: 0,
      amountWithdrawable: 0,
      amountPaid: 0,
      amountRefunded: 0,
      checkpointReviewDays,
      finalReviewDays,
      deliverables,
      deliverablesLockedAt: new Date().toISOString(),
      fundState: 'IN_CUSTODY',
      access,
      applicationDeadline: access === 'open' ? projectData.applicationDeadline : undefined,
      applications: [],
      status: access === 'open' ? 'selection_pending' : 'invitation_pending',
      milestones,
      submissions: [],
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    });

    const savedProject = await newProject.save();

    if (access === 'invited' && savedProject.freelancerId) {
      await new NotificationModel({
        id: `notif_${Date.now()}_invitation`,
        userId: savedProject.freelancerId,
        projectId: savedProject.id,
        type: 'project',
        title: 'Project invitation awaiting your response',
        description: `${savedProject.clientName} invited you to "${savedProject.title}". Review the scope and accept or decline the work.`,
        timestamp: 'Just now',
        read: false,
        link: '/freelancer/notifications',
      }).save();
    }

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

// PATCH project governance settings before work begins
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await ProjectModel.findOne({ id: req.params.id });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    if (project.status !== 'draft' && project.status !== 'selection_pending') {
      res.status(409).json({ error: 'Review windows and scope are locked once work begins.' });
      return;
    }
    if (req.body.actorId && req.body.actorId !== project.clientId) {
      res.status(403).json({ error: 'Only the customer can edit project governance settings.' });
      return;
    }
    const checkpointReviewDays = parseReviewDays(req.body.checkpointReviewDays, project.checkpointReviewDays, 2, 21);
    const finalReviewDays = parseReviewDays(req.body.finalReviewDays, project.finalReviewDays, 2, 30);
    if (!checkpointReviewDays || !finalReviewDays) {
      res.status(400).json({ error: 'Checkpoint review must be 2–21 days and final review must be 2–30 days.' });
      return;
    }
    if (req.body.deliverables !== undefined && !Array.isArray(req.body.deliverables)) {
      res.status(400).json({ error: 'Deliverables must be a checklist.' });
      return;
    }
    project.checkpointReviewDays = checkpointReviewDays;
    project.finalReviewDays = finalReviewDays;
    if (Array.isArray(req.body.deliverables)) project.deliverables = req.body.deliverables;
    project.lastActivityAt = new Date().toISOString();
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST invite a specific freelancer to a customer-owned project before work starts.
router.post('/:id/invite', async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId, freelancerId } = req.body || {};
    const project = await ProjectModel.findOne({ id: req.params.id });
    if (!project) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }
    if (project.clientId !== clientId) {
      res.status(403).json({ error: 'Only the customer who created this project can send an invitation.' });
      return;
    }
    if (project.freelancerId || !['draft', 'selection_pending'].includes(project.status)) {
      res.status(409).json({ error: 'Only an unassigned project that has not started can be invited to a freelancer.' });
      return;
    }
    const freelancer = await UserModel.findOne({ id: freelancerId, role: 'freelancer' });
    if (!freelancer) {
      res.status(404).json({ error: 'Freelancer not found.' });
      return;
    }

    const now = new Date().toISOString();
    project.access = 'invited';
    project.freelancerId = freelancer.id;
    project.freelancerName = freelancer.name;
    project.freelancerAvatar = freelancer.avatar;
    project.freelancerTitle = freelancer.title;
    project.applicationDeadline = undefined;
    project.applications = [];
    project.status = 'invitation_pending';
    project.lastActivityAt = now;
    await project.save();

    await new NotificationModel({
      id: `notif_${Date.now()}_invitation`,
      userId: freelancer.id,
      projectId: project.id,
      type: 'project',
      title: 'Project invitation awaiting your response',
      description: `${project.clientName} invited you to "${project.title}". Review the scope and accept or decline the work.`,
      timestamp: 'Just now',
      read: false,
      link: '/freelancer/notifications',
    }).save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST customer cancellation with a deterministic kill fee for the next unfrozen milestone
router.post('/:id/cancel', async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await ProjectModel.findOne({ id: req.params.id });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    const { actorId, reason } = req.body;
    if (actorId !== project.clientId) {
      res.status(403).json({ error: 'Only the customer can cancel this project.' });
      return;
    }
    if (project.status !== 'active' && project.status !== 'in_review') {
      res.status(409).json({ error: 'Only an active project can be cancelled by the customer.' });
      return;
    }
    const nextMilestone = project.milestones.find((milestone: any) => milestone.fundState === 'IN_CUSTODY');
    if (!nextMilestone) {
      res.status(409).json({ error: 'No unfrozen milestone remains. Use the review or dispute flow instead.' });
      return;
    }
    const killFee = Math.floor(nextMilestone.amount * CANCELLATION_KILL_FEE_RATE);
    const refundAmount = Math.max(0, project.amountInCustody - killFee);
    const now = new Date().toISOString();
    project.milestones = project.milestones.map((milestone: any) => milestone.id === nextMilestone.id
      ? { ...milestone, status: 'failed', fundState: 'REFUNDED', cancellationKillFee: killFee }
      : milestone);
    project.amountInCustody = 0;
    project.amountFrozen += killFee;
    project.amountRefunded += refundAmount;
    project.fundState = deriveProjectFundState(project);
    project.status = 'cancelled_by_customer';
    project.lastActivityAt = now;
    await project.save();

    const hash = () => `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`;
    await new LedgerEntryModel({ id: `led_${Date.now()}_kill`, projectId: project.id, projectTitle: project.title, actorId: project.clientId, actorName: project.clientName, actorRole: 'client', eventType: 'CANCELLATION_KILL_FEE', previousState: 'IN_CUSTODY', newState: 'FROZEN', amount: killFee, timestamp: now, referenceId: `CANCEL_KILL_${Date.now()}`, hash: hash(), notes: `Customer cancellation: ₹${killFee.toLocaleString()} frozen as builder kill-fee compensation for ${nextMilestone.title}. Reason: ${reason || 'Not provided'}` }).save();
    await new LedgerEntryModel({ id: `led_${Date.now()}_refund`, projectId: project.id, projectTitle: project.title, actorId: project.clientId, actorName: project.clientName, actorRole: 'client', eventType: 'CANCELLATION_REFUND', previousState: 'IN_CUSTODY', newState: 'REFUNDED', amount: refundAmount, timestamp: now, referenceId: `CANCEL_REFUND_${Date.now()}`, hash: hash(), notes: `Customer cancellation refund after kill fee. Reason: ${reason || 'Not provided'}` }).save();
    await new MessageModel({ id: `msg_${Date.now()}`, projectId: project.id, senderId: 'system', senderName: 'KEYStone Protocol', senderRole: 'admin', content: `CUSTOMER CANCELLATION: ₹${killFee.toLocaleString()} frozen as builder compensation; ₹${refundAmount.toLocaleString()} refunded to customer.`, timestamp: now, isSystemEvent: true, systemEventType: 'CANCELLATION_KILL_FEE' }).save();
    if (project.freelancerId) await new NotificationModel({ id: `notif_${Date.now()}_kill`, userId: project.freelancerId, type: 'payment', title: 'Customer cancellation compensation secured', description: `₹${killFee.toLocaleString()} was frozen as your cancellation protection for "${project.title}".`, timestamp: 'Just now', read: false, link: '/freelancer/income' }).save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST freelancer response to an invited project. Work stays locked until accepted.
router.post('/:id/invitation/respond', async (req: Request, res: Response): Promise<void> => {
  try {
    const { freelancerId, response } = req.body || {};
    const project = await ProjectModel.findOne({ id: req.params.id });
    if (!project) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }
    if (project.access !== 'invited' || project.status !== 'invitation_pending') {
      res.status(409).json({ error: 'This project invitation has already been answered or is no longer available.' });
      return;
    }
    if (!freelancerId || project.freelancerId !== freelancerId) {
      res.status(403).json({ error: 'Only the invited freelancer can respond to this invitation.' });
      return;
    }
    if (response !== 'accept' && response !== 'reject') {
      res.status(400).json({ error: 'Invitation response must be accept or reject.' });
      return;
    }

    const now = new Date().toISOString();
    if (response === 'accept') {
      project.status = 'active';
      project.selectedAt = now;
      project.lastActivityAt = now;
      await project.save();
      await recalculateTrustScore(freelancerId);

      await new MessageModel({ id: `msg_${Date.now()}`, projectId: project.id, senderId: 'system', senderName: 'KEYStone Protocol', senderRole: 'admin', content: `PROJECT INVITATION ACCEPTED: ${project.freelancerName || 'Freelancer'} accepted the work. The project workspace is now active.`, timestamp: now, isSystemEvent: true, systemEventType: 'PROJECT_STARTED' }).save();
      await new NotificationModel({ id: `notif_${Date.now()}_accepted`, userId: project.clientId, projectId: project.id, type: 'project', title: 'Project invitation accepted', description: `${project.freelancerName || 'Your freelancer'} accepted "${project.title}" and can begin work.`, timestamp: 'Just now', read: false, link: `/client/projects/${project.id}` }).save();
    } else {
      const refundAmount = project.amountInCustody + project.amountFrozen;
      project.status = 'cancelled';
      project.fundState = 'REFUNDED';
      project.amountInCustody = 0;
      project.amountFrozen = 0;
      project.amountRefunded += refundAmount;
      project.lastActivityAt = now;
      await project.save();
      await recalculateTrustScore(freelancerId);

      await new LedgerEntryModel({ id: `led_${Date.now()}_invitation_declined`, projectId: project.id, projectTitle: project.title, actorId: freelancerId, actorName: project.freelancerName || 'Freelancer', actorRole: 'freelancer', eventType: 'INVITATION_DECLINED_REFUND', previousState: 'IN_CUSTODY', newState: 'REFUNDED', amount: refundAmount, timestamp: now, referenceId: `INVITE_DECLINED_${Date.now()}`, hash: `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`, notes: `The invited freelancer declined before work began. Full project funds were returned to the customer.` }).save();
      await new MessageModel({ id: `msg_${Date.now()}`, projectId: project.id, senderId: 'system', senderName: 'KEYStone Protocol', senderRole: 'admin', content: `PROJECT INVITATION DECLINED: No work began, so the full project deposit was returned to the customer.`, timestamp: now, isSystemEvent: true, systemEventType: 'CANCELLATION_REFUND' }).save();
      await new NotificationModel({ id: `notif_${Date.now()}_declined`, userId: project.clientId, projectId: project.id, type: 'project', title: 'Project invitation declined', description: `${project.freelancerName || 'The freelancer'} declined "${project.title}". No work began, so the full deposit was refunded.`, timestamp: 'Just now', read: false, link: `/client/projects/${project.id}` }).save();
    }

    res.json(project);
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
    project.status = 'invitation_pending';
    project.lastActivityAt = new Date().toISOString();
    await project.save();

    await new MessageModel({
      id: `msg_${Date.now()}`,
      projectId: project.id,
      senderId: 'system',
      senderName: 'KEYStone Protocol',
      senderRole: 'admin',
      content: `FREELANCER SELECTED: ${application.freelancerName} received a project invitation and must accept before work begins.`,
      timestamp: new Date().toISOString(),
      isSystemEvent: true,
      systemEventType: 'PROJECT_STARTED',
    }).save();

    await new NotificationModel({
      id: `notif_${Date.now()}`,
      userId: application.freelancerId,
      projectId: project.id,
      type: 'project',
      title: 'Project invitation awaiting your response',
      description: `${project.clientName} selected you for "${project.title}". Review the offer and accept or decline the work.`,
      timestamp: 'Just now',
      read: false,
      link: '/freelancer/notifications',
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
    if (project.status !== 'active' && project.status !== 'in_review') {
      res.status(409).json({ error: 'The freelancer must accept this invitation before milestone work can begin.' });
      return;
    }

    const milestone = project.milestones.find((item: any) => item.id === milestoneId);
    if (!milestone) {
      res.status(404).json({ error: 'Milestone not found.' });
      return;
    }
    if (milestone.status === 'submitted' || milestone.status === 'approved' || milestone.fundState !== 'IN_CUSTODY') {
      res.status(409).json({ error: 'This milestone has already entered review or been completed.' });
      return;
    }
    if (project.submissions.some((submission: any) => submission.milestoneId === milestoneId)) {
      res.status(409).json({ error: 'Each milestone accepts exactly one demo submission. It is already awaiting review or complete.' });
      return;
    }

    const completedDeliverableIds = Array.isArray(submissionData.completedDeliverableIds) ? submissionData.completedDeliverableIds : [];
    const relevantDeliverables = project.deliverables.filter((item: any) => !item.milestoneId || item.milestoneId === milestoneId);
    if (completedDeliverableIds.some((itemId: string) => !relevantDeliverables.some((item: any) => item.id === itemId))) {
      res.status(400).json({ error: 'A completed deliverable must belong to this milestone.' });
      return;
    }
    const completedAt = new Date().toISOString();
    project.deliverables = project.deliverables.map((item: any) => completedDeliverableIds.includes(item.id)
      ? { ...item, status: 'COMPLETED', markedCompleteAt: completedAt }
      : item);
    const scopeComplete = relevantDeliverables.length > 0 && relevantDeliverables.every((item: any) => completedDeliverableIds.includes(item.id) || item.status === 'COMPLETED');
    const subId = `sub_${Date.now()}`;
    const reviewDays = milestone.reviewDays || project.checkpointReviewDays || 7;
    const newSubmission = {
      ...submissionData,
      id: subId,
      milestoneId,
      submittedAt: new Date().toISOString(),
      status: 'under_review',
      completedDeliverableIds,
      scopeComplete,
      reviewDays,
      reviewDueAt: addDays(new Date(), reviewDays),
    };

    let milestoneAmount = milestone.amount || 0;
    project.milestones = project.milestones.map((m: any) => {
      if (m.id === milestoneId) {
        return { ...m, status: 'submitted', fundState: 'FROZEN' };
      }
      return m;
    });

    project.amountInCustody = Math.max(0, project.amountInCustody - milestoneAmount);
    project.amountFrozen = project.amountFrozen + milestoneAmount;
    project.fundState = deriveProjectFundState(project);
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

    const milestone = project.milestones.find((item: any) => item.id === milestoneId);
    if (!milestone) {
      res.status(404).json({ error: 'Milestone not found.' });
      return;
    }
    if (milestone.fundState !== 'FROZEN' || milestone.status !== 'submitted') {
      res.status(409).json({ error: 'Only a submitted milestone under review can be approved.' });
      return;
    }
    if (!project.submissions.some((submission: any) => submission.milestoneId === milestoneId && submission.status === 'under_review')) {
      res.status(409).json({ error: 'This milestone does not have an approvable demo ticket.' });
      return;
    }

    let milestoneAmount = milestone.amount || 0;
    project.milestones = project.milestones.map((m: any) => {
      if (m.id === milestoneId) {
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

    const now = new Date().toISOString();
    const allApproved = project.milestones.every((m: any) => m.status === 'approved');
    if (allApproved) {
      project.status = 'completed';
      project.completedAt = now;
    }
    project.amountFrozen = Math.max(0, project.amountFrozen - milestoneAmount);
    project.amountWithdrawable = project.amountWithdrawable + milestoneAmount;
    project.fundState = deriveProjectFundState(project);
    project.lastActivityAt = now;

    await project.save();
    if (project.freelancerId) await recalculateTrustScore(project.freelancerId);

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
      notes: `Client unresponsive for the agreed ${project.finalReviewDays}-day final review window. Automated inactivity protection triggered. Funds released to freelancer.`,
    }).save();

    await new MessageModel({
      id: `msg_${Date.now()}`,
      projectId: project.id,
      senderId: 'system',
      senderName: 'KEYStone Protocol',
      senderRole: 'admin',
      content: `${project.finalReviewDays}-DAY INACTIVITY PROTECTION TRIGGERED: Funds automatically moved to WITHDRAWABLE state.`,
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
