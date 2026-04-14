// src/routes/index.ts
import { Router } from 'express';
import { prisma } from '../config/db';
import usersRoutes from './users';
import classesRoutes from './classes';
import referenceRoutes from './references';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: "API Ent'Artes a funcionar",
    timestamp: new Date(),
  });
});

router.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

router.use('/users', usersRoutes);
router.use('/classes', classesRoutes);
router.use('/reference', referenceRoutes);

export default router;