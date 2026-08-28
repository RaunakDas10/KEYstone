import { Router, type Request, type Response } from 'express';
import { LedgerEntryModel } from '../models/LedgerEntry';

const router = Router();

// GET all ledger entries
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.query;
    const query: Record<string, any> = {};
    if (projectId) query.projectId = projectId;

    const entries = await LedgerEntryModel.find(query).sort({ timestamp: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST new ledger entry
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const id = data.id || `led_${Date.now()}`;
    const timestamp = data.timestamp || new Date().toISOString();
    const hash =
      data.hash ||
      `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`;

    const newEntry = new LedgerEntryModel({
      ...data,
      id,
      timestamp,
      hash,
    });

    const saved = await newEntry.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
