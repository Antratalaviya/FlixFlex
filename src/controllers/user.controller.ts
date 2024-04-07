import status from "http-status";

import { Request, Response } from "express";
import { ApiError, ApiResponce, asyncHandler } from "../utils/customUtilities";
import { AppString } from "../utils/appString";
import userService from "../services/user.service";
import firebaseService from "../middlewares/uploadFB.middleware";
import { DFileStatus, FirebaseBucket, IFileStatus } from "../constants";
import { UserDocument, UserInput } from "../models/interfaceModel";

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
    await firebaseService
      .uploadToFireBase(avatarFile, FirebaseBucket.IMAGE)
      .then(async (file: IFileStatus) => {
        if (file.isUploaded) {
          avatarPath = file.filePath;
        }
      });
    if (coverImageFile) {
      await firebaseService
        .uploadToFireBase(coverImageFile, FirebaseBucket.IMAGE)
        .then(async (file: IFileStatus) => {
          if (file.isUploaded) {
            coverImagePath = file.filePath;
          }
        });
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
    await userService.updateUserById(req.user._id, {
      refreshToken: "",
    } as UserDocument);
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
const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  try {
    let user = await userService.getUserById(req.user._id);
    if (!user) {
      return res
        .status(status.NOT_FOUND)
        .json(new ApiError(status.NOT_FOUND, AppString.USER_NOT_EXIST));
    }
    let fileArray = req.files as { [fieldname: string]: Express.Multer.File[] };
    let avatarFile = fileArray["avatar"] ? fileArray["avatar"][0] : undefined;
    let avatarPath;
    let coverImagePath;
    let coverImageFile = fileArray["coverImage"]
      ? fileArray["coverImage"][0]
      : undefined;
    if (avatarFile && user.avatar) {
      let file = await firebaseService.uploadToFireBase(
        avatarFile,
        FirebaseBucket.IMAGE
      );
      if (!file.isUploaded) {
        return res
          .status(status.INTERNAL_SERVER_ERROR)
          .json(new ApiError(status.INTERNAL_SERVER_ERROR));
      }
      avatarPath = file.filePath;
      let deleteimage = await firebaseService.deleteFromFirebase(user.avatar);
      if (!deleteimage.isDeleted) {
        return res
          .status(status.INTERNAL_SERVER_ERROR)
          .json(new ApiError(status.INTERNAL_SERVER_ERROR));
      }
    }
    if (coverImageFile) {
      let file = await firebaseService.uploadToFireBase(
        coverImageFile,
        FirebaseBucket.IMAGE
      );
      if (!file.isUploaded) {
        return res
          .status(status.INTERNAL_SERVER_ERROR)
          .json(new ApiError(status.INTERNAL_SERVER_ERROR));
      }
      coverImagePath = file.filePath;
    }
    if (user.coverImage) {
      let deleteimage = await firebaseService.deleteFromFirebase(user.coverImage);
      if (!deleteimage.isDeleted) {
        return res
          .status(status.INTERNAL_SERVER_ERROR)
          .json(new ApiError(status.INTERNAL_SERVER_ERROR));
      }
    }

    let update = await userService.updateUserById(req.user._id, {
      ...req.body,
      avatar: avatarPath ? avatarPath : user.avatar,
      coverImage: coverImagePath ? coverImagePath : user.coverImage,
    });
    if (!update) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json(new ApiError(status.INTERNAL_SERVER_ERROR));
    }
    return res
      .status(status.OK)
      .json(new ApiResponce(status.OK, {}, AppString.USER_UPDATED));
  } catch (error) {
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
      );
  }
});
const getProfile = asyncHandler(async (req: Request, res: Response) => {
  try {
    let user = await userService.getUserById(req.user._id);
    if (!user) {
      return res
        .status(status.NOT_FOUND)
        .json(new ApiError(status.NOT_FOUND, AppString.USER_NOT_EXIST));
    }
    return res
      .status(status.OK)
      .json(
        new ApiResponce(status.OK, { user: user }, AppString.USER_RETRIEVED)
      );
  } catch (error) {
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
      );
  }
});

const getAllUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    let page: number =
      typeof req.query?.page === "string"
        ? parseInt(req.query?.page, 10) || 0
        : 0;
    let limit: number =
      typeof req.query?.limit === "string"
        ? parseInt(req.query?.limit, 10) || 10
        : 0;
    let users = await userService.getAllUser(page, limit);
    return res
      .status(status.OK)
      .json(
        new ApiResponce(status.OK, { users: users }, AppString.USER_RETRIEVED)
      );
  } catch (error) {
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
      );
  }
});

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  try {
    let user = await userService.getUserById(req.user._id);
    if (!user) {
      return res
        .status(status.NOT_FOUND)
        .json(new ApiError(status.NOT_FOUND, AppString.USER_NOT_EXIST));
    }
    let accessToken = user.generateAccessToken();
    let refreshToken = user.generateRefreshToken();

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
        new ApiResponce(status.OK, {
          accessToken: accessToken,
          refreshToken: refreshToken,
        })
      );
  } catch (error) {
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
      );
  }
});

const changeCurrentPassword = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      let { oldPassword, newPassword } = req.body;
      let user = await userService.getUserByEmailOrUsername(
        req.user.email,
        req.user.username
      );
      if (!user) {
        return res
          .status(status.NOT_FOUND)
          .json(new ApiError(status.NOT_FOUND, AppString.USER_NOT_EXIST));
      }
      let isPasswordValid = await user.isPasswordMatched(oldPassword as string);

      if (!isPasswordValid) {
        return res
          .status(status.NOT_FOUND)
          .json(new ApiError(status.NOT_FOUND, AppString.PASSWORD_INCORRECT));
      }

      user.password = newPassword;
      user.save();
      return res
        .status(status.OK)
        .json(new ApiResponce(status.OK, {}, AppString.PASSWORD_UPDATED));
    } catch (error) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json(
          new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
        );
    }
  }
);

const updateAccountDetails = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { fullName, email } = req.body;

      let user = await userService.updateUserById(req.user._id, {
        fullName: fullName,
        email: email,
      } as UserDocument);
      if (!user) {
        return res
          .status(status.INTERNAL_SERVER_ERROR)
          .json(new ApiError(status.INTERNAL_SERVER_ERROR));
      }
      return res
        .status(status.OK)
        .json(new ApiResponce(status.OK, {}, AppString.USER_UPDATED));
    } catch (error) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json(
          new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
        );
    }
  }
);

const updateUserAvatar = asyncHandler(async (req: Request, res: Response) => {
  try {
    let user = await userService.getUserById(req.user._id);
    if (!user) {
      return res
        .status(status.NOT_FOUND)
        .json(new ApiError(status.NOT_FOUND, AppString.USER_NOT_EXIST));
    }
    let fileArray = req.files as { [fieldname: string]: Express.Multer.File[] };
    let avatarFile = fileArray["avatar"] ? fileArray["avatar"][0] : undefined;
    let avatarPath;
    if (!avatarFile) {
      return res
        .status(status.NOT_FOUND)
        .json(new ApiError(status.NOT_FOUND, AppString.AVATAR_NOT_FOUND));
    }
    let file = await firebaseService.uploadToFireBase(
      avatarFile,
      FirebaseBucket.IMAGE
    );
    if (!file.isUploaded) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json(new ApiError(status.INTERNAL_SERVER_ERROR));
    }
    avatarPath = file.filePath;
    let deleteimage = await firebaseService.deleteFromFirebase(user.avatar);
    if (!deleteimage.isDeleted) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json(new ApiError(status.INTERNAL_SERVER_ERROR));
    }
    let update = await userService.updateUserById(req.user._id, {
      avatar: avatarPath,
    } as UserDocument);
    if (!update) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json(new ApiError(status.INTERNAL_SERVER_ERROR));
    }
    return res
      .status(status.OK)
      .json(new ApiResponce(status.OK, {}, AppString.USER_UPDATED));
  } catch (error) {
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
      );
  }
});

const updateUserCoverImage = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      let user = await userService.getUserById(req.user._id);
      if (!user) {
        return res
          .status(status.NOT_FOUND)
          .json(new ApiError(status.NOT_FOUND, AppString.USER_NOT_EXIST));
      }
      let fileArray = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };
      let coverImagePath;
      let coverImageFile = fileArray["coverImage"]
        ? fileArray["coverImage"][0]
        : undefined;
      if (!coverImageFile) {
        return res
          .status(status.NOT_FOUND)
          .json(new ApiError(status.NOT_FOUND, AppString.COVERIMG_NOT_FOUND));
      }
      let file = await firebaseService.uploadToFireBase(
        coverImageFile,
        FirebaseBucket.IMAGE
      );
      if (!file.isUploaded) {
        return res
          .status(status.INTERNAL_SERVER_ERROR)
          .json(new ApiError(status.INTERNAL_SERVER_ERROR));
      }
      coverImagePath = file.filePath;
      if (user.coverImage) {
        let deleteimage = await firebaseService.deleteFromFirebase(
          user.coverImage
        );
        if (!deleteimage.isDeleted) {
          return res
            .status(status.INTERNAL_SERVER_ERROR)
            .json(new ApiError(status.INTERNAL_SERVER_ERROR));
        }
      }
      let update = await userService.updateUserById(req.user._id, {
        coverImage: coverImagePath,
      } as UserDocument);
      if (!update) {
        return res
          .status(status.INTERNAL_SERVER_ERROR)
          .json(new ApiError(status.INTERNAL_SERVER_ERROR));
      }
      return res
        .status(status.OK)
        .json(new ApiResponce(status.OK, {}, AppString.USER_UPDATED));
    } catch (error) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json(
          new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
        );
    }
  }
);

/**
 * refreshAccessToken     //acc and ref   //done //route is not done
 * changeCurrentPassword   //old and new pass  //done  //route is not done
 * updateAccountDetails   //fullname  //done //route undone
 * updateUserAvatar      //done
 * updateUserCoverImage  //done
 * getUserChannelProfile  //subscribe schema done
 */

export default {
  register,
  login,
  logOut,
  updateProfile,
  getProfile,
  getAllUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
};
