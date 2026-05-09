import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as controller from '../../src/controllers/schoolController';
import * as schoolServices from '../../src/services/school';

vi.mock('../../src/services/school', () => ({
  listSchoolYearsService: vi.fn(),
  createSchoolYearService: vi.fn(),
  updateSchoolYearService: vi.fn(),
  deleteSchoolYearService: vi.fn(),

  getAllScheduleVacanciesService: vi.fn(),
  getScheduleVacancyByIdService: vi.fn(),
  getScheduleVacanciesByUserIdService: vi.fn(),
  createScheduleVacancyService: vi.fn(),
  updateScheduleVacancyService: vi.fn(),
  deleteScheduleVacancyService: vi.fn(),

  getScheduleSubmissionsService: vi.fn(),
  getAllScheduleSubmissionsService: vi.fn(),
  getLatestSubmissionStatusService: vi.fn(),
  submitScheduleService: vi.fn(),
  reviewScheduleSubmissionService: vi.fn(),
}));

const mockRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.locals = {};
  return res;
};

const next = vi.fn();

describe('School Controller - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('School Years', () => {
    it('deve listar anos letivos com sucesso', async () => {
      const req: any = {};
      const res = mockRes();

      (schoolServices.listSchoolYearsService as any).mockResolvedValue([
        { schoolYearId: 1, schoolYearName: '2025/2026' },
      ]);

      await controller.listSchoolYearsController(req, res, next);

      expect(res.json).toHaveBeenCalledWith([
        { schoolYearId: 1, schoolYearName: '2025/2026' },
      ]);
    });

    it('deve criar ano letivo com sucesso', async () => {
      const req: any = {
        body: {
          schoolYearName: '2025/2026',
          schoolYearStart: '2025-09-01',
          schoolYearEnd: '2026-07-31',
        },
      };
      const res = mockRes();

      (schoolServices.createSchoolYearService as any).mockResolvedValue({
        schoolYearId: 1,
      });

      await controller.createSchoolYearController(req, res, next);

      expect(schoolServices.createSchoolYearService).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ schoolYearId: 1 });
    });

    it('deve atualizar ano letivo com sucesso', async () => {
      const req: any = {
        params: { id: '1' },
        body: { schoolYearName: '2026/2027' },
      };
      const res = mockRes();

      (schoolServices.updateSchoolYearService as any).mockResolvedValue({
        schoolYearId: 1,
        schoolYearName: '2026/2027',
      });

      await controller.updateSchoolYearController(req, res, next);

      expect(schoolServices.updateSchoolYearService).toHaveBeenCalledWith(
        req.params,
        req.body
      );
      expect(res.json).toHaveBeenCalledWith({
        schoolYearId: 1,
        schoolYearName: '2026/2027',
      });
    });

    it('deve apagar ano letivo com sucesso', async () => {
      const req: any = { params: { id: '1' } };
      const res = mockRes();

      (schoolServices.deleteSchoolYearService as any).mockResolvedValue(undefined);

      await controller.deleteSchoolYearController(req, res, next);

      expect(schoolServices.deleteSchoolYearService).toHaveBeenCalledWith(req.params);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('Schedule Vacancies', () => {
    it('deve listar disponibilidades com sucesso', async () => {
      const req: any = {};
      const res = mockRes();

      (schoolServices.getAllScheduleVacanciesService as any).mockResolvedValue([
        { scheduleVacancyId: 1 },
      ]);

      await controller.listScheduleVacanciesController(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ scheduleVacancyId: 1 }]);
    });

    it('deve obter disponibilidade por ID com sucesso', async () => {
      const req: any = { params: { id: '1' } };
      const res = mockRes();

      (schoolServices.getScheduleVacancyByIdService as any).mockResolvedValue({
        scheduleVacancyId: 1,
      });

      await controller.getScheduleVacancyByIdController(req, res, next);

      expect(schoolServices.getScheduleVacancyByIdService).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ scheduleVacancyId: 1 });
    });

    it('deve obter disponibilidades por userId com sucesso', async () => {
      const req: any = { params: { userId: '1' } };
      const res = mockRes();

      (schoolServices.getScheduleVacanciesByUserIdService as any).mockResolvedValue([
        { scheduleVacancyId: 1, userId: 1 },
      ]);

      await controller.getScheduleVacanciesByUserIdController(req, res, next);

      expect(schoolServices.getScheduleVacanciesByUserIdService).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ scheduleVacancyId: 1, userId: 1 }]);
    });

    it('deve obter as minhas disponibilidades com sucesso', async () => {
      const req: any = {};
      const res = mockRes();
      res.locals.user = { id: '1' };

      (schoolServices.getScheduleVacanciesByUserIdService as any).mockResolvedValue([
        { scheduleVacancyId: 1, userId: 1 },
      ]);

      await controller.getMyScheduleVacanciesController(req, res, next);

      expect(schoolServices.getScheduleVacanciesByUserIdService).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve chamar next se utilizador autenticado não existir nas minhas disponibilidades', async () => {
      const req: any = {};
      const res = mockRes();

      await controller.getMyScheduleVacanciesController(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('deve criar disponibilidade com userId do body', async () => {
      const req: any = {
        body: {
          userId: 2,
          schoolYearId: 1,
          scheduleVacancyStart: '2026-05-01T09:00:00.000Z',
          scheduleVacancyEnd: '2026-05-01T10:00:00.000Z',
        },
      };
      const res = mockRes();
      res.locals.user = { id: '1' };

      (schoolServices.createScheduleVacancyService as any).mockResolvedValue({
        scheduleVacancyId: 1,
        userId: 2,
      });

      await controller.createScheduleVacancyController(req, res, next);

      expect(schoolServices.createScheduleVacancyService).toHaveBeenCalledWith({
        ...req.body,
        userId: 2,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ scheduleVacancyId: 1, userId: 2 });
    });

    it('deve criar disponibilidade com userId autenticado por defeito', async () => {
      const req: any = {
        body: {
          schoolYearId: 1,
          scheduleVacancyStart: '2026-05-01T09:00:00.000Z',
          scheduleVacancyEnd: '2026-05-01T10:00:00.000Z',
        },
      };
      const res = mockRes();
      res.locals.user = { id: '5' };

      (schoolServices.createScheduleVacancyService as any).mockResolvedValue({
        scheduleVacancyId: 1,
        userId: 5,
      });

      await controller.createScheduleVacancyController(req, res, next);

      expect(schoolServices.createScheduleVacancyService).toHaveBeenCalledWith({
        ...req.body,
        userId: 5,
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('deve atualizar disponibilidade com sucesso', async () => {
      const req: any = {
        params: { id: '1' },
        body: { scheduleVacancyRecurrence: true },
      };
      const res = mockRes();

      (schoolServices.updateScheduleVacancyService as any).mockResolvedValue({
        scheduleVacancyId: 1,
        scheduleVacancyRecurrence: true,
      });

      await controller.updateScheduleVacancyController(req, res, next);

      expect(schoolServices.updateScheduleVacancyService).toHaveBeenCalledWith(
        1,
        req.body
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve apagar disponibilidade com sucesso', async () => {
      const req: any = { params: { id: '1' } };
      const res = mockRes();

      (schoolServices.deleteScheduleVacancyService as any).mockResolvedValue(undefined);

      await controller.deleteScheduleVacancyController(req, res, next);

      expect(schoolServices.deleteScheduleVacancyService).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('Schedule Submissions', () => {
    it('deve obter submissões de um utilizador com sucesso', async () => {
      const req: any = { params: { userId: '1' } };
      const res = mockRes();

      (schoolServices.getScheduleSubmissionsService as any).mockResolvedValue([
        { scheduleSubmissionId: 1 },
      ]);

      await controller.getScheduleSubmissionsController(req, res, next);

      expect(schoolServices.getScheduleSubmissionsService).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ scheduleSubmissionId: 1 }]);
    });

    it('deve obter as minhas submissões com sucesso', async () => {
      const req: any = {};
      const res = mockRes();
      res.locals.user = { id: '1' };

      (schoolServices.getScheduleSubmissionsService as any).mockResolvedValue([
        { scheduleSubmissionId: 1 },
      ]);

      await controller.getMyScheduleSubmissionsController(req, res, next);

      expect(schoolServices.getScheduleSubmissionsService).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve listar todas as submissões com sucesso', async () => {
      const req: any = {};
      const res = mockRes();

      (schoolServices.getAllScheduleSubmissionsService as any).mockResolvedValue([
        { scheduleSubmissionId: '1_pending' },
      ]);

      await controller.getAllScheduleSubmissionsController(req, res, next);

      expect(schoolServices.getAllScheduleSubmissionsService).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ scheduleSubmissionId: '1_pending' }]);
    });

    it('deve obter estado mais recente por userId com sucesso', async () => {
      const req: any = { params: { userId: '1' } };
      const res = mockRes();

      (schoolServices.getLatestSubmissionStatusService as any).mockResolvedValue({
        status: { scheduleSubmissionStatusDesc: 'Pendente' },
      });

      await controller.getLatestSubmissionStatusController(req, res, next);

      expect(schoolServices.getLatestSubmissionStatusService).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve obter o meu estado mais recente com sucesso', async () => {
      const req: any = {};
      const res = mockRes();
      res.locals.user = { id: '1' };

      (schoolServices.getLatestSubmissionStatusService as any).mockResolvedValue({
        status: { scheduleSubmissionStatusDesc: 'Aprovado' },
      });

      await controller.getMyLatestSubmissionStatusController(req, res, next);

      expect(schoolServices.getLatestSubmissionStatusService).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve submeter horário com sucesso', async () => {
      const req: any = {
        body: {
          schoolYearId: 1,
          vacancies: [
            {
              day_of_week: 'Segunda-feira',
              start_time: '09:00',
              end_time: '10:00',
            },
          ],
        },
      };
      const res = mockRes();
      res.locals.user = { id: '1' };

      (schoolServices.submitScheduleService as any).mockResolvedValue([
        { scheduleVacancyId: 1 },
      ]);

      await controller.submitScheduleController(req, res, next);

      expect(schoolServices.submitScheduleService).toHaveBeenCalledWith(
        1,
        1,
        req.body.vacancies
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith([{ scheduleVacancyId: 1 }]);
    });

    it('deve rever submissão com sucesso', async () => {
      const req: any = {
        params: { submissionId: '1' },
        body: { status: 'Aprovado' },
      };
      const res = mockRes();

      (schoolServices.reviewScheduleSubmissionService as any).mockResolvedValue({
        success: true,
      });

      await controller.reviewScheduleSubmissionController(req, res, next);

      expect(schoolServices.reviewScheduleSubmissionService).toHaveBeenCalledWith(
        1,
        'Aprovado'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Submission for user 1 reviewed with status: Aprovado',
      });
    });
  });
});