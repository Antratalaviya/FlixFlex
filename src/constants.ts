import { Request } from "express";
import { Document } from "mongoose";

export interface IFileStatus {
  isUploaded: boolean;
  filePath: string;
}

export const Collection = {
  MODEL_USER: "User",
  MODEL_VIDEO: "Video",
};

export const FirebaseBucket = {
  IMAGE: "Images",
  VIDEO: "Videos",
};

export const TokenType = {
  accessToken: "access",
  refreshToken: "refresh",
};

export interface userTokenPayload {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  tokenType: string;
}
