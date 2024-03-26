import mongoose from "mongoose";
import config from "config";

export const dbConnect = (): any => {
  mongoose
    .connect(config.get("MONGO_URI"))
    .then((data) => {
      console.log(
        `Mongo DB connected !! : ${data.connection.host} : ${data.connection.name}`
      );
    })
    .catch((error : Error) => {
      console.log(`Mongo DB connection Failed !! ${error}`);
      process.exit(1);
    });
};
