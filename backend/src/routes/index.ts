import { Router } from "express";
import { prisma } from "../config/db";
import {
  itemsRouter,
  rentalsRouter,
  inventoryReferencesRouter,
  characteristicsRouter,
} from "./inventory";
import { ensureAuth } from "../middlewares/ensureAuth";

// Auth & Coaching
import authRoutes from "./auth";

// Grouped Routes
import { usersRouter, userTypesRouter, userClassRolesRouter } from "./users";
import { classesRouter, classStatusesRouter, coachingRouter } from "./classes";
import {
  studiosRouter,
  modalitiesRouter,
  studioModalitiesRouter,
} from "./studios";
import { schoolYearsRouter, scheduleVacanciesRouter } from "./school";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "API Ent'Artes a funcionar",
    timestamp: new Date(),
  });
});

router.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

// Auth
router.use("/auth", authRoutes);

// Users Group
router.use("/users", ensureAuth, usersRouter);
router.use("/user-types", ensureAuth, userTypesRouter);
router.use("/user-class-roles", ensureAuth, userClassRolesRouter);

// Classes Group
router.use("/classes", ensureAuth, classesRouter);
router.use("/class-statuses", ensureAuth, classStatusesRouter);
router.use("/coachings", ensureAuth, coachingRouter);

// Studios / School Group
router.use("/studios", ensureAuth, studiosRouter);
router.use("/modalities", ensureAuth, modalitiesRouter);
router.use("/studio-modalities", ensureAuth, studioModalitiesRouter);
router.use("/school-years", ensureAuth, schoolYearsRouter);
router.use("/schedule-vacancies", ensureAuth, scheduleVacanciesRouter);

// Inventory Group
router.use("/items", ensureAuth, itemsRouter);
router.use("/rentals", ensureAuth, rentalsRouter);
router.use("/characteristics", ensureAuth, characteristicsRouter);
router.use("/inventory-references", ensureAuth, inventoryReferencesRouter);

export default router;
