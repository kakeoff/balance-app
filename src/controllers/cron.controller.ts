import { Request, Response } from "express";
import { CronService } from "../services/cron.service";

const cronService = new CronService();

export const getCronJobsStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const jobs = await cronService.getJobsStatus();
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error getting cron jobs status:", error);
    res.status(500).json({ error: "Failed to get cron jobs status" });
  }
};
