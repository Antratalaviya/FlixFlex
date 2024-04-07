import joi from "joi";
import commonValid from "../utils/commonValid";

const register = {
  body: joi.object({
    username: commonValid.usernameValidation,
    email: commonValid.emailValidation,
    fullName: commonValid.fullnameValidation,
    password: commonValid.passwordValidation,
  }),
  files: commonValid.fileValidationReqSchema,
};

const login = {
  body: joi.object({
    email: commonValid.emailValidation,
    password: commonValid.passwordValidation,
  }),
};
const profile = {
  body: joi.object({
    username: commonValid.usernameValidation,
    email: commonValid.emailValidation,
    fullName: commonValid.fullnameValidation,
    avatar: commonValid.avatarValidation,
    coverImage: commonValid.coverImageValidation,
  }),
  files: commonValid.fileValidationSchema,
};

const file = {
  files: commonValid.fileValidationSchema,
};
const account = {
  body: joi.object({
    email: commonValid.emailValidation,
    fullName: commonValid.fullnameValidation,
  }),
};

const password = {
  body: joi.object({
    oldPassword: commonValid.passwordValidation,
    newPassword: commonValid.passwordValidation,
  }),
};
export default {
  login,
  profile,
  register,
  account,
  file,
  password,
};
