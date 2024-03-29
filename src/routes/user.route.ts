import express from "express";

import userController from "../controllers/user.controller";
import { upload } from "../middlewares/multer.middleware";

const router = express();

router.post(
  "/register",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  userController.register
);

router.post("/login", userController.login);

export default router;
