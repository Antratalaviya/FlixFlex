import multer, { Multer, StorageEngine } from "multer";

const storage: StorageEngine = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now + file.fieldname);
  },
});

export const multerStorage: Multer = multer({ storage: storage });
