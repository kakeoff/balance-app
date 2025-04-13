import express from "express";
import { getCronJobsStatus } from "../controllers/cron.controller";

const router = express.Router();

router.get("/status", getCronJobsStatus);

export default router;
