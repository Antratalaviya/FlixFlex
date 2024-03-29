import { User } from "../models/user.model";

const getUserByEmail = (email: string): object => {
  const query: object = {
    email: email,
  };
  const select: string = "-password -refreshToken";
  return User.findOne(query).select(select);
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
  const select: string = "-password -refreshToken";
  return User.findOne(query).select(select);
};

const createUser = (body: object): object => {
  return new User(body).select("-password -refreshToken");
};
export default {
  getUserByEmail,
  getUserById,
  getUserByEmailOrUsername,
  createUser,
};
