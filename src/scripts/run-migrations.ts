import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import { SequelizeStorage, Umzug } from "umzug";
import * as path from "path";

dotenv.config();

const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: (msg) => console.log(`[DB] ${msg}`),
});

const umzug = new Umzug({
  migrations: {
    glob: "dist/migrations/*.js",
    resolve: ({ name, path, context }) => {
      delete require.cache[require.resolve(path!)];
      const migration = require(path!);
      return {
        name,
        up: async () => migration.up(context, sequelize),
        down: async () => migration.down(context, sequelize),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    const command = process.argv[2] || "up";

    if (command === "up") {
      console.log("Running migrations...");
      const migrations = await umzug.up();
      console.log(`Executed ${migrations.length} migrations successfully.`);

      if (migrations.length === 0) {
        console.log("No pending migrations found.");
      } else {
        console.log("Applied migrations:");
        migrations.forEach((migration) => {
          console.log(`- ${migration.name}`);
        });
      }
    } else if (command === "down") {
      const count = process.argv[3] ? parseInt(process.argv[3], 10) : 1;
      console.log(`Rolling back ${count} migration(s)...`);
      const migrations = await umzug.down({ step: count });
      console.log(`Rolled back ${migrations.length} migrations successfully.`);

      if (migrations.length > 0) {
        console.log("Rolled back migrations:");
        migrations.forEach((migration) => {
          console.log(`- ${migration.name}`);
        });
      }
    } else if (command === "pending") {
      const pending = await umzug.pending();
      console.log(`Found ${pending.length} pending migrations:`);
      pending.forEach((migration) => {
        console.log(`- ${migration.name}`);
      });
    } else if (command === "executed") {
      const executed = await umzug.executed();
      console.log(`Found ${executed.length} executed migrations:`);
      executed.forEach((migration) => {
        console.log(`- ${migration.name}`);
      });
    } else {
      console.error(`Unknown command: ${command}`);
      console.log("Available commands: up, down, pending, executed");
      process.exit(1);
    }

    console.log("Migration process completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runMigrations();
