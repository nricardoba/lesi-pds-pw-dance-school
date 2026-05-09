import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createRentalService,
  returnRentalService,
  listRentalsService,
  getRentalByIdService,
  deleteRentalService,
} from '../../src/services/inventory/rentalsServices';
import { prisma } from '../../src/config/db';

vi.mock('../../src/config/db', () => ({
  prisma: {
    schoolItem: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    rentItem: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('Rentals Services - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createRentalService', () => {
    it('deve criar um aluguer com sucesso', async () => {
      const body = {
        userId: 1,
        itemId: 10,
        rentDateStart: '2026-05-01T10:00:00.000Z',
        rentDateEnd: '2026-05-08T10:00:00.000Z',
      };

      const mockRental = {
        rentId: 1,
        userId: 1,
        itemId: 10,
        rentDateStart: new Date(body.rentDateStart),
        rentDateEnd: new Date(body.rentDateEnd),
        actualRentDateEnd: null,
        itemDamaged: null,
      };

      (prisma.schoolItem.findUnique as any).mockResolvedValue({ itemId: 10 });
      (prisma.user.findUnique as any).mockResolvedValue({ userId: 1 });
      (prisma.rentItem.findFirst as any).mockResolvedValue(null);
      (prisma.rentItem.create as any).mockResolvedValue(mockRental);

      const result = await createRentalService(body);

      expect(result).toEqual(mockRental);
      expect(prisma.schoolItem.findUnique).toHaveBeenCalledWith({
        where: { itemId: 10 },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(prisma.rentItem.findFirst).toHaveBeenCalledWith({
        where: {
          itemId: 10,
          actualRentDateEnd: null,
        },
      });
      expect(prisma.rentItem.create).toHaveBeenCalled();
    });

    it('deve lançar erro se o item não existir', async () => {
      const body = {
        userId: 1,
        itemId: 999,
        rentDateStart: '2026-05-01T10:00:00.000Z',
        rentDateEnd: '2026-05-08T10:00:00.000Z',
      };

      (prisma.schoolItem.findUnique as any).mockResolvedValue(null);

      await expect(createRentalService(body)).rejects.toMatchObject({
        message: 'Item não encontrado.',
        statusCode: 404,
      });

      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(prisma.rentItem.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro se o utilizador não existir', async () => {
      const body = {
        userId: 999,
        itemId: 10,
        rentDateStart: '2026-05-01T10:00:00.000Z',
        rentDateEnd: '2026-05-08T10:00:00.000Z',
      };

      (prisma.schoolItem.findUnique as any).mockResolvedValue({ itemId: 10 });
      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(createRentalService(body)).rejects.toMatchObject({
        message: 'Utilizador não encontrado.',
        statusCode: 404,
      });

      expect(prisma.rentItem.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro se o item já estiver alugado', async () => {
      const body = {
        userId: 1,
        itemId: 10,
        rentDateStart: '2026-05-01T10:00:00.000Z',
        rentDateEnd: '2026-05-08T10:00:00.000Z',
      };

      (prisma.schoolItem.findUnique as any).mockResolvedValue({ itemId: 10 });
      (prisma.user.findUnique as any).mockResolvedValue({ userId: 1 });
      (prisma.rentItem.findFirst as any).mockResolvedValue({
        rentId: 1,
        itemId: 10,
        actualRentDateEnd: null,
      });

      await expect(createRentalService(body)).rejects.toMatchObject({
        message: 'O item já se encontra alugado.',
        statusCode: 400,
      });

      expect(prisma.rentItem.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro se os dados forem inválidos', async () => {
      const body = {
        userId: 'abc',
        itemId: 10,
        rentDateStart: 'data-invalida',
        rentDateEnd: '2026-05-08T10:00:00.000Z',
      };

      await expect(createRentalService(body)).rejects.toThrow();
      expect(prisma.schoolItem.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('returnRentalService', () => {
    it('deve devolver um aluguer com sucesso', async () => {
      const params = { id: 1 };
      const body = {
        actualRentDateEnd: '2026-05-07T10:00:00.000Z',
        itemDamaged: true,
      };

      const existingRental = {
        rentId: 1,
        userId: 1,
        itemId: 10,
      };

      const updatedRental = {
        ...existingRental,
        actualRentDateEnd: new Date(body.actualRentDateEnd),
        itemDamaged: true,
      };

      (prisma.rentItem.findUnique as any).mockResolvedValue(existingRental);
      (prisma.rentItem.update as any).mockResolvedValue(updatedRental);

      const result = await returnRentalService(params, body);

      expect(result).toEqual(updatedRental);
      expect(prisma.rentItem.findUnique).toHaveBeenCalledWith({
        where: { rentId: 1 },
      });
      expect(prisma.rentItem.update).toHaveBeenCalledWith({
        where: { rentId: 1 },
        data: {
          actualRentDateEnd: new Date(body.actualRentDateEnd),
          itemDamaged: true,
        },
      });
    });

    it('deve devolver aluguer com itemDamaged false por defeito', async () => {
      const params = { id: 1 };
      const body = {
        actualRentDateEnd: '2026-05-07T10:00:00.000Z',
      };

      (prisma.rentItem.findUnique as any).mockResolvedValue({
        rentId: 1,
        userId: 1,
        itemId: 10,
      });

      (prisma.rentItem.update as any).mockResolvedValue({
        rentId: 1,
        actualRentDateEnd: new Date(body.actualRentDateEnd),
        itemDamaged: false,
      });

      const result = await returnRentalService(params, body);

      expect(result).toBeDefined();
      expect(prisma.rentItem.update).toHaveBeenCalledWith({
        where: { rentId: 1 },
        data: {
          actualRentDateEnd: new Date(body.actualRentDateEnd),
          itemDamaged: false,
        },
      });
    });

    it('deve lançar erro se o aluguer não existir ao devolver', async () => {
      const params = { id: 999 };
      const body = {
        actualRentDateEnd: '2026-05-07T10:00:00.000Z',
      };

      (prisma.rentItem.findUnique as any).mockResolvedValue(null);

      await expect(returnRentalService(params, body)).rejects.toMatchObject({
        message: 'Aluguer não encontrado.',
        statusCode: 404,
      });

      expect(prisma.rentItem.update).not.toHaveBeenCalled();
    });

    it('deve lançar erro se os dados da devolução forem inválidos', async () => {
      const params = { id: 1 };
      const body = {
        actualRentDateEnd: 'data-invalida',
      };

      await expect(returnRentalService(params, body)).rejects.toThrow();
      expect(prisma.rentItem.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('listRentalsService', () => {
    it('deve listar todos os alugueres com sucesso', async () => {
      const mockRentals = [
        {
          rentId: 1,
          userId: 1,
          itemId: 10,
        },
        {
          rentId: 2,
          userId: 2,
          itemId: 11,
        },
      ];

      (prisma.rentItem.findMany as any).mockResolvedValue(mockRentals);

      const result = await listRentalsService();

      expect(result).toEqual(mockRentals);
      expect(prisma.rentItem.findMany).toHaveBeenCalled();
    });

    it('deve devolver array vazio quando não existem alugueres', async () => {
      (prisma.rentItem.findMany as any).mockResolvedValue([]);

      const result = await listRentalsService();

      expect(result).toEqual([]);
    });
  });

  describe('getRentalByIdService', () => {
    it('deve obter um aluguer por ID com sucesso', async () => {
      const params = { id: 1 };

      const mockRental = {
        rentId: 1,
        userId: 1,
        itemId: 10,
      };

      (prisma.rentItem.findUnique as any).mockResolvedValue(mockRental);

      const result = await getRentalByIdService(params);

      expect(result).toEqual(mockRental);
      expect(prisma.rentItem.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { rentId: 1 },
        })
      );
    });

    it('deve lançar erro se o aluguer não existir', async () => {
      const params = { id: 999 };

      (prisma.rentItem.findUnique as any).mockResolvedValue(null);

      await expect(getRentalByIdService(params)).rejects.toMatchObject({
        message: 'Aluguer não encontrado.',
        statusCode: 404,
      });
    });
  });

  describe('deleteRentalService', () => {
    it('deve apagar um aluguer com sucesso', async () => {
      const params = { id: 1 };

      (prisma.rentItem.findUnique as any).mockResolvedValue({
        rentId: 1,
      });

      (prisma.rentItem.delete as any).mockResolvedValue({
        rentId: 1,
      });

      const result = await deleteRentalService(params);

      expect(result).toBeUndefined();
      expect(prisma.rentItem.findUnique).toHaveBeenCalledWith({
        where: { rentId: 1 },
      });
      expect(prisma.rentItem.delete).toHaveBeenCalledWith({
        where: { rentId: 1 },
      });
    });

    it('deve lançar erro se o aluguer não existir ao apagar', async () => {
      const params = { id: 999 };

      (prisma.rentItem.findUnique as any).mockResolvedValue(null);

      await expect(deleteRentalService(params)).rejects.toMatchObject({
        message: 'Aluguer não encontrado.',
        statusCode: 404,
      });

      expect(prisma.rentItem.delete).not.toHaveBeenCalled();
    });

    it('deve lançar erro se o ID for inválido', async () => {
      const params = { id: 'abc' };

      await expect(deleteRentalService(params)).rejects.toThrow();
      expect(prisma.rentItem.findUnique).not.toHaveBeenCalled();
    });
  });
});