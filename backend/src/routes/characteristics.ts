import { Router } from "express";
import {
  createItemCharacteristicsController,
  updateItemCharacteristicsController,
  listItemCharacteristicsController,
  getItemCharacteristicsByIdController,
  deleteItemCharacteristicsController,
  addItemImageController,
  removeItemImageController,
} from "../controllers/characteristicsController";

const router = Router();

router.get("/", listItemCharacteristicsController);
router.get("/:id", getItemCharacteristicsByIdController);
router.post("/", createItemCharacteristicsController);
router.put("/:id", updateItemCharacteristicsController);
router.delete("/:id", deleteItemCharacteristicsController);

// Image routes
router.post("/:id/images", addItemImageController);
router.delete("/:id/images/:imageId", removeItemImageController);

export default router;
