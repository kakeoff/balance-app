import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export interface CronJobAttributes {
  id: number;
  name: string;
  interval: string;
  functionName: string;
  isActive: boolean;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CronJobCreationAttributes
  extends Omit<
    CronJobAttributes,
    "id" | "lastRunAt" | "nextRunAt" | "createdAt" | "updatedAt"
  > {}

export class CronJob
  extends Model<CronJobAttributes, CronJobCreationAttributes>
  implements CronJobAttributes
{
  public id!: number;
  public name!: string;
  public interval!: string;
  public functionName!: string;
  public isActive!: boolean;
  public lastRunAt!: Date | null;
  public nextRunAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CronJob.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    interval: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    functionName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    lastRunAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    nextRunAt: {
      type: DataTypes.DATE,
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
    tableName: "cron_jobs",
  }
);
