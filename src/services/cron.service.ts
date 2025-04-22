import { CronJob } from "../models/cron-job.model";
import { CronJobExecution } from "../models/cron-job-execution.model";
import { SERVER_ID } from "../utils/server-id";
import { Op } from "sequelize";
import * as cron from "node-cron";

const jobFunctions: Record<string, () => Promise<void>> = {
  task_1: async () => {
    console.log("Processing user data...");
    await new Promise((resolve) => setTimeout(resolve, 120000));
    console.log("User data processing completed");
  },
  task_2: async () => {
    console.log("Cleaning up old records...");
    await new Promise((resolve) => setTimeout(resolve, 120000));
    console.log("Database cleanup completed");
  },
  task_3: async () => {
    console.log("Fetching external data...");
    await new Promise((resolve) => setTimeout(resolve, 120000));
    console.log("External data fetching completed");
  },
  task_4: async () => {
    console.log("Generating reports...");
    await new Promise((resolve) => setTimeout(resolve, 120000));
    console.log("Report generation completed");
  },
  task_5: async () => {
    console.log("Backing up data...");
    await new Promise((resolve) => setTimeout(resolve, 120000));
    console.log("Data backup completed");
  },
  task_6: async () => {
    console.log("Checking system health...");
    await new Promise((resolve) => setTimeout(resolve, 120000));
    console.log("System health check completed");
  },
  task_7: async () => {
    console.log("Sending notifications...");
    await new Promise((resolve) => setTimeout(resolve, 120000));
    console.log("Notifications sent");
  },
  task_8: async () => {
    console.log("Aggregating data...");
    await new Promise((resolve) => setTimeout(resolve, 120000));
    console.log("Data aggregation completed");
  },
  task_9: async () => {
    console.log("Invalidating cache...");
    await new Promise((resolve) => setTimeout(resolve, 120000));
    console.log("Cache invalidation completed");
  },
  task_10: async () => {
    console.log("Synchronizing data...");
    await new Promise((resolve) => setTimeout(resolve, 120000));
    console.log("Data synchronization completed");
  },
};

export class CronService {
  private jobs: Map<number, cron.ScheduledTask> = new Map();
  private isInitialized = false;

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    const serverPosition = this.getServerPosition();
    console.log(
      `Server ID: ${SERVER_ID}, Position: ${serverPosition}, Port: ${process.env.PORT}`
    );

    await this.createDefaultJobs();
    await this.startAllJobs();
    this.isInitialized = true;
  }

  private async createDefaultJobs(): Promise<void> {
    const defaultJobs = [
      {
        name: "Task 1",
        interval: "*/10 * * * *",
        functionName: "task_1",
        isActive: true,
      },
      {
        name: "Task 2",
        interval: "*/15 * * * *",
        functionName: "task_2",
        isActive: true,
      },
      {
        name: "Task 3",
        interval: "*/20 * * * *",
        functionName: "task_3",
        isActive: true,
      },
      {
        name: "Task 4",
        interval: "*/25 * * * *",
        functionName: "task_4",
        isActive: true,
      },
      {
        name: "Task 5",
        interval: "*/30 * * * *",
        functionName: "task_5",
        isActive: true,
      },
      {
        name: "Task 6",
        interval: "*/35 * * * *",
        functionName: "task_6",
        isActive: true,
      },
      {
        name: "Task 7",
        interval: "*/40 * * * *",
        functionName: "task_7",
        isActive: true,
      },
      {
        name: "Task 8",
        interval: "*/45 * * * *",
        functionName: "task_8",
        isActive: true,
      },
      {
        name: "Task 9",
        interval: "*/50 * * * *",
        functionName: "task_9",
        isActive: true,
      },
      {
        name: "Task 10",
        interval: "*/55 * * * *",
        functionName: "task_10",
        isActive: true,
      },
    ];

    try {
      const existingJobsCount = await CronJob.count();

      if (existingJobsCount === 0) {
        console.log("Creating default cron jobs...");
        await CronJob.bulkCreate(defaultJobs);
        console.log(`Created ${defaultJobs.length} default cron jobs`);
      } else {
        console.log(
          `Found ${existingJobsCount} existing cron jobs, skipping creation`
        );
      }
    } catch (error) {
      console.error("Error in createDefaultJobs:", error);
    }
  }

  private async startAllJobs(): Promise<void> {
    try {
      const jobs = await CronJob.findAll({
        where: { isActive: true },
      });

      const serverPosition = this.getServerPosition();

      console.log(`Starting jobs for server position ${serverPosition}...`);

      let scheduledCount = 0;
      for (const job of jobs) {
        if (jobs.indexOf(job) % 5 === serverPosition) {
          await this.startJob(job);
          scheduledCount++;
        }
      }

      console.log(`Scheduled ${scheduledCount} jobs on this server instance`);
    } catch (error) {
      console.error("Error starting jobs:", error);
    }
  }

  private getNextRunDate(cronExpression: string): Date {
    const now = new Date();
    const [minute, hour, day, month, dayOfWeek] = cronExpression.split(" ");
    if (minute.startsWith("*/")) {
      const interval = parseInt(minute.substring(2), 10);
      const nextMinute = Math.ceil(now.getMinutes() / interval) * interval;
      const nextDate = new Date(now);
      nextDate.setMinutes(nextMinute);
      nextDate.setSeconds(0);
      nextDate.setMilliseconds(0);
      if (nextDate <= now) {
        nextDate.setMinutes(nextDate.getMinutes() + interval);
      }
      return nextDate;
    }
    const nextDate = new Date(now);
    nextDate.setMinutes(now.getMinutes() + 1);
    nextDate.setSeconds(0);
    nextDate.setMilliseconds(0);
    return nextDate;
  }

  private async startJob(job: CronJob): Promise<void> {
    try {
      this.stopJob(job.id);
      console.log(`Starting job: ${job.name} (${job.interval})`);
      const task = cron.schedule(job.interval, async () => {
        await this.runJob(job);
      });
      this.jobs.set(job.id, task);
      const nextRun = this.getNextRunDate(job.interval);
      await job.update({ nextRunAt: nextRun });
    } catch (error) {
      console.error(`Error starting job ${job.name}:`, error);
    }
  }

  private stopJob(jobId: number): void {
    const task = this.jobs.get(jobId);
    if (task) {
      task.stop();
      this.jobs.delete(jobId);
    }
  }

  private getServerPosition(): number {
    const port = process.env.PORT || "3000";
    const portNumber = parseInt(port, 10);

    return (portNumber % 10) - 1;
  }

  private async runJob(job: CronJob): Promise<void> {
    try {
      const execution = await CronJobExecution.create({
        cronJobId: job.id,
        startedAt: new Date(),
        status: "running",
        serverId: SERVER_ID,
      });
      const jobFunction = jobFunctions[job.functionName];
      if (!jobFunction) {
        throw new Error(`Job function ${job.functionName} not found`);
      }
      await jobFunction();
      await execution.update({
        completedAt: new Date(),
        status: "completed",
      });
      const nextRun = this.getNextRunDate(job.interval);
      await job.update({
        lastRunAt: new Date(),
        nextRunAt: nextRun,
      });
    } catch (error) {
      console.error(`Error running job ${job.name}:`, error);
      await CronJobExecution.update(
        {
          completedAt: new Date(),
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
        },
        {
          where: {
            cronJobId: job.id,
            status: "running",
            serverId: SERVER_ID,
          },
        }
      );
    }
  }

  public async getJobsStatus(): Promise<any[]> {
    const jobs = await CronJob.findAll();
    const runningExecutions = await CronJobExecution.findAll({
      where: {
        status: "running",
      },
    });
    return jobs.map((job) => {
      const runningExecution = runningExecutions.find(
        (exec) => exec.cronJobId === job.id
      );
      const now = new Date();
      const startedAt = runningExecution
        ? new Date(runningExecution.startedAt)
        : null;
      const elapsedSeconds = startedAt
        ? Math.floor((now.getTime() - startedAt.getTime()) / 1000)
        : 0;
      return {
        id: job.id,
        name: job.name,
        interval: job.interval,
        isActive: job.isActive,
        lastRunAt: job.lastRunAt,
        nextRunAt: job.nextRunAt,
        status: runningExecution ? "running" : "idle",
        serverId: runningExecution?.serverId || null,
        elapsedSeconds,
      };
    });
  }
}
