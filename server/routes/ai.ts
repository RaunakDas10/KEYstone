import { Router, type Request, type Response } from 'express';
import { isDBConnected } from '../config/db';
import { UserModel } from '../models/User';
import { findTalentWithGemini } from '../services/geminiTalentSearch';
import { SEED_FREELANCERS, SEED_USERS } from '../../src/mock/seedData';

const router = Router();
const MAX_QUERY_LENGTH = 800;

router.post('/talent-search', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = typeof req.body?.query === 'string' ? req.body.query.trim() : '';
    const requesterId = typeof req.body?.requesterId === 'string' ? req.body.requesterId.trim() : '';
    const requestedLimit = Number(req.body?.limit) || 5;

    if (!requesterId) {
      res.status(401).json({ error: 'Authentication is required to use AI Mode.' });
      return;
    }
    if (!query || query.length > MAX_QUERY_LENGTH) {
      res.status(400).json({ error: `Enter a request between 1 and ${MAX_QUERY_LENGTH} characters.` });
      return;
    }

    const usingDatabase = isDBConnected();
    const requester = usingDatabase
      ? await UserModel.findOne({ id: requesterId }).lean()
      : Object.values(SEED_USERS).find((user) => user.id === requesterId);
    if (!requester) {
      res.status(401).json({ error: 'Your account could not be verified.' });
      return;
    }

    const freelancers = usingDatabase
      ? await UserModel.find({ role: 'freelancer' }).lean()
      : SEED_FREELANCERS;
    if (!freelancers.length) {
      res.status(404).json({ error: 'No freelancer profiles are available to recommend yet.' });
      return;
    }

    const search = await findTalentWithGemini(query, freelancers, requestedLimit);
    res.json(search);
  } catch {
    res.status(500).json({ error: 'Unable to complete AI talent search.' });
  }
});

export default router;
