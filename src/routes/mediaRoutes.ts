import { Router } from "express";
import { createNote, getNotes } from "../controllers/mediaControllers";

export const mediaRouter = Router();

mediaRouter.post("/", createNote);
mediaRouter.get("/:userId", getNotes);
