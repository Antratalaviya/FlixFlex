import express, { NextFunction, Request, Response } from "express";
import cors from "cors"
const app = express();

app.use((_, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Header",
    "Origin, X-Requested-With, Authorization, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  next();
});

app.use(express.urlencoded({extended : true}))
app.use(express.json())

app.use(cors({
    origin : ["http://localhost:3000", "http://localhost:3001"],
    credentials : true,
    methods : 'GET, POST, PUT, PATCH, DELETE',
}))

app.get('/test',(req:Request, res : Response)=>{
    res.json("Api is running")
})

export { app };
