import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
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
} from "../services/inventory/inventoryReferencesServices";
import { AppError } from "../utils/appError";

const nameSchema = z.object({
  name: z.string().min(1),
});

const colorSchema = z.object({
  name: z.string().min(1),
  hex: z.string().optional(),
});

const conditionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

// --- Category ---
export const listCategoriesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await listCategoriesService();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const createCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = nameSchema.parse(req.body);
    const category = await createCategoryService(data);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const updateCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError("Invalid ID", 400);
    const data = nameSchema.partial().parse(req.body);
    const updated = await updateCategoryService(id, data);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError("Invalid ID", 400);
    await deleteCategoryService(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// --- Color ---
export const listColorsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const colors = await listColorsService();
    res.json(colors);
  } catch (error) {
    next(error);
  }
};

export const createColorController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = colorSchema.parse(req.body);
    const color = await createColorService(data);
    res.status(201).json(color);
  } catch (error) {
    next(error);
  }
};

export const updateColorController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError("Invalid ID", 400);
    const data = colorSchema.partial().parse(req.body);
    const updated = await updateColorService(id, data);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteColorController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError("Invalid ID", 400);
    await deleteColorService(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// --- Size ---
export const listSizesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sizes = await listSizesService();
    res.json(sizes);
  } catch (error) {
    next(error);
  }
};

export const createSizeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = nameSchema.parse(req.body);
    const size = await createSizeService(data);
    res.status(201).json(size);
  } catch (error) {
    next(error);
  }
};

export const updateSizeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError("Invalid ID", 400);
    const data = nameSchema.partial().parse(req.body);
    const updated = await updateSizeService(id, data);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteSizeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError("Invalid ID", 400);
    await deleteSizeService(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// --- Item Condition ---
export const listItemConditionsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const conditions = await listItemConditionsService();
    res.json(conditions);
  } catch (error) {
    next(error);
  }
};

export const createItemConditionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = conditionSchema.parse(req.body);
    const condition = await createItemConditionService(data);
    res.status(201).json(condition);
  } catch (error) {
    next(error);
  }
};

export const updateItemConditionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError("Invalid ID", 400);
    const data = conditionSchema.partial().parse(req.body);
    const updated = await updateItemConditionService(id, data);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteItemConditionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError("Invalid ID", 400);
    await deleteItemConditionService(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// --- Dance Type ---
export const listDanceTypesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const danceTypes = await listDanceTypesService();
    res.json(danceTypes);
  } catch (error) {
    next(error);
  }
};

export const createDanceTypeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = nameSchema.parse(req.body);
    const danceType = await createDanceTypeService(data);
    res.status(201).json(danceType);
  } catch (error) {
    next(error);
  }
};

export const updateDanceTypeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError("Invalid ID", 400);
    const data = nameSchema.partial().parse(req.body);
    const updated = await updateDanceTypeService(id, data);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteDanceTypeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError("Invalid ID", 400);
    await deleteDanceTypeService(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
