import { Request, Response } from "express";
import { ApiError, ApiResponce, asyncHandler } from "../utils/customUtilities";

const getUser = asyncHandler(async (req: Request, res: Response) => {
  console.log("Hello from getUser");
  return res.status(200).json(new ApiError(404));
});

export default {
  getUser,
};
