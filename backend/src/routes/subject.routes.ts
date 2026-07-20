import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../config/database';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: subjects,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const subject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        error: { message: 'Subject not found' },
      });
    }

    return res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

export default router;
