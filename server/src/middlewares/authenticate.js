import jwt from 'jsonwebtoken';
import { env } from '../configs/env.js';
import { UnauthorizedError } from '../shared/errors/AppError.js';
import { prisma } from '../configs/prisma.js';

export async function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedError('Token required');

    const token = authHeader.slice(7);
    const payload = jwt.verify(token, env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub, isActive: true, deletedAt: null },
      select: { id: true, email: true, firstName: true, lastName: true, isVerified: true },
    });

    if (!user) throw new UnauthorizedError('User not found or inactive');

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Invalid or expired token'));
    }
    next(err);
  }
}

export function requireVerified(req, _res, next) {
  if (!req.user.isVerified) {
    return next(new UnauthorizedError('Email not verified'));
  }
  next();
}
