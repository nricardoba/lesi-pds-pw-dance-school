import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  listClassStatusesService,
  createClassStatusService,
  updateClassStatusService,
  deleteClassStatusService,
} from '../../src/services/classes/classStatusesServices';
import { prisma } from '../../src/config/db';
import { AppError } from '../../src/utils/appError';

vi.mock('../../src/config/db', () => ({
  prisma: {
    classStatus: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('Class Statuses Services - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listClassStatusesService', () => {
    it('deve listar todos os estados de aula com sucesso', async () => {
      const mockStatuses = [
        { classStatusId: 1, classStatusDesc: 'Scheduled' },
        { classStatusId: 2, classStatusDesc: 'Completed' },
      ];

      (prisma.classStatus.findMany as any).mockResolvedValue(mockStatuses);
      const result = await listClassStatusesService();

      expect(result).toEqual(mockStatuses);
      expect(prisma.classStatus.findMany).toHaveBeenCalled();
    });

    it('deve retornar array vazio se não houver estados', async () => {
      (prisma.classStatus.findMany as any).mockResolvedValue([]);
      const result = await listClassStatusesService();

      expect(result).toEqual([]);
    });
  });

  describe('createClassStatusService', () => {
    it('deve criar um estado de aula com sucesso', async () => {
      const body = { classStatusDesc: 'Scheduled' };
      const mockStatus = { classStatusId: 1, ...body };

      (prisma.classStatus.create as any).mockResolvedValue(mockStatus);
      const result = await createClassStatusService(body);

      expect(result).toEqual(mockStatus);
    });
  });

  describe('updateClassStatusService', () => {
    it('deve atualizar um estado de aula com sucesso', async () => {
      const params = { id: 1 };
      const body = { classStatusDesc: 'Completed' };
      const mockStatus = { classStatusId: 1, ...body };

      (prisma.classStatus.findUnique as any).mockResolvedValue(mockStatus);
      (prisma.classStatus.update as any).mockResolvedValue(mockStatus);

      const result = await updateClassStatusService(params, body);

      expect(result).toBeDefined();
    });
  });

  describe('deleteClassStatusService', () => {
    it('deve deletar um estado de aula com sucesso', async () => {
      const params = { id: 1 };

      (prisma.classStatus.findUnique as any).mockResolvedValue({ classStatusId: 1 });
      (prisma.classStatus.delete as any).mockResolvedValue({ classStatusId: 1 });

      await deleteClassStatusService(params);

      expect(prisma.classStatus.delete).toHaveBeenCalled();
    });
  });
});
