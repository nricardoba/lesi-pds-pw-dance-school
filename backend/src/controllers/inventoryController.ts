import { Request, Response } from "express";
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
import {
  listItemsService,
  getItemByIdService,
  createItemService,
  updateItemService,
  deleteItemService,
} from "../services/inventory/itemsServices";
import {
  createRentalService,
  returnRentalService,
  listRentalsService,
  getRentalByIdService,
  deleteRentalService,
} from "../services/inventory/rentalsServices";
import { AppError } from "../utils/appError";

// ============================================================================
// ITEMS
// ============================================================================

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

// ============================================================================
// RENTALS
// ============================================================================

export const createRentalController = async (req: Request, res: Response) => {
  try {
    const rental = await createRentalService(req.body);
    return res.status(201).json(rental);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao criar aluguer." });
  }
};

export const returnRentalController = async (req: Request, res: Response) => {
  try {
    const updatedRental = await returnRentalService(req.params, req.body);
    return res.json(updatedRental);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao devolver aluguer." });
  }
};

export const listRentalsController = async (_req: Request, res: Response) => {
  try {
    const rentals = await listRentalsService();
    return res.json(rentals);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao obter alugueres." });
  }
};

export const getRentalByIdController = async (req: Request, res: Response) => {
  try {
    const rental = await getRentalByIdService(req.params);
    return res.json(rental);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao obter aluguer." });
  }
};

export const deleteRentalController = async (req: Request, res: Response) => {
  try {
    const data = await deleteRentalService(req.params);
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao apagar aluguer." });
  }
};

// ============================================================================
// INVENTORY REFERENCES
// ============================================================================

// ----------------------------------------------------------------------------
// CATEGORY
// ----------------------------------------------------------------------------

export const listCategoriesController = async (
  _req: Request,
  res: Response,
) => {
  try {
    const categories = await listCategoriesService();
    return res.json(categories);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao obter categorias." });
  }
};

export const createCategoryController = async (req: Request, res: Response) => {
  try {
    const category = await createCategoryService(req.body);
    return res.status(201).json(category);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao criar categoria." });
  }
};

export const updateCategoryController = async (req: Request, res: Response) => {
  try {
    const updated = await updateCategoryService(req.params, req.body);
    return res.json(updated);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao atualizar categoria." });
  }
};

export const deleteCategoryController = async (req: Request, res: Response) => {
  try {
    await deleteCategoryService(req.params);
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao apagar categoria." });
  }
};

// ----------------------------------------------------------------------------
// COLOR
// ----------------------------------------------------------------------------

export const listColorsController = async (_req: Request, res: Response) => {
  try {
    const colors = await listColorsService();
    return res.json(colors);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao obter cores." });
  }
};

export const createColorController = async (req: Request, res: Response) => {
  try {
    const color = await createColorService(req.body);
    return res.status(201).json(color);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao criar cor." });
  }
};

export const updateColorController = async (req: Request, res: Response) => {
  try {
    const updated = await updateColorService(req.params, req.body);
    return res.json(updated);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao atualizar cor." });
  }
};

export const deleteColorController = async (req: Request, res: Response) => {
  try {
    await deleteColorService(req.params);
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao apagar cor." });
  }
};

// ----------------------------------------------------------------------------
// SIZE
// ----------------------------------------------------------------------------

export const listSizesController = async (_req: Request, res: Response) => {
  try {
    const sizes = await listSizesService();
    return res.json(sizes);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao obter tamanhos." });
  }
};

export const createSizeController = async (req: Request, res: Response) => {
  try {
    const size = await createSizeService(req.body);
    return res.status(201).json(size);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao criar tamanho." });
  }
};

export const updateSizeController = async (req: Request, res: Response) => {
  try {
    const updated = await updateSizeService(req.params, req.body);
    return res.json(updated);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao atualizar tamanho." });
  }
};

export const deleteSizeController = async (req: Request, res: Response) => {
  try {
    await deleteSizeService(req.params);
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao apagar tamanho." });
  }
};

// ----------------------------------------------------------------------------
// ITEM CONDITION
// ----------------------------------------------------------------------------

export const listItemConditionsController = async (
  _req: Request,
  res: Response,
) => {
  try {
    const conditions = await listItemConditionsService();
    return res.json(conditions);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao obter estados de item." });
  }
};

export const createItemConditionController = async (
  req: Request,
  res: Response,
) => {
  try {
    const condition = await createItemConditionService(req.body);
    return res.status(201).json(condition);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao criar estado de item." });
  }
};

export const updateItemConditionController = async (
  req: Request,
  res: Response,
) => {
  try {
    const updated = await updateItemConditionService(req.params, req.body);
    return res.json(updated);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao atualizar estado de item." });
  }
};

export const deleteItemConditionController = async (
  req: Request,
  res: Response,
) => {
  try {
    await deleteItemConditionService(req.params);
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao apagar estado de item." });
  }
};

// ----------------------------------------------------------------------------
// DANCE TYPE
// ----------------------------------------------------------------------------

export const listDanceTypesController = async (
  _req: Request,
  res: Response,
) => {
  try {
    const danceTypes = await listDanceTypesService();
    return res.json(danceTypes);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao obter tipos de dança." });
  }
};

export const createDanceTypeController = async (
  req: Request,
  res: Response,
) => {
  try {
    const danceType = await createDanceTypeService(req.body);
    return res.status(201).json(danceType);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao criar tipo de dança." });
  }
};

export const updateDanceTypeController = async (
  req: Request,
  res: Response,
) => {
  try {
    const updated = await updateDanceTypeService(req.params, req.body);
    return res.json(updated);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao atualizar tipo de dança." });
  }
};

export const deleteDanceTypeController = async (
  req: Request,
  res: Response,
) => {
  try {
    await deleteDanceTypeService(req.params);
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao apagar tipo de dança." });
  }
};
