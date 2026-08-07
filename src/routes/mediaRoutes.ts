import { Router } from "express";
import multer from "multer";
import { createNote, deleteNote, getNotes } from "../controllers/mediaControllers";
import { verifyToken } from "../middlewares/userAuthentication";

export const mediaRouter = Router();

// memory storage to get the file buffer directly
const upload = multer({ storage: multer.memoryStorage() });

mediaRouter.post("/", upload.single("media"), createNote);
mediaRouter.get("/subject/:subjectId", getNotes);
mediaRouter.delete("/:noteId",verifyToken, deleteNote);