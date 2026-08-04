import { Router } from "express";
import multer from "multer";
import { createNote, getNotes } from "../controllers/mediaControllers";

export const mediaRouter = Router();

// memory storage to get the file buffer directly
const upload = multer({ storage: multer.memoryStorage() });

mediaRouter.post("/", upload.single("media"), createNote);
mediaRouter.get("/:userId", getNotes);
