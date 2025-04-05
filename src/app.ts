import cors from "cors";
import express from "express";
import { errorHandler } from "./middlewares/error.middleware";
import usersRouter from "./routes/users.route";
import { notFoundHandler } from "./middlewares/not-found.middleware";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use("/api/users", usersRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
