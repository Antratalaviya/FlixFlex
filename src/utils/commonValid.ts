import joi from "joi";

const stringValidation = joi.string().trim();
const stringReqValidation = stringValidation.required();
const dateValidation = joi.date();
const numValidation = joi.number();

// user validations
const emailValidation = stringReqValidation.email();
const passwordValidation = stringReqValidation
  .min(6)
  .regex(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()-_=+{};:'",.<>?/\\|[\]`~]).{6,30}$/
  )
  .message(
    "Password must be at least 6 characters long and include at least one digit, one lowercase letter, one uppercase letter, and one special character."
  )
  .required();
const fullnameValidation = stringReqValidation.min(3).max(30);
const usernameValidation = stringReqValidation.min(3).max(30);
const genderValidation = stringReqValidation.valid("male", "female", "other");
const dateReqValidation = dateValidation.required();
const avatarValidation = stringReqValidation;
const coverImageValidation = stringValidation;

export default {
  emailValidation,
  dateValidation,
  passwordValidation,
  fullnameValidation,
  genderValidation,
  dateReqValidation,
  usernameValidation,
  coverImageValidation,
  avatarValidation,
};
