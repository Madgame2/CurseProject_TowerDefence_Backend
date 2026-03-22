import express, {Request, Response } from "express"
import router from "./routes/Routes";

const app = express();


app.use(express.json());
app.use(router);

export default app;