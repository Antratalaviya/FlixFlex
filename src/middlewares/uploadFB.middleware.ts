import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { app } from "../dbConnection/firebase.config";
import { IFileStatus } from "../constants";

async function uploadFB(
  file: Express.Multer.File,
  fileType: string
): Promise<IFileStatus> {
  return new Promise<IFileStatus>(async (resolve, reject) => {
    const fileStatus: IFileStatus = {
      isUploaded: false,
      filePath: "",
    };
    // if (!this.isValidRequest) return reject(fileStatus);
    const storage = getStorage(app, process.env.storageBucket);
    let fileName = `${fileType}/${Date.now()}/${file.originalname}`;
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

export default uploadFB;
