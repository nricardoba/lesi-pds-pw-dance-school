import { Router } from 'express';
import { ensureAuth } from '../middlewares/ensureAuth';
import { CoachingController } from '../controllers/coachingController';

const router = Router();

// Fase 1 — Pedido
router.get('/studios',            ensureAuth, CoachingController.getAvailableStudios);
router.get('/vacancies',          ensureAuth, CoachingController.getVacancies);
router.post('/request',           ensureAuth, CoachingController.requestCoaching);

// Fase 2 — Confirmação
router.patch('/:classId/confirm', ensureAuth, CoachingController.confirmCoaching);

// Fase 3 — Validação
router.post('/:classId/validate', ensureAuth, CoachingController.validateCoaching);

export default router;