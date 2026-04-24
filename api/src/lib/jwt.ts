import jwt, { SignOptions } from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh';
const ACCESS_EXPIRES = (process.env.JWT_ACCESS_EXPIRES || '15m') as SignOptions['expiresIn'];
const REFRESH_EXPIRES = (process.env.JWT_REFRESH_EXPIRES || '7d') as SignOptions['expiresIn'];

export interface JwtPayload {
  sub: string;
  role: 'USER' | 'ADMIN';
}

export const signAccessToken = (payload: JwtPayload) =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });

export const signRefreshToken = (payload: JwtPayload) =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, ACCESS_SECRET) as JwtPayload & { iat: number; exp: number };

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, REFRESH_SECRET) as JwtPayload & { iat: number; exp: number };
