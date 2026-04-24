import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';

const router = Router();

const progressSchema = z.object({
  lessonId: z.string(),
  position: z.number().int().nonnegative(),
  completed: z.boolean().optional(),
});

router.post('/', requireAuth, validate(progressSchema), async (req, res) => {
  const { lessonId, position, completed } = req.body as z.infer<typeof progressSchema>;
  const userId = req.user!.sub;

  const progress = await prisma.progress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { position, completed: completed ?? undefined },
    create: { userId, lessonId, position, completed: completed ?? false },
  });

  // Recompute course progress %
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { section: true },
  });
  if (lesson) {
    const totalLessons = await prisma.lesson.count({
      where: { section: { courseId: lesson.section.courseId } },
    });
    const completedLessons = await prisma.progress.count({
      where: {
        userId,
        completed: true,
        lesson: { section: { courseId: lesson.section.courseId } },
      },
    });
    const pct = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
    await prisma.enrollment.updateMany({
      where: { userId, courseId: lesson.section.courseId },
      data: { progress: pct },
    });
  }

  res.json({ progress });
});

router.get('/course/:courseId', requireAuth, async (req, res) => {
  const progresses = await prisma.progress.findMany({
    where: {
      userId: req.user!.sub,
      lesson: { section: { courseId: req.params.courseId } },
    },
  });
  res.json({ progresses });
});

// Bookmarks
router.post('/bookmarks/:lessonId', requireAuth, async (req, res) => {
  const b = await prisma.bookmark.upsert({
    where: { userId_lessonId: { userId: req.user!.sub, lessonId: req.params.lessonId } },
    update: {},
    create: { userId: req.user!.sub, lessonId: req.params.lessonId },
  });
  res.json({ bookmark: b });
});

router.delete('/bookmarks/:lessonId', requireAuth, async (req, res) => {
  await prisma.bookmark.deleteMany({
    where: { userId: req.user!.sub, lessonId: req.params.lessonId },
  });
  res.json({ ok: true });
});

router.get('/bookmarks', requireAuth, async (req, res) => {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: req.user!.sub },
    include: {
      lesson: { include: { section: { include: { course: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ bookmarks });
});

// Notes
const noteSchema = z.object({
  lessonId: z.string(),
  content: z.string().min(1).max(4000),
  timestamp: z.number().int().nonnegative().default(0),
});

router.post('/notes', requireAuth, validate(noteSchema), async (req, res) => {
  const { lessonId, content, timestamp } = req.body as z.infer<typeof noteSchema>;
  const note = await prisma.note.create({
    data: { userId: req.user!.sub, lessonId, content, timestamp },
  });
  res.status(201).json({ note });
});

router.get('/notes/:lessonId', requireAuth, async (req, res) => {
  const notes = await prisma.note.findMany({
    where: { userId: req.user!.sub, lessonId: req.params.lessonId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ notes });
});

router.delete('/notes/:id', requireAuth, async (req, res) => {
  await prisma.note.deleteMany({ where: { id: req.params.id, userId: req.user!.sub } });
  res.json({ ok: true });
});

export default router;
