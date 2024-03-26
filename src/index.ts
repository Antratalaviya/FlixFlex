import dotenv from "dotenv";
import config from "config";

import { app } from "./app";
import { dbConnect } from "./dbConnection/db.config";

dotenv.config();

const port = config.get("PORT") || 8080;

// dbConnect();

app.listen(port, (): void => {
  console.log(`Server is running on port : ${port}`);
});
