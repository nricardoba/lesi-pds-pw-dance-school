import { Router } from "express";
import {
  listCategoriesController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
  listColorsController,
  createColorController,
  updateColorController,
  deleteColorController,
  listSizesController,
  createSizeController,
  updateSizeController,
  deleteSizeController,
  listItemConditionsController,
  createItemConditionController,
  updateItemConditionController,
  deleteItemConditionController,
  listDanceTypesController,
  createDanceTypeController,
  updateDanceTypeController,
  deleteDanceTypeController,
} from "../controllers/inventoryReferencesController";

const router = Router();

// --- Categories ---
router.get("/categories", listCategoriesController);
router.post("/categories", createCategoryController);
router.put("/categories/:id", updateCategoryController);
router.delete("/categories/:id", deleteCategoryController);

// --- Colors ---
router.get("/colors", listColorsController);
router.post("/colors", createColorController);
router.put("/colors/:id", updateColorController);
router.delete("/colors/:id", deleteColorController);

// --- Sizes ---
router.get("/sizes", listSizesController);
router.post("/sizes", createSizeController);
router.put("/sizes/:id", updateSizeController);
router.delete("/sizes/:id", deleteSizeController);

// --- Item Conditions ---
router.get("/item-conditions", listItemConditionsController);
router.post("/item-conditions", createItemConditionController);
router.put("/item-conditions/:id", updateItemConditionController);
router.delete("/item-conditions/:id", deleteItemConditionController);

// --- Dance Types ---
router.get("/dance-types", listDanceTypesController);
router.post("/dance-types", createDanceTypeController);
router.put("/dance-types/:id", updateDanceTypeController);
router.delete("/dance-types/:id", deleteDanceTypeController);

export default router;
