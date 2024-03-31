import status from "http-status";

import { Request, Response } from "express";
import { ApiError, ApiResponce, asyncHandler } from "../utils/customUtilities";
import { AppString } from "../utils/appString";
import userService from "../services/user.service";
import uploadFB from "../middlewares/uploadFB.middleware";
import { FirebaseBucket, IFileStatus } from "../constants";
import { UserInput } from "../models/interfaceModel";

const register = asyncHandler(async (req: Request, res: Response) => {
  try {
    let input = req.body as UserInput;
    if (!input) {
      return res
        .status(status.BAD_REQUEST)
        .json(
          new ApiError(status.BAD_REQUEST, AppString.INPUT_FIELDS_NOT_FOUND)
        );
    }
    let user = await userService.getUserByEmailOrUsername(
      input.email,
      input.username
    );
    if (user) {
      return res
        .status(status.UNAUTHORIZED)
        .json(new ApiError(status.UNAUTHORIZED, AppString.USER_ALREADY_EXIST));
    }
    const fileArray = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    const coverImageFile = fileArray["coverImage"]
      ? fileArray["coverImage"][0]
      : undefined;
    const avatarFile = fileArray["avatar"] ? fileArray["avatar"][0] : undefined;
    let avatarPath;
    let coverImagePath;

    if (!avatarFile) {
      return res
        .status(status.BAD_REQUEST)
        .json(new ApiError(status.BAD_REQUEST, AppString.AVATAR_NOT_FOUND));
    }
    await uploadFB(avatarFile, FirebaseBucket.IMAGE).then(
      async (file: IFileStatus) => {
        if (file.isUploaded) {
          avatarPath = file.filePath;
        }
      }
    );
    if (coverImageFile) {
      await uploadFB(coverImageFile, FirebaseBucket.IMAGE).then(
        async (file: IFileStatus) => {
          if (file.isUploaded) {
            coverImagePath = file.filePath;
          }
        }
      );
    }
    let userData = {
      username: input.username,
      email: input.email,
      fullName: input.fullName,
      password: input.password,
      avatar: avatarPath,
    };
    let newUser = await userService.createUser(userData);
    if (coverImagePath) {
      newUser.coverImage = coverImagePath as unknown as string;
      newUser.save();
    }
    if (newUser) {
      return res.status(status.OK).json(
        new ApiResponce(
          status.CREATED,
          {
            user: {
              username: newUser.username,
              email: newUser.email,
              fullName: newUser.fullName,
              password: newUser.password,
              avatar: newUser.avatar,
              coverImage: newUser.coverImage,
              watchHistory: newUser.watchHistory,
            },
          },
          AppString.USER_REGISTERED
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
    let isPasswordValid = await user.isPasswordMatched(password as string);

    if (!isPasswordValid) {
      return res
        .status(status.NOT_FOUND)
        .json(new ApiError(status.NOT_FOUND, AppString.PASSWORD_INCORRECT));
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
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
          AppString.USER_LOGIN
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

const logOut = asyncHandler(async (req: Request, res: Response) => {
  try {
    await userService.updateUserById(req.user._id);
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(status.OK)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponce(status.OK, {}, AppString.USER_LOGOUT));
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
  logOut,
};
