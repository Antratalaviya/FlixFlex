import { UserDocument } from "../models/interfaceModel";
import { User } from "../models/user.model";
const getUserByEmail = (id: string) => {
  const query: object = {
    _id: id,
  };
  const select: string = "-password -refreshToken -__v";
  return User.findById(query).select(select);
};

const getUserById = (id: string) => {
  const query: object = {
    _id: id,
  };
  const select: string = "-password -refreshToken -__v";
  return User.findById(query).select(select);
};

const getUserByEmailOrUsername = (email: string, username: string) => {
  const query: object = {
    $or: [{ email: email }, { username: username }],
  };
  return User.findOne(query).select("-__v");
};

const createUser = async (input: object) => {
  return await User.create(input);
};

const updateUserById = async (id: string, userBody: UserDocument) => {
  if (userBody.email || userBody.username) {
    let exist = await User.findOne({
      $and: [
        {
          $or: [{ email: userBody?.email }, { username: userBody?.username }],
        },
        {
          _id: { $ne: id },
        },
      ],
    });
    if (exist) {
      return null;
    }
  }

  return await User.findByIdAndUpdate(
    id,
    {
      $set: { ...userBody },
    },
    {
      new: true,
    }
  );
};

const getFullUserById = async (
  username: string,
  _id: string
): Promise<object> => {
  let pipeline = [
    {
      $match: { username: username?.toLowerCase() },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "SubscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedTo: {
          $size: "$SubscribedTo",
        },
        isSubscribed: {
          $cond: {
            $if: { $in: [_id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        channelsSubscribedTo: 1,
        isSubscribed: 1,
      },
    },
  ];

  return await User.aggregate(pipeline);
};

const getAllUser = async (page: number, limit: number) => {
  return await User.find()
    .select("-password -refreshToken -__v")
    .skip((page - 1) * limit)
    .limit(limit);
};

export default {
  getUserByEmail,
  getUserById,
  getUserByEmailOrUsername,
  createUser,
  updateUserById,
  getAllUser,
  getFullUserById,
};
