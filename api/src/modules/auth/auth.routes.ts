import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import { HttpError } from '../../middleware/error';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function issueTokens(userId: string, role: 'USER' | 'ADMIN') {
  const accessToken = signAccessToken({ sub: userId, role });
  const refreshToken = signRefreshToken({ sub: userId, role });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId, expiresAt },
  });
  return { accessToken, refreshToken };
}

router.post('/register', validate(registerSchema), async (req, res) => {
  const { name, email, password } = req.body as z.infer<typeof registerSchema>;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new HttpError(409, 'Email already in use');
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });
  const tokens = await issueTokens(user.id, user.role);
  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    ...tokens,
  });
});

router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new HttpError(401, 'Invalid credentials');
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new HttpError(401, 'Invalid credentials');
  const tokens = await issueTokens(user.id, user.role);
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    ...tokens,
  });
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) throw new HttpError(400, 'refreshToken required');
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new HttpError(401, 'Invalid refresh token');
  }
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.revoked || stored.expiresAt < new Date())
    throw new HttpError(401, 'Refresh token expired');
  // rotate
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
  const tokens = await issueTokens(payload.sub, payload.role);
  res.json(tokens);
});

router.post('/logout', requireAuth, async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken, userId: req.user!.sub },
      data: { revoked: true },
    });
  }
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
  });
  if (!user) throw new HttpError(404, 'User not found');
  res.json({ user });
});

export default router;
