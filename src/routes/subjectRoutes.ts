import { Router } from "express";
import { createSubject, getSubjects } from "../controllers/subjectControllers";

export const subjectRouter = Router();

subjectRouter.post("/", createSubject);
subjectRouter.get("/:userId", getSubjects);
