import { app } from "./app";
import { checkDatabase } from "./config/database";
import { sequelize } from "./config/database";
import { CronService } from "./services/cron.service";

const PORT = process.env.PORT || 3000;
const cronService = new CronService();

async function startServer() {
  await checkDatabase();

  sequelize
    .sync({ alter: true })
    .then(async () => {
      console.log("Migrations completed");

      try {
        await cronService.initialize();
        console.log("Cron service initialized successfully");
      } catch (error: unknown) {
        console.error("Failed to initialize cron service:", error);
      }

      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    })
    .catch((error: unknown) => {
      console.error("Failed to run migrations:", error);
    });
}

startServer();
