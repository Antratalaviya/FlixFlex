import mongoose from "mongoose";
import { Comment } from "../models/comment.model";

const postComment = async (
  content: string,
  userId: string,
  videoId: string
) => {
  return await Comment.create({
    content: content,
    video: videoId,
    owner: userId,
  });
};

const deleteComment = async (commentId: string) => {
  return await Comment.findByIdAndDelete(commentId);
};

const getAllVideoComment = async (
  videoId: string,
  page: number,
  limit: number
) => {
  let pipeline = [
    {
      $match: { video: new mongoose.Types.ObjectId(videoId) },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "comments",
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $addFields: {
        username: { $first: "$user.username" },
        avatar: { $first: "$user.avatar" },
        commentLiked: { $size: "$comments" },
        isOwnerLiked: {
          $in: ["$video.owner", "$comments.likedBy"],
        },
      },
    },
    {
      $project : {
        username : 1,
        avatar : 1,
        content : 1,
        commentLiked : 1,
        isOwnerLiked : 1
      }
    }
  ];

  return await Comment.aggregate(pipeline);
};
export default {
  postComment,
  deleteComment,
  getAllVideoComment,
};
