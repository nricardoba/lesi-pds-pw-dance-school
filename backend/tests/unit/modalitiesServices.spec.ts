import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as modalitiesServices from '../../src/services/studios/modalitiesServices';
import { prisma } from '../../src/config/db';
import { AppError } from '../../src/utils/appError';

vi.mock('../../src/config/db', () => ({
  prisma: {
    modality: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('Modalities Services - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listModalitiesService', () => {
    it('deve listar todas as modalidades com sucesso', async () => {
      const mockModalities = [
        { modalityId: 1, modalityName: 'Ballet', modalityHourlyFee: 25 },
        { modalityId: 2, modalityName: 'Hip Hop', modalityHourlyFee: 20 },
      ];

      vi.mocked(prisma.modality.findMany).mockResolvedValue(mockModalities as any);

      const response = await modalitiesServices.listModalitiesService();

      expect(response).toEqual(mockModalities);
      expect(prisma.modality.findMany).toHaveBeenCalledWith({ orderBy: { modalityId: 'asc' } });
    });

    it('deve retornar uma lista vazia se não houver modalidades', async () => {
      vi.mocked(prisma.modality.findMany).mockResolvedValue([]);

      const response = await modalitiesServices.listModalitiesService();

      expect(response).toEqual([]);
    });
  });

  describe('getModalityByIdService', () => {
    it('deve retornar uma modalidade por ID com sucesso', async () => {
      const mockModality = { modalityId: 1, modalityName: 'Ballet', modalityHourlyFee: 25 };

      vi.mocked(prisma.modality.findUnique).mockResolvedValue(mockModality as any);

      const response = await modalitiesServices.getModalityByIdService({ id: 1 });

      expect(response).toEqual(mockModality);
      expect(prisma.modality.findUnique).toHaveBeenCalledWith({
        where: { modalityId: 1 },
      });
    });

    it('deve lançar erro se a modalidade não for encontrada', async () => {
      vi.mocked(prisma.modality.findUnique).mockResolvedValue(null);

      await expect(modalitiesServices.getModalityByIdService({ id: 999 }))
        .rejects.toThrow('Modalidade não encontrada.');
    });
  });

  describe('createModalityService', () => {
    it('deve criar uma modalidade com sucesso', async () => {
      const validPayload = { modalityName: 'Contemporâneo', modalityHourlyFee: 30 };
      const mockCreatedModality = { modalityId: 1, ...validPayload };

      vi.mocked(prisma.modality.create).mockResolvedValue(mockCreatedModality as any);

      const response = await modalitiesServices.createModalityService(validPayload);

      expect(response).toMatchObject({
        modalityId: 1,
        modalityName: 'Contemporâneo',
        modalityHourlyFee: 30,
      });

      expect(prisma.modality.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.any(Object),
      }));
    });

    it('deve lançar erro se o nome estiver vazio', async () => {
      const invalidPayload = { modalityName: '', modalityHourlyFee: 25 };

      await expect(modalitiesServices.createModalityService(invalidPayload))
        .rejects.toThrow();
    });

    it('deve lançar erro se faltar dados obrigatórios', async () => {
      const invalidPayload = { modalityName: 'Ballet' }; // Faltando modalityHourlyFee

      await expect(modalitiesServices.createModalityService(invalidPayload))
        .rejects.toThrow();
    });
  });

  describe('updateModalityService', () => {
    it('deve atualizar uma modalidade com sucesso', async () => {
      const updateData = { modalityName: 'Ballet Clássico' };
      const mockUpdatedModality = { modalityId: 1, modalityName: 'Ballet Clássico', modalityHourlyFee: 25 };

      vi.mocked(prisma.modality.findUnique).mockResolvedValue({ modalityId: 1 } as any);
      vi.mocked(prisma.modality.update).mockResolvedValue(mockUpdatedModality as any);

      const response = await modalitiesServices.updateModalityService({ id: 1 }, updateData);

      expect(response).toMatchObject({
        modalityId: 1,
        modalityName: 'Ballet Clássico',
      });

      expect(prisma.modality.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { modalityId: 1 },
      }));
    });

    it('deve lançar erro se a modalidade não for encontrada', async () => {
      const updateData = { modalityHourlyFee: 35 };

      vi.mocked(prisma.modality.findUnique).mockResolvedValue(null);

      await expect(modalitiesServices.updateModalityService({ id: 999 }, updateData))
        .rejects.toThrow('Modalidade não encontrada.');
    });

    it('deve permitir atualizar apenas a taxa horária', async () => {
      const updateData = { modalityHourlyFee: 40 };
      const mockUpdatedModality = { modalityId: 1, modalityName: 'Ballet', modalityHourlyFee: 40 };

      vi.mocked(prisma.modality.findUnique).mockResolvedValue({ modalityId: 1 } as any);
      vi.mocked(prisma.modality.update).mockResolvedValue(mockUpdatedModality as any);

      const response = await modalitiesServices.updateModalityService({ id: 1 }, updateData);

      expect(response.modalityHourlyFee).toBe(40);
    });
  });

  describe('deleteModalityService', () => {
    it('deve apagar uma modalidade com sucesso', async () => {
      vi.mocked(prisma.modality.findUnique).mockResolvedValue({ modalityId: 1 } as any);
      vi.mocked(prisma.modality.delete).mockResolvedValue({ modalityId: 1 } as any);

      const response = await modalitiesServices.deleteModalityService({ id: 1 });

      expect(response).toBeNull();
      expect(prisma.modality.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { modalityId: 1 },
      }));
      expect(prisma.modality.delete).toHaveBeenCalledWith({ where: { modalityId: 1 } });
    });

    it('deve lançar erro se a modalidade não for encontrada', async () => {
      vi.mocked(prisma.modality.findUnique).mockResolvedValue(null);

      await expect(modalitiesServices.deleteModalityService({ id: 999 }))
        .rejects.toThrow('Modalidade não encontrada.');

      expect(prisma.modality.delete).not.toHaveBeenCalled();
    });
  });
});
