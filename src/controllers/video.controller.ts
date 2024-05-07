/**
 * publishAVideo  //test-done
 * getVideoById //_id params  done
 * updateVideo //title des  done
 * deleteVideo //delete video thumbnail from fb and video document done
 * togglePublishStatus  //isPublished status done
 * getAllVideos // user:username avatar video: video done
 */
import { Request, Response } from "express";
import status from "http-status";

import { videoDuration } from "../utils/customUtilities";
import { ApiError, ApiResponce, asyncHandler } from "../utils/customUtilities";
import { AppString } from "../utils/appString";
import { FirebaseBucket, IFileStatus } from "../constants";
import firebaseService from "../middlewares/uploadFB.middleware";
import { VideoInput } from "../models/interfaceModel";
import videoService from "../services/video.service";

const publishAVideo = asyncHandler(async (req: Request, res: Response) => {
  try {
    const input = req.body as VideoInput;
    if (!input.title || !input.description) {
      return res
        .status(status.BAD_REQUEST)
        .json(new ApiError(status.BAD_REQUEST, AppString.TITLE_DESC_REQUIRED));
    }
    let fileArray = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    let videoFile = fileArray["video"] ? fileArray["video"][0] : undefined;
    let thumbnailFile = fileArray["thumbnail"]
      ? fileArray["thumbnail"][0]
      : undefined;

    if (!videoFile || !thumbnailFile) {
      return res
        .status(status.BAD_REQUEST)
        .json(
          new ApiError(status.BAD_REQUEST, AppString.VIDEO_THUMBNAIL_REQUIRED)
        );
    }

    let videoStatus: IFileStatus = await firebaseService.uploadToFireBase(
      videoFile,
      FirebaseBucket.VIDEO
    );

    let thumbnailStatus: IFileStatus = await firebaseService.uploadToFireBase(
      thumbnailFile,
      FirebaseBucket.IMAGE
    );

    if (!videoStatus.isUploaded || !thumbnailStatus.isUploaded) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json(
          new ApiError(status.INTERNAL_SERVER_ERROR, AppString.FILE_UPLOAD_ERR)
        );
    }
    let videoFileUrl = videoStatus.filePath;
    let thumbnailUrl = thumbnailStatus.filePath;
    let duration = await videoDuration(videoFile.buffer);
    let video = {
      videoFile: videoFileUrl,
      thumbnail: thumbnailUrl,
      owner: req.user._id,
      title: input.title,
      description: input.description,
      duration: duration,
      isPublished: true,
    };

    await videoService.postVideo(video);

    return res
      .status(status.OK)
      .json(new ApiResponce(status.OK, {}, AppString.VIDEO_UPLOADED));
  } catch (error) {
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
      );
  }
});

const updateVideo = asyncHandler(async (req: Request, res: Response) => {
  try {
    const input = req.body as VideoInput;
    const _id: string = req.params.id;
    let video = await videoService.getVideoById(_id);
    if (!input) {
      return res
        .status(status.BAD_REQUEST)
        .json(new ApiError(status.BAD_REQUEST, AppString.TITLE_DESC_REQUIRED));
    }
    if (!video) {
      return res
        .status(status.NOT_FOUND)
        .json(new ApiError(status.NOT_FOUND, AppString.VIDEO_NOT_FOUND));
    }

    let updateVideo = await videoService.updateVideoById(_id, {
      title: input.title,
      description: input.description,
    });
    if (!updateVideo) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json(
          new ApiError(status.INTERNAL_SERVER_ERROR, AppString.UPDATE_FAILED)
        );
    }
    return res
      .status(status.OK)
      .json(new ApiResponce(status.OK, {}, AppString.VIDEO_UPDATED));
  } catch (error) {
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
      );
  }
});

const searchVideo = asyncHandler(async (req: Request, res: Response) => {
  try {
    let keyword: string =
      typeof req.query?.keyword === "string" ? req.query?.keyword : "";
    let page: number =
      typeof req.query?.page === "string" ? parseInt(req.query?.page) || 1 : 1;
    let limit: number =
      typeof req.query?.limit === "string"
        ? parseInt(req.query?.limit) || 10
        : 10;

    let video = await videoService.getAllVideo(keyword, page, limit);

    if (!video) {
      return res
        .status(status.NOT_FOUND)
        .json(new ApiError(status.NOT_FOUND, AppString.VIDEO_NOT_FOUND));
    }
    return res
      .status(status.OK)
      .json(
        new ApiResponce(
          status.OK,
          { total: video.length, videos: video },
          AppString.VIDEO_RETRIEVED
        )
      );
  } catch (error) {
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
      );
  }
});
const getVideo = asyncHandler(async (req: Request, res: Response) => {
  try {
    let id = req.params.id;

    let video = await videoService.getFullVideoById(id);

    if (!video) {
      return res
        .status(status.NOT_FOUND)
        .json(new ApiError(status.NOT_FOUND, AppString.VIDEO_NOT_FOUND));
    }
    return res
      .status(status.OK)
      .json(new ApiResponce(status.OK, video, AppString.VIDEO_RETRIEVED));
  } catch (error) {
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
      );
  }
});
const getAllVideo = asyncHandler(async (req: Request, res: Response) => {
  try {
    let page: number =
      typeof req.query?.page === "string" ? parseInt(req.query?.page) || 1 : 1;
    let limit: number =
      typeof req.query?.limit === "string"
        ? parseInt(req.query?.limit) || 10
        : 10;
    let video = await videoService.getAllVideo("", page, limit);

    if (!video) {
      return res
        .status(status.NOT_FOUND)
        .json(new ApiError(status.NOT_FOUND, AppString.VIDEO_NOT_FOUND));
    }
    return res
      .status(status.OK)
      .json(new ApiResponce(status.OK, video, AppString.VIDEO_RETRIEVED));
  } catch (error) {
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
      );
  }
});

const togglePublishStatus = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const _id: string = req.params.id;
      let video = await videoService.getVideoById(_id);

      if (!video) {
        return res
          .status(status.NOT_FOUND)
          .json(new ApiError(status.NOT_FOUND, AppString.VIDEO_NOT_FOUND));
      }

      let updateVideo = await videoService.updateVideoById(_id, {
        isPublished: !video.isPublished,
      });
      if (!updateVideo) {
        return res
          .status(status.INTERNAL_SERVER_ERROR)
          .json(
            new ApiError(status.INTERNAL_SERVER_ERROR, AppString.UPDATE_FAILED)
          );
      }
      return res
        .status(status.OK)
        .json(new ApiResponce(status.OK, {}, AppString.VIDEO_UPDATED));
    } catch (error) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json(
          new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
        );
    }
  }
);

const deleteVideo = asyncHandler(async (req: Request, res: Response) => {
  try {
    let _id: string = req.params.id;
    let video = await videoService.getVideoById(_id);

    if (!video) {
      return res
        .status(status.NOT_FOUND)
        .json(new ApiError(status.NOT_FOUND, AppString.VIDEO_NOT_FOUND));
    }

    let deleteVideo = await firebaseService.deleteFromFirebase(video.videoFile);
    if (!deleteVideo.isDeleted) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json(new ApiError(status.INTERNAL_SERVER_ERROR));
    }
    let deleteThumbnail = await firebaseService.deleteFromFirebase(
      video.thumbnail
    );
    if (!deleteThumbnail.isDeleted) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json(new ApiError(status.INTERNAL_SERVER_ERROR));
    }
    let deleted = await videoService.deleteVideoById(_id);
    if (!deleted) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json(
          new ApiError(status.INTERNAL_SERVER_ERROR, AppString.DELETE_FAILED)
        );
    }
    return res
      .status(status.OK)
      .json(new ApiResponce(status.OK, {}, AppString.VIDEO_DELETED));
  } catch (error) {
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
      );
  }
});

export default {
  publishAVideo,
  updateVideo,
  getVideo,
  getAllVideo,
  togglePublishStatus,
  deleteVideo,
  searchVideo,
};
