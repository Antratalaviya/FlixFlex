import mongoose, { Document } from "mongoose";

export interface UserInput {
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  password: string;
}

export interface UserDocument extends UserInput, Document {
  coverImage: string;
  watchHistory: Array<mongoose.Schema.Types.ObjectId>;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
  isPasswordMatched(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}
