import { Response, NextFunction, Request } from "express";

export class ApiResponce {
  success: boolean;
  constructor(
    public statusCode: number,
    public data: object,
    public message = "Success"
  ) {
    this.success = statusCode < 400;
  }
}

export class ApiError {
  data: null;
  success: boolean;
  constructor(
    public statusCode: number,
    public message = "Something went wrong",
  ) {
    this.data = null;
    this.success = false;
  }
}

export const asyncHandler =
  (requestHandler: Function) =>
  async (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(requestHandler(req, res, next)).catch((err) =>
      next(err)
    );
  };
