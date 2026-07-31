import { Router } from "express";
import { signup } from "../controllers/userControllers";
export const userRouter = Router();

userRouter.post("/signup" , signup);