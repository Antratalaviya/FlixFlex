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
  return User.findOne(query);
};

const createUser = async (input: object) => {
  return await User.create(input);
};
export default {
  getUserByEmail,
  getUserById,
  getUserByEmailOrUsername,
  createUser,
};
