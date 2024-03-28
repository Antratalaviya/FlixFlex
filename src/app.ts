import express, { NextFunction, Request, Response } from "express";
import cors from "cors";

import userRoutes from "./routes/user.route";

const app = express();

app.use((_, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Header",
    "Origin, X-Requested-With, Authorization, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    methods: "GET, POST, PUT, PATCH, DELETE",
  })
);

app.get("/test", (req: Request, res: Response) => {
  res.json("Api is running");
});

app.use("/api/v1/user", userRoutes);

export { app };
