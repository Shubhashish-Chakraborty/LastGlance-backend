import { Request, Response } from 'express';
import prisma from '../db/prisma';
import { deleteFileFromS3 } from '../utils/s3';

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

export const deleteSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subjectId } = req.params;
    const authReq = req as any;
    const currentUserId = authReq.user?.id;

    if (!subjectId) {
      res.status(400).json({ error: 'Subject ID is required' });
      return;
    }

    const subject = await prisma.subject.findUnique({
      where: { id: String(subjectId) },
      include: {
        notes: {
          include: {
            media: true,
          },
        },
      },
    });

    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }

    if (subject.userId !== currentUserId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const mediaKeys = subject.notes.flatMap((note) =>
      note.media?.map((mediaItem) => mediaItem.key) ?? []
    );

    await Promise.all(
      mediaKeys.map((key) =>
        deleteFileFromS3(key).catch((err) =>
          console.error(`Failed to delete S3 object ${key}:`, err)
        )
      )
    );

    await prisma.$transaction([
      prisma.note.deleteMany({ where: { subjectId: String(subjectId) } }),
      prisma.subject.delete({ where: { id: String(subjectId) } }),
    ]);

    res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Failed to delete subject:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
};
