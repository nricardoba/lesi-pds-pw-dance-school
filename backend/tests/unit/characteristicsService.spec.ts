import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createItemCharacteristicsService,
  updateItemCharacteristicsService,
  listItemCharacteristicsService,
  getItemCharacteristicsByIdService,
  deleteItemCharacteristicsService,
  addItemImageService,
  removeItemImageService,
} from '../../src/services/inventory/characteristicsServices';
import { prisma } from '../../src/config/db';

vi.mock('../../src/config/db', () => ({
  prisma: {
    itemCharacteristics: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
    itemImage: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    itemCharacteristicsDanceType: {
      deleteMany: vi.fn(),
    },
  },
}));

describe('Item Characteristics Services - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCharacteristic = {
    itemCharacteristicsId: 1,
    itemCharacteristicsName: 'Vestido de Dança',
    categoryId: 1,
    colorId: 1,
    sizeId: 1,
    category: { categoryId: 1, categoryName: 'Roupa' },
    color: { colorId: 1, colorName: 'Vermelho' },
    size: { sizeId: 1, sizeName: 'M' },
    itemCharacteristicsDanceType: [],
    itemImage: [],
  };

  describe('createItemCharacteristicsService', () => {
    it('deve criar características de item com sucesso sem imagens nem tipos de dança', async () => {
      const body = {
        name: 'Vestido de Dança',
        categoryId: 1,
        colorId: 1,
        sizeId: 1,
      };

      (prisma.itemCharacteristics.create as any).mockResolvedValue(mockCharacteristic);

      const result = await createItemCharacteristicsService(body);

      expect(result).toEqual(mockCharacteristic);
      expect(prisma.itemCharacteristics.create).toHaveBeenCalledWith({
        data: {
          itemCharacteristicsName: 'Vestido de Dança',
          category: { connect: { categoryId: 1 } },
          color: { connect: { colorId: 1 } },
          size: { connect: { sizeId: 1 } },
        },
        include: {
          itemCharacteristicsDanceType: true,
          itemImage: true,
          category: true,
          color: true,
          size: true,
        },
      });
    });

    it('deve criar características de item com imagens e tipos de dança', async () => {
      const body = {
        name: 'Saia de Ballet',
        categoryId: 1,
        colorId: 2,
        sizeId: 3,
        danceTypeIds: [1, 2],
        images: ['imagem1.jpg', 'imagem2.jpg'],
      };

      const created = {
        ...mockCharacteristic,
        itemCharacteristicsName: 'Saia de Ballet',
        itemImage: [
          { itemImageId: 1, itemImageUrl: 'imagem1.jpg', itemImageIsMain: true },
          { itemImageId: 2, itemImageUrl: 'imagem2.jpg', itemImageIsMain: false },
        ],
        itemCharacteristicsDanceType: [
          { danceTypeId: 1 },
          { danceTypeId: 2 },
        ],
      };

      (prisma.itemCharacteristics.create as any).mockResolvedValue(created);

      const result = await createItemCharacteristicsService(body);

      expect(result).toEqual(created);
      expect(prisma.itemCharacteristics.create).toHaveBeenCalledWith({
        data: {
          itemCharacteristicsName: 'Saia de Ballet',
          category: { connect: { categoryId: 1 } },
          color: { connect: { colorId: 2 } },
          size: { connect: { sizeId: 3 } },
          itemCharacteristicsDanceType: {
            create: [
              { danceTypeId: 1 },
              { danceTypeId: 2 },
            ],
          },
          itemImage: {
            create: [
              { itemImageUrl: 'imagem1.jpg', itemImageIsMain: true },
              { itemImageUrl: 'imagem2.jpg', itemImageIsMain: false },
            ],
          },
        },
        include: {
          itemCharacteristicsDanceType: true,
          itemImage: true,
          category: true,
          color: true,
          size: true,
        },
      });
    });
  });

  describe('updateItemCharacteristicsService', () => {
    it('deve atualizar características de item com sucesso', async () => {
      const updateData = {
        name: 'Vestido Atualizado',
        categoryId: 2,
        colorId: 3,
        sizeId: 4,
      };

      const updated = {
        ...mockCharacteristic,
        itemCharacteristicsName: 'Vestido Atualizado',
      };

      (prisma.itemCharacteristics.findUnique as any).mockResolvedValue(mockCharacteristic);
      (prisma.itemCharacteristics.update as any).mockResolvedValue(updated);

      const result = await updateItemCharacteristicsService(1, updateData);

      expect(result).toEqual(updated);
      expect(prisma.itemCharacteristics.findUnique).toHaveBeenCalledWith({
        where: { itemCharacteristicsId: 1 },
      });
      expect(prisma.itemCharacteristics.update).toHaveBeenCalledWith({
        where: { itemCharacteristicsId: 1 },
        data: {
          itemCharacteristicsName: 'Vestido Atualizado',
          category: { connect: { categoryId: 2 } },
          color: { connect: { colorId: 3 } },
          size: { connect: { sizeId: 4 } },
        },
        include: {
          itemCharacteristicsDanceType: true,
          itemImage: true,
          category: true,
          color: true,
          size: true,
        },
      });
    });

    it('deve atualizar apenas o nome quando só o nome é enviado', async () => {
      (prisma.itemCharacteristics.findUnique as any).mockResolvedValue(mockCharacteristic);
      (prisma.itemCharacteristics.update as any).mockResolvedValue({
        ...mockCharacteristic,
        itemCharacteristicsName: 'Novo Nome',
      });

      const result = await updateItemCharacteristicsService(1, {
        name: 'Novo Nome',
      });

      expect(result).toBeDefined();
      expect(prisma.itemCharacteristics.update).toHaveBeenCalledWith({
        where: { itemCharacteristicsId: 1 },
        data: {
          itemCharacteristicsName: 'Novo Nome',
        },
        include: {
          itemCharacteristicsDanceType: true,
          itemImage: true,
          category: true,
          color: true,
          size: true,
        },
      });
    });

    it('deve lançar erro se as características não existirem ao atualizar', async () => {
      (prisma.itemCharacteristics.findUnique as any).mockResolvedValue(null);

      await expect(
        updateItemCharacteristicsService(999, {
          name: 'Inexistente',
        })
      ).rejects.toMatchObject({
        message: 'Item Characteristics not found',
        statusCode: 404,
      });

      expect(prisma.itemCharacteristics.update).not.toHaveBeenCalled();
    });
  });

  describe('listItemCharacteristicsService', () => {
    it('deve listar características de itens com sucesso', async () => {
      (prisma.itemCharacteristics.findMany as any).mockResolvedValue([mockCharacteristic]);

      const result = await listItemCharacteristicsService();

      expect(result).toEqual([mockCharacteristic]);
      expect(prisma.itemCharacteristics.findMany).toHaveBeenCalledWith({
        include: {
          category: true,
          color: true,
          size: true,
          itemCharacteristicsDanceType: {
            include: { danceType: true },
          },
          itemImage: true,
        },
      });
    });

    it('deve devolver array vazio se não existirem características', async () => {
      (prisma.itemCharacteristics.findMany as any).mockResolvedValue([]);

      const result = await listItemCharacteristicsService();

      expect(result).toEqual([]);
    });
  });

  describe('getItemCharacteristicsByIdService', () => {
    it('deve obter características por ID com sucesso', async () => {
      (prisma.itemCharacteristics.findUnique as any).mockResolvedValue(mockCharacteristic);

      const result = await getItemCharacteristicsByIdService(1);

      expect(result).toEqual(mockCharacteristic);
      expect(prisma.itemCharacteristics.findUnique).toHaveBeenCalledWith({
        where: { itemCharacteristicsId: 1 },
        include: {
          category: true,
          color: true,
          size: true,
          itemCharacteristicsDanceType: {
            include: { danceType: true },
          },
          itemImage: true,
        },
      });
    });

    it('deve lançar erro se as características não forem encontradas', async () => {
      (prisma.itemCharacteristics.findUnique as any).mockResolvedValue(null);

      await expect(getItemCharacteristicsByIdService(999)).rejects.toMatchObject({
        message: 'Item Characteristics not found',
        statusCode: 404,
      });
    });
  });

  describe('deleteItemCharacteristicsService', () => {
    it('deve apagar características de item com sucesso', async () => {
      (prisma.itemCharacteristics.findUnique as any).mockResolvedValue(mockCharacteristic);
      (prisma.itemImage.deleteMany as any).mockResolvedValue({ count: 2 });
      (prisma.itemCharacteristicsDanceType.deleteMany as any).mockResolvedValue({ count: 1 });
      (prisma.itemCharacteristics.delete as any).mockResolvedValue(mockCharacteristic);

      const result = await deleteItemCharacteristicsService(1);

      expect(result).toBeUndefined();
      expect(prisma.itemImage.deleteMany).toHaveBeenCalledWith({
        where: { itemCharacteristicsId: 1 },
      });
      expect(prisma.itemCharacteristicsDanceType.deleteMany).toHaveBeenCalledWith({
        where: { itemCharacteristicsId: 1 },
      });
      expect(prisma.itemCharacteristics.delete).toHaveBeenCalledWith({
        where: { itemCharacteristicsId: 1 },
      });
    });

    it('deve lançar erro se as características não existirem ao apagar', async () => {
      (prisma.itemCharacteristics.findUnique as any).mockResolvedValue(null);

      await expect(deleteItemCharacteristicsService(999)).rejects.toMatchObject({
        message: 'Item Characteristics not found',
        statusCode: 404,
      });

      expect(prisma.itemCharacteristics.delete).not.toHaveBeenCalled();
    });
  });

  describe('addItemImageService', () => {
    it('deve adicionar imagem a características de item com sucesso', async () => {
      const image = {
        itemImageId: 1,
        itemCharacteristicsId: 1,
        itemImageUrl: 'imagem.jpg',
        itemImageIsMain: false,
      };

      (prisma.itemCharacteristics.findUnique as any).mockResolvedValue(mockCharacteristic);
      (prisma.itemImage.create as any).mockResolvedValue(image);

      const result = await addItemImageService(1, 'imagem.jpg');

      expect(result).toEqual(image);
      expect(prisma.itemImage.create).toHaveBeenCalledWith({
        data: {
          itemCharacteristicsId: 1,
          itemImageUrl: 'imagem.jpg',
          itemImageIsMain: false,
        },
      });
    });

    it('deve lançar erro ao adicionar imagem se as características não existirem', async () => {
      (prisma.itemCharacteristics.findUnique as any).mockResolvedValue(null);

      await expect(addItemImageService(999, 'imagem.jpg')).rejects.toMatchObject({
        message: 'Item Characteristics not found',
        statusCode: 404,
      });

      expect(prisma.itemImage.create).not.toHaveBeenCalled();
    });
  });

  describe('removeItemImageService', () => {
    it('deve remover imagem com sucesso', async () => {
      const image = {
        itemImageId: 1,
        itemCharacteristicsId: 1,
        itemImageUrl: 'imagem.jpg',
      };

      (prisma.itemImage.findUnique as any).mockResolvedValue(image);
      (prisma.itemImage.delete as any).mockResolvedValue(image);

      const result = await removeItemImageService(1);

      expect(result).toBeUndefined();
      expect(prisma.itemImage.delete).toHaveBeenCalledWith({
        where: { itemImageId: 1 },
      });
    });

    it('deve lançar erro se a imagem não existir', async () => {
      (prisma.itemImage.findUnique as any).mockResolvedValue(null);

      await expect(removeItemImageService(999)).rejects.toMatchObject({
        message: 'Item Image not found',
        statusCode: 404,
      });

      expect(prisma.itemImage.delete).not.toHaveBeenCalled();
    });
  });
});