import { describe, it, expect, beforeEach, vi } from 'vitest';
import { listUserTypesService } from '../../src/services/users/userTypesServices';
import { prisma } from '../../src/config/db';

vi.mock('../../src/config/db', () => ({
  prisma: {
    userType: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('User Types Services - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listUserTypesService', () => {
    it('deve listar todos os tipos de utilizador com sucesso', async () => {
      const mockUserTypes = [
        { userTypeId: 1, userTypeDesc: 'Admin' },
        { userTypeId: 2, userTypeDesc: 'Student' },
      ];

      (prisma.userType.findMany as any).mockResolvedValue(mockUserTypes);
      const result = await listUserTypesService();

      expect(result).toEqual(mockUserTypes);
      expect(prisma.userType.findMany).toHaveBeenCalled();
    });

    it('deve retornar array vazio se não houver tipos de utilizador', async () => {
      (prisma.userType.findMany as any).mockResolvedValue([]);
      const result = await listUserTypesService();

      expect(result).toEqual([]);
    });
  });
});
