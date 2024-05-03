import express from "express";
import { verifyUserAccess } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import videoValidation from "../validations/video.validation";
import videoController from "../controllers/video.controller";
import { upload } from "../middlewares/multer.middleware";

const router = express.Router();

router.post(
  "/publish",
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  verifyUserAccess,
  validate(videoValidation.postVideo),
  videoController.publishAVideo
);

router.get("/", verifyUserAccess, videoController.getAllVideo);

router.get(
  "/:id",
  verifyUserAccess,
  validate(videoValidation.getVideo),
  videoController.getVideo
);

router.post(
  "/:id",
  verifyUserAccess,
  validate(videoValidation.updateVideo),
  videoController.updateVideo
);

router.post(
  "/publishStatus/:id",
  verifyUserAccess,
  validate(videoValidation.getVideo),
  videoController.togglePublishStatus
);

router.delete(
  "/:id",
  verifyUserAccess,
  validate(videoValidation.getVideo),
  videoController.deleteVideo
);
export default router;
