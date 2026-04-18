// src/routes/index.ts
import { Router } from "express";
import { prisma } from "../config/db";
import itemsRoutes from "./items";
import rentalsRoutes from "./rentals";
import characteristicsRoutes from "./characteristics";
import inventoryReferencesRoutes from "./inventoryReferences";
import { ensureAuth } from "../middlewares/ensureAuth";

// Auth & Coaching
import authRoutes from "./auth";
import coachingRoutes from "./coaching";

// Grouped Routes
import { usersRouter, userTypesRouter, userClassRolesRouter } from "./users";
import { classesRouter, classStatusesRouter } from "./classes";
import scheduleVacancyRoutes from "./scheduleVacancy";
import {
  studiosRouter,
  modalitiesRouter,
  studioModalitiesRouter,
} from "./studios";
import { schoolYearsRouter } from "./school";

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
router.use("/schedule-vacancies", ensureAuth, scheduleVacancyRoutes);

// Classes Group
router.use("/classes", ensureAuth, classesRouter);
router.use("/class-statuses", ensureAuth, classStatusesRouter);
router.use("/coaching", ensureAuth, coachingRoutes);

// Studios Group
router.use("/studios", ensureAuth, studiosRouter);
router.use("/modalities", ensureAuth, modalitiesRouter);
router.use("/studio-modalities", ensureAuth, studioModalitiesRouter);
router.use("/school-years", ensureAuth, schoolYearsRouter);

// Inventory Group
router.use("/items", ensureAuth, itemsRoutes);
router.use("/rentals", ensureAuth, rentalsRoutes);
router.use("/characteristics", ensureAuth, characteristicsRoutes);
router.use("/inventory-references", ensureAuth, inventoryReferencesRoutes);

export default router;
