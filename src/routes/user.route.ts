import express from "express";

import userController from "../controllers/user.controller";

const router = express();

router.post("/", userController.register);

export default router;
