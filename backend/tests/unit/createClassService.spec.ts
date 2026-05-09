import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as classServices from '../../src/services/classes/classesServices';
import { prisma } from '../../src/config/db';
import { AppError } from '../../src/utils/appError';

vi.mock('../../src/config/db', () => ({
  prisma: {
    class: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    studioModality: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    schoolYear: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    userClass: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    userClassRole: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe('Class Services - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createClassService', () => {
    it('deve criar uma aula com sucesso', async () => {
      const validPayload = {
        schoolYearId: 1,
        classDateStart: new Date('2023-09-01T10:00:00Z').toISOString(),
        classDateEnd: new Date('2023-09-01T11:00:00Z').toISOString(),
        classRecurrence: false,
        studioModalityId: 1,
        classFinalFee: 100,
        classStatusId: 1,
      };

      const mockCreatedClass = {
        ...validPayload,
        classId: 1,
        classStatus: {},
        schoolYear: {},
        studioModality: { modality: {}, studio: {} },
      };

      vi.mocked(prisma.schoolYear.findUnique).mockResolvedValue({ schoolYearId: 1 } as any);
      vi.mocked(prisma.class.create).mockResolvedValue(mockCreatedClass as any);

      const response = await classServices.createClassService(validPayload);

      expect(response).toMatchObject({
        schoolYearId: 1,
        classFinalFee: 100,
        classId: 1,
      });

      expect(prisma.class.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.any(Object),
        include: expect.any(Object),
      }));
    });

    it('deve lançar erro se faltar algum dado necessário', async () => {
      const invalidData = { classDateStart: '2023-09-01T10:00:00Z' }; // Faltando outros dados

      await expect(classServices.createClassService(invalidData)).rejects.toThrow(
        'Dados obrigatórios ausentes'
      );
      expect(prisma.class.create).not.toHaveBeenCalled();
    });
  });

  describe('updateClassService', () => {
    it('deve atualizar a aula com sucesso', async () => {
      const updatedData = { classDateStart: new Date('2023-09-02T10:00:00Z').toISOString(), classDateEnd: new Date('2023-09-02T11:00:00Z').toISOString() };
      const mockClass = { classId: 1, ...updatedData, userClass: [] };

      vi.mocked(prisma.class.findUnique).mockResolvedValue(mockClass as any);
      vi.mocked(prisma.userClassRole.findFirst).mockResolvedValue({ userClassRoleId: 1 } as any);
      
      // Mock $transaction to execute the callback immediately and return the result
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return callback({
          class: {
            update: vi.fn().mockResolvedValue(mockClass),
            findUnique: vi.fn().mockResolvedValue(mockClass),
          },
          userClass: {
            deleteMany: vi.fn(),
            create: vi.fn(),
          },
        } as any);
      });

      const response = await classServices.updateClassService({ id: 1 }, updatedData);

      expect(response).toMatchObject({
        classId: 1,
      });

      expect(prisma.class.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { classId: 1 },
      }));
    });

    it('deve lançar erro se a aula não for encontrada', async () => {
      const updatedData = { classDateStart: new Date('2023-09-02T10:00:00Z').toISOString(), classDateEnd: new Date('2023-09-02T11:00:00Z').toISOString() };

      vi.mocked(prisma.class.findUnique).mockResolvedValue(null);

      await expect(classServices.updateClassService({ id: 999 }, updatedData)).rejects.toThrow('Aula não encontrada.');
    });
  });

  describe('getClassByIdService', () => {
    it('deve retornar a aula com sucesso', async () => {
      const mockClass = { 
        classId: 1, 
        classDateStart: '2023-09-01T10:00:00Z',
        classStatus: {},
        schoolYear: {},
        studioModality: { modality: {}, studio: {} },
        userClass: [],
      };

      vi.mocked(prisma.class.findUnique).mockResolvedValue(mockClass as any);

      const response = await classServices.getClassByIdService({ id: 1 });

      expect(response).toMatchObject(mockClass);
      expect(prisma.class.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { classId: 1 },
        include: expect.any(Object),
      }));
    });

    it('deve lançar erro se a aula não for encontrada', async () => {
      vi.mocked(prisma.class.findUnique).mockResolvedValue(null);

      await expect(classServices.getClassByIdService({ id: 999 })).rejects.toThrow('Aula não encontrada.');
    });
  });

  describe('deleteClassService', () => {
    it('deve excluir a aula com sucesso', async () => {
      const mockClass = { classId: 1 };

      vi.mocked(prisma.class.findUnique).mockResolvedValue(mockClass as any);
      vi.mocked(prisma.class.delete).mockResolvedValue(mockClass as any);

      const response = await classServices.deleteClassService({ id: 1 });

      expect(response).toBeNull();
      expect(prisma.class.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { classId: 1 },
      }));
      expect(prisma.class.delete).toHaveBeenCalledWith({ where: { classId: 1 } });
    });

    it('deve lançar erro se a aula não for encontrada', async () => {
      vi.mocked(prisma.class.findUnique).mockResolvedValue(null);

      await expect(classServices.deleteClassService({ id: 999 })).rejects.toThrow('Aula não encontrada.');
    });
  });

  describe('addUserToClassService', () => {
    it('deve adicionar um utilizador à aula com sucesso', async () => {
      const validPayload = { userId: 2, userClassRoleId: 1, userValidation: true };
      const mockClass = { classId: 1, userClass: [] };
      const mockUserClass = { classId: 1, userId: 2, userClassRoleId: 1, userValidation: true, user: { userId: 2 }, class: mockClass, userClassRole: { userClassRoleId: 1 } };

      vi.mocked(prisma.class.findUnique).mockResolvedValue(mockClass as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ userId: 2 } as any);
      vi.mocked(prisma.userClass.create).mockResolvedValue(mockUserClass as any);

      const response = await classServices.addUserToClassService({ id: 1 }, validPayload);

      expect(response).toMatchObject(mockUserClass);
      expect(prisma.userClass.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining(validPayload),
      }));
    });

    it('deve lançar erro se a aula não for encontrada', async () => {
      const validPayload = { userId: 2, userClassRoleId: 1, userValidation: true };

      vi.mocked(prisma.class.findUnique).mockResolvedValue(null);

      await expect(classServices.addUserToClassService({ id: 999 }, validPayload)).rejects.toThrow('Aula não encontrada.');
    });

    it('deve lançar erro se o utilizador não for encontrado', async () => {
      const validPayload = { userId: 2, userClassRoleId: 1, userValidation: true };

      vi.mocked(prisma.class.findUnique).mockResolvedValue({ classId: 1 } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(classServices.addUserToClassService({ id: 1 }, validPayload)).rejects.toThrow('Utilizador não encontrado.');
    });
  });

});