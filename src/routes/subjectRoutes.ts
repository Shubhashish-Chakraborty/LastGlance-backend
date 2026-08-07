import { Router } from "express";
import { createSubject, deleteSubject, getSubjects } from "../controllers/subjectControllers";
import { verifyToken } from "../middlewares/userAuthentication";

export const subjectRouter = Router();

subjectRouter.post("/", createSubject);
subjectRouter.get("/:userId", getSubjects);
subjectRouter.delete("/:subjectId", verifyToken, deleteSubject);
