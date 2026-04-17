import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { prisma } from '../../../configs/prisma.js';
import { env } from '../../../configs/env.js';
import { sendMail } from '../../../configs/mailer.js';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  AppError,
} from '../../../shared/errors/AppError.js';

function generateTokens(userId) {
  const accessToken = jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
  const refreshToken = jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
  return { accessToken, refreshToken };
}

function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function register({ firstName, lastName, email, password }) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new ConflictError('Email already registered');

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: { firstName, lastName, email, passwordHash },
    select: { id: true, email: true, firstName: true, lastName: true },
  });

  const verifyToken = generateSecureToken();
  await prisma.token.create({
    data: {
      userId: user.id,
      token: verifyToken,
      type: 'EMAIL_VERIFICATION',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  await sendMail({
    to: user.email,
    subject: 'Verifica tu cuenta en Finmo',
    html: `
      <h2>¡Bienvenido a Finmo, ${user.firstName}!</h2>
      <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
      <a href="${env.FRONTEND_URL}/verify-email?token=${verifyToken}">Verificar cuenta</a>
      <p>Este enlace expira en 24 horas.</p>
    `,
  });

  return user;
}

export async function verifyEmail(token) {
  const record = await prisma.token.findUnique({ where: { token } });
  if (!record || record.type !== 'EMAIL_VERIFICATION' || record.usedAt || record.expiresAt < new Date()) {
    throw new AppError('Invalid or expired verification token', 400, 'INVALID_TOKEN');
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { isVerified: true } }),
    prisma.token.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email, isActive: true, deletedAt: null },
    include: { profile: true },
  });
  if (!user) throw new UnauthorizedError('Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Invalid credentials');

  const { accessToken, refreshToken } = generateTokens(user.id);

  await prisma.token.create({
    data: {
      userId: user.id,
      token: refreshToken,
      type: 'REFRESH',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified,
      avatarUrl: user.avatarUrl,
      onboardingStep: user.onboardingStep,
      monthlyIncome: user.monthlyIncome,
      currency: user.currency,
      profile: user.profile,
    },
  };
}

export async function refreshTokens(refreshToken) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const record = await prisma.token.findUnique({
    where: { token: refreshToken },
  });
  if (!record || record.type !== 'REFRESH' || record.usedAt || record.expiresAt < new Date()) {
    throw new UnauthorizedError('Refresh token expired or already used');
  }

  await prisma.token.update({ where: { id: record.id }, data: { usedAt: new Date() } });

  const tokens = generateTokens(payload.sub);
  await prisma.token.create({
    data: {
      userId: payload.sub,
      token: tokens.refreshToken,
      type: 'REFRESH',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return tokens;
}

export async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email, isActive: true, deletedAt: null } });
  if (!user) return; // No revelar si existe

  const resetToken = generateSecureToken();
  await prisma.token.create({
    data: {
      userId: user.id,
      token: resetToken,
      type: 'PASSWORD_RESET',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  await sendMail({
    to: user.email,
    subject: 'Recupera tu contraseña en Finmo',
    html: `
      <h2>Recuperación de contraseña</h2>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${env.FRONTEND_URL}/reset-password?token=${resetToken}">Restablecer contraseña</a>
      <p>Este enlace expira en 1 hora.</p>
      <p>Si no solicitaste esto, ignora este correo.</p>
    `,
  });
}

export async function resetPassword({ token, password }) {
  const record = await prisma.token.findUnique({ where: { token } });
  if (!record || record.type !== 'PASSWORD_RESET' || record.usedAt || record.expiresAt < new Date()) {
    throw new AppError('Invalid or expired reset token', 400, 'INVALID_TOKEN');
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.token.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);
}

export async function logout(userId, refreshToken) {
  await prisma.token.updateMany({
    where: { userId, token: refreshToken, type: 'REFRESH' },
    data: { usedAt: new Date() },
  });
}
