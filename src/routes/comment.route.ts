import express from "express";
import { verifyUserAccess } from "../middlewares/auth.middleware";
import commentController from "../controllers/comment.controller";
import { validate } from "../middlewares/validation.middleware";
import commentValidation from "../validations/comment.validation";

const router = express.Router();

router.use(verifyUserAccess);

router.post(
  "/:id",
  validate(commentValidation.postComment),
  commentController.postComment
);

router.delete(
  "/:id",
  validate(commentValidation.idValidation),
  commentController.deleteComment
);

router.get(
  "/videos/:id",
  validate(commentValidation.idValidation),
  commentController.getAllVideoComment
);

export default router;
