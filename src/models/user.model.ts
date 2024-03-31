import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import config from "config";

import { Collection, TokenType } from "../constants";
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
  const secretKey: Secret = config.get("ACCESS_TOKEN_SECRET");
  if (!secretKey) {
    throw new Error("Access token secret key is not defined");
  }

  const payload = {
    _id: this._id,
    username: this.username,
    email: this.email,
    fullName: this.fullName,
  };

  const options: SignOptions = {
    expiresIn: config.get("ACCESS_TOKEN_EXPIRE"),
    algorithm: "HS256",
  };

  return jwt.sign(payload, secretKey, options);
};

userSchema.methods.generateRefreshToken = function (this: UserDocument) {
  const secretKey: Secret = config.get("REFRESH_TOKEN_SECRET");
  if (!secretKey) {
    throw new Error("Access token secret key is not defined");
  }

  const payload = {
    _id: this._id,
  };

  const options: SignOptions = {
    expiresIn: config.get("REFRESH_TOKEN_EXPIRE"),
    algorithm: "HS256"
  };

  return jwt.sign(payload, secretKey, options);
};

export const User = mongoose.model<UserDocument>(
  Collection.MODEL_USER,
  userSchema
);
