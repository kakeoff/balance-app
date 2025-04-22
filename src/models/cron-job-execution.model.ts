import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import { CronJob } from "./cron-job.model";

export interface CronJobExecutionAttributes {
  id: number;
  cronJobId: number;
  startedAt: Date;
  completedAt: Date | null;
  status: "running" | "completed" | "failed";
  serverId: string;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CronJobExecutionCreationAttributes
  extends Omit<CronJobExecutionAttributes, "id" | "createdAt" | "updatedAt"> {}

export class CronJobExecution
  extends Model<CronJobExecutionAttributes, CronJobExecutionCreationAttributes>
  implements CronJobExecutionAttributes
{
  public id!: number;
  public cronJobId!: number;
  public startedAt!: Date;
  public completedAt!: Date | null;
  public status!: "running" | "completed" | "failed";
  public serverId!: string;
  public error!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CronJobExecution.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cronJobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("running", "completed", "failed"),
      allowNull: false,
      defaultValue: "running",
    },
    serverId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "cron_job_executions",
    timestamps: true,
  }
);

CronJob.hasMany(CronJobExecution, {
  foreignKey: "cronJobId",
  constraints: false,
});

CronJobExecution.belongsTo(CronJob, {
  foreignKey: "cronJobId",
  constraints: false,
});
