import { Sequelize } from "sequelize";
import { Umzug, SequelizeStorage } from "umzug";
import { MigrationLockService } from "../services/migration-lock.service";
import path from "path";

async function runMigrations() {
  const sequelize = new Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "balance_app",
  });

  const lockService = new MigrationLockService(sequelize);

  try {
    console.log("Attempting to acquire migration lock...");
    const hasLock = await lockService.acquireLock();

    if (!hasLock) {
      console.log("Another instance is already running migrations. Exiting...");
      return;
    }

    console.log("Lock acquired, starting migrations...");

    const umzug = new Umzug({
      migrations: {
        glob: ["*.ts", { cwd: path.join(__dirname, "../migrations") }],
      },
      storage: new SequelizeStorage({ sequelize }),
      context: sequelize.getQueryInterface(),
      logger: console,
    });

    await umzug.up();
    console.log("Migrations completed successfully!");
  } catch (error) {
    console.error("Error during migrations:", error);
  } finally {
    await lockService.releaseLock();
    console.log("Lock released");
    await sequelize.close();
  }
}

runMigrations();
