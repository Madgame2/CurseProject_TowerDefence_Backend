import { Router } from "express";
import ProfileController from "../controllers/ProfileController";

const ProfileRouter = Router();

ProfileRouter.post("/register", ProfileController.register);
ProfileRouter.post("/confirmRegr", ProfileController.confirmRegister);

export default ProfileRouter;