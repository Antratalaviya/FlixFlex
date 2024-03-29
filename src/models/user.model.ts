import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "config";

import { Collection } from "../constants";
import { NextFunction } from "express";

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

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    return next(error as Error);
  }
});
userSchema.methods.isPasswordMatched = async function (password: string) {
  const result = await bcrypt.compare(password, this.password);
  return result;
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      sub: {
        _id: this._id,
        username: this.username,
        email: this.email,
        fullName: this.fullName,
      },
      exp: config.get("ACCESS_TOKEN_EXPIRE"),
    },
    config.get("ACCESS_TOKEN_SECRET")
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      sub: {
        _id: this._id,
      },
      exp: config.get("ACCESS_TOKEN_EXPIRE"),
    },
    config.get("ACCESS_TOKEN_SECRET")
  );
};

export const User = mongoose.model(Collection.MODEL_USER, userSchema);
