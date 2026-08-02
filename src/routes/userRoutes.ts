import { Router } from "express";
import { login, signup } from "../controllers/userControllers";
export const userRouter = Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);