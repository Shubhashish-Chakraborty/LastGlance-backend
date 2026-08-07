import { Router } from "express";
import { changePassword, changeUsername, login, signup } from "../controllers/userControllers";
import { verifyToken } from "../middlewares/userAuthentication";
export const userRouter = Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put('/change-password', verifyToken, changePassword);
userRouter.put('/change-username', verifyToken, changeUsername);
