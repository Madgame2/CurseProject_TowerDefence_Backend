import { Router } from "express";
import ProfileController from "../controllers/ProfileController";

const ProfileRouter = Router();

ProfileRouter.post("/register", ProfileController.register);
ProfileRouter.post("/confirmRegr", ProfileController.confirmRegister);

ProfileRouter.post("/login", ProfileController.authUser);

export default ProfileRouter;