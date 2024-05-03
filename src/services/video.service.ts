import { Video } from "../models/video.model";

const postVideo = async (input: object) => {
  return await Video.create(input);
};

const getVideoById = async (_id: string) => {
  return await Video.findById(_id).select("-__v");
};

const getAllVideoById = async (
  matchCriteria: object,
  page: number,
  limit: number
): Promise<object> => {
  let pipeline = [
    {
      $match: matchCriteria,
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
        _id: 1,
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
  getAllVideoById,
  updateVideoById,
  deleteVideoById
};
