import jwt from 'jsonwebtoken';
import { randomBytes, createHash } from 'crypto';
import { prisma } from './db.js';

const SECRET = process.env.JWT_SECRET || 'dev-secret';
const TOKEN_DAYS = { remember: 30, session: 1 };

export async function issueSession(res, userId, remember) {
  const days = remember ? TOKEN_DAYS.remember : TOKEN_DAYS.session;
  const token = jwt.sign({ sub: userId, jti: randomBytes(16).toString('hex') }, SECRET, {
    expiresIn: `${days}d`,
  });
  const session = await prisma.session.create({
    data: { token, userId, remember, expiresAt: new Date(Date.now() + days * 86400e3) },
  });
  res.cookie('aw_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: days * 86400e3,
  });
  return session;
}

export async function destroySession(token) {
  if (token) await prisma.session.deleteMany({ where: { token } });
}

export async function userFromRequest(req) {
  const token = req.cookies?.aw_session || req.headers.authorization?.replace(/^Bearer /, '');
  if (!token) return null;
  let payload;
  try {
    payload = jwt.verify(token, SECRET);
  } catch {
    return null;
  }
  const session = await prisma.session.findUnique({ where: { token } });
  if (!session || session.expiresAt < new Date()) return null;
  return prisma.user.findUnique({ where: { id: payload.sub } });
}

export function makeToken() {
  const raw = randomBytes(32).toString('hex');
  const hash = createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin')
    return res.status(403).json({ error: 'Admin access required' });
  next();
}

export async function authMiddleware(req, _res, next) {
  req.user = await userFromRequest(req);
  next();
}
