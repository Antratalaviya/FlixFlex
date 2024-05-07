import mongoose from "mongoose";
import { Video } from "../models/video.model";

const postVideo = async (input: object) => {
  return await Video.create(input);
};

const getVideoById = async (_id: string) => {
  return await Video.findById(_id).select("-__v");
};

const getFullVideoById = async (videoId: string): Promise<object> => {
  await Video.updateOne({ _id: videoId }, { $inc: { views: 1 } });

  let pipeline = [
    {
      $match: { _id: new mongoose.Types.ObjectId(videoId) },
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
        foreignField: "video",
        as: "videos",
      },
    },
    {
      $addFields: {
        avatar: {
          $first: "$user.avatar",
        },
        username: {
          $first: "$user.username",
        },
        likes: {
          $size: "$videos",
        },
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        thumbnail: 1,
        videoFile: 1,
        duration: 1,
        avatar: 1,
        username: 1,
        views: 1,
        likes: 1,
        createdAt: 1,
      },
    },
  ];

  return await Video.aggregate(pipeline);
};

const getAllVideo = async (
  keyword: string,
  page: number,
  limit: number
) => {
  let pipeline = [
    {
      $match: {
        $or: [
          { description: { $regex: new RegExp(keyword.toLowerCase(), "i") } },
          { title: { $regex: new RegExp(keyword.toLowerCase(), "i") } }
        ]
      }
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
      $addFields: {
        avatar: {
          $first: "$user.avatar",
        },
        username: {
          $first: "$user.username",
        },
      },
    },
    {
      $project: {
        title: 1,
        thumbnail: 1,
        videoFile: 1,
        duration: 1,
        avatar: 1,
        username: 1,
        createdAt: 1,
        views: 1,
      },
    },
  ];

  return await Video.aggregate(pipeline);
};

const updateVideoById = async (_id: string, body: object) => {
  return await Video.findByIdAndUpdate(
    _id,
    {
      $set: { ...body },
    },
    { new: true }
  );
};

const deleteVideoById = async (_id: string) => {
  return await Video.findByIdAndDelete(_id);
};

export default {
  postVideo,
  getVideoById,
  getFullVideoById,
  getAllVideo,
  updateVideoById,
  deleteVideoById,
};
