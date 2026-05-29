import { Router } from "express";
import { checkRole } from "../middlewares/checkRole";
import { USER_ROLES } from "../utils/permissions";
import * as InventoryController from "../controllers/inventoryController";
import { upload } from "../middlewares/upload";
import { ensureAuth } from "../middlewares/ensureAuth";

// ============================================================================
// CHARACTERISTICS ROUTER
// ============================================================================
export const characteristicsRouter = Router();

characteristicsRouter.get(
    "/",
    InventoryController.listItemCharacteristicsController,
);
characteristicsRouter.get(
    "/:id",
    InventoryController.getItemCharacteristicsByIdController,
);
characteristicsRouter.post(
    "/",
    InventoryController.createItemCharacteristicsController,
);
characteristicsRouter.put(
    "/:id",
    InventoryController.updateItemCharacteristicsController,
);
characteristicsRouter.delete(
    "/:id",
    InventoryController.deleteItemCharacteristicsController,
);

// Image routes
characteristicsRouter.post(
    "/:id/images",
    upload.single("image"),
    InventoryController.addItemImageController,
);
characteristicsRouter.delete(
    "/:id/images/:imageId",
    InventoryController.removeItemImageController,
);

// ============================================================================
// ITEMS ROUTER
// ============================================================================
export const itemsRouter = Router();

itemsRouter.get(
    "/",
    ensureAuth,
    InventoryController.listItemsController,
);
itemsRouter.get("/:id", InventoryController.getItemByIdController);
itemsRouter.post(
    "/",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.PARENT, USER_ROLES.STUDENT, USER_ROLES.TEACHER]),
    InventoryController.createItemController,
);
itemsRouter.put(
    "/:id",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.PARENT, USER_ROLES.STUDENT, USER_ROLES.TEACHER]),
    InventoryController.updateItemController,
);
itemsRouter.delete(
    "/:id",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.PARENT, USER_ROLES.STUDENT, USER_ROLES.TEACHER]),
    InventoryController.deleteItemController,
);

// ============================================================================
// RENTALS ROUTER
// ============================================================================
export const rentalsRouter = Router();

rentalsRouter.get(
    "/",
    ensureAuth,
    InventoryController.listRentalsController,
);
rentalsRouter.get(
    "/:id",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER]),
    InventoryController.getRentalByIdController,
);
rentalsRouter.post(
    "/",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN]),
    InventoryController.createRentalController,
);
rentalsRouter.put(
    "/:id/return",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN]),
    InventoryController.returnRentalController,
);
rentalsRouter.delete(
    "/:id",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN]),
    InventoryController.deleteRentalController,
);

// ============================================================================
// INVENTORY REFERENCES ROUTER
// ============================================================================
export const inventoryReferencesRouter = Router();

// --- Categories ---
inventoryReferencesRouter.get(
    "/categories",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT]),
    InventoryController.listCategoriesController,
);
inventoryReferencesRouter.post(
    "/categories",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT]),
    InventoryController.createCategoryController,
);
inventoryReferencesRouter.put(
    "/categories/:id",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT]),
    InventoryController.updateCategoryController,
);
inventoryReferencesRouter.delete(
    "/categories/:id",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN]),
    InventoryController.deleteCategoryController,
);

// --- Colors ---
inventoryReferencesRouter.get(
    "/colors",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT]),
    InventoryController.listColorsController,
);
inventoryReferencesRouter.post(
    "/colors",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT]),
    InventoryController.createColorController,
);
inventoryReferencesRouter.put(
    "/colors/:id",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT]),
    InventoryController.updateColorController,
);
inventoryReferencesRouter.delete(
    "/colors/:id",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN]),
    InventoryController.deleteColorController,
);

// --- Sizes ---
inventoryReferencesRouter.get(
    "/sizes",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT]),
    InventoryController.listSizesController,
);
inventoryReferencesRouter.post(
    "/sizes",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT]),
    InventoryController.createSizeController,
);
inventoryReferencesRouter.put(
    "/sizes/:id",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT]),
    InventoryController.updateSizeController,
);
inventoryReferencesRouter.delete(
    "/sizes/:id",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN]),
    InventoryController.deleteSizeController,
);

// --- Item Conditions ---
inventoryReferencesRouter.get(
    "/item-conditions",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT]),
    InventoryController.listItemConditionsController,
);
inventoryReferencesRouter.post(
    "/item-conditions",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT]),
    InventoryController.createItemConditionController,
);
inventoryReferencesRouter.put(
    "/item-conditions/:id",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT]),
    InventoryController.updateItemConditionController,
);
inventoryReferencesRouter.delete(
    "/item-conditions/:id",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN]),
    InventoryController.deleteItemConditionController,
);

// --- Dance Types ---
inventoryReferencesRouter.get(
    "/dance-types",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT]),
    InventoryController.listDanceTypesController,
);
inventoryReferencesRouter.post(
    "/dance-types",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT]),
    InventoryController.createDanceTypeController,
);
inventoryReferencesRouter.put(
    "/dance-types/:id",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT]),
    InventoryController.updateDanceTypeController,
);
inventoryReferencesRouter.delete(
    "/dance-types/:id",
    ensureAuth,
    checkRole([USER_ROLES.ADMIN]),
    InventoryController.deleteDanceTypeController,
);
