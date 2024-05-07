import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import yaml from 'yaml';

import userRoutes from "./routes/user.route";
import videoRoutes from "./routes/video.route";
import subscriptionRoutes from "./routes/subscription.route";
import likesRoutes from "./routes/likes.route";
import commentRoutes from "./routes/comment.route";

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

// swagger configuration
const swaggerFile = fs.readFileSync(
  path.join(process.cwd(), "swagger.yaml"),
  "utf-8"
);
const swaggerJson = yaml.parse(swaggerFile);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJson));

// app routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/video", videoRoutes);
app.use("/api/v1/subscription", subscriptionRoutes);
app.use("/api/v1/comment", commentRoutes);
app.use("/api/v1/likes", likesRoutes);
 
export { app };
