import {
  UploadTask,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../config/firebase.config";
import { UploadFbFile } from "../constants";

async function uploadFB(file: UploadFbFile, fileType: string): Promise<string | void> {
  const storage = getStorage(app, process.env.storageBucket);
    let dateTime = Date.now();
    let fileName = `fileType/${dateTime}`;
    let storageRef = ref(storage, fileName);
    let metaData = {
      contentType: file.type,
    };
    let uploadTask : UploadTask = uploadBytesResumable(storageRef, file.buffer, metaData);

    getDownloadURL(uploadTask.snapshot.ref)
      .then((url : string) => {
        return url;
      })
      .catch((err) => {
        console.log(err);
      });
}

export default uploadFB;
