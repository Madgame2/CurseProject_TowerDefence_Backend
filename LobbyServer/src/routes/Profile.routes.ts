import { Router } from "express";
import ProfileController from "../controllers/ProfileController";
import { query, validationResult } from "express-validator"; 


const ProfileRouter = Router();

ProfileRouter.post("/register", ProfileController.register);
ProfileRouter.post("/confirmRegr", ProfileController.confirmRegister);
ProfileRouter.delete(
  "/UnregUser",
  query("email")
    .exists().withMessage("Email обязателен")
    .isEmail().withMessage("Email должен быть корректным"),
  
  // Middleware для обработки ошибок валидации
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },

  // Контроллер
  ProfileController.deleteUnconfUser
);


ProfileRouter.post("/login", ProfileController.authUser);

export default ProfileRouter;