import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { requireAuth, requireAdmin } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { HttpError } from '../../middleware/error';

const router = Router();

router.get('/me/enrollments', requireAuth, async (req, res) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: req.user!.sub },
    orderBy: { createdAt: 'desc' },
    include: {
      course: {
        select: {
          id: true, slug: true, title: true, thumbnail: true, category: true,
          difficulty: true, rating: true, studentCount: true,
        },
      },
    },
  });
  res.json({ enrollments });
});

router.get('/me/stats', requireAuth, async (req, res) => {
  const userId = req.user!.sub;
  const [enrolled, completedProgress, totalProgress] = await Promise.all([
    prisma.enrollment.count({ where: { userId } }),
    prisma.progress.count({ where: { userId, completed: true } }),
    prisma.progress.aggregate({ where: { userId }, _sum: { position: true } }),
  ]);
  const enrollments = await prisma.enrollment.findMany({ where: { userId } });
  const avgProgress =
    enrollments.length === 0
      ? 0
      : Math.round(enrollments.reduce((a, e) => a + e.progress, 0) / enrollments.length);
  res.json({
    enrolled,
    avgProgress,
    timeSpentSeconds: totalProgress._sum.position || 0,
    certificates: completedProgress > 0 ? 8 : 0, // placeholder
  });
});

router.get('/me/recent', requireAuth, async (req, res) => {
  const recents = await prisma.progress.findMany({
    where: { userId: req.user!.sub },
    orderBy: { updatedAt: 'desc' },
    take: 5,
    include: {
      lesson: { include: { section: { include: { course: true } } } },
    },
  });
  res.json({
    recents: recents.map((r) => ({
      lessonId: r.lessonId,
      lessonTitle: r.lesson.title,
      position: r.position,
      duration: r.lesson.duration,
      completed: r.completed,
      updatedAt: r.updatedAt,
      course: {
        id: r.lesson.section.course.id,
        slug: r.lesson.section.course.slug,
        title: r.lesson.section.course.title,
        thumbnail: r.lesson.section.course.thumbnail,
      },
    })),
  });
});

const updateProfileSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  avatar: z.string().url().optional().nullable(),
});

router.put('/me', requireAuth, validate(updateProfileSchema), async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.user!.sub },
    data: req.body,
    select: { id: true, name: true, email: true, role: true, avatar: true },
  });
  res.json({ user });
});

// ------- ADMIN -------
router.get('/', requireAuth, requireAdmin, async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, email: true, role: true, avatar: true, createdAt: true,
      _count: { select: { enrollments: true } },
    },
  });
  res.json({ users });
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  if (req.params.id === req.user!.sub) throw new HttpError(400, 'Cannot delete yourself');
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

router.get('/admin/stats', requireAuth, requireAdmin, async (_req, res) => {
  const [totalUsers, totalCourses, totalEnrollments, enrollments] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.enrollment.findMany({ include: { course: true } }),
  ]);
  const revenue = enrollments.reduce((a, e) => a + e.course.price, 0);
  // mock revenue trend (by month)
  const now = new Date();
  const trend = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const month = d.toLocaleString('en-US', { month: 'short' });
    return { month, value: Math.round(1000 + Math.random() * 25000) };
  });
  res.json({
    totals: {
      users: totalUsers,
      courses: totalCourses,
      enrollments: totalEnrollments,
      revenue: Math.round(revenue),
    },
    trend,
  });
});

router.get('/admin/recent-enrollments', requireAuth, requireAdmin, async (_req, res) => {
  const recent = await prisma.enrollment.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
      course: { select: { id: true, title: true, slug: true } },
    },
  });
  res.json({ recent });
});

export default router;
