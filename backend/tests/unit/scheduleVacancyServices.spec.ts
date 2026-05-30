import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAllScheduleVacanciesService,
  getScheduleVacancyByIdService,
  getScheduleVacanciesByUserIdService,
  createScheduleVacancyService,
  updateScheduleVacancyService,
  deleteScheduleVacancyService,
  getScheduleSubmissionsService,
  getAllScheduleSubmissionsService,
  getLatestSubmissionStatusService,
  submitScheduleService,
  reviewScheduleSubmissionService,
} from '../../src/services/school/scheduleVacancyServices';
import { prisma } from '../../src/config/db';

vi.mock('../../src/config/db', () => ({
  prisma: {
    scheduleVacancy: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      updateMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    schoolYear: {
      findUnique: vi.fn(),
    },
  },
}));

describe('Schedule Vacancy Services - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseVacancy = {
    scheduleVacancyId: 1,
    userId: 1,
    schoolYearId: 1,
    scheduleVacancyStart: new Date('2026-05-04T09:00:00.000Z'),
    scheduleVacancyEnd: new Date('2026-05-04T10:00:00.000Z'),
    scheduleVacancyRecurrence: false,
    scheduleVacancyApproved: null,
    user: {
      userName: 'Professor Teste',
    },
  };

  describe('getAllScheduleVacanciesService', () => {
    it('deve listar todas as disponibilidades com sucesso', async () => {
      (prisma.scheduleVacancy.findMany as any).mockResolvedValue([baseVacancy]);

      const result = await getAllScheduleVacanciesService();

      expect(result).toEqual([baseVacancy]);
      expect(prisma.scheduleVacancy.findMany).toHaveBeenCalledWith({
        include: {
          user: {
            select: {
              userName: true,
            },
          },
          schoolYear: {
            select: {
              schoolYearName: true,
            },
          },
        },
      });
    });

    it('deve devolver array vazio se não existirem disponibilidades', async () => {
      (prisma.scheduleVacancy.findMany as any).mockResolvedValue([]);

      const result = await getAllScheduleVacanciesService();

      expect(result).toEqual([]);
    });
  });

  describe('getScheduleVacancyByIdService', () => {
    it('deve obter uma disponibilidade por ID com sucesso', async () => {
      (prisma.scheduleVacancy.findUnique as any).mockResolvedValue(baseVacancy);

      const result = await getScheduleVacancyByIdService(1);

      expect(result).toEqual(baseVacancy);
      expect(prisma.scheduleVacancy.findUnique).toHaveBeenCalledWith({
        where: { scheduleVacancyId: 1 },
        include: {
          user: {
            select: {
              userName: true,
            },
          },
          schoolYear: {
            select: {
              schoolYearName: true,
            },
          },
        },
      });
    });

    it('deve lançar erro se a disponibilidade não for encontrada', async () => {
      (prisma.scheduleVacancy.findUnique as any).mockResolvedValue(null);

      await expect(getScheduleVacancyByIdService(999)).rejects.toMatchObject({
        message: 'Disponibilidade não encontrada',
        statusCode: 404,
      });
    });
  });

  describe('getScheduleVacanciesByUserIdService', () => {
    it('deve listar disponibilidades de um utilizador com sucesso', async () => {
      (prisma.scheduleVacancy.findMany as any).mockResolvedValue([baseVacancy]);

      const result = await getScheduleVacanciesByUserIdService(1);

      expect(result).toEqual([baseVacancy]);
      expect(prisma.scheduleVacancy.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: {
          schoolYear: {
            select: {
              schoolYearName: true,
            },
          },
        },
      });
    });

    it('deve devolver array vazio se o utilizador não tiver disponibilidades', async () => {
      (prisma.scheduleVacancy.findMany as any).mockResolvedValue([]);

      const result = await getScheduleVacanciesByUserIdService(1);

      expect(result).toEqual([]);
    });
  });

  describe('createScheduleVacancyService', () => {
    it('deve criar uma disponibilidade com sucesso', async () => {
      const body = {
        userId: 1,
        schoolYearId: 1,
        scheduleVacancyStart: '2026-05-04T09:00:00.000Z',
        scheduleVacancyEnd: '2026-05-04T10:00:00.000Z',
        scheduleVacancyRecurrence: true,
      };

      (prisma.user.findUnique as any).mockResolvedValue({ userId: 1 });
      (prisma.schoolYear.findUnique as any).mockResolvedValue({ schoolYearId: 1 });
      (prisma.scheduleVacancy.create as any).mockResolvedValue({
        ...body,
        scheduleVacancyId: 1,
        scheduleVacancyStart: new Date(body.scheduleVacancyStart),
        scheduleVacancyEnd: new Date(body.scheduleVacancyEnd),
      });

      const result = await createScheduleVacancyService(body);

      expect(result).toBeDefined();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(prisma.schoolYear.findUnique).toHaveBeenCalledWith({
        where: { schoolYearId: 1 },
      });
      expect(prisma.scheduleVacancy.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          schoolYearId: 1,
          scheduleVacancyStart: new Date(body.scheduleVacancyStart),
          scheduleVacancyEnd: new Date(body.scheduleVacancyEnd),
          scheduleVacancyRecurrence: true,
        },
      });
    });

    it('deve criar disponibilidade com recorrência false por defeito', async () => {
      const body = {
        userId: 1,
        schoolYearId: 1,
        scheduleVacancyStart: '2026-05-04T09:00:00.000Z',
        scheduleVacancyEnd: '2026-05-04T10:00:00.000Z',
      };

      (prisma.user.findUnique as any).mockResolvedValue({ userId: 1 });
      (prisma.schoolYear.findUnique as any).mockResolvedValue({ schoolYearId: 1 });
      (prisma.scheduleVacancy.create as any).mockResolvedValue({
        scheduleVacancyId: 1,
        ...body,
        scheduleVacancyRecurrence: false,
      });

      await createScheduleVacancyService(body);

      expect(prisma.scheduleVacancy.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          schoolYearId: 1,
          scheduleVacancyStart: new Date(body.scheduleVacancyStart),
          scheduleVacancyEnd: new Date(body.scheduleVacancyEnd),
          scheduleVacancyRecurrence: false,
        },
      });
    });

    it('deve lançar erro se o utilizador não existir', async () => {
      const body = {
        userId: 999,
        schoolYearId: 1,
        scheduleVacancyStart: '2026-05-04T09:00:00.000Z',
        scheduleVacancyEnd: '2026-05-04T10:00:00.000Z',
      };

      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(createScheduleVacancyService(body)).rejects.toMatchObject({
        message: 'Utilizador não encontrado',
        statusCode: 404,
      });

      expect(prisma.scheduleVacancy.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro se o ano letivo não existir', async () => {
      const body = {
        userId: 1,
        schoolYearId: 999,
        scheduleVacancyStart: '2026-05-04T09:00:00.000Z',
        scheduleVacancyEnd: '2026-05-04T10:00:00.000Z',
      };

      (prisma.user.findUnique as any).mockResolvedValue({ userId: 1 });
      (prisma.schoolYear.findUnique as any).mockResolvedValue(null);

      await expect(createScheduleVacancyService(body)).rejects.toMatchObject({
        message: 'Ano letivo não encontrado',
        statusCode: 404,
      });

      expect(prisma.scheduleVacancy.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro se a hora de fim não for posterior à hora de início', async () => {
      const body = {
        userId: 1,
        schoolYearId: 1,
        scheduleVacancyStart: '2026-05-04T10:00:00.000Z',
        scheduleVacancyEnd: '2026-05-04T09:00:00.000Z',
      };

      (prisma.user.findUnique as any).mockResolvedValue({ userId: 1 });
      (prisma.schoolYear.findUnique as any).mockResolvedValue({ schoolYearId: 1 });

      await expect(createScheduleVacancyService(body)).rejects.toMatchObject({
        message: 'A hora de fim deve ser posterior à hora de início',
        statusCode: 400,
      });

      expect(prisma.scheduleVacancy.create).not.toHaveBeenCalled();
    });
  });

  describe('updateScheduleVacancyService', () => {
    it('deve atualizar uma disponibilidade com sucesso', async () => {
      const data = {
        scheduleVacancyStart: '2026-05-04T11:00:00.000Z',
        scheduleVacancyEnd: '2026-05-04T12:00:00.000Z',
        scheduleVacancyRecurrence: true,
      };

      (prisma.scheduleVacancy.findUnique as any).mockResolvedValue(baseVacancy);
      (prisma.scheduleVacancy.update as any).mockResolvedValue({
        ...baseVacancy,
        scheduleVacancyStart: new Date(data.scheduleVacancyStart),
        scheduleVacancyEnd: new Date(data.scheduleVacancyEnd),
        scheduleVacancyRecurrence: true,
      });

      const result = await updateScheduleVacancyService(1, data);

      expect(result).toBeDefined();
      expect(prisma.scheduleVacancy.update).toHaveBeenCalledWith({
        where: { scheduleVacancyId: 1 },
        data: {
          userId: 1,
          schoolYearId: 1,
          scheduleVacancyStart: new Date(data.scheduleVacancyStart),
          scheduleVacancyEnd: new Date(data.scheduleVacancyEnd),
          scheduleVacancyRecurrence: true,
        },
      });
    });

    it('deve lançar erro se a disponibilidade não existir ao atualizar', async () => {
      (prisma.scheduleVacancy.findUnique as any).mockResolvedValue(null);

      await expect(
        updateScheduleVacancyService(999, {
          scheduleVacancyStart: '2026-05-04T11:00:00.000Z',
          scheduleVacancyEnd: '2026-05-04T12:00:00.000Z',
        })
      ).rejects.toMatchObject({
        message: 'Disponibilidade não encontrada',
        statusCode: 404,
      });
    });

    it('deve lançar erro se novo utilizador não existir', async () => {
      (prisma.scheduleVacancy.findUnique as any).mockResolvedValue(baseVacancy);
      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(
        updateScheduleVacancyService(1, {
          userId: 999,
        })
      ).rejects.toMatchObject({
        message: 'Utilizador não encontrado',
        statusCode: 404,
      });

      expect(prisma.scheduleVacancy.update).not.toHaveBeenCalled();
    });

    it('deve lançar erro se novo ano letivo não existir', async () => {
      (prisma.scheduleVacancy.findUnique as any).mockResolvedValue(baseVacancy);
      (prisma.schoolYear.findUnique as any).mockResolvedValue(null);

      await expect(
        updateScheduleVacancyService(1, {
          schoolYearId: 999,
        })
      ).rejects.toMatchObject({
        message: 'Ano letivo não encontrado',
        statusCode: 404,
      });

      expect(prisma.scheduleVacancy.update).not.toHaveBeenCalled();
    });

    it('deve lançar erro se a nova hora de fim não for posterior à nova hora de início', async () => {
      (prisma.scheduleVacancy.findUnique as any).mockResolvedValue(baseVacancy);

      await expect(
        updateScheduleVacancyService(1, {
          scheduleVacancyStart: '2026-05-04T13:00:00.000Z',
          scheduleVacancyEnd: '2026-05-04T12:00:00.000Z',
        })
      ).rejects.toMatchObject({
        message: 'A hora de fim deve ser posterior à hora de início',
        statusCode: 400,
      });

      expect(prisma.scheduleVacancy.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteScheduleVacancyService', () => {
    it('deve apagar uma disponibilidade com sucesso', async () => {
      (prisma.scheduleVacancy.findUnique as any).mockResolvedValue(baseVacancy);
      (prisma.scheduleVacancy.delete as any).mockResolvedValue(baseVacancy);

      const result = await deleteScheduleVacancyService(1);

      expect(result).toBeUndefined();
      expect(prisma.scheduleVacancy.delete).toHaveBeenCalledWith({
        where: { scheduleVacancyId: 1 },
      });
    });

    it('deve lançar erro se a disponibilidade não existir ao apagar', async () => {
      (prisma.scheduleVacancy.findUnique as any).mockResolvedValue(null);

      await expect(deleteScheduleVacancyService(999)).rejects.toMatchObject({
        message: 'Disponibilidade não encontrada',
        statusCode: 404,
      });

      expect(prisma.scheduleVacancy.delete).not.toHaveBeenCalled();
    });
  });

  describe('getScheduleSubmissionsService', () => {
    it('deve devolver submissões pendentes e aprovadas de um utilizador', async () => {
      const pending = {
        ...baseVacancy,
        scheduleVacancyId: 1,
        scheduleVacancyRecurrence: true,
        scheduleVacancyApproved: null,
      };

      const approved = {
        ...baseVacancy,
        scheduleVacancyId: 2,
        scheduleVacancyRecurrence: false,
        scheduleVacancyApproved: true,
      };

      const rejected = {
        ...baseVacancy,
        scheduleVacancyId: 3,
        scheduleVacancyRecurrence: true,
        scheduleVacancyApproved: false,
      };

      (prisma.scheduleVacancy.findMany as any).mockResolvedValue([pending, approved, rejected]);

      const result = await getScheduleSubmissionsService(1);

      expect(result).toHaveLength(3);
      expect(result[0].status.scheduleSubmissionStatusDesc).toBe('Pendente');
      expect(result[1].status.scheduleSubmissionStatusDesc).toBe('Aprovado');
      expect(result[2].status.scheduleSubmissionStatusDesc).toBe('Rejeitado');
      expect(result[0].scheduleVacancies[0]).toHaveProperty('day_of_week');
      expect(result[0].scheduleVacancies[0]).toHaveProperty('start_time');
      expect(result[0].scheduleVacancies[0]).toHaveProperty('end_time');
    });

    it('deve devolver array vazio se não houver submissões do utilizador', async () => {
      (prisma.scheduleVacancy.findMany as any).mockResolvedValue([]);

      const result = await getScheduleSubmissionsService(1);

      expect(result).toEqual([]);
    });
  });

  describe('getAllScheduleSubmissionsService', () => {
    it('deve devolver submissões agrupadas por utilizador', async () => {
      const vacancies = [
        {
          ...baseVacancy,
          userId: 1,
          scheduleVacancyId: 1,
          scheduleVacancyRecurrence: true,
          scheduleVacancyApproved: null,
        },
        {
          ...baseVacancy,
          userId: 2,
          scheduleVacancyId: 2,
          scheduleVacancyRecurrence: false,
          scheduleVacancyApproved: true,
          user: { userName: 'Professor Dois' },
        },
        {
          ...baseVacancy,
          userId: 3,
          scheduleVacancyId: 3,
          scheduleVacancyRecurrence: true,
          scheduleVacancyApproved: false,
          user: { userName: 'Professor Três' },
        },
      ];

      (prisma.scheduleVacancy.findMany as any).mockResolvedValue(vacancies);

      const result = await getAllScheduleSubmissionsService();

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('scheduleSubmissionId');
      expect(result[0]).toHaveProperty('scheduleVacancies');
      expect(result[1]).toHaveProperty('scheduleSubmissionId');
      expect(result[1]).toHaveProperty('scheduleVacancies');
      expect(result[2]).toHaveProperty('scheduleSubmissionId');
      expect(result[2]).toHaveProperty('scheduleVacancies');
    });

    it('deve devolver array vazio quando não existem disponibilidades', async () => {
      (prisma.scheduleVacancy.findMany as any).mockResolvedValue([]);

      const result = await getAllScheduleSubmissionsService();

      expect(result).toEqual([]);
    });
  });

  describe('getLatestSubmissionStatusService', () => {
    it('deve devolver estado pendente se houver disponibilidades pendentes', async () => {
      const pending = {
        ...baseVacancy,
        scheduleVacancyRecurrence: true,
        scheduleVacancyApproved: null,
      };

      (prisma.scheduleVacancy.findMany as any).mockResolvedValueOnce([pending]);

      const result = await getLatestSubmissionStatusService(1);

      expect(result).toBeDefined();
      expect(result?.status.scheduleSubmissionStatusDesc).toBe('Pendente');
    });

    it('deve devolver estado aprovado se não houver pendentes mas houver aprovadas', async () => {
      const approved = {
        ...baseVacancy,
        scheduleVacancyRecurrence: false,
        scheduleVacancyApproved: true,
      };

      (prisma.scheduleVacancy.findMany as any)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([approved]);

      const result = await getLatestSubmissionStatusService(1);

      expect(result).toBeDefined();
      expect(result?.status.scheduleSubmissionStatusDesc).toBe('Aprovado');
    });

    it('deve devolver estado rejeitado se não houver pendentes nem aprovadas mas houver rejeitadas', async () => {
      const rejected = {
        ...baseVacancy,
        scheduleVacancyRecurrence: true,
        scheduleVacancyApproved: false,
      };

      (prisma.scheduleVacancy.findMany as any)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([rejected]);

      const result = await getLatestSubmissionStatusService(1);

      expect(result).toBeDefined();
      expect(result?.status.scheduleSubmissionStatusDesc).toBe('Rejeitado');
    });

    it('deve devolver null se não houver pendentes nem aprovadas', async () => {
      (prisma.scheduleVacancy.findMany as any)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await getLatestSubmissionStatusService(1);

      expect(result).toBeNull();
    });
  });

  describe('submitScheduleService', () => {
    it('deve apagar pendentes anteriores e criar novas disponibilidades pendentes', async () => {
      const vacancies = [
        {
          day_of_week: 'Segunda-feira',
          start_time: '09:00',
          end_time: '10:00',
        },
        {
          day_of_week: 'Terça-feira',
          start_time: '11:00',
          end_time: '12:00',
        },
      ];

      (prisma.scheduleVacancy.deleteMany as any).mockResolvedValue({ count: 2 });
      (prisma.scheduleVacancy.create as any)
        .mockResolvedValueOnce({
          scheduleVacancyId: 1,
          userId: 1,
          schoolYearId: 1,
          scheduleVacancyRecurrence: true,
        })
        .mockResolvedValueOnce({
          scheduleVacancyId: 2,
          userId: 1,
          schoolYearId: 1,
          scheduleVacancyRecurrence: true,
        });

      const result = await submitScheduleService(1, 1, vacancies);

      expect(result).toHaveLength(2);
      expect(prisma.scheduleVacancy.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          scheduleVacancyApproved: null,
        },
      });
      expect(prisma.scheduleVacancy.create).toHaveBeenCalledTimes(2);
    });

    it('deve devolver array vazio se submissão não tiver disponibilidades', async () => {
      (prisma.scheduleVacancy.deleteMany as any).mockResolvedValue({ count: 0 });

      const result = await submitScheduleService(1, 1, []);

      expect(result).toEqual([]);
      expect(prisma.scheduleVacancy.create).not.toHaveBeenCalled();
    });
  });

  describe('reviewScheduleSubmissionService', () => {
    it('deve aprovar disponibilidades pendentes', async () => {
      (prisma.scheduleVacancy.updateMany as any).mockResolvedValue({ count: 2 });

      const result = await reviewScheduleSubmissionService(1, 'Aprovado');

      expect(result).toEqual({ success: true });
      expect(prisma.scheduleVacancy.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          scheduleVacancyApproved: null,
        },
        data: {
          scheduleVacancyApproved: true,
        },
      });
    });

    it('deve rejeitar disponibilidades pendentes', async () => {
      (prisma.scheduleVacancy.updateMany as any).mockResolvedValue({ count: 2 });

      const result = await reviewScheduleSubmissionService(1, 'Rejeitado');

      expect(result).toEqual({ success: true });
      expect(prisma.scheduleVacancy.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          scheduleVacancyApproved: null,
        },
        data: {
          scheduleVacancyApproved: false,
        },
      });
    });

    it('deve devolver sucesso sem alterar dados se estado for desconhecido', async () => {
      const result = await reviewScheduleSubmissionService(1, 'Outro');

      expect(result).toEqual({ success: true });
      expect(prisma.scheduleVacancy.updateMany).not.toHaveBeenCalled();
      expect(prisma.scheduleVacancy.deleteMany).not.toHaveBeenCalled();
    });
  });
});