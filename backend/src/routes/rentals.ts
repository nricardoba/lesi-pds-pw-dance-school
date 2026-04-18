import { Router } from "express";
import {
  createRentalController,
  returnRentalController,
  listRentalsController,
  getRentalByIdController,
  deleteRentalController,
} from "../controllers/rentalsController";

const router = Router();

router.get("/", listRentalsController);
router.get("/:id", getRentalByIdController);
router.post("/", createRentalController);
router.put("/:id/return", returnRentalController);
router.delete("/:id", deleteRentalController);

export default router;
