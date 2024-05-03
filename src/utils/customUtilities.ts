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
    public message = "Something went wrong"
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

export const videoDuration = async (buffer: Buffer) => {
  const header = Buffer.from("mvhd");
  const start = buffer.indexOf(header) + 16;
  const timeScale = buffer.readUInt32BE(start);
  const duration = buffer.readUInt32BE(start + 4);
  let totalSeconds = Math.floor(duration / timeScale);

  // let hours = Math.floor(totalSeconds / 3600);
  // totalSeconds %= 3600;
  // let minutes = Math.floor(totalSeconds / 60);
  // let seconds = totalSeconds % 60;

  // return `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  return totalSeconds;
};
