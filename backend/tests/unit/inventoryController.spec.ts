import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as controller from '../../src/controllers/inventoryController';
import * as inventoryServices from '../../src/services/inventory';

vi.mock('../../src/services/inventory', () => ({
  createItemCharacteristicsService: vi.fn(),
  updateItemCharacteristicsService: vi.fn(),
  listItemCharacteristicsService: vi.fn(),
  getItemCharacteristicsByIdService: vi.fn(),
  deleteItemCharacteristicsService: vi.fn(),
  addItemImageService: vi.fn(),
  removeItemImageService: vi.fn(),

  listCategoriesService: vi.fn(),
  createCategoryService: vi.fn(),
  updateCategoryService: vi.fn(),
  deleteCategoryService: vi.fn(),

  listColorsService: vi.fn(),
  createColorService: vi.fn(),
  updateColorService: vi.fn(),
  deleteColorService: vi.fn(),

  listSizesService: vi.fn(),
  createSizeService: vi.fn(),
  updateSizeService: vi.fn(),
  deleteSizeService: vi.fn(),

  listItemConditionsService: vi.fn(),
  createItemConditionService: vi.fn(),
  updateItemConditionService: vi.fn(),
  deleteItemConditionService: vi.fn(),

  listDanceTypesService: vi.fn(),
  createDanceTypeService: vi.fn(),
  updateDanceTypeService: vi.fn(),
  deleteDanceTypeService: vi.fn(),

  listItemsService: vi.fn(),
  getItemByIdService: vi.fn(),
  createItemService: vi.fn(),
  updateItemService: vi.fn(),
  deleteItemService: vi.fn(),

  createRentalService: vi.fn(),
  returnRentalService: vi.fn(),
  listRentalsService: vi.fn(),
  getRentalByIdService: vi.fn(),
  deleteRentalService: vi.fn(),
}));

const mockRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.locals = {};
  return res;
};

const next = vi.fn();

describe('Inventory Controller - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Characteristics', () => {
    it('deve criar características com sucesso', async () => {
      const req: any = {
        body: {
          name: 'Vestido',
          categoryId: 1,
          colorId: 1,
          sizeId: 1,
          danceTypeIds: [1],
          images: ['https://example.com/img.jpg'],
        },
      };
      const res = mockRes();

      (inventoryServices.createItemCharacteristicsService as any).mockResolvedValue({
        itemCharacteristicsId: 1,
      });

      await controller.createItemCharacteristicsController(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ itemCharacteristicsId: 1 });
    });

    it('deve listar características com sucesso', async () => {
      const req: any = {};
      const res = mockRes();

      (inventoryServices.listItemCharacteristicsService as any).mockResolvedValue([
        { itemCharacteristicsId: 1 },
      ]);

      await controller.listItemCharacteristicsController(req, res, next);

      expect(res.json).toHaveBeenCalledWith([{ itemCharacteristicsId: 1 }]);
    });

    it('deve obter características por ID com sucesso', async () => {
      const req: any = { params: { id: '1' } };
      const res = mockRes();

      (inventoryServices.getItemCharacteristicsByIdService as any).mockResolvedValue({
        itemCharacteristicsId: 1,
      });

      await controller.getItemCharacteristicsByIdController(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ itemCharacteristicsId: 1 });
    });

    it('deve atualizar características com sucesso', async () => {
      const req: any = {
        params: { id: '1' },
        body: { name: 'Vestido Atualizado' },
      };
      const res = mockRes();

      (inventoryServices.updateItemCharacteristicsService as any).mockResolvedValue({
        itemCharacteristicsId: 1,
        itemCharacteristicsName: 'Vestido Atualizado',
      });

      await controller.updateItemCharacteristicsController(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        itemCharacteristicsId: 1,
        itemCharacteristicsName: 'Vestido Atualizado',
      });
    });

    it('deve apagar características com sucesso', async () => {
      const req: any = { params: { id: '1' } };
      const res = mockRes();

      (inventoryServices.deleteItemCharacteristicsService as any).mockResolvedValue(undefined);

      await controller.deleteItemCharacteristicsController(req, res, next);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('deve adicionar imagem com sucesso', async () => {
      const req: any = {
        params: { id: '1' },
        file: { filename: 'imagem.jpg' },
      };
      const res = mockRes();

      (inventoryServices.addItemImageService as any).mockResolvedValue({
        itemImageId: 1,
        itemImageUrl: '/uploads/imagem.jpg',
      });

      await controller.addItemImageController(req, res, next);

      expect(inventoryServices.addItemImageService).toHaveBeenCalledWith(
        1,
        '/uploads/imagem.jpg'
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('deve chamar next se tentar adicionar imagem sem ficheiro', async () => {
      const req: any = {
        params: { id: '1' },
      };
      const res = mockRes();

      await controller.addItemImageController(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('deve remover imagem com sucesso', async () => {
      const req: any = { params: { imageId: '1' } };
      const res = mockRes();

      (inventoryServices.removeItemImageService as any).mockResolvedValue(undefined);

      await controller.removeItemImageController(req, res, next);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('Items', () => {
    it('deve listar itens com sucesso', async () => {
      const req: any = {};
      const res = mockRes();

      (inventoryServices.listItemsService as any).mockResolvedValue([{ itemId: 1 }]);

      await controller.listItemsController(req, res, next);

      expect(res.json).toHaveBeenCalledWith([{ itemId: 1 }]);
    });

    it('deve obter item por ID com sucesso', async () => {
      const req: any = { params: { id: '1' } };
      const res = mockRes();

      (inventoryServices.getItemByIdService as any).mockResolvedValue({ itemId: 1 });

      await controller.getItemByIdController(req, res, next);

      expect(inventoryServices.getItemByIdService).toHaveBeenCalledWith(req.params);
      expect(res.json).toHaveBeenCalledWith({ itemId: 1 });
    });

    it('deve criar item com sucesso', async () => {
      const req: any = { body: { itemCharacteristicsId: 1, itemConditionId: 1 } };
      const res = mockRes();

      (inventoryServices.createItemService as any).mockResolvedValue({ itemId: 1 });

      await controller.createItemController(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ itemId: 1 });
    });

    it('deve atualizar item com sucesso', async () => {
      const req: any = {
        params: { id: '1' },
        body: { itemConditionId: 2 },
      };
      const res = mockRes();
      res.locals.user = { userId: 1 };

      (inventoryServices.updateItemService as any).mockResolvedValue({ itemId: 1 });

      await controller.updateItemController(req, res, next);

      expect(inventoryServices.updateItemService).toHaveBeenCalledWith(
        req.params,
        req.body,
        res.locals.user
      );
      expect(res.json).toHaveBeenCalledWith({ itemId: 1 });
    });

    it('deve apagar item com sucesso', async () => {
      const req: any = { params: { id: '1' } };
      const res = mockRes();
      res.locals.user = { userId: 1 };

      (inventoryServices.deleteItemService as any).mockResolvedValue({ message: 'ok' });

      await controller.deleteItemController(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ message: 'ok' });
    });
  });

  describe('Rentals', () => {
    it('deve criar aluguer com sucesso', async () => {
      const req: any = { body: { userId: 1, itemId: 1 } };
      const res = mockRes();

      (inventoryServices.createRentalService as any).mockResolvedValue({ rentId: 1 });

      await controller.createRentalController(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ rentId: 1 });
    });

    it('deve devolver aluguer com sucesso', async () => {
      const req: any = {
        params: { id: '1' },
        body: { actualRentDateEnd: '2026-05-01T10:00:00.000Z' },
      };
      const res = mockRes();

      (inventoryServices.returnRentalService as any).mockResolvedValue({ rentId: 1 });

      await controller.returnRentalController(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ rentId: 1 });
    });

    it('deve listar alugueres com sucesso', async () => {
      const req: any = {};
      const res = mockRes();

      (inventoryServices.listRentalsService as any).mockResolvedValue([{ rentId: 1 }]);

      await controller.listRentalsController(req, res, next);

      expect(res.json).toHaveBeenCalledWith([{ rentId: 1 }]);
    });

    it('deve obter aluguer por ID com sucesso', async () => {
      const req: any = { params: { id: '1' } };
      const res = mockRes();

      (inventoryServices.getRentalByIdService as any).mockResolvedValue({ rentId: 1 });

      await controller.getRentalByIdController(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ rentId: 1 });
    });

    it('deve apagar aluguer com sucesso', async () => {
      const req: any = { params: { id: '1' } };
      const res = mockRes();

      (inventoryServices.deleteRentalService as any).mockResolvedValue(undefined);

      await controller.deleteRentalController(req, res, next);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('Inventory References', () => {
    it('deve gerir categorias', async () => {
      const res = mockRes();

      (inventoryServices.listCategoriesService as any).mockResolvedValue([{ categoryId: 1 }]);
      await controller.listCategoriesController({} as any, res, next);
      expect(res.json).toHaveBeenCalledWith([{ categoryId: 1 }]);

      (inventoryServices.createCategoryService as any).mockResolvedValue({ categoryId: 1 });
      await controller.createCategoryController({ body: { categoryName: 'Roupa' } } as any, res, next);
      expect(res.status).toHaveBeenCalledWith(201);

      (inventoryServices.updateCategoryService as any).mockResolvedValue({ categoryId: 1 });
      await controller.updateCategoryController({ params: { id: '1' }, body: {} } as any, res, next);
      expect(res.json).toHaveBeenCalledWith({ categoryId: 1 });

      (inventoryServices.deleteCategoryService as any).mockResolvedValue(undefined);
      await controller.deleteCategoryController({ params: { id: '1' } } as any, res, next);
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('deve gerir cores', async () => {
      const res = mockRes();

      (inventoryServices.listColorsService as any).mockResolvedValue([{ colorId: 1 }]);
      await controller.listColorsController({} as any, res, next);

      (inventoryServices.createColorService as any).mockResolvedValue({ colorId: 1 });
      await controller.createColorController({ body: { colorName: 'Azul' } } as any, res, next);

      (inventoryServices.updateColorService as any).mockResolvedValue({ colorId: 1 });
      await controller.updateColorController({ params: { id: '1' }, body: {} } as any, res, next);

      (inventoryServices.deleteColorService as any).mockResolvedValue(undefined);
      await controller.deleteColorController({ params: { id: '1' } } as any, res, next);

      expect(inventoryServices.listColorsService).toHaveBeenCalled();
      expect(inventoryServices.createColorService).toHaveBeenCalled();
      expect(inventoryServices.updateColorService).toHaveBeenCalled();
      expect(inventoryServices.deleteColorService).toHaveBeenCalled();
    });

    it('deve gerir tamanhos', async () => {
      const res = mockRes();

      (inventoryServices.listSizesService as any).mockResolvedValue([{ sizeId: 1 }]);
      await controller.listSizesController({} as any, res, next);

      (inventoryServices.createSizeService as any).mockResolvedValue({ sizeId: 1 });
      await controller.createSizeController({ body: { sizeName: 'M' } } as any, res, next);

      (inventoryServices.updateSizeService as any).mockResolvedValue({ sizeId: 1 });
      await controller.updateSizeController({ params: { id: '1' }, body: {} } as any, res, next);

      (inventoryServices.deleteSizeService as any).mockResolvedValue(undefined);
      await controller.deleteSizeController({ params: { id: '1' } } as any, res, next);

      expect(inventoryServices.listSizesService).toHaveBeenCalled();
      expect(inventoryServices.createSizeService).toHaveBeenCalled();
      expect(inventoryServices.updateSizeService).toHaveBeenCalled();
      expect(inventoryServices.deleteSizeService).toHaveBeenCalled();
    });

    it('deve gerir condições de item', async () => {
      const res = mockRes();

      (inventoryServices.listItemConditionsService as any).mockResolvedValue([{ itemConditionId: 1 }]);
      await controller.listItemConditionsController({} as any, res, next);

      (inventoryServices.createItemConditionService as any).mockResolvedValue({ itemConditionId: 1 });
      await controller.createItemConditionController({ body: { itemConditionName: 'Novo' } } as any, res, next);

      (inventoryServices.updateItemConditionService as any).mockResolvedValue({ itemConditionId: 1 });
      await controller.updateItemConditionController({ params: { id: '1' }, body: {} } as any, res, next);

      (inventoryServices.deleteItemConditionService as any).mockResolvedValue(undefined);
      await controller.deleteItemConditionController({ params: { id: '1' } } as any, res, next);

      expect(inventoryServices.listItemConditionsService).toHaveBeenCalled();
      expect(inventoryServices.createItemConditionService).toHaveBeenCalled();
      expect(inventoryServices.updateItemConditionService).toHaveBeenCalled();
      expect(inventoryServices.deleteItemConditionService).toHaveBeenCalled();
    });

    it('deve gerir tipos de dança', async () => {
      const res = mockRes();

      (inventoryServices.listDanceTypesService as any).mockResolvedValue([{ danceTypeId: 1 }]);
      await controller.listDanceTypesController({} as any, res, next);

      (inventoryServices.createDanceTypeService as any).mockResolvedValue({ danceTypeId: 1 });
      await controller.createDanceTypeController({ body: { danceTypeName: 'Ballet' } } as any, res, next);

      (inventoryServices.updateDanceTypeService as any).mockResolvedValue({ danceTypeId: 1 });
      await controller.updateDanceTypeController({ params: { id: '1' }, body: {} } as any, res, next);

      (inventoryServices.deleteDanceTypeService as any).mockResolvedValue(undefined);
      await controller.deleteDanceTypeController({ params: { id: '1' } } as any, res, next);

      expect(inventoryServices.listDanceTypesService).toHaveBeenCalled();
      expect(inventoryServices.createDanceTypeService).toHaveBeenCalled();
      expect(inventoryServices.updateDanceTypeService).toHaveBeenCalled();
      expect(inventoryServices.deleteDanceTypeService).toHaveBeenCalled();
    });
  });
});