import bcrypt from 'bcryptjs';
import { prisma } from '../../../configs/prisma.js';
import { env } from '../../../configs/env.js';
import { NotFoundError, UnauthorizedError } from '../../../shared/errors/AppError.js';

const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  isVerified: true,
  monthlyIncome: true,
  currency: true,
  onboardingStep: true,
  createdAt: true,
  profile: true,
};

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: USER_SELECT });
  if (!user) throw new NotFoundError('User');
  return user;
}

export async function updateProfile(userId, data) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: USER_SELECT,
  });
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User');

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Current password is incorrect');

  const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

export async function deleteAccount(userId) {
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false, deletedAt: new Date() },
  });
}
