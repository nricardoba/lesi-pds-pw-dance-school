// src/routes/index.ts
import { Router } from 'express';
import { prisma } from '../config/db';
import authRoutes from './auth';
import usersRoutes from './users';
import classesRoutes from './classes';
import referencesRoutes from './references';
import coachingRoutes from './coaching';
import { ensureAuth } from '../middlewares/ensureAuth';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: "API Ent'Artes a funcionar",
    timestamp: new Date(),
  });
});

router.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/classes', classesRoutes);
router.use('/references', referencesRoutes);
router.use('/coaching', ensureAuth , coachingRoutes);

export default router;