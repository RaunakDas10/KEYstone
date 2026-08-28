import { Router, type Request, type Response } from 'express';
import { ReportModel } from '../models/Report';
import { NotificationModel } from '../models/Notification';

const router = Router();

// GET all reports
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const reports = await ReportModel.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST report
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { reporter, target, projectId, reason, description } = req.body;
    const reportId = `report_${Date.now()}`;

    const newReport = new ReportModel({
      id: reportId,
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
    });

    const saved = await newReport.save();

    await new NotificationModel({
      id: `notif_${Date.now()}`,
      userId: 'all',
      type: 'system',
      title: 'New report submitted',
      description: `${reporter.name} reported ${target.name}.`,
      timestamp: 'Just now',
      read: false,
      link: '/admin/reports',
    }).save();

    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
