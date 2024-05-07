import express from "express";

import { verifyUserAccess } from "../middlewares/auth.middleware";
import subscriptionController from "../controllers/subscription.controller";
import { validate } from "../middlewares/validation.middleware";
import subscriptionValidation from "../validations/subscription.validation";

const router = express.Router();

router.use(verifyUserAccess);

router.get(
  "/u/:id",
  validate(subscriptionValidation.idValidation),
  subscriptionController.getChannelSubscriber
);
router.get(
  "/c/:id",
  validate(subscriptionValidation.idValidation),
  subscriptionController.getSubscribedChannel
);
router.post(
  "/:id",
  validate(subscriptionValidation.idValidation),
  subscriptionController.toggleSubscription
);

export default router;
