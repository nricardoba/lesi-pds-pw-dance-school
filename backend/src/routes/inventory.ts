import { Router } from "express";
import { checkRole } from "../middlewares/checkRole";
import { USER_ROLES } from "../utils/permissions";
import * as InventoryController from "../controllers/inventoryController";

// ============================================================================
// ITEMS ROUTER
// ============================================================================
export const itemsRouter = Router();

itemsRouter.get("/", checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER]), InventoryController.listItemsController);
itemsRouter.get("/:id", InventoryController.getItemByIdController);
itemsRouter.post("/", checkRole([USER_ROLES.ADMIN, USER_ROLES.PARENT]), InventoryController.createItemController);
itemsRouter.put("/:id", checkRole([USER_ROLES.ADMIN, USER_ROLES.PARENT]), InventoryController.updateItemController);
itemsRouter.delete("/:id", checkRole([USER_ROLES.ADMIN, USER_ROLES.PARENT]), InventoryController.deleteItemController);

// ============================================================================
// RENTALS ROUTER
// ============================================================================
export const rentalsRouter = Router();

rentalsRouter.get("/", checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER]), InventoryController.listRentalsController);
rentalsRouter.get("/:id", checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER]), InventoryController.getRentalByIdController);
rentalsRouter.post("/", checkRole([USER_ROLES.ADMIN]), InventoryController.createRentalController);
rentalsRouter.put("/:id/return", checkRole([USER_ROLES.ADMIN]), InventoryController.returnRentalController);
rentalsRouter.delete("/:id", checkRole([USER_ROLES.ADMIN]), InventoryController.deleteRentalController);

// ============================================================================
// INVENTORY REFERENCES ROUTER
// ============================================================================
export const inventoryReferencesRouter = Router();

// --- Categories ---
inventoryReferencesRouter.get("/categories", checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER]), InventoryController.listCategoriesController);
inventoryReferencesRouter.post("/categories", checkRole([USER_ROLES.ADMIN]), InventoryController.createCategoryController);
inventoryReferencesRouter.put("/categories/:id", checkRole([USER_ROLES.ADMIN]), InventoryController.updateCategoryController);
inventoryReferencesRouter.delete("/categories/:id", checkRole([USER_ROLES.ADMIN]), InventoryController.deleteCategoryController);

// --- Colors ---
inventoryReferencesRouter.get("/colors", checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER]), InventoryController.listColorsController);
inventoryReferencesRouter.post("/colors", checkRole([USER_ROLES.ADMIN]), InventoryController.createColorController);
inventoryReferencesRouter.put("/colors/:id", checkRole([USER_ROLES.ADMIN]), InventoryController.updateColorController);
inventoryReferencesRouter.delete("/colors/:id", checkRole([USER_ROLES.ADMIN]), InventoryController.deleteColorController);

// --- Sizes ---
inventoryReferencesRouter.get("/sizes", checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER]), InventoryController.listSizesController);
inventoryReferencesRouter.post("/sizes", checkRole([USER_ROLES.ADMIN]), InventoryController.createSizeController);
inventoryReferencesRouter.put("/sizes/:id", checkRole([USER_ROLES.ADMIN]), InventoryController.updateSizeController);
inventoryReferencesRouter.delete("/sizes/:id", checkRole([USER_ROLES.ADMIN]), InventoryController.deleteSizeController);

// --- Item Conditions ---
inventoryReferencesRouter.get("/item-conditions", checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER]), InventoryController.listItemConditionsController);
inventoryReferencesRouter.post("/item-conditions", checkRole([USER_ROLES.ADMIN]), InventoryController.createItemConditionController);
inventoryReferencesRouter.put("/item-conditions/:id", checkRole([USER_ROLES.ADMIN]), InventoryController.updateItemConditionController);
inventoryReferencesRouter.delete("/item-conditions/:id", checkRole([USER_ROLES.ADMIN]), InventoryController.deleteItemConditionController);

// --- Dance Types ---
inventoryReferencesRouter.get("/dance-types", checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER]), InventoryController.listDanceTypesController);
inventoryReferencesRouter.post("/dance-types", checkRole([USER_ROLES.ADMIN]), InventoryController.createDanceTypeController);
inventoryReferencesRouter.put("/dance-types/:id", checkRole([USER_ROLES.ADMIN]), InventoryController.updateDanceTypeController);
inventoryReferencesRouter.delete("/dance-types/:id", checkRole([USER_ROLES.ADMIN]), InventoryController.deleteDanceTypeController);
