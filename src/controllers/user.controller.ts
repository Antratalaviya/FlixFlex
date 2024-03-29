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
    let user: object = userService.getUserByEmail(req.body.email);
    console.log(user);
    if (user) {
      return res
        .status(status.UNAUTHORIZED)
        .json(new ApiError(status.UNAUTHORIZED, AppString.USER_ALREADY_EXIST));
    }

    let newUser: object = userService.createUser(req.body);
    console.log(newUser)
    if (newUser) {
      return res
        .status(status.OK)
        .json(
          new ApiResponce(
            status.CREATED,
            { user: newUser },
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

export default {
  register,
};
