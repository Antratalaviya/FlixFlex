import express from "express";

import userController from "../controllers/user.controller";
import { upload } from "../middlewares/multer.middleware";
import { verifyUserAccess } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import userValidation from "../validations/user.validation";

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
  validate(userValidation.register),
  userController.register
);

router.post("/login", validate(userValidation.login), userController.login);

//secure routes

router.patch("/logout", verifyUserAccess, userController.logOut);
router.put(
  "/edit",
  validate(userValidation.profile),
  verifyUserAccess,
  userController.updateProfile
);

export default router;
