import { Request, Response } from 'express';
import prisma from '../db/prisma';
import { uploadFileToS3 } from '../utils/s3';

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