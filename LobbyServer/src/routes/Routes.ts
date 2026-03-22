import { Router } from "express";
import LobbyRouter from "./lobby.routes";
import Profilerouter from "./Profile.routes";

const router = Router();

router.use("/profile/", Profilerouter);
router.use("/Lobby",LobbyRouter);


export default router;
