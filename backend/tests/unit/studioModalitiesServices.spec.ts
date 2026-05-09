import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as studioModalitiesServices from '../../src/services/studios/studioModalitiesServices';
import { prisma } from '../../src/config/db';
import { AppError } from '../../src/utils/appError';

vi.mock('../../src/config/db', () => ({
  prisma: {
    studioModality: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('Studio Modalities Services - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listStudioModalitiesService', () => {
    it('deve listar todas as relações estúdio-modalidade com sucesso', async () => {
      const mockStudioModalities = [
        {
          studioModalityId: 1,
          studioId: 1,
          modalityId: 1,
          studio: { studioId: 1, studioName: 'Estúdio A', studioMaxCapacity: 20 },
          modality: { modalityId: 1, modalityName: 'Ballet', modalityHourlyFee: 25 },
        },
      ];

      vi.mocked(prisma.studioModality.findMany).mockResolvedValue(mockStudioModalities as any);

      const response = await studioModalitiesServices.listStudioModalitiesService();

      expect(response).toEqual(mockStudioModalities);
      expect(prisma.studioModality.findMany).toHaveBeenCalledWith(expect.objectContaining({
        include: expect.any(Object),
        orderBy: { studioModalityId: 'asc' },
      }));
    });

    it('deve retornar uma lista vazia se não houver relações', async () => {
      vi.mocked(prisma.studioModality.findMany).mockResolvedValue([]);

      const response = await studioModalitiesServices.listStudioModalitiesService();

      expect(response).toEqual([]);
    });
  });

  describe('createStudioModalityService', () => {
    it('deve criar uma relação estúdio-modalidade com sucesso', async () => {
      const validPayload = { studioId: 1, modalityId: 1 };
      const mockCreated = { studioModalityId: 1, ...validPayload };

      vi.mocked(prisma.studioModality.create).mockResolvedValue(mockCreated as any);

      const response = await studioModalitiesServices.createStudioModalityService(validPayload);

      expect(response).toMatchObject({
        studioModalityId: 1,
        studioId: 1,
        modalityId: 1,
      });

      expect(prisma.studioModality.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.any(Object),
      }));
    });

    it('deve lançar erro se faltar studioId', async () => {
      const invalidPayload = { modalityId: 1 };

      await expect(studioModalitiesServices.createStudioModalityService(invalidPayload))
        .rejects.toThrow();
    });

    it('deve lançar erro se faltar modalityId', async () => {
      const invalidPayload = { studioId: 1 };

      await expect(studioModalitiesServices.createStudioModalityService(invalidPayload))
        .rejects.toThrow();
    });
  });

  describe('updateStudioModalityService', () => {
    it('deve atualizar uma relação estúdio-modalidade com sucesso', async () => {
      const updateData = { studioId: 2 };
      const mockUpdated = { studioModalityId: 1, studioId: 2, modalityId: 1 };

      vi.mocked(prisma.studioModality.findUnique).mockResolvedValue({ studioModalityId: 1 } as any);
      vi.mocked(prisma.studioModality.update).mockResolvedValue(mockUpdated as any);

      const response = await studioModalitiesServices.updateStudioModalityService({ id: 1 }, updateData);

      expect(response).toMatchObject({
        studioModalityId: 1,
        studioId: 2,
      });

      expect(prisma.studioModality.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { studioModalityId: 1 },
      }));
    });

    it('deve lançar erro se a relação não for encontrada', async () => {
      const updateData = { studioId: 2 };

      vi.mocked(prisma.studioModality.findUnique).mockResolvedValue(null);

      await expect(studioModalitiesServices.updateStudioModalityService({ id: 999 }, updateData))
        .rejects.toThrow();
    });

    it('deve permitir atualizar apenas a modalidade', async () => {
      const updateData = { modalityId: 2 };
      const mockUpdated = { studioModalityId: 1, studioId: 1, modalityId: 2 };

      vi.mocked(prisma.studioModality.findUnique).mockResolvedValue({ studioModalityId: 1 } as any);
      vi.mocked(prisma.studioModality.update).mockResolvedValue(mockUpdated as any);

      const response = await studioModalitiesServices.updateStudioModalityService({ id: 1 }, updateData);

      expect(response.modalityId).toBe(2);
    });
  });

  describe('deleteStudioModalityService', () => {
    it('deve apagar uma relação estúdio-modalidade com sucesso', async () => {
      vi.mocked(prisma.studioModality.findUnique).mockResolvedValue({ studioModalityId: 1 } as any);
      vi.mocked(prisma.studioModality.delete).mockResolvedValue({ studioModalityId: 1 } as any);

      const response = await studioModalitiesServices.deleteStudioModalityService({ id: 1 });

      expect(response).toBeNull();
      expect(prisma.studioModality.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { studioModalityId: 1 },
      }));
      expect(prisma.studioModality.delete).toHaveBeenCalledWith({ where: { studioModalityId: 1 } });
    });

    it('deve lançar erro se a relação não for encontrada', async () => {
      vi.mocked(prisma.studioModality.findUnique).mockResolvedValue(null);

      await expect(studioModalitiesServices.deleteStudioModalityService({ id: 999 }))
        .rejects.toThrow();

      expect(prisma.studioModality.delete).not.toHaveBeenCalled();
    });
  });
});
