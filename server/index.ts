import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, isDBConnected } from './config/db';
import { seedDatabase } from './seed';
import { initializeTrustScores } from './services/trustScore';

import authRouter from './routes/auth';
import projectsRouter from './routes/projects';
import ledgerRouter from './routes/ledger';
import disputesRouter from './routes/disputes';
import messagesRouter from './routes/messages';
import notificationsRouter from './routes/notifications';
import reportsRouter from './routes/reports';
import payoutsRouter from './routes/payouts';
import aiRouter from './routes/ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/ledger', ledgerRouter);
app.use('/api/disputes', disputesRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/payouts', payoutsRouter);
app.use('/api/ai', aiRouter);

// Health Check & DB status
app.get('/api/health', (_req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    database: isDBConnected() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Manual seed endpoint (useful for demo resets)
app.post('/api/seed', async (req: Request, res: Response): Promise<void> => {
  const force = req.query.force === 'true';
  await seedDatabase(force);
  res.json({ message: 'Seed executed successfully' });
});

// Start Server
const startServer = async () => {
  app.listen(Number(PORT), '0.0.0.0', async () => {
    console.log(`[Server] KEYstone backend running on http://localhost:${PORT}`);
    console.log(`[Server] API Health check: http://localhost:${PORT}/api/health`);

    console.log('[Server] Connecting to MongoDB...');
    await connectDB();

    if (isDBConnected()) {
      await seedDatabase(false);
      await initializeTrustScores();
    }
  });
};

startServer();

export default app;
