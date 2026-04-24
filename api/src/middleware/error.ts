import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not found' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation error', issues: err.issues });
  }
  const e = err as { status?: number; message?: string };
  const status = e.status && Number.isInteger(e.status) ? e.status : 500;
  const message = e.message || 'Internal server error';
  if (status >= 500) console.error(err);
  res.status(status).json({ error: message });
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
