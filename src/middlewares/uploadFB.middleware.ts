import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import { app } from "../dbConnection/firebase.config";
import { DFileStatus, IFileStatus } from "../constants";
import config from "config";

async function uploadToFireBase(
  file: Express.Multer.File,
  fileType: string
): Promise<IFileStatus> {
  return new Promise<IFileStatus>(async (resolve, reject) => {
    const fileStatus: IFileStatus = {
      isUploaded: false,
      filePath: "",
    };
    const storage = getStorage(app, config.get("storageBucket"));
    let fileName = `${fileType}/${Date.now()}-${file.originalname}`;
    let storageRef = ref(storage, fileName);
    const metadata = {
      contentType: file.mimetype,
      name: file.originalname,
    };
    await uploadBytes(storageRef, file.buffer, metadata)
      .then(async (snapshot) => {
        fileStatus.isUploaded = true;
        fileStatus.filePath = await getDownloadURL(snapshot.ref);
        resolve(fileStatus);
      })

      .catch((error) => {
        console.log("Error: ", error);

        reject(fileStatus);
      });
  });
}

async function deleteFromFirebase(downloadUrl: string): Promise<DFileStatus> {
  return new Promise<DFileStatus>(async (resolve, reject) => {
    const fileStatus: DFileStatus = {
      isDeleted: false,
    };
    const storage = getStorage(app, config.get("storageBucket"));
    let fileRef = ref(storage, downloadUrl);
    await deleteObject(fileRef)
      .then(() => {
        fileStatus.isDeleted = true;
        resolve(fileStatus);
      })
      .catch((error) => {
        console.log(error);
        reject(fileStatus);
      });
  });
}

export default { uploadToFireBase, deleteFromFirebase };
