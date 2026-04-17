import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  createItemCharacteristicsService,
  updateItemCharacteristicsService,
  listItemCharacteristicsService,
  getItemCharacteristicsByIdService,
  deleteItemCharacteristicsService,
  addItemImageService,
  removeItemImageService,
} from "../services/characteristicsServices";
import { AppError } from "../utils/AppError";

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

export const createItemCharacteristicsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = createCharacteristicSchema.parse(req.body);
    const characteristic = await createItemCharacteristicsService(data);
    res.status(201).json(characteristic);
  } catch (error) {
    next(error);
  }
};

export const updateItemCharacteristicsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new AppError("Invalid characteristic ID", 400);
    }
    const data = updateCharacteristicSchema.parse(req.body);
    const updated = await updateItemCharacteristicsService(id, data);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const listItemCharacteristicsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const characteristics = await listItemCharacteristicsService();
    res.json(characteristics);
  } catch (error) {
    next(error);
  }
};

export const getItemCharacteristicsByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new AppError("Invalid characteristic ID", 400);
    }
    const characteristic = await getItemCharacteristicsByIdService(id);
    res.json(characteristic);
  } catch (error) {
    next(error);
  }
};

export const deleteItemCharacteristicsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new AppError("Invalid characteristic ID", 400);
    }
    await deleteItemCharacteristicsService(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const addItemImageController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new AppError("Invalid characteristic ID", 400);
    }
    const { url } = addImageSchema.parse(req.body);
    const image = await addItemImageService(id, url);
    res.status(201).json(image);
  } catch (error) {
    next(error);
  }
};

export const removeItemImageController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const imageId = parseInt(req.params.imageId, 10);
    if (isNaN(imageId)) {
      throw new AppError("Invalid image ID", 400);
    }
    await removeItemImageService(imageId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
