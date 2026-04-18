import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  createRentalService,
  returnRentalService,
  listRentalsService,
  getRentalByIdService,
  deleteRentalService,
} from "../services/inventory/rentalsServices";
import { AppError } from "../utils/appError";

const createRentalSchema = z.object({
  userId: z.number().int().positive(),
  itemId: z.number().int().positive(),
  rentDateStart: z
    .string()
    .datetime()
    .or(z.date())
    .transform((val) => new Date(val)),
  rentDateEnd: z
    .string()
    .datetime()
    .or(z.date())
    .transform((val) => new Date(val)),
});

const returnRentalSchema = z.object({
  actualRentDateEnd: z
    .string()
    .datetime()
    .or(z.date())
    .transform((val) => new Date(val)),
  itemDamaged: z.boolean().optional(),
});

export const createRentalController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = createRentalSchema.parse(req.body);
    const rental = await createRentalService(data);
    res.status(201).json(rental);
  } catch (error) {
    next(error);
  }
};

export const returnRentalController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new AppError("Invalid rental ID", 400);
    }
    const { actualRentDateEnd, itemDamaged } = returnRentalSchema.parse(
      req.body,
    );
    const updatedRental = await returnRentalService(
      id,
      actualRentDateEnd,
      itemDamaged,
    );
    res.json(updatedRental);
  } catch (error) {
    next(error);
  }
};

export const listRentalsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rentals = await listRentalsService();
    res.json(rentals);
  } catch (error) {
    next(error);
  }
};

export const getRentalByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new AppError("Invalid rental ID", 400);
    }
    const rental = await getRentalByIdService(id);
    res.json(rental);
  } catch (error) {
    next(error);
  }
};

export const deleteRentalController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new AppError("Invalid rental ID", 400);
    }
    await deleteRentalService(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
