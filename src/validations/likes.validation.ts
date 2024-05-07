import joi from "joi";
import commonValid from "../utils/commonValid";

const idValidation = {
  params: joi.object({
    id: commonValid.idValidation,
  }),
};

export default {
    idValidation
}