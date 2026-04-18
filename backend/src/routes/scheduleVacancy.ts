import { Router } from 'express';
import {
  listScheduleVacanciesController,
  getScheduleVacancyByIdController,
  getScheduleVacanciesByUserIdController,
  createScheduleVacancyController,
  updateScheduleVacancyController,
  deleteScheduleVacancyController
} from '../controllers/scheduleVacancyController';

const router = Router();

router.get('/', listScheduleVacanciesController);
router.get('/:id', getScheduleVacancyByIdController);
router.get('/user/:userId', getScheduleVacanciesByUserIdController);

router.post('/', createScheduleVacancyController);
router.put('/:id', updateScheduleVacancyController);
router.delete('/:id', deleteScheduleVacancyController);

export default router;
