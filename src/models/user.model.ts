import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "config";

import { Collection } from "../constants";
import { UserDocument } from "./interfaceModel";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (this: UserDocument, next) {
  if (!this.isModified("password")) return next();
  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    return next(error as Error);
  }
});
userSchema.methods.isPasswordMatched = async function (
  password: string
): Promise<boolean> {
  const user = this as UserDocument;

  const result = await bcrypt.compare(password, user.password);
  return result;
};

userSchema.methods.generateAccessToken = function (this: UserDocument) {
  let tokenMaxAge: number = config.get("ACCESS_TOKEN_EXPIRE");
  return jwt.sign(
    {
      sub: {
        _id: this._id,
        username: this.username,
        email: this.email,
        fullName: this.fullName,
      },
      exp: tokenMaxAge * 86400,
    },
    config.get("ACCESS_TOKEN_SECRET")
  );
};

userSchema.methods.generateRefreshToken = function (this: UserDocument) {
  let tokenMaxAge: number = config.get("REFRESH_TOKEN_EXPIRE");
  return jwt.sign(
    {
      sub: {
        _id: this._id,
      },
      exp: tokenMaxAge * 86400,
    },
    config.get("REFRESH_TOKEN_SECRET")
  );
};

export const User = mongoose.model<UserDocument>(
  Collection.MODEL_USER,
  userSchema
);
