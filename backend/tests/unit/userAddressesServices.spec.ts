import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  addUserAddressService,
  deleteUserAddressService,
} from '../../src/services/users/userAddressesServices';
import { prisma } from '../../src/config/db';

vi.mock('../../src/config/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    locality: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    postalCode: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    address: {
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    userAddress: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('User Addresses Services - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addUserAddressService', () => {
    it('deve adicionar um endereço com sucesso', async () => {
      const params = { id: 1 };
      const body = {
        streetName: 'Rua A',
        postalCode: '1000-001',
        localityName: 'Lisboa',
        isMainAddress: false,
      };

      (prisma.user.findUnique as any).mockResolvedValue({ userId: 1 });

      (prisma.locality.findFirst as any).mockResolvedValue(null);
      (prisma.locality.create as any).mockResolvedValue({
        localityId: 1,
        localityName: 'Lisboa',
      });

      (prisma.postalCode.findUnique as any).mockResolvedValue(null);
      (prisma.postalCode.create as any).mockResolvedValue({
        postalCode: '1000-001',
        localityId: 1,
      });

      (prisma.address.findFirst as any).mockResolvedValue(null);
      (prisma.address.create as any).mockResolvedValue({
        streetId: 1,
        streetName: 'Rua A',
        postalCode: '1000-001',
      });

      (prisma.userAddress.create as any).mockResolvedValue({
        userAddressId: 1,
        userId: 1,
        streetId: 1,
        isMainAddress: false,
      });

      const result = await addUserAddressService(params, body);

      expect(result).toBeDefined();
      expect(prisma.user.findUnique).toHaveBeenCalled();
      expect(prisma.locality.findFirst).toHaveBeenCalled();
      expect(prisma.postalCode.findUnique).toHaveBeenCalled();
      expect(prisma.address.findFirst).toHaveBeenCalled();
      expect(prisma.userAddress.create).toHaveBeenCalled();
    });

    it('deve lançar erro se utilizador não existe', async () => {
      const params = { id: 99999 };
      const body = {
        streetName: 'Rua A',
        postalCode: '1000-001',
        localityName: 'Lisboa',
        isMainAddress: false,
      };

      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(addUserAddressService(params, body)).rejects.toThrow();
    });
  });

  describe('deleteUserAddressService', () => {
    it('deve remover um endereço com sucesso', async () => {
      const params = { id: 1, userAddressId: 1 };

      (prisma.userAddress.findUnique as any).mockResolvedValue({
        userAddressId: 1,
        userId: 1,
        streetId: 1,
      });

      (prisma.userAddress.delete as any).mockResolvedValue({
        userAddressId: 1,
        userId: 1,
        streetId: 1,
      });

      (prisma.userAddress.count as any).mockResolvedValue(0);

      (prisma.address.delete as any).mockResolvedValue({
        streetId: 1,
      });

      await deleteUserAddressService(params);

      expect(prisma.userAddress.findUnique).toHaveBeenCalled();
      expect(prisma.userAddress.delete).toHaveBeenCalled();
    });

    it('deve lançar erro ao remover endereço inexistente', async () => {
      const params = { id: 1, userAddressId: 99999 };

      (prisma.userAddress.findUnique as any).mockResolvedValue(null);

      await expect(deleteUserAddressService(params)).rejects.toThrow();
    });

    it('deve lançar erro se userAddressId estiver em falta', async () => {
      const params = { id: 1 };

      await expect(deleteUserAddressService(params)).rejects.toThrow(
        'userAddressId em falta.'
      );
    });
  });
});