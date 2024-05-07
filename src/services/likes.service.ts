import mongoose from "mongoose";
import { Likes } from "../models/like.model";

const getLikedByComment = async (userId: string, commentId: string) => {
  return await Likes.findOne({
    likedBy: new mongoose.Types.ObjectId(userId),
    comment: new mongoose.Types.ObjectId(commentId),
  });
};

const getLikedByVideo = async (userId: string, videoId: string) => {
  return await Likes.findOne({
    likedBy: new mongoose.Types.ObjectId(userId),
    video: new mongoose.Types.ObjectId(videoId),
  });
};

const deleteLikedBy = async (likedId: string) => {
  return await Likes.findByIdAndDelete(likedId);
};

const createLikedByComment = async (userId: string, commentId: string) => {
  return await Likes.create({
    likedBy: userId,
    comment: commentId,
  });
};
const createLikedByVideo = async (userId: string, videoId: string) => {
  return await Likes.create({
    likedBy: userId,
    video: videoId,
  });
};

const getAllLikedVideos = async (
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
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $addFields: {
        videos: "$videos",
      },
    },
    {
      $project: {
        videos: 1,
      },
    },
  ];

  return Likes.aggregate(pipeline);
};

export default {
  getLikedByComment,
  getLikedByVideo,
  deleteLikedBy,
  createLikedByComment,
  createLikedByVideo,
  getAllLikedVideos,
};
