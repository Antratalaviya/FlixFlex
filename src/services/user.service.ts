import { User } from "../models/user.model";

const getUserByEmail = (id: string) => {
  const query: object = {
    _id: id,
  };
  const select: string = "-password -refreshToken";
  return User.findById(query).select(select);
};

const getUserById = (id: string) => {
  const query: object = {
    _id: id,
  };
  const select: string = "-password -refreshToken";
  return User.findById(query).select(select);
};

const getUserByEmailOrUsername = (email: string, username: string) => {
  const query: object = {
    $or: [{ email: email }, { username: username }],
  };
  const select: string = "-password";
  return User.findOne(query).select(select);
};

const createUser = async (body: object) => {
  return await User.create(body).then((res) => {
    return {
      _id: res._id,
      username: res.username,
      email: res.email,
      fullName: res.fullName,
      avatar: res.avatar,
      watchHistory: res.watchHistory,
    };
  });
};
export default {
  getUserByEmail,
  getUserById,
  getUserByEmailOrUsername,
  createUser,
};
