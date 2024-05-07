import express from "express";
import { verifyUserAccess } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import videoValidation from "../validations/video.validation";
import videoController from "../controllers/video.controller";
import { upload } from "../middlewares/multer.middleware";

const router = express.Router();

router.use(verifyUserAccess);

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
  validate(videoValidation.postVideo),
  videoController.publishAVideo
);

router.get("/", videoController.getAllVideo);
router.get("/search", videoController.searchVideo);
router.get(
  "/:id",
  validate(videoValidation.getVideo),
  videoController.getVideo
);

router.post(
  "/:id",
  validate(videoValidation.updateVideo),
  videoController.updateVideo
);

router.post(
  "/publishStatus/:id",
  validate(videoValidation.getVideo),
  videoController.togglePublishStatus
);

router.delete(
  "/:id",
  validate(videoValidation.getVideo),
  videoController.deleteVideo
);

export default router;
