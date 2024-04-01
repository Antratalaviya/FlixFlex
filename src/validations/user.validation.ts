import joi from "joi";
import commonValid from "../utils/commonValid";

const register = {
  body: joi.object({
    username: commonValid.usernameValidation,
    email: commonValid.emailValidation,
    fullName: commonValid.fullnameValidation,
    password: commonValid.passwordValidation,
  }),
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
    password: commonValid.passwordValidation,
    avatar: commonValid.avatarValidation,
    coverImage: commonValid.coverImageValidation,
  }),
};
export default {
  login,
  profile,
  register,
};
