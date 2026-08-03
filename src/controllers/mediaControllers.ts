import { Request, Response } from 'express';
import prisma from '../db/prisma';

export const createNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, title, content } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const note = await prisma.note.create({
      data: {
        userId,
        title,
        content,
      },
    });

    res.status(201).json(note);
  } catch (error) {
    console.error('Failed to create note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
};

export const getNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const notes = await prisma.note.findMany({
      where: {
        userId: String(userId)
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(notes);
  } catch (error) {
    console.error('Failed to get notes:', error);
    res.status(500).json({ error: 'Failed to get notes' });
  }
};