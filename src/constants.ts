export interface IFileStatus {
  isUploaded: boolean;
  filePath: string;
}
export interface DFileStatus {
  isDeleted: boolean;
}
export const Collection = {
  MODEL_USER: "User",
  MODEL_VIDEO: "Video",
  MODEL_SUB: "Subscription",
};

export const FirebaseBucket = {
  IMAGE: "Images",
  VIDEO: "Videos",
};

export interface userTokenPayload {
  _id: string;
  username: string;
  email: string;
  fullName: string;
}
