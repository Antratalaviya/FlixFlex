import status from "http-status";

import { Request, Response } from "express";
import { ApiError, ApiResponce, asyncHandler } from "../utils/customUtilities";
import { AppString } from "../utils/appString";
import userService from "../services/user.service";

const register = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.body) {
      return res
        .status(404)
        .json(new ApiError(404, AppString.INPUT_FIELDS_NOT_FOUND));
    }
    let user = await userService.getUserByEmail(req.body.email);
    if (user) {
      return res
        .status(status.UNAUTHORIZED)
        .json(new ApiError(status.UNAUTHORIZED, AppString.USER_ALREADY_EXIST));
    }

    let newUser = await userService.createUser(req.body);
    if (newUser) {
      return res.status(status.OK).json(
        new ApiResponce(
          status.CREATED,
          {
            user: newUser,
          },
          AppString.USER_REGISTERED_SUCCESSFULLY
        )
      );
    }
  } catch (error) {
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
      );
  }
});

const login = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    if (!email && !username) {
      return res
        .status(status.NOT_FOUND)
        .json(
          new ApiError(status.NOT_FOUND, AppString.EMAIL_USERNAME_NOT_FOUND)
        );
    }
    const user = await userService.getUserByEmailOrUsername(email, username);
    if (!user) {
      return res
        .status(status.NOT_FOUND)
        .json(new ApiError(status.NOT_FOUND, AppString.USER_NOT_EXIST));
    }
    if (!password) {
      return res
        .status(status.NOT_FOUND)
        .json(new ApiError(status.NOT_FOUND, AppString.PASSWORD_NOT_FOUND));
    }
    let isPasswordValid = await user.isPasswordMatched(password)
   
    console.log(isPasswordValid);
    if (!isPasswordValid) {
      return res
        .status(status.NOT_FOUND)
        .json(new ApiError(status.NOT_FOUND, AppString.PASSWORD_INCORRECT));
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    user.save();

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(status.OK)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponce(
          status.OK,
          { user: user, accessToken: accessToken },
          AppString.USER_LOGIN_SUCCESSFULLY
        )
      );
  } catch (error) {
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
      );
  }
});

export default {
  register,
  login,
};
