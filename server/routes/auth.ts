import { Router, type Request, type Response } from 'express';
import { UserModel } from '../models/User';

const router = Router();

// GET all users
router.get('/users', async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await UserModel.find().sort({ joinedDate: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET user by ID
router.get('/users/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findOne({ id: req.params.id });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update user profile
router.put('/users/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await UserModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Login / Switch user
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, userId } = req.body;
    let user = null;
    if (userId) {
      user = await UserModel.findOne({ id: userId });
    } else if (role) {
      user = await UserModel.findOne({ role });
    }
    if (!user) {
      user = await UserModel.findOne();
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
