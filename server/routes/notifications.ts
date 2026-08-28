import { Router, type Request, type Response } from 'express';
import { NotificationModel } from '../models/Notification';

const router = Router();

// GET notifications
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;
    const query: Record<string, any> = {};
    if (userId) {
      query.$or = [{ userId }, { userId: 'all' }];
    }

    const notifications = await NotificationModel.find(query).sort({ timestamp: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST notification
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const id = data.id || `notif_${Date.now()}`;
    const timestamp = data.timestamp || 'Just now';

    const newNotif = new NotificationModel({
      ...data,
      id,
      timestamp,
      read: false,
    });

    const saved = await newNotif.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// PUT mark as read
router.put('/:id/read', async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await NotificationModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { read: true } },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
