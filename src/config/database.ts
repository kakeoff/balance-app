import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import { SequelizeStorage, Umzug } from "umzug";

dotenv.config();

export const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false,
});

export const umzug = new Umzug({
  migrations: {
    glob: "dist/migrations/*.js",
    resolve: ({ name, path, context }) => {
      delete require.cache[require.resolve(path!)];
      const migration = require(path!);
      return {
        name,
        up: async () => migration.up(context),
        down: async () => migration.down(context),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

export const checkDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");
    await umzug.up();
    console.log("Migrations completed");
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};
