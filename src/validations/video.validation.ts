import joi from "joi";
import commonValid from "../utils/commonValid";

const postVideo = {
  body: joi.object({
    title: commonValid.titleValidation,
    description: commonValid.descriptionValidation,
  }),
  files: commonValid.fileVidandImgReqValidation,
};

const getVideo = {
  params: joi.object({
    id: commonValid.idValidation,
  }),
};
const updateVideo = {
  body: joi.object({
    title: commonValid.titleValidation,
    description: commonValid.descriptionValidation,
  }),
  params: joi.object({
    id: commonValid.idValidation,
  }),
};
export default {
  postVideo,
  getVideo,
  updateVideo,
};
