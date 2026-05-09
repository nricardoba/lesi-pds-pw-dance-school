import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  upsertUserNifService,
  deleteUserNifService,
} from '../../src/services/users/userNifServices';
import { prisma } from '../../src/config/db';

vi.mock('../../src/config/db', () => ({
  prisma: {
    userNIF: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe('User NIFs Services - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('upsertUserNifService', () => {
    it('deve criar ou atualizar um NIF com sucesso', async () => {
      const params = { id: 1 };
      const body = { userNif: '123456789' };

      const mockNif = {
        userId: 1,
        userNif: '123456789',
      };

      (prisma.user.findUnique as any).mockResolvedValue({ userId: 1 });
      (prisma.userNIF.upsert as any).mockResolvedValue(mockNif);

      const result = await upsertUserNifService(params, body);

      expect(result).toEqual(mockNif);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(prisma.userNIF.upsert).toHaveBeenCalled();
    });

    it('deve lançar erro se utilizador não existe', async () => {
      const params = { id: 99999 };
      const body = { userNif: '123456789' };

      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(upsertUserNifService(params, body)).rejects.toThrow();
    });
  });

  describe('deleteUserNifService', () => {
    it('deve deletar um NIF com sucesso', async () => {
      const params = { id: 1 };

      (prisma.userNIF.delete as any).mockResolvedValue({
        userId: 1,
        userNif: '123456789',
      });

      const result = await deleteUserNifService(params);

      expect(result).toMatchObject({
        message: 'NIF apagado com sucesso.',
      });

      expect(prisma.userNIF.delete).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });

    it('deve lançar erro se o NIF não existir', async () => {
  const params = { id: 99999 };

  (prisma.userNIF.delete as any).mockRejectedValue(new Error('Not found'));

  await expect(deleteUserNifService(params)).rejects.toMatchObject({
    message: 'Registo de NIF não encontrado.',
    statusCode: 404,
  });
});
  });
});