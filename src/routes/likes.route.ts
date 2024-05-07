import express from "express";
import { verifyUserAccess } from "../middlewares/auth.middleware";
import likesController from "../controllers/likes.controller";
import { validate } from "../middlewares/validation.middleware";
import likesValidation from "../validations/likes.validation";

const router = express.Router();

router.use(verifyUserAccess);

router.post(
  "/toggle/c/:id",
  validate(likesValidation.idValidation),
  likesController.toggleCommentLike
);
router.post(
  "/toggle/v/:id",
  validate(likesValidation.idValidation),
  likesController.toggleVideoLike
);
router.get(
  "/videos/:id",
  validate(likesValidation.idValidation),
  likesController.getLikedVideos
);

export default router;
