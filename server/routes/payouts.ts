import { Router, type Request, type Response } from 'express';
import { ProjectModel } from '../models/Project';
import { LedgerEntryModel } from '../models/LedgerEntry';
import { NotificationModel } from '../models/Notification';

const router = Router();

// POST withdraw freelancer earnings
router.post('/withdraw', async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, user, method } = req.body;
    const withdrawAmount = Number(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      res.status(400).json({ error: 'Invalid payout amount' });
      return;
    }

    const projects = await ProjectModel.find({ freelancerId: user.id });
    const available = projects.reduce((sum, p) => sum + (p.amountWithdrawable || 0), 0);

    if (withdrawAmount > available) {
      res.status(400).json({ error: 'Withdrawal amount exceeds available balance' });
      return;
    }

    let remaining = withdrawAmount;
    for (const project of projects) {
      if (remaining <= 0) break;
      if (project.amountWithdrawable > 0) {
        const debit = Math.min(project.amountWithdrawable, remaining);
        project.amountWithdrawable -= debit;
        project.amountPaid = (project.amountPaid || 0) + debit;
        if (project.amountWithdrawable === 0 && project.status === 'completed') {
          project.fundState = 'PAID';
        }
        project.lastActivityAt = new Date().toISOString();
        remaining -= debit;
        await project.save();
      }
    }

    // Ledger
    await new LedgerEntryModel({
      id: `led_${Date.now()}`,
      projectId: 'platform',
      projectTitle: 'Freelancer Payout',
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      eventType: 'PAYOUT_WITHDRAWN',
      previousState: 'WITHDRAWABLE',
      newState: 'PAID',
      amount: withdrawAmount,
      timestamp: new Date().toISOString(),
      referenceId: `TXN_PAYOUT_${Date.now()}`,
      hash: `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
      notes: `${(method || 'BANK').toUpperCase()} payout settled to ${user.name}.`,
    }).save();

    // Notification
    await new NotificationModel({
      id: `notif_${Date.now()}`,
      userId: user.id,
      type: 'payment',
      title: 'Payout completed',
      description: `₹${withdrawAmount.toLocaleString()} was sent via ${(method || 'BANK').toUpperCase()}.`,
      timestamp: 'Just now',
      read: false,
      link: '/freelancer/income',
    }).save();

    res.json({ success: true, amount: withdrawAmount });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
