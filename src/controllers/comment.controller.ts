/**
 * add
 * get // owner : avatar userName comment:createdAt content likes: commentLikes ownerLiked:bool
 * delete
 */
import status from "http-status";
import { Request, Response } from "express";

import { ApiError, ApiResponce, asyncHandler } from "../utils/customUtilities";
import { AppString } from "../utils/appString";
import commentService from "../services/comment.service";

const postComment = asyncHandler(async (req: Request, res: Response) => {
  try {
    let content: string = req.body.content;
    let userId = req.user._id;
    let videoId: string = req.params.id;

    let comment = await commentService.postComment(content, userId, videoId);

    if (!comment) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json(new ApiError(status.INTERNAL_SERVER_ERROR));
    }

    return res
      .status(status.OK)
      .json(new ApiResponce(status.OK, {}, AppString.COMMENT_POSTED));
  } catch (error) {
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
      );
  }
});

const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  try {
    let commentId: string = req.params.id;
    let deletedComment = await commentService.deleteComment(commentId);

    if (!deletedComment) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json(new ApiError(status.INTERNAL_SERVER_ERROR));
    }
    return res
      .status(status.OK)
      .json(new ApiResponce(status.OK, {}, AppString.COMMENT_DELETED));
  } catch (error) {
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
      );
  }
});

const getAllVideoComment = asyncHandler(async (req: Request, res: Response) => {
  try {
    const videoId: string = req.params.id;
    let page: number =
      typeof req.query?.page === "string" ? parseInt(req.query?.page) || 1 : 1;
    let limit: number =
      typeof req.query?.limit === "string"
        ? parseInt(req.query?.limit) || 10
        : 10;

    let comments = await commentService.getAllVideoComment(
      videoId,
      page,
      limit
    );

    return res
      .status(status.OK)
      .json(
        new ApiResponce(
          status.OK,
          { total: comments.length, comments: comments },
          AppString.COMMENT_RETRIEVED
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

export default {
  postComment,
  deleteComment,
  getAllVideoComment,
};
