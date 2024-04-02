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

const logoutUserById = async (id: string) => {
  return await User.findByIdAndUpdate(
    id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );
};
const updateUserById = async (id: string, userBody: UserDocument) => {
  if (userBody.email || userBody.username) {
    let exist = await User.findOne({
      $and: [
        {
          $or: [{ email: userBody.email }, { username: userBody.username }],
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
export default {
  getUserByEmail,
  getUserById,
  getUserByEmailOrUsername,
  createUser,
  updateUserById,
  logoutUserById,
};
