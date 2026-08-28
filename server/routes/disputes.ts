import { Router, type Request, type Response } from 'express';
import { DisputeModel } from '../models/Dispute';
import { ProjectModel } from '../models/Project';
import { LedgerEntryModel } from '../models/LedgerEntry';
import { MessageModel } from '../models/Message';

const router = Router();

// GET all disputes
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const disputes = await DisputeModel.find().sort({ createdAt: -1 });
    res.json(disputes);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST raise dispute
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, reason, description, user } = req.body;
    const project = await ProjectModel.findOne({ id: projectId });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const disputeId = `disp_${Date.now()}`;
    const newDispute = new DisputeModel({
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
    });
    const savedDispute = await newDispute.save();

    const previousState = project.fundState;
    project.status = 'disputed';
    project.fundState = 'DISPUTED';
    project.disputeId = disputeId;
    await project.save();

    // Ledger
    await new LedgerEntryModel({
      id: `led_${Date.now()}`,
      projectId,
      projectTitle: project.title,
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      eventType: 'DISPUTE_OPENED',
      previousState,
      newState: 'DISPUTED',
      amount: project.budget,
      timestamp: new Date().toISOString(),
      referenceId: disputeId,
      hash: `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
      notes: `Dispute opened by ${user.name}: "${reason}". Platform governance review initiated.`,
    }).save();

    // System Message
    await new MessageModel({
      id: `msg_${Date.now()}`,
      projectId,
      senderId: 'system',
      senderName: 'KEYStone Protocol',
      senderRole: 'admin',
      content: `DISPUTE INITIATED: Funds locked under platform review.`,
      timestamp: new Date().toISOString(),
      isSystemEvent: true,
      systemEventType: 'DISPUTE_OPENED',
    }).save();

    res.status(201).json(savedDispute);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST resolve dispute by admin
router.post('/:id/resolve', async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientRefundPct } = req.body;
    const dispute = await DisputeModel.findOne({ id: req.params.id });
    if (!dispute) {
      res.status(404).json({ error: 'Dispute not found' });
      return;
    }

    const clientRefundAmount = Math.round((dispute.amountInDispute * clientRefundPct) / 100);
    const freelancerAmount = dispute.amountInDispute - clientRefundAmount;

    dispute.status = 'resolved';
    dispute.resolution = {
      clientRefundAmount,
      freelancerAmount,
      summary: `Admin resolved dispute: ${clientRefundPct}% refund to Client (₹${clientRefundAmount.toLocaleString()}), ${100 - clientRefundPct}% payout to Freelancer (₹${freelancerAmount.toLocaleString()}).`,
      resolvedAt: new Date().toISOString(),
      resolvedBy: 'KEYStone Governance Team',
    };
    await dispute.save();

    const project = await ProjectModel.findOne({ id: dispute.projectId });
    if (project) {
      project.status = 'completed';
      project.fundState = 'PAID';
      project.amountFrozen = 0;
      project.amountRefunded = clientRefundAmount;
      project.amountWithdrawable = freelancerAmount;
      await project.save();

      // Ledger
      await new LedgerEntryModel({
        id: `led_${Date.now()}`,
        projectId: project.id,
        projectTitle: project.title,
        actorId: 'user_admin_1',
        actorName: 'KEYStone Risk & Governance',
        actorRole: 'admin',
        eventType: 'DISPUTE_RESOLVED',
        previousState: 'DISPUTED',
        newState: 'PAID',
        amount: dispute.amountInDispute,
        timestamp: new Date().toISOString(),
        referenceId: `RESOLVE_${dispute.id}`,
        hash: `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
        notes: `Dispute resolved by Admin. Client Refund: ₹${clientRefundAmount.toLocaleString()}, Freelancer Payout: ₹${freelancerAmount.toLocaleString()}.`,
      }).save();

      // System message
      await new MessageModel({
        id: `msg_${Date.now()}`,
        projectId: project.id,
        senderId: 'system',
        senderName: 'KEYStone Protocol',
        senderRole: 'admin',
        content: `DISPUTE RESOLVED BY ADMIN: Financial settlement executed.`,
        timestamp: new Date().toISOString(),
        isSystemEvent: true,
        systemEventType: 'DISPUTE_RESOLVED',
      }).save();
    }

    res.json(dispute);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
