import express from "express";

import userController from "../controllers/user.controller";
const router = express();

router.get("/", userController.getUser);

export default router;
