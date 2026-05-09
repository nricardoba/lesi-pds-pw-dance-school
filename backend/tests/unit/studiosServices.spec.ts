import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as studiosServices from '../../src/services/studios/studiosServices';
import { prisma } from '../../src/config/db';
import { AppError } from '../../src/utils/appError';

vi.mock('../../src/config/db', () => ({
  prisma: {
    studio: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
    studioModality: {
      findMany: vi.fn(),
    },
  },
}));

describe('Studios Services - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listStudiosService', () => {
    it('deve listar todos os estúdios com sucesso', async () => {
      const mockStudios = [
        { studioId: 1, studioName: 'Estúdio A', studioMaxCapacity: 20 },
        { studioId: 2, studioName: 'Estúdio B', studioMaxCapacity: 30 },
      ];

      vi.mocked(prisma.studio.findMany).mockResolvedValue(mockStudios as any);

      const response = await studiosServices.listStudiosService();

      expect(response).toEqual(mockStudios);
      expect(prisma.studio.findMany).toHaveBeenCalledWith({ orderBy: { studioId: 'asc' } });
    });

    it('deve retornar uma lista vazia se não houver estúdios', async () => {
      vi.mocked(prisma.studio.findMany).mockResolvedValue([]);

      const response = await studiosServices.listStudiosService();

      expect(response).toEqual([]);
    });
  });

  describe('createStudioService', () => {
    it('deve criar um estúdio com sucesso', async () => {
      const validPayload = { studioName: 'Estúdio Novo', studioMaxCapacity: 25 };
      const mockCreatedStudio = { studioId: 1, ...validPayload };

      vi.mocked(prisma.studio.create).mockResolvedValue(mockCreatedStudio as any);

      const response = await studiosServices.createStudioService(validPayload);

      expect(response).toMatchObject({
        studioId: 1,
        studioName: 'Estúdio Novo',
        studioMaxCapacity: 25,
      });

      expect(prisma.studio.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.any(Object),
      }));
    });

    it('deve lançar erro se faltar dados obrigatórios', async () => {
      const invalidPayload = { studioName: 'Estúdio' }; // Faltando studioMaxCapacity

      await expect(studiosServices.createStudioService(invalidPayload))
        .rejects.toThrow();
    });

    it('deve lançar erro se o nome estiver vazio', async () => {
      const invalidPayload = { studioName: '', studioMaxCapacity: 20 };

      await expect(studiosServices.createStudioService(invalidPayload))
        .rejects.toThrow();
    });
  });

  describe('updateStudioService', () => {
    it('deve atualizar um estúdio com sucesso', async () => {
      const updateData = { studioName: 'Estúdio Atualizado' };
      const mockUpdatedStudio = { studioId: 1, studioName: 'Estúdio Atualizado', studioMaxCapacity: 25 };

      vi.mocked(prisma.studio.findUnique).mockResolvedValue({ studioId: 1 } as any);
      vi.mocked(prisma.studio.update).mockResolvedValue(mockUpdatedStudio as any);

      const response = await studiosServices.updateStudioService({ id: 1 }, updateData);

      expect(response).toMatchObject({
        studioId: 1,
        studioName: 'Estúdio Atualizado',
      });

      expect(prisma.studio.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { studioId: 1 },
      }));
    });

    it('deve lançar erro se o estúdio não for encontrado', async () => {
      const updateData = { studioName: 'Novo Nome' };

      vi.mocked(prisma.studio.findUnique).mockResolvedValue(null);

      await expect(studiosServices.updateStudioService({ id: 999 }, updateData))
        .rejects.toThrow('Estudio não encontrado.');
    });

    it('deve permitir atualizar apenas a capacidade', async () => {
      const updateData = { studioMaxCapacity: 35 };
      const mockUpdatedStudio = { studioId: 1, studioName: 'Estúdio A', studioMaxCapacity: 35 };

      vi.mocked(prisma.studio.findUnique).mockResolvedValue({ studioId: 1 } as any);
      vi.mocked(prisma.studio.update).mockResolvedValue(mockUpdatedStudio as any);

      const response = await studiosServices.updateStudioService({ id: 1 }, updateData);

      expect(response.studioMaxCapacity).toBe(35);
    });
  });

  describe('deleteStudioService', () => {
    it('deve apagar um estúdio com sucesso', async () => {
      vi.mocked(prisma.studio.findUnique).mockResolvedValue({ studioId: 1 } as any);
      vi.mocked(prisma.studio.delete).mockResolvedValue({ studioId: 1 } as any);

      const response = await studiosServices.deleteStudioService({ id: 1 });

      expect(response).toBeNull();
      expect(prisma.studio.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { studioId: 1 },
      }));
      expect(prisma.studio.delete).toHaveBeenCalledWith({ where: { studioId: 1 } });
    });

    it('deve lançar erro se o estúdio não for encontrado', async () => {
      vi.mocked(prisma.studio.findUnique).mockResolvedValue(null);

      await expect(studiosServices.deleteStudioService({ id: 999 }))
        .rejects.toThrow('Estudio não encontrado.');

      expect(prisma.studio.delete).not.toHaveBeenCalled();
    });
  });

  describe('getAvailableStudiosService', () => {
    it('deve retornar estúdios disponíveis para uma modalidade', async () => {
      const mockStudioModalities = [
        {
          studioModalityId: 1,
          studioId: 1,
          modalityId: 1,
          studio: { studioId: 1, studioName: 'Estúdio A', studioMaxCapacity: 20 },
          modality: { modalityId: 1, modalityDesc: 'Ballet' },
        },
      ];

      vi.mocked(prisma.studioModality.findMany).mockResolvedValue(mockStudioModalities as any);

      const response = await studiosServices.getAvailableStudiosService(1);

      expect(response).toEqual(mockStudioModalities);
      expect(prisma.studioModality.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { modalityId: 1 },
        include: expect.any(Object),
      }));
    });

    it('deve lançar erro se modalityId for indefinido', async () => {
      await expect(studiosServices.getAvailableStudiosService(undefined as any))
        .rejects.toThrow('modalityId é obrigatório.');
    });

    it('deve retornar lista vazia se não houver estúdios para a modalidade', async () => {
      vi.mocked(prisma.studioModality.findMany).mockResolvedValue([]);

      const response = await studiosServices.getAvailableStudiosService(999);

      expect(response).toEqual([]);
    });
  });
});
