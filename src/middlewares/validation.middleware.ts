import { NextFunction, Request, Response } from "express";
import joi from "joi";
import status from "http-status";
import { ApiError } from "../utils/customUtilities";

const pick = (object: { [key: string]: any }, keys: string[]) => {
  return keys.reduce((obj: { [key: string]: any }, key: string) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

export const validate =
  (schema: object) => (req: Request, res: Response, next: NextFunction) => {
    let validSchema = pick(schema, ["query", "body", "params", "files"]);
    let objectSchema = pick(req, Object.keys(validSchema));
    const { value, error } = joi
      .compile(validSchema)
      .validate(objectSchema, { abortEarly: false, allowUnknown: true });
    if (error) {
      let errorMsg = error.details[0].message;
      return res
        .status(status.BAD_REQUEST)
        .json(new ApiError(status.BAD_REQUEST, errorMsg));
    }
    next();
  };
