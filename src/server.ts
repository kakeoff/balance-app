import { app } from "./app";
import { sequelize } from "./config/database";
import { CronService } from "./services/cron.service";

const PORT = process.env.PORT || 3000;
const cronService = new CronService();

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");

    const serverNumber = parseInt(process.env.PORT || "3000", 10) % 10;
    const delayTime = serverNumber * 2000;
    console.log(`Waiting ${delayTime}ms before initializing services...`);
    await new Promise((resolve) => setTimeout(resolve, delayTime));

    try {
      await cronService.initialize();
      console.log("Cron service initialized successfully");
    } catch (error) {
      console.error("Error initializing cron service:", error);
      console.log("Continuing application startup despite cron service errors");
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
