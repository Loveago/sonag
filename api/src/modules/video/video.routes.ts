import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { z } from 'zod';
import { requireAuth, requireAdmin } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { getUploadUrl, getStreamUrl, s3Enabled } from '../../lib/s3';

const router = Router();

const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 * 1024 } });

// Presigned URL for direct-to-S3 upload (admin only)
const presignSchema = z.object({
  key: z.string().min(3),
  contentType: z.string().min(3),
});

router.post(
  '/presign',
  requireAuth,
  requireAdmin,
  validate(presignSchema),
  async (req, res) => {
    if (!s3Enabled) return res.status(400).json({ error: 'S3 disabled; use /upload' });
    const { key, contentType } = req.body as z.infer<typeof presignSchema>;
    const url = await getUploadUrl(key, contentType);
    res.json({ url, key });
  },
);

// Local fallback upload (admin only)
router.post(
  '/upload',
  requireAuth,
  requireAdmin,
  upload.single('file'),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const publicUrl = `${req.protocol}://${req.get('host')}/static/${req.file.filename}`;
    res.status(201).json({
      key: req.file.filename,
      url: publicUrl,
      size: req.file.size,
    });
  },
);

// Secure stream signed URL (S3-only). Local files served via /static.
router.get('/stream/:key', requireAuth, async (req, res) => {
  if (!s3Enabled) return res.status(400).json({ error: 'S3 disabled' });
  const url = await getStreamUrl(req.params.key);
  res.json({ url });
});

export default router;
