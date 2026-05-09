import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  listUserClassRolesService,
  createUserClassRoleService,
  updateUserClassRoleService,
  deleteUserClassRoleService,
} from '../../src/services/users/userClassRolesServices';
import { prisma } from '../../src/config/db';

vi.mock('../../src/config/db', () => ({
  prisma: {
    userClassRole: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('User Class Roles Services - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRole = {
    userClassRoleId: 1,
    userClassRoleDesc: 'Professor Responsável',
  };

  describe('listUserClassRolesService', () => {
    it('deve listar os papéis de utilizador na aula com sucesso', async () => {
      const roles = [
        { userClassRoleId: 1, userClassRoleDesc: 'Professor Responsável' },
        { userClassRoleId: 2, userClassRoleDesc: 'Professor Assistente' },
        { userClassRoleId: 3, userClassRoleDesc: 'Aluno' },
      ];

      (prisma.userClassRole.findMany as any).mockResolvedValue(roles);

      const result = await listUserClassRolesService();

      expect(result).toEqual(roles);
      expect(prisma.userClassRole.findMany).toHaveBeenCalledWith({
        orderBy: { userClassRoleId: 'asc' },
      });
    });

    it('deve devolver array vazio se não existirem papéis', async () => {
      (prisma.userClassRole.findMany as any).mockResolvedValue([]);

      const result = await listUserClassRolesService();

      expect(result).toEqual([]);
    });
  });

  describe('createUserClassRoleService', () => {
    it('deve criar um papel de utilizador na aula com sucesso', async () => {
      const body = {
        userClassRoleDesc: 'Aluno',
      };

      const created = {
        userClassRoleId: 3,
        userClassRoleDesc: 'Aluno',
      };

      (prisma.userClassRole.create as any).mockResolvedValue(created);

      const result = await createUserClassRoleService(body);

      expect(result).toEqual(created);
      expect(prisma.userClassRole.create).toHaveBeenCalledWith({
        data: { userClassRoleDesc: 'Aluno' },
      });
    });

    it('deve lançar erro se a descrição estiver vazia', async () => {
      const body = {
        userClassRoleDesc: '',
      };

      await expect(createUserClassRoleService(body)).rejects.toThrow();

      expect(prisma.userClassRole.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro se a descrição estiver em falta', async () => {
      const body = {};

      await expect(createUserClassRoleService(body)).rejects.toThrow();

      expect(prisma.userClassRole.create).not.toHaveBeenCalled();
    });
  });

  describe('updateUserClassRoleService', () => {
    it('deve atualizar um papel de utilizador na aula com sucesso', async () => {
      const params = { id: 1 };
      const body = {
        userClassRoleDesc: 'Professor Principal',
      };

      const updated = {
        userClassRoleId: 1,
        userClassRoleDesc: 'Professor Principal',
      };

      (prisma.userClassRole.findUnique as any).mockResolvedValue({
        userClassRoleId: 1,
      });
      (prisma.userClassRole.update as any).mockResolvedValue(updated);

      const result = await updateUserClassRoleService(params, body);

      expect(result).toEqual(updated);
      expect(prisma.userClassRole.findUnique).toHaveBeenCalledWith({
        where: { userClassRoleId: 1 },
        select: { userClassRoleId: true },
      });
      expect(prisma.userClassRole.update).toHaveBeenCalledWith({
        where: { userClassRoleId: 1 },
        data: {
          userClassRoleDesc: 'Professor Principal',
        },
      });
    });

    it('deve atualizar sem alterar descrição quando o body vem vazio', async () => {
      const params = { id: 1 };
      const body = {};

      (prisma.userClassRole.findUnique as any).mockResolvedValue({
        userClassRoleId: 1,
      });
      (prisma.userClassRole.update as any).mockResolvedValue(mockRole);

      const result = await updateUserClassRoleService(params, body);

      expect(result).toEqual(mockRole);
      expect(prisma.userClassRole.update).toHaveBeenCalledWith({
        where: { userClassRoleId: 1 },
        data: {},
      });
    });

    it('deve lançar erro se o papel não existir ao atualizar', async () => {
      const params = { id: 999 };
      const body = {
        userClassRoleDesc: 'Inexistente',
      };

      (prisma.userClassRole.findUnique as any).mockResolvedValue(null);

      await expect(updateUserClassRoleService(params, body)).rejects.toMatchObject({
        message: 'Papel de utilizador na aula não encontrado.',
        statusCode: 404,
      });

      expect(prisma.userClassRole.update).not.toHaveBeenCalled();
    });

    it('deve lançar erro se o id for inválido ao atualizar', async () => {
      const params = { id: 'abc' };
      const body = {
        userClassRoleDesc: 'Professor',
      };

      await expect(updateUserClassRoleService(params, body)).rejects.toThrow();

      expect(prisma.userClassRole.findUnique).not.toHaveBeenCalled();
      expect(prisma.userClassRole.update).not.toHaveBeenCalled();
    });

    it('deve lançar erro se a descrição enviada for vazia ao atualizar', async () => {
      const params = { id: 1 };
      const body = {
        userClassRoleDesc: '',
      };

      await expect(updateUserClassRoleService(params, body)).rejects.toThrow();

      expect(prisma.userClassRole.findUnique).not.toHaveBeenCalled();
      expect(prisma.userClassRole.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteUserClassRoleService', () => {
    it('deve apagar um papel de utilizador na aula com sucesso', async () => {
      const params = { id: 1 };

      (prisma.userClassRole.findUnique as any).mockResolvedValue({
        userClassRoleId: 1,
      });
      (prisma.userClassRole.delete as any).mockResolvedValue(mockRole);

      const result = await deleteUserClassRoleService(params);

      expect(result).toBeNull();
      expect(prisma.userClassRole.findUnique).toHaveBeenCalledWith({
        where: { userClassRoleId: 1 },
        select: { userClassRoleId: true },
      });
      expect(prisma.userClassRole.delete).toHaveBeenCalledWith({
        where: { userClassRoleId: 1 },
      });
    });

    it('deve lançar erro se o papel não existir ao apagar', async () => {
      const params = { id: 999 };

      (prisma.userClassRole.findUnique as any).mockResolvedValue(null);

      await expect(deleteUserClassRoleService(params)).rejects.toMatchObject({
        message: 'Papel de utilizador na aula não encontrado.',
        statusCode: 404,
      });

      expect(prisma.userClassRole.delete).not.toHaveBeenCalled();
    });

    it('deve lançar erro se o id for inválido ao apagar', async () => {
      const params = { id: 'abc' };

      await expect(deleteUserClassRoleService(params)).rejects.toThrow();

      expect(prisma.userClassRole.findUnique).not.toHaveBeenCalled();
      expect(prisma.userClassRole.delete).not.toHaveBeenCalled();
    });
  });
});