import { Router } from "express";
import {
    getAllScheduleSubmissions,
    getScheduleSubmissions,
    getLatestSubmissionStatus,
    submitSchedule,
    reviewScheduleSubmission
} from "../controllers/scheduleMockController";

const router = Router();

// Pseudo-routes to mimic the ones frontend expects
router.get("/all", getAllScheduleSubmissions);
router.get("/user/:userId", getScheduleSubmissions);
router.get("/user/:userId/latest", getLatestSubmissionStatus);
router.post("/submit", submitSchedule);
router.put("/:submissionId/review", reviewScheduleSubmission);

export { router as scheduleRouter };
