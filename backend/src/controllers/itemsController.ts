import { Request, Response } from "express";
import {
  listItemsService,
  getItemByIdService,
  createItemService,
  updateItemService,
  deleteItemService,
} from "../services/itemsServices";
import { AppError } from "../utils/appError";

export const listItemsController = async (_req: Request, res: Response) => {
  try {
    const data = await listItemsService();
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao obter itens." });
  }
};

export const getItemByIdController = async (req: Request, res: Response) => {
  try {
    const data = await getItemByIdService(req.params);
    return res.json(data);
  } catch (error) {
    console.error(error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: "Erro ao obter item." });
  }
};

export const createItemController = async (req: Request, res: Response) => {
  try {
    const data = await createItemService(req.body);
    return res.status(201).json(data);
  } catch (error) {
    console.error(error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: "Erro ao criar item." });
  }
};

export const updateItemController = async (req: Request, res: Response) => {
  try {
    const data = await updateItemService(req.params, req.body);
    return res.json(data);
  } catch (error) {
    console.error(error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: "Erro ao atualizar item." });
  }
};

export const deleteItemController = async (req: Request, res: Response) => {
  try {
    const data = await deleteItemService(req.params);
    return res.json(data);
  } catch (error) {
    console.error(error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: "Erro ao apagar item." });
  }
};
