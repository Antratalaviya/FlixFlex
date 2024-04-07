import express from "express";

import userController from "../controllers/user.controller";
import { upload } from "../middlewares/multer.middleware";
import { verifyUserAccess } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import userValidation from "../validations/user.validation";

const router = express();

router.get("/", userController.getAllUser); //not authorized
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
  verifyUserAccess,
  validate(userValidation.profile),
  userController.updateProfile
);

router.get("/profile", verifyUserAccess, userController.getProfile);

router.get("/refresh", verifyUserAccess, userController.refreshAccessToken);

router.put(
  "/edit/password",
  verifyUserAccess,
  validate(userValidation.password),
  userController.changeCurrentPassword
);

router.put(
  "/edit/coverImage",
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
  verifyUserAccess,
  validate(userValidation.file),
  userController.updateUserCoverImage
);
router.put(
  "/edit/avatar",
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
  verifyUserAccess,
  validate(userValidation.file),
  userController.updateUserAvatar
);
router.put(
  "/edit/account",
  verifyUserAccess,
  validate(userValidation.account),
  userController.updateAccountDetails
);

export default router;
