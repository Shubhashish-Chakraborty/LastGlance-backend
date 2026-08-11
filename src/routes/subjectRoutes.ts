import { Router } from "express";
import { createSubject, deleteSubject, editSubjects, getSubjects } from "../controllers/subjectControllers";
import { verifyToken } from "../middlewares/userAuthentication";

export const subjectRouter = Router();

subjectRouter.post("/", createSubject);
subjectRouter.get("/:userId", getSubjects);
subjectRouter.delete("/:subjectId", verifyToken, deleteSubject);
subjectRouter.put("/:subjectId", verifyToken, editSubjects);
