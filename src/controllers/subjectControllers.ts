import { Request, Response } from 'express';
import prisma from '../db/prisma';

export const createSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, name } = req.body;

    if (!userId || !name) {
      res.status(400).json({ error: 'User ID and Subject name are required' });
      return;
    }

    const subject = await prisma.subject.create({
      data: {
        userId,
        name,
      },
    });

    res.status(201).json(subject);
  } catch (error: any) {
    console.error('Failed to create subject:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Subject already exists for this user' });
      return;
    }
    res.status(500).json({ error: 'Failed to create subject' });
  }
};

export const getSubjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const subjects = await prisma.subject.findMany({
      where: {
        userId: String(userId)
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { notes: true }
        }
      }
    });

    res.status(200).json(subjects);
  } catch (error) {
    console.error('Failed to get subjects:', error);
    res.status(500).json({ error: 'Failed to get subjects' });
  }
};
