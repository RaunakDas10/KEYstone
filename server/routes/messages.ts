import { Router, type Request, type Response } from 'express';
import { MessageModel } from '../models/Message';

const router = Router();

// GET messages
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.query;
    const query: Record<string, any> = {};
    if (projectId) query.projectId = projectId;

    const messages = await MessageModel.find(query).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST message
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const id = data.id || `msg_${Date.now()}`;
    const timestamp = data.timestamp || new Date().toISOString();

    const newMessage = new MessageModel({
      ...data,
      id,
      timestamp,
    });

    const saved = await newMessage.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
