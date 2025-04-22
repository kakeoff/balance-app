import { DataTypes, QueryInterface, Sequelize } from "sequelize";

export async function up(
  queryInterface: QueryInterface,
  sequelize: Sequelize
): Promise<void> {
  const checkTableExists = async (tableName: string): Promise<boolean> => {
    const [result] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = '${tableName}'
      );
    `);
    return !!(result[0] as any)?.exists;
  };

  const checkEnumExists = async (enumName: string): Promise<boolean> => {
    const [result] = await sequelize.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = '${enumName}'
      );
    `);
    return !!(result[0] as any)?.exists;
  };

  try {
    console.log("Starting CRON tables migration");

    const cronJobsExist = await checkTableExists("cron_jobs");
    const cronJobExecutionsExist = await checkTableExists(
      "cron_job_executions"
    );
    const enumExists = await checkEnumExists("enum_cron_job_executions_status");

    if (cronJobsExist && cronJobExecutionsExist) {
      console.log("CRON tables are already set up");
      return;
    }

    if (!enumExists) {
      await sequelize.query(`
        CREATE TYPE "enum_cron_job_executions_status" AS ENUM ('running', 'completed', 'failed')
      `);
      console.log("Created status enum type");
    } else {
      console.log("Status enum type exists, skipping");
    }

    if (!cronJobsExist) {
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
      console.log("Created cron_jobs table");
    } else {
      console.log("cron_jobs table exists, skipping");
    }

    if (!cronJobExecutionsExist) {
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
      console.log("Created cron_job_executions table");

      await queryInterface.addIndex("cron_job_executions", ["cronJobId"]);
      await queryInterface.addIndex("cron_job_executions", ["status"]);
      await queryInterface.addIndex("cron_job_executions", ["serverId"]);
      console.log("Added indexes for cron_job_executions");
    } else {
      console.log("cron_job_executions table exists, skipping");
    }

    console.log("CRON tables migration completed");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        console.log("Some database objects already exist, continuing");
        console.log("Details:", error.message);
      } else {
        console.error("Migration error:", error.message);
        throw error;
      }
    } else {
      console.error("Unexpected migration error:", error);
      throw error;
    }
  }
}

export async function down(
  queryInterface: QueryInterface,
  sequelize: Sequelize
): Promise<void> {
  try {
    console.log("Starting CRON tables rollback");

    const [cronJobsResult] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'cron_job_executions'
      );
    `);
    const cronJobExecutionsExist = !!(cronJobsResult[0] as any)?.exists;

    if (cronJobExecutionsExist) {
      await queryInterface.dropTable("cron_job_executions");
      console.log("Dropped cron_job_executions table");
    } else {
      console.log("cron_job_executions table not found, skipping");
    }

    const [cronJobResult] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'cron_jobs'
      );
    `);
    const cronJobsExist = !!(cronJobResult[0] as any)?.exists;

    if (cronJobsExist) {
      await queryInterface.dropTable("cron_jobs");
      console.log("Dropped cron_jobs table");
    } else {
      console.log("cron_jobs table not found, skipping");
    }

    const [enumResult] = await sequelize.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_cron_job_executions_status'
      );
    `);
    const enumExists = !!(enumResult[0] as any)?.exists;

    if (enumExists) {
      await sequelize.query(`
        DROP TYPE IF EXISTS "enum_cron_job_executions_status"
      `);
      console.log("Dropped status enum type");
    } else {
      console.log("Status enum type not found, skipping");
    }

    console.log("CRON tables rollback completed");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Rollback error:", error.message);
    } else {
      console.error("Unexpected rollback error:", error);
    }
    throw error;
  }
}
