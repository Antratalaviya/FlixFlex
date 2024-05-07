import joi from "joi";
import commonValid from "../utils/commonValid";

const idValidation = {
  params: joi.object({
    id: commonValid.idValidation,
  }),
};

const postComment = {
  params: joi.object({
    id: commonValid.idValidation,
  }),
  body: joi.object({
    content: commonValid.contentValidation,
  }),
};
export default {
  idValidation,
  postComment
};
