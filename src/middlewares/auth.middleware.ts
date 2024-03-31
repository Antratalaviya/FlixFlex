import { NextFunction, Request, Response } from "express";
import status from "http-status";
import config from "config";
import jwt from "jsonwebtoken";

import { ApiError } from "../utils/customUtilities";
import { AppString } from "../utils/appString";
import { userTokenPayload } from "../constants";
import userService from "../services/user.service";

export const verifyUserAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token =
      req.cookies?.accessToken ||
      req.headers?.authorization?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(status.UNAUTHORIZED)  
        .json(new ApiError(status.UNAUTHORIZED, AppString.UNAUTHORIZED));
    }
    const decoded = jwt.verify(token, config.get("ACCESS_TOKEN_SECRET"), {
      complete: true,
    });
    let payload = decoded.payload as userTokenPayload;
    let user = await userService.getUserById(payload._id);
    req.user = user;
    next();
  } catch (error) {
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
      );
  }
};
