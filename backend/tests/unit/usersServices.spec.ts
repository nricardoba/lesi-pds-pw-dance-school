import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as usersServices from '../../src/services/users/usersServices';
import { AppError } from '../../src/utils/appError';

vi.mock('../../src/config/db', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from '../../src/config/db';

const mockPrisma = prisma as any;

describe('Users Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listUsersService', () => {
    it('deve listar todos os usuários com relações completas', async () => {
      const mockUsers = [
        {
          userId: 1,
          userName: 'João Silva',
          userBirthDate: new Date('1990-05-15'),
          userStartDate: new Date('2024-01-15'),
          userTypeId: 2,
          userIsActive: true,
          userType: { userTypeId: 2, userTypeName: 'Aluno' },
          studentNumber: null,
          userNIF: null,
          userModality: [],
          userAddress: [],
          userContact: [],
        },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await usersServices.listUsersService();

      expect(result).toEqual(mockUsers);
      expect(mockPrisma.user.findMany).toHaveBeenCalled();
    });

    it('deve retornar lista vazia quando não há usuários', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);

      const result = await usersServices.listUsersService();

      expect(result).toEqual([]);
    });
  });

  describe('getUserByIdService', () => {
    it('deve retornar um usuário por ID com todas as relações', async () => {
      const mockUser = {
        userId: 1,
        userName: 'João Silva',
        userBirthDate: new Date('1990-05-15'),
        userStartDate: new Date('2024-01-15'),
        userTypeId: 2,
        userIsActive: true,
        userType: { userTypeId: 2, userTypeName: 'Aluno' },
        studentNumber: null,
        userNIF: null,
        userModality: [
          {
            userModalityId: 1,
            modality: { modalityId: 1, modalityName: 'Ballet' },
          },
        ],
        userAddress: [],
        userContact: [],
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await usersServices.getUserByIdService({ id: 1 });

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 1 },
        })
      );
    });

    it('deve lançar erro quando usuário não existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        usersServices.getUserByIdService({ id: 999 })
      ).rejects.toThrow(AppError);
    });

    it('deve lançar erro com mensagem correta', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        usersServices.getUserByIdService({ id: 999 })
      ).rejects.toThrow('Utilizador não encontrado.');
    });
  });

  describe('getMyProfileService', () => {
    it('deve retornar o perfil do usuário logado', async () => {
      const mockUser = {
        userId: 1,
        userName: 'João Silva',
        userBirthDate: new Date('1990-05-15'),
        userStartDate: new Date('2024-01-15'),
        userTypeId: 2,
        userIsActive: true,
        userType: { userTypeId: 2, userTypeName: 'Aluno' },
        studentNumber: null,
        userNIF: null,
        userModality: [],
        userAddress: [],
        userContact: [],
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await usersServices.getMyProfileService(1);

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalled();
    });
  });

  describe('getUsersByIdsService', () => {
    it('deve retornar múltiplos usuários por IDs', async () => {
      const mockUsers = [
        {
          userId: 1,
          userName: 'João Silva',
          userIsActive: true,
        },
        {
          userId: 2,
          userName: 'Maria Santos',
          userIsActive: true,
        },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await usersServices.getUsersByIdsService([1, 2]);

      expect(result).toEqual(mockUsers);
      expect(mockPrisma.user.findMany).toHaveBeenCalled();
    });

    it('deve retornar lista vazia quando nenhum ID é encontrado', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);

      const result = await usersServices.getUsersByIdsService([999, 1000]);

      expect(result).toEqual([]);
    });
  });

  describe('createUserService', () => {
    it('deve criar um usuário com sucesso', async () => {
      const inputData = {
        userName: 'João Silva',
        userBirthDate: '1990-05-15',
        userStartDate: '2024-01-15',
        userTypeId: 2,
        userIsActive: true,
      };

      const mockCreatedUser = {
        userId: 1,
        userName: 'João Silva',
        userBirthDate: new Date('1990-05-15'),
        userStartDate: new Date('2024-01-15'),
        userTypeId: 2,
        userIsActive: true,
        userType: { userTypeId: 2, userTypeName: 'Aluno' },
        studentNumber: null,
        userNIF: null,
        userModality: [],
        userAddress: [],
        userContact: [],
      };

      mockPrisma.user.create.mockResolvedValue(mockCreatedUser);
      mockPrisma.user.findUnique.mockResolvedValue(mockCreatedUser);

      const result = await usersServices.createUserService(inputData);

      expect(result).toEqual(mockCreatedUser);
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('deve lançar erro quando userName está vazio', async () => {
      const invalidData = {
        userName: '',
        userBirthDate: '1990-05-15',
        userStartDate: '2024-01-15',
        userTypeId: 2,
        userIsActive: true,
      };

      await expect(
        usersServices.createUserService(invalidData)
      ).rejects.toThrow();
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando userTypeId é inválido', async () => {
      const invalidData = {
        userName: 'João Silva',
        userBirthDate: '1990-05-15',
        userStartDate: '2024-01-15',
        userTypeId: -1,
        userIsActive: true,
      };

      await expect(
        usersServices.createUserService(invalidData)
      ).rejects.toThrow();
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando falta campo obrigatório', async () => {
      const invalidData = {
        userName: 'João Silva',
        userBirthDate: '1990-05-15',
      };

      await expect(
        usersServices.createUserService(invalidData)
      ).rejects.toThrow();
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('updateUserService', () => {
    it('deve atualizar um usuário com sucesso', async () => {
      const params = { id: 1 };
      const updateData = {
        userName: 'João Silva Atualizado',
      };

      mockPrisma.user.findUnique.mockResolvedValue({
        userId: 1,
      });

      const mockUpdatedUser = {
        userId: 1,
        userName: 'João Silva Atualizado',
        userBirthDate: new Date('1990-05-15'),
        userStartDate: new Date('2024-01-15'),
        userTypeId: 2,
        userIsActive: true,
        userType: { userTypeId: 2, userTypeName: 'Aluno' },
        studentNumber: null,
        userNIF: null,
        userModality: [],
        userAddress: [],
        userContact: [],
      };

      mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await usersServices.updateUserService(params, updateData);

      expect(result).toEqual(mockUpdatedUser);
      expect(mockPrisma.user.update).toHaveBeenCalled();
    });

    it('deve lançar erro ao atualizar usuário inexistente', async () => {
      const params = { id: 999 };
      const updateData = { userName: 'Novo Nome' };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        usersServices.updateUserService(params, updateData)
      ).rejects.toThrow(AppError);

      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('deve permitir atualização parcial do usuário', async () => {
      const params = { id: 1 };
      const updateData = {
        userIsActive: false,
      };

      mockPrisma.user.findUnique.mockResolvedValue({
        userId: 1,
      });

      const mockUpdatedUser = {
        userId: 1,
        userName: 'João Silva',
        userBirthDate: new Date('1990-05-15'),
        userStartDate: new Date('2024-01-15'),
        userTypeId: 2,
        userIsActive: false,
        userType: { userTypeId: 2, userTypeName: 'Aluno' },
        studentNumber: null,
        userNIF: null,
        userModality: [],
        userAddress: [],
        userContact: [],
      };

      mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await usersServices.updateUserService(params, updateData);

      expect(result.userIsActive).toBe(false);
    });
  });

  /* describe('deleteUserService', () => {
    it('deve deletar um usuário com sucesso', async () => {
      const params = { id: 1 };

      mockPrisma.user.findUnique.mockResolvedValue({
        userId: 1,
      });

      mockPrisma.user.delete.mockResolvedValue({
        userId: 1,
      });

      const result = await usersServices.deleteUserService(params);

      expect(result).toBeNull();
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });

    it('deve lançar erro ao deletar usuário inexistente', async () => {
      const params = { id: 999 };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        usersServices.deleteUserService(params)
      ).rejects.toThrow(AppError);

      expect(mockPrisma.user.delete).not.toHaveBeenCalled();
    });
  }); */
});
