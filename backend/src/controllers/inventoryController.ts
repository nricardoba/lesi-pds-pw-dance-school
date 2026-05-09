import { Request, Response } from "express";
import { z } from "zod";
import {
  // => CHARACTERISTICS
  createItemCharacteristicsService,
  updateItemCharacteristicsService,
  listItemCharacteristicsService,
  getItemCharacteristicsByIdService,
  deleteItemCharacteristicsService,
  addItemImageService,
  removeItemImageService,

  // => INVENTORY REFERENCES
  listCategoriesService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
  listColorsService,
  createColorService,
  updateColorService,
  deleteColorService,
  listSizesService,
  createSizeService,
  updateSizeService,
  deleteSizeService,
  listItemConditionsService,
  createItemConditionService,
  updateItemConditionService,
  deleteItemConditionService,
  listDanceTypesService,
  createDanceTypeService,
  updateDanceTypeService,
  deleteDanceTypeService,

  // => ITEMS
  listItemsService,
  getItemByIdService,
  createItemService,
  updateItemService,
  deleteItemService,

  // => RENTALS
  createRentalService,
  returnRentalService,
  listRentalsService,
  getRentalByIdService,
  deleteRentalService,
} from "../services/inventory";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/appError";

// ============================================================================
// CHARACTERISTICS
// ============================================================================

const createCharacteristicSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative().optional(),
  categoryId: z.number().int().positive(),
  colorId: z.number().int().positive(),
  sizeId: z.number().int().positive(),
  danceTypeIds: z.array(z.number().int().positive()).optional(),
  images: z.array(z.string().url()).optional(),
});

const updateCharacteristicSchema = createCharacteristicSchema.partial();

const addImageSchema = z.object({
  url: z.string().url(),
});

export const createItemCharacteristicsController = catchAsync(
  async (req: Request, res: Response) => {
    const data = createCharacteristicSchema.parse(req.body);
    const characteristic = await createItemCharacteristicsService(data);
    return res.status(201).json(characteristic);
  },
);

export const updateItemCharacteristicsController = catchAsync(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError("ID de caracter�stica inv�lido", 400);

    const data = updateCharacteristicSchema.parse(req.body);
    const updated = await updateItemCharacteristicsService(id, data);
    return res.json(updated);
  },
);

export const listItemCharacteristicsController = catchAsync(
  async (_req: Request, res: Response) => {
    const characteristics = await listItemCharacteristicsService();
    return res.json(characteristics);
  },
);

export const getItemCharacteristicsByIdController = catchAsync(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError("ID de caracter�stica inv�lido", 400);

    const characteristic = await getItemCharacteristicsByIdService(id);
    return res.json(characteristic);
  },
);

export const deleteItemCharacteristicsController = catchAsync(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError("ID de caracter�stica inv�lido", 400);

    await deleteItemCharacteristicsService(id);
    return res.status(204).send();
  },
);

export const addItemImageController = catchAsync(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError("ID de característica inválido", 400);

    if (!req.file) {
      throw new AppError("Nenhuma imagem enviada", 400);
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const image = await addItemImageService(id, imageUrl);
    return res.status(201).json(image);
  },
);

export const removeItemImageController = catchAsync(
  async (req: Request, res: Response) => {
    const imageId = parseInt(req.params.imageId, 10);
    if (isNaN(imageId)) throw new AppError("Invalid image ID", 400);

    await removeItemImageService(imageId);
    return res.status(204).send();
  },
);

// ============================================================================
// ITEMS
// ============================================================================

export const listItemsController = catchAsync(
  async (_req: Request, res: Response) => {
    const data = await listItemsService();
    return res.json(data);
  },
);

export const getItemByIdController = catchAsync(
  async (req: Request, res: Response) => {
    const data = await getItemByIdService(req.params);
    return res.json(data);
  },
);

export const createItemController = catchAsync(
  async (req: Request, res: Response) => {
    const data = await createItemService(req.body);
    return res.status(201).json(data);
  },
);

export const updateItemController = catchAsync(
  async (req: Request, res: Response) => {
    const data = await updateItemService(req.params, req.body, res.locals.user);
    return res.json(data);
  },
);

export const deleteItemController = catchAsync(
  async (req: Request, res: Response) => {
    const data = await deleteItemService(req.params, res.locals.user);
    return res.json(data);
  },
);

// ============================================================================
// RENTALS
// ============================================================================

export const createRentalController = catchAsync(
  async (req: Request, res: Response) => {
    const rental = await createRentalService(req.body);
    return res.status(201).json(rental);
  },
);

export const returnRentalController = catchAsync(
  async (req: Request, res: Response) => {
    const updatedRental = await returnRentalService(req.params, req.body);
    return res.json(updatedRental);
  },
);

export const listRentalsController = catchAsync(
  async (_req: Request, res: Response) => {
    const rentals = await listRentalsService();
    return res.json(rentals);
  },
);

export const getRentalByIdController = catchAsync(
  async (req: Request, res: Response) => {
    const rental = await getRentalByIdService(req.params);
    return res.json(rental);
  },
);

export const deleteRentalController = catchAsync(
  async (req: Request, res: Response) => {
    await deleteRentalService(req.params);
    return res.status(204).send();
  },
);

// ============================================================================
// INVENTORY REFERENCES
// ============================================================================

// ----------------------------------------------------------------------------
// CATEGORY
// ----------------------------------------------------------------------------

export const listCategoriesController = catchAsync(
  async (_req: Request, res: Response) => {
    const categories = await listCategoriesService();
    return res.json(categories);
  },
);

export const createCategoryController = catchAsync(
  async (req: Request, res: Response) => {
    const category = await createCategoryService(req.body);
    return res.status(201).json(category);
  },
);

export const updateCategoryController = catchAsync(
  async (req: Request, res: Response) => {
    const updated = await updateCategoryService(req.params, req.body);
    return res.json(updated);
  },
);

export const deleteCategoryController = catchAsync(
  async (req: Request, res: Response) => {
    await deleteCategoryService(req.params);
    return res.status(204).send();
  },
);

// ----------------------------------------------------------------------------
// COLOR
// ----------------------------------------------------------------------------

export const listColorsController = catchAsync(
  async (_req: Request, res: Response) => {
    const colors = await listColorsService();
    return res.json(colors);
  },
);

export const createColorController = catchAsync(
  async (req: Request, res: Response) => {
    const color = await createColorService(req.body);
    return res.status(201).json(color);
  },
);

export const updateColorController = catchAsync(
  async (req: Request, res: Response) => {
    const updated = await updateColorService(req.params, req.body);
    return res.json(updated);
  },
);

export const deleteColorController = catchAsync(
  async (req: Request, res: Response) => {
    await deleteColorService(req.params);
    return res.status(204).send();
  },
);

// ----------------------------------------------------------------------------
// SIZE
// ----------------------------------------------------------------------------

export const listSizesController = catchAsync(
  async (_req: Request, res: Response) => {
    const sizes = await listSizesService();
    return res.json(sizes);
  },
);

export const createSizeController = catchAsync(
  async (req: Request, res: Response) => {
    const size = await createSizeService(req.body);
    return res.status(201).json(size);
  },
);

export const updateSizeController = catchAsync(
  async (req: Request, res: Response) => {
    const updated = await updateSizeService(req.params, req.body);
    return res.json(updated);
  },
);

export const deleteSizeController = catchAsync(
  async (req: Request, res: Response) => {
    await deleteSizeService(req.params);
    return res.status(204).send();
  },
);

// ----------------------------------------------------------------------------
// ITEM CONDITION
// ----------------------------------------------------------------------------

export const listItemConditionsController = catchAsync(
  async (_req: Request, res: Response) => {
    const conditions = await listItemConditionsService();
    return res.json(conditions);
  },
);

export const createItemConditionController = catchAsync(
  async (req: Request, res: Response) => {
    const condition = await createItemConditionService(req.body);
    return res.status(201).json(condition);
  },
);

export const updateItemConditionController = catchAsync(
  async (req: Request, res: Response) => {
    const updated = await updateItemConditionService(req.params, req.body);
    return res.json(updated);
  },
);

export const deleteItemConditionController = catchAsync(
  async (req: Request, res: Response) => {
    await deleteItemConditionService(req.params);
    return res.status(204).send();
  },
);

// ----------------------------------------------------------------------------
// DANCE TYPE
// ----------------------------------------------------------------------------

export const listDanceTypesController = catchAsync(
  async (_req: Request, res: Response) => {
    const danceTypes = await listDanceTypesService();
    return res.json(danceTypes);
  },
);

export const createDanceTypeController = catchAsync(
  async (req: Request, res: Response) => {
    const danceType = await createDanceTypeService(req.body);
    return res.status(201).json(danceType);
  },
);

export const updateDanceTypeController = catchAsync(
  async (req: Request, res: Response) => {
    const updated = await updateDanceTypeService(req.params, req.body);
    return res.json(updated);
  },
);

export const deleteDanceTypeController = catchAsync(
  async (req: Request, res: Response) => {
    await deleteDanceTypeService(req.params);
    return res.status(204).send();
  },
);
