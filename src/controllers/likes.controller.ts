/**
 * toggleCommentLike
 * toggleVideoLike
 * getLikedVideos
 */
import status from "http-status";
import { Request, Response } from "express";
import { ApiError, ApiResponce, asyncHandler } from "../utils/customUtilities";
import likesService from "../services/likes.service";
import { AppString } from "../utils/appString";

const toggleCommentLike = asyncHandler(async (req: Request, res: Response) => {
  try {
    let userId = req.user._id;
    let commentId: string = req.params.id;

    let likedByUser = await likesService.getLikedByComment(userId, commentId);
    if (likedByUser) {
      let deleted = await likesService.deleteLikedBy(likedByUser._id);

      if (!deleted) {
        return res
          .status(status.INTERNAL_SERVER_ERROR)
          .json(new ApiError(status.INTERNAL_SERVER_ERROR));
      }

      return res
        .status(status.OK)
        .json(new ApiResponce(status.OK, {}, AppString.DISLIKED_COMMENT));
    } else {
      let created = await likesService.createLikedByComment(userId, commentId);
      if (!created) {
        return res
          .status(status.INTERNAL_SERVER_ERROR)
          .json(new ApiError(status.INTERNAL_SERVER_ERROR));
      }
      return res
        .status(status.OK)
        .json(new ApiResponce(status.OK, {}, AppString.LIKED_COMMENT));
    }
  } catch (error) {
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
      );
  }
});

const toggleVideoLike = asyncHandler(async (req: Request, res: Response) => {
  try {
    let userId = req.user._id;
    let videoId: string = req.params.id;

    let likedByUser = await likesService.getLikedByVideo(userId, videoId);
    if (likedByUser) {
      let deleted = await likesService.deleteLikedBy(likedByUser._id);

      if (!deleted) {
        return res
          .status(status.INTERNAL_SERVER_ERROR)
          .json(new ApiError(status.INTERNAL_SERVER_ERROR));
      }

      return res
        .status(status.OK)
        .json(new ApiResponce(status.OK, {}, AppString.DISLIKED_VIDEO));
    } else {
      let created = await likesService.createLikedByVideo(userId, videoId);
      if (!created) {
        return res
          .status(status.INTERNAL_SERVER_ERROR)
          .json(new ApiError(status.INTERNAL_SERVER_ERROR));
      }
      return res
        .status(status.OK)
        .json(new ApiResponce(status.OK, {}, AppString.LIKED_VIDEO));
    }
  } catch (error) {
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
      );
  }
});

const getLikedVideos = asyncHandler(async (req: Request, res: Response) => {
  try {
    let videoId: string = req.params.id;
    let page: number =
      typeof req.query?.page === "string" ? parseInt(req.query?.page) || 1 : 1;
    let limit: number =
      typeof req.query?.limit === "string"
        ? parseInt(req.query?.limit) || 10
        : 10;

    let videos = await likesService.getAllLikedVideos(videoId, page, limit);

    return res
      .status(status.OK)
      .json(new ApiResponce(status.OK, videos, AppString.VIDEO_RETRIEVED));
  } catch (error) {
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
      );
  }
});
export default {
  toggleCommentLike,
  toggleVideoLike,
  getLikedVideos,
};
