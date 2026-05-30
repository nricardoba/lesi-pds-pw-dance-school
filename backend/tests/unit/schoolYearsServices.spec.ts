import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as schoolYearsServices from '../../src/services/school/schoolYearsServices';
import { AppError } from '../../src/utils/appError';

vi.mock('../../src/config/db', () => ({
  prisma: {
    schoolYear: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from '../../src/config/db';

const mockPrisma = prisma as any;

describe('School Years Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.schoolYear.findFirst.mockResolvedValue(null);
  });

  describe('listSchoolYearsService', () => {
    it('deve listar todos os anos letivos', async () => {
      const mockSchoolYears = [
        {
          schoolYearId: 1,
          schoolYearName: 'Ano Letivo 2024-2025',
          schoolYearStart: new Date('2024-09-01'),
          schoolYearEnd: new Date('2025-06-30'),
        },
        {
          schoolYearId: 2,
          schoolYearName: 'Ano Letivo 2025-2026',
          schoolYearStart: new Date('2025-09-01'),
          schoolYearEnd: new Date('2026-06-30'),
        },
      ];

      mockPrisma.schoolYear.findMany.mockResolvedValue(mockSchoolYears);

      const result = await schoolYearsServices.listSchoolYearsService();

      expect(result).toEqual(mockSchoolYears);
      expect(mockPrisma.schoolYear.findMany).toHaveBeenCalledWith({
        orderBy: { schoolYearId: 'asc' },
      });
    });

    it('deve retornar lista vazia quando não há anos letivos', async () => {
      mockPrisma.schoolYear.findMany.mockResolvedValue([]);

      const result = await schoolYearsServices.listSchoolYearsService();

      expect(result).toEqual([]);
      expect(mockPrisma.schoolYear.findMany).toHaveBeenCalled();
    });
  });

  describe('createSchoolYearService', () => {
    it('deve criar um ano letivo com sucesso', async () => {
      const inputData = {
        schoolYearName: 'Ano Letivo 2024-2025',
        schoolYearStart: '2024-09-01',
        schoolYearEnd: '2025-06-30',
      };

      const mockCreatedYear = {
        schoolYearId: 1,
        schoolYearName: 'Ano Letivo 2024-2025',
        schoolYearStart: new Date('2024-09-01'),
        schoolYearEnd: new Date('2025-06-30'),
      };

      mockPrisma.schoolYear.create.mockResolvedValue(mockCreatedYear);

      const result = await schoolYearsServices.createSchoolYearService(inputData);

      expect(result).toEqual(mockCreatedYear);
      expect(mockPrisma.schoolYear.create).toHaveBeenCalledWith({
        data: {
          schoolYearName: inputData.schoolYearName,
          schoolYearStart: new Date(inputData.schoolYearStart),
          schoolYearEnd: new Date(inputData.schoolYearEnd),
        },
      });
    });

    it('deve lançar erro quando o intervalo coincide com outro ano letivo', async () => {
      const inputData = {
        schoolYearName: 'Ano Letivo 2026-2027',
        schoolYearStart: '2026-01-01',
        schoolYearEnd: '2026-12-31',
      };

      mockPrisma.schoolYear.findFirst.mockResolvedValue({
        schoolYearName: 'Ano Letivo 2025-2026',
      });

      await expect(
        schoolYearsServices.createSchoolYearService(inputData)
      ).rejects.toThrow('O intervalo do ano letivo coincide com "Ano Letivo 2025-2026".');

      expect(mockPrisma.schoolYear.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando dados obrigatórios estão faltando', async () => {
      const invalidData = {
        schoolYearName: '',
        schoolYearStart: '2024-09-01',
        schoolYearEnd: '2025-06-30',
      };

      await expect(
        schoolYearsServices.createSchoolYearService(invalidData)
      ).rejects.toThrow();
      expect(mockPrisma.schoolYear.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando falta campo obrigatório', async () => {
      const invalidData = {
        schoolYearName: 'Ano Letivo 2024-2025',
        schoolYearStart: '2024-09-01',
      };

      await expect(
        schoolYearsServices.createSchoolYearService(invalidData)
      ).rejects.toThrow();
      expect(mockPrisma.schoolYear.create).not.toHaveBeenCalled();
    });
  });

  describe('updateSchoolYearService', () => {
    it('deve atualizar um ano letivo com sucesso', async () => {
      const params = { id: 1 };
      const updateData = {
        schoolYearName: 'Ano Letivo 2024-2025 Atualizado',
      };

      mockPrisma.schoolYear.findUnique.mockResolvedValue({
        schoolYearId: 1,
        schoolYearName: 'Ano Letivo 2024-2025',
        schoolYearStart: new Date('2024-09-01'),
        schoolYearEnd: new Date('2025-06-30'),
      });

      const mockUpdatedYear = {
        schoolYearId: 1,
        schoolYearName: 'Ano Letivo 2024-2025 Atualizado',
        schoolYearStart: new Date('2024-09-01'),
        schoolYearEnd: new Date('2025-06-30'),
      };

      mockPrisma.schoolYear.update.mockResolvedValue(mockUpdatedYear);

      const result = await schoolYearsServices.updateSchoolYearService(params, updateData);

      expect(result).toEqual(mockUpdatedYear);
      expect(mockPrisma.schoolYear.update).toHaveBeenCalled();
    });

    it('deve lançar erro ao atualizar ano letivo inexistente', async () => {
      const params = { id: 999 };
      const updateData = { schoolYearName: 'Novo Nome' };

      mockPrisma.schoolYear.findUnique.mockResolvedValue(null);

      await expect(
        schoolYearsServices.updateSchoolYearService(params, updateData)
      ).rejects.toThrow(AppError);

      expect(mockPrisma.schoolYear.update).not.toHaveBeenCalled();
    });

    it('deve permitir atualização parcial do ano letivo', async () => {
      const params = { id: 1 };
      const updateData = {
        schoolYearEnd: '2025-07-31',
      };

      mockPrisma.schoolYear.findUnique.mockResolvedValue({
        schoolYearId: 1,
        schoolYearName: 'Ano Letivo 2024-2025',
        schoolYearStart: new Date('2024-09-01'),
        schoolYearEnd: new Date('2025-06-30'),
      });

      const mockUpdatedYear = {
        schoolYearId: 1,
        schoolYearName: 'Ano Letivo 2024-2025',
        schoolYearStart: new Date('2024-09-01'),
        schoolYearEnd: new Date('2025-07-31'),
      };

      mockPrisma.schoolYear.update.mockResolvedValue(mockUpdatedYear);

      const result = await schoolYearsServices.updateSchoolYearService(params, updateData);

      expect(result).toEqual(mockUpdatedYear);
    });

    it('deve lançar erro quando a atualização cria sobreposição com outro ano letivo', async () => {
      const params = { id: 1 };
      const updateData = {
        schoolYearStart: '2025-01-01',
        schoolYearEnd: '2025-12-31',
      };

      mockPrisma.schoolYear.findUnique.mockResolvedValue({
        schoolYearId: 1,
        schoolYearName: 'Ano Letivo 2024-2025',
        schoolYearStart: new Date('2024-09-01'),
        schoolYearEnd: new Date('2025-06-30'),
      });

      mockPrisma.schoolYear.findFirst.mockResolvedValue({
        schoolYearName: 'Ano Letivo 2025-2026',
      });

      await expect(
        schoolYearsServices.updateSchoolYearService(params, updateData)
      ).rejects.toThrow('O intervalo do ano letivo coincide com "Ano Letivo 2025-2026".');

      expect(mockPrisma.schoolYear.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteSchoolYearService', () => {
    it('deve deletar um ano letivo com sucesso', async () => {
      const params = { id: 1 };

      mockPrisma.schoolYear.findUnique.mockResolvedValue({
        schoolYearId: 1,
      });

      mockPrisma.schoolYear.delete.mockResolvedValue({
        schoolYearId: 1,
      });

      const result = await schoolYearsServices.deleteSchoolYearService(params);

      expect(result).toBeNull();
      expect(mockPrisma.schoolYear.delete).toHaveBeenCalledWith({
        where: { schoolYearId: 1 },
      });
    });

    it('deve lançar erro ao deletar ano letivo inexistente', async () => {
      const params = { id: 999 };

      mockPrisma.schoolYear.findUnique.mockResolvedValue(null);

      await expect(
        schoolYearsServices.deleteSchoolYearService(params)
      ).rejects.toThrow(AppError);

      expect(mockPrisma.schoolYear.delete).not.toHaveBeenCalled();
    });

    it('deve lançar erro com código correto ao não encontrar recurso', async () => {
      const params = { id: 999 };

      mockPrisma.schoolYear.findUnique.mockResolvedValue(null);

      await expect(
        schoolYearsServices.deleteSchoolYearService(params)
      ).rejects.toThrow();
    });
  });
});
