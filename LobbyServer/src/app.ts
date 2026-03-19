import express, {Request, Response } from "express"
import lobbyRoutes  from "./routes/lobby.routes"

const app = express();

app.use(express.json());
app.use(lobbyRoutes);

export default app;