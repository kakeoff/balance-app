import cors from "cors";
import express from "express";
import { errorHandler } from "./middlewares/error.middleware";
import usersRouter from "./routes/users.route";
import cronRouter from "./routes/cron.route";
import { notFoundHandler } from "./middlewares/not-found.middleware";
import { CronService } from "./services/cron.service";

const app = express();
const cronService = new CronService();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/users", usersRouter);
app.use("/api/cron", cronRouter);

app.use(notFoundHandler);
app.use(errorHandler);

cronService.initialize().catch((err) => {
  console.error("Failed to initialize cron service:", err);
});

export { app };
