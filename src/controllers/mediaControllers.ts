import { Request, Response } from 'express';
import prisma from '../db/prisma';
import { deleteFileFromS3, uploadFileToS3 } from '../utils/s3';

export const createNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, title, content, subjectId } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    let mediaData: any[] = [];

    // If an image was uploaded, upload it to S3
    if (req.file) {
      const { originalname, mimetype, buffer, size } = req.file;
      const { url, key } = await uploadFileToS3(buffer, mimetype, originalname);

      mediaData.push({
        url,
        key,
        type: 'IMAGE',
        mimeType: mimetype,
        size
      });
    }

    const note = await prisma.note.create({
      data: {
        userId,
        title,
        content,
        subjectId,
        media: {
          create: mediaData
        }
      },
      include: {
        media: true
      }
    });

    res.status(201).json(note);
  } catch (error) {
    console.error('Failed to create note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
};

export const getNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subjectId } = req.params;

    if (!subjectId) {
      res.status(400).json({ error: 'Subject ID is required' });
      return;
    }

    const notes = await prisma.note.findMany({
      where: {
        subjectId: String(subjectId)
      },
      include: {
        media: true
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(notes);
  } catch (error) {
    console.error('Failed to get notes:', error);
    res.status(500).json({ error: 'Failed to get notes' });
  }
};

export const deleteNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;

    if (!noteId) {
      res.status(400).json({ error: 'Note ID is required' });
      return;
    }

    // Delete the note and its associated media
    const deletedNote = await prisma.note.delete({
      where: { id: String(noteId) },
      include: { media: true }
    });

    // Remove the actual files from S3
    if (deletedNote.media && deletedNote.media.length > 0) {
      await Promise.all(
        deletedNote.media.map((m) =>
          deleteFileFromS3(m.key).catch((err) =>
            console.error(`Failed to delete S3 object ${m.key}:`, err)
          )
        )
      );
    }

    res.status(200).json(deletedNote);
  } catch (error) {
    console.error('Failed to delete note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
};