import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { requireAuth, requireAdmin } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { HttpError } from '../../middleware/error';

const router = Router();

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// PUBLIC — list published courses
router.get('/', async (req, res) => {
  const { q, category, difficulty, sort } = req.query as Record<string, string | undefined>;
  const where: any = { status: 'PUBLISHED' };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { summary: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (category && category !== 'all') where.category = category;
  if (difficulty && difficulty !== 'all') where.difficulty = difficulty.toUpperCase();

  const orderBy: any =
    sort === 'popular'
      ? { studentCount: 'desc' }
      : sort === 'rating'
      ? { rating: 'desc' }
      : sort === 'newest'
      ? { createdAt: 'desc' }
      : { createdAt: 'desc' };

  const courses = await prisma.course.findMany({
    where,
    orderBy,
    select: {
      id: true, title: true, slug: true, summary: true, thumbnail: true,
      category: true, difficulty: true, price: true, isFree: true,
      rating: true, ratingCount: true, studentCount: true, duration: true,
      createdAt: true,
    },
  });
  res.json({ courses });
});

router.get('/categories', async (_req, res) => {
  const rows = await prisma.course.groupBy({
    by: ['category'],
    where: { status: 'PUBLISHED' },
    _count: true,
  });
  res.json({ categories: rows.map((r) => ({ name: r.category, count: r._count })) });
});

// PUBLIC — course detail by slug
router.get('/slug/:slug', async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { slug: req.params.slug },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            select: { id: true, title: true, order: true, duration: true },
          },
        },
      },
    },
  });
  if (!course) throw new HttpError(404, 'Course not found');
  res.json({ course });
});

// AUTH — lesson with video (requires enrollment OR admin)
router.get('/lessons/:lessonId', requireAuth, async (req, res) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: req.params.lessonId },
    include: { section: { include: { course: true } } },
  });
  if (!lesson) throw new HttpError(404, 'Lesson not found');

  if (req.user!.role !== 'ADMIN') {
    const enrolled = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user!.sub, courseId: lesson.section.courseId } },
    });
    if (!enrolled) throw new HttpError(403, 'Not enrolled');
  }

  const progress = await prisma.progress.findUnique({
    where: { userId_lessonId: { userId: req.user!.sub, lessonId: lesson.id } },
  });

  res.json({
    lesson: {
      id: lesson.id,
      title: lesson.title,
      duration: lesson.duration,
      content: lesson.content,
      videoUrl: lesson.videoUrl,
      course: { id: lesson.section.course.id, title: lesson.section.course.title, slug: lesson.section.course.slug },
    },
    progress,
  });
});

// ENROLL
router.post('/:id/enroll', requireAuth, async (req, res) => {
  const course = await prisma.course.findUnique({ where: { id: req.params.id } });
  if (!course) throw new HttpError(404, 'Course not found');
  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: req.user!.sub, courseId: course.id } },
    update: {},
    create: { userId: req.user!.sub, courseId: course.id },
  });
  await prisma.course.update({
    where: { id: course.id },
    data: { studentCount: { increment: 1 } },
  });
  res.json({ enrollment });
});

// ------- ADMIN -------
const courseSchema = z.object({
  title: z.string().min(3),
  summary: z.string().min(5),
  description: z.string().min(5),
  thumbnail: z.string().url(),
  category: z.string().min(2),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  price: z.number().nonnegative().default(0),
  isFree: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});

router.get('/admin/all', requireAuth, requireAdmin, async (_req, res) => {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { sections: true, enrollments: true } } },
  });
  res.json({ courses });
});

router.post('/', requireAuth, requireAdmin, validate(courseSchema), async (req, res) => {
  const data = req.body as z.infer<typeof courseSchema>;
  const course = await prisma.course.create({
    data: { ...data, slug: slugify(data.title) + '-' + Math.random().toString(36).slice(2, 7) },
  });
  res.status(201).json({ course });
});

router.put('/:id', requireAuth, requireAdmin, validate(courseSchema.partial()), async (req, res) => {
  const course = await prisma.course.update({ where: { id: req.params.id }, data: req.body });
  res.json({ course });
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await prisma.course.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// SECTIONS
router.post('/:id/sections', requireAuth, requireAdmin, async (req, res) => {
  const count = await prisma.section.count({ where: { courseId: req.params.id } });
  const section = await prisma.section.create({
    data: { title: req.body.title || 'New Section', order: count, courseId: req.params.id },
  });
  res.status(201).json({ section });
});

router.put('/sections/:id', requireAuth, requireAdmin, async (req, res) => {
  const section = await prisma.section.update({ where: { id: req.params.id }, data: req.body });
  res.json({ section });
});

router.delete('/sections/:id', requireAuth, requireAdmin, async (req, res) => {
  await prisma.section.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

router.post('/sections/reorder', requireAuth, requireAdmin, async (req, res) => {
  const { order } = req.body as { order: string[] };
  await Promise.all(
    order.map((id, idx) => prisma.section.update({ where: { id }, data: { order: idx } })),
  );
  res.json({ ok: true });
});

// LESSONS
router.post('/sections/:sectionId/lessons', requireAuth, requireAdmin, async (req, res) => {
  const count = await prisma.lesson.count({ where: { sectionId: req.params.sectionId } });
  const lesson = await prisma.lesson.create({
    data: {
      sectionId: req.params.sectionId,
      title: req.body.title || 'New Lesson',
      order: count,
      duration: req.body.duration ?? 0,
      videoUrl: req.body.videoUrl ?? null,
      videoKey: req.body.videoKey ?? null,
      content: req.body.content ?? null,
    },
  });
  res.status(201).json({ lesson });
});

router.put('/lessons/:id', requireAuth, requireAdmin, async (req, res) => {
  const lesson = await prisma.lesson.update({ where: { id: req.params.id }, data: req.body });
  res.json({ lesson });
});

router.delete('/lessons/:id', requireAuth, requireAdmin, async (req, res) => {
  await prisma.lesson.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

router.post('/lessons/reorder', requireAuth, requireAdmin, async (req, res) => {
  const { order } = req.body as { order: string[] };
  await Promise.all(
    order.map((id, idx) => prisma.lesson.update({ where: { id }, data: { order: idx } })),
  );
  res.json({ ok: true });
});

export default router;
