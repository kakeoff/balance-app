import { DataTypes, QueryInterface, Sequelize } from "sequelize";

export async function up(
  queryInterface: QueryInterface,
  sequelize: Sequelize
): Promise<void> {
  try {
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_cron_job_executions_status" AS ENUM ('running', 'completed', 'failed')
    `);

    await queryInterface.createTable("cron_jobs", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.createTable("cron_job_executions", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cronJobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "cron_jobs",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      status: {
        type: DataTypes.ENUM("running", "completed", "failed"),
        allowNull: false,
        defaultValue: "running",
      },
      startedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      error: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      serverId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("cron_job_executions", ["cronJobId"]);
    await queryInterface.addIndex("cron_job_executions", ["status"]);
    await queryInterface.addIndex("cron_job_executions", ["serverId"]);
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  }
}

export async function down(
  queryInterface: QueryInterface,
  sequelize: Sequelize
): Promise<void> {
  try {
    await queryInterface.dropTable("cron_job_executions");
    await queryInterface.dropTable("cron_jobs");
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_cron_job_executions_status"
    `);
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  }
}
