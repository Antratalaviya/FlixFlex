import dotenv from "dotenv";

import { app } from "./app";
import { dbConnect } from "./dbConnection/db.config";
 
dotenv.config();

const port = process.env.PORT || 8081;
  
dbConnect();

app.listen(port, (): void => {
  console.log(`Server is running on port : ${port}`);
});
