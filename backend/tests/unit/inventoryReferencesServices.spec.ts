import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as inventoryReferencesServices from '../../src/services/inventory/inventoryReferencesServices';
import { prisma } from '../../src/config/db';
import { AppError } from '../../src/utils/appError';

vi.mock('../../src/config/db', () => ({
  prisma: {
    category: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    color: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    size: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    itemCondition: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    danceType: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const mockPrisma = prisma as any;

describe('Inventory References Services - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- CATEGORIES ---
  describe('Categories', () => {
    it('deve listar todas as categorias', async () => {
      const mockCategories = [
        { categoryId: 1, categoryName: 'Tutus' },
        { categoryId: 2, categoryName: 'Sapatos' },
      ];

      vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories as any);

      const result = await inventoryReferencesServices.listCategoriesService();

      expect(result).toEqual(mockCategories);
    });

    it('deve criar uma categoria com sucesso', async () => {
      const mockCreatedCategory = {
        categoryId: 1,
        categoryName: 'Tutus',
      };

      vi.mocked(prisma.category.create).mockResolvedValue(mockCreatedCategory as any);

      const result = await inventoryReferencesServices.createCategoryService({ name: 'Tutus' });

      expect(result.categoryName).toBe('Tutus');
    });

    it('deve atualizar uma categoria com sucesso', async () => {
      const mockUpdatedCategory = {
        categoryId: 1,
        categoryName: 'Tutus Clássicos',
      };

      vi.mocked(prisma.category.update).mockResolvedValue(mockUpdatedCategory as any);

      const result = await inventoryReferencesServices.updateCategoryService(
        { id: 1 },
        { name: 'Tutus Clássicos' }
      );

      expect(result.categoryName).toBe('Tutus Clássicos');
    });

    it('deve deletar uma categoria com sucesso', async () => {
      const mockCategory = { categoryId: 1 };

      vi.mocked(prisma.category.delete).mockResolvedValue(mockCategory as any);

      const result = await inventoryReferencesServices.deleteCategoryService({ id: 1 });

      expect(result).toBeDefined();
      expect(prisma.category.delete).toHaveBeenCalledWith({ where: { categoryId: 1 } });
    });
  });

  // --- COLORS ---
  describe('Colors', () => {
    it('deve listar todas as cores', async () => {
      const mockColors = [
        { colorId: 1, colorName: 'Vermelho', colorHex: '#FF0000' },
        { colorId: 2, colorName: 'Preto', colorHex: '#000000' },
      ];

      vi.mocked(prisma.color.findMany).mockResolvedValue(mockColors as any);

      const result = await inventoryReferencesServices.listColorsService();

      expect(result).toEqual(mockColors);
    });

    it('deve criar uma cor com sucesso', async () => {
      const mockCreatedColor = {
        colorId: 1,
        colorName: 'Vermelho',
        colorHex: '#FF0000',
      };

      vi.mocked(prisma.color.create).mockResolvedValue(mockCreatedColor as any);

      const result = await inventoryReferencesServices.createColorService({
        name: 'Vermelho',
        hex: '#FF0000',
      });

      expect(result.colorName).toBe('Vermelho');
    });

    it('deve atualizar uma cor com sucesso', async () => {
      const mockUpdatedColor = {
        colorId: 1,
        colorName: 'Vermelho Claro',
        colorHex: '#FF6666',
      };

      vi.mocked(prisma.color.update).mockResolvedValue(mockUpdatedColor as any);

      const result = await inventoryReferencesServices.updateColorService(
        { id: 1 },
        { name: 'Vermelho Claro', hex: '#FF6666' }
      );

      expect(result.colorName).toBe('Vermelho Claro');
    });

    it('deve deletar uma cor com sucesso', async () => {
      const mockColor = { colorId: 1 };

      vi.mocked(prisma.color.delete).mockResolvedValue(mockColor as any);

      const result = await inventoryReferencesServices.deleteColorService({ id: 1 });

      expect(result).toBeDefined();
      expect(prisma.color.delete).toHaveBeenCalledWith({ where: { colorId: 1 } });
    });
  });

  // --- SIZES ---
  describe('Sizes', () => {
    it('deve listar todos os tamanhos', async () => {
      const mockSizes = [
        { sizeId: 1, sizeName: 'PP' },
        { sizeId: 2, sizeName: 'P' },
      ];

      vi.mocked(prisma.size.findMany).mockResolvedValue(mockSizes as any);

      const result = await inventoryReferencesServices.listSizesService();

      expect(result).toEqual(mockSizes);
    });

    it('deve criar um tamanho com sucesso', async () => {
      const mockCreatedSize = {
        sizeId: 1,
        sizeName: 'PP',
      };

      vi.mocked(prisma.size.create).mockResolvedValue(mockCreatedSize as any);

      const result = await inventoryReferencesServices.createSizeService({ name: 'PP' });

      expect(result.sizeName).toBe('PP');
    });

    it('deve atualizar um tamanho com sucesso', async () => {
      const mockUpdatedSize = {
        sizeId: 1,
        sizeName: 'Pequeno',
      };

      vi.mocked(prisma.size.update).mockResolvedValue(mockUpdatedSize as any);

      const result = await inventoryReferencesServices.updateSizeService(
        { id: 1 },
        { name: 'Pequeno' }
      );

      expect(result.sizeName).toBe('Pequeno');
    });

    it('deve deletar um tamanho com sucesso', async () => {
      const mockSize = { sizeId: 1 };

      vi.mocked(prisma.size.delete).mockResolvedValue(mockSize as any);

      const result = await inventoryReferencesServices.deleteSizeService({ id: 1 });

      expect(result).toBeDefined();
      expect(prisma.size.delete).toHaveBeenCalledWith({ where: { sizeId: 1 } });
    });
  });

  // --- ITEM CONDITIONS ---
  describe('Item Conditions', () => {
    it('deve listar todas as condições de item', async () => {
      const mockConditions = [
        { itemConditionId: 1, itemConditionName: 'Novo' },
        { itemConditionId: 2, itemConditionName: 'Usado' },
      ];

      vi.mocked(prisma.itemCondition.findMany).mockResolvedValue(mockConditions as any);

      const result = await inventoryReferencesServices.listItemConditionsService();

      expect(result).toEqual(mockConditions);
    });

    it('deve criar uma condição com sucesso', async () => {
      const mockCreatedCondition = {
        itemConditionId: 1,
        itemConditionName: 'Novo',
      };

      vi.mocked(prisma.itemCondition.create).mockResolvedValue(mockCreatedCondition as any);

      const result = await inventoryReferencesServices.createItemConditionService({
        name: 'Novo',
      });

      expect(result.itemConditionName).toBe('Novo');
    });

    it('deve atualizar uma condição com sucesso', async () => {
      const mockUpdatedCondition = {
        itemConditionId: 1,
        itemConditionName: 'Novo e Brilhante',
      };

      vi.mocked(prisma.itemCondition.update).mockResolvedValue(mockUpdatedCondition as any);

      const result = await inventoryReferencesServices.updateItemConditionService(
        { id: 1 },
        { name: 'Novo e Brilhante' }
      );

      expect(result.itemConditionName).toBe('Novo e Brilhante');
    });

    it('deve deletar uma condição com sucesso', async () => {
      const mockCondition = { itemConditionId: 1 };

      vi.mocked(prisma.itemCondition.delete).mockResolvedValue(mockCondition as any);

      const result = await inventoryReferencesServices.deleteItemConditionService({ id: 1 });

      expect(result).toBeDefined();
      expect(prisma.itemCondition.delete).toHaveBeenCalledWith({
        where: { itemConditionId: 1 },
      });
    });
  });

  // --- DANCE TYPES ---
  describe('Dance Types', () => {
    it('deve listar todos os tipos de dança', async () => {
      const mockDanceTypes = [
        { danceTypeId: 1, danceTypeDesc: 'Ballet' },
        { danceTypeId: 2, danceTypeDesc: 'Contemporâneo' },
      ];

      vi.mocked(prisma.danceType.findMany).mockResolvedValue(mockDanceTypes as any);

      const result = await inventoryReferencesServices.listDanceTypesService();

      expect(result).toEqual(mockDanceTypes);
    });

    it('deve criar um tipo de dança com sucesso', async () => {
      const mockCreatedDanceType = {
        danceTypeId: 1,
        danceTypeDesc: 'Ballet',
      };

      vi.mocked(prisma.danceType.create).mockResolvedValue(mockCreatedDanceType as any);

      const result = await inventoryReferencesServices.createDanceTypeService({
        name: 'Ballet',
      });

      expect(result.danceTypeDesc).toBe('Ballet');
    });

    it('deve atualizar um tipo de dança com sucesso', async () => {
      const mockUpdatedDanceType = {
        danceTypeId: 1,
        danceTypeDesc: 'Ballet Clássico',
      };

      vi.mocked(prisma.danceType.update).mockResolvedValue(mockUpdatedDanceType as any);

      const result = await inventoryReferencesServices.updateDanceTypeService(
        { id: 1 },
        { name: 'Ballet Clássico' }
      );

      expect(result.danceTypeDesc).toBe('Ballet Clássico');
    });

    it('deve deletar um tipo de dança com sucesso', async () => {
      const mockDanceType = { danceTypeId: 1 };

      vi.mocked(prisma.danceType.delete).mockResolvedValue(mockDanceType as any);

      const result = await inventoryReferencesServices.deleteDanceTypeService({ id: 1 });

      expect(result).toBeDefined();
      expect(prisma.danceType.delete).toHaveBeenCalledWith({ where: { danceTypeId: 1 } });
    });
  });

  describe('Validações', () => {
    it('deve validar campos obrigatórios ao criar categoria', async () => {
      await expect(
        inventoryReferencesServices.createCategoryService({ name: '' })
      ).rejects.toThrow();
    });

    it('deve validar campos obrigatórios ao criar cor', async () => {
      await expect(
        inventoryReferencesServices.createColorService({ name: '' })
      ).rejects.toThrow();
    });

    it('deve validar campos obrigatórios ao criar tamanho', async () => {
      await expect(
        inventoryReferencesServices.createSizeService({ name: '' })
      ).rejects.toThrow();
    });

    it('deve validar campos obrigatórios ao criar condição', async () => {
      await expect(
        inventoryReferencesServices.createItemConditionService({ name: '' })
      ).rejects.toThrow();
    });

    it('deve validar campos obrigatórios ao criar tipo de dança', async () => {
      await expect(
        inventoryReferencesServices.createDanceTypeService({ name: '' })
      ).rejects.toThrow();
    });
  });
});
