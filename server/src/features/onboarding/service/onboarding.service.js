import { prisma } from '../../../configs/prisma.js';

// Devuelve el estado actual del onboarding + perfil del usuario
export async function getOnboardingStatus(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, firstName: true, lastName: true, email: true,
      monthlyIncome: true, currency: true, onboardingStep: true,
      profile: true,
    },
  });
  return user;
}

// Paso 1 — datos personales / preferencias
export async function saveStep1(userId, data) {
  const { currency, ...profileData } = data;

  await prisma.$transaction([
    // Actualiza moneda en el usuario si viene
    ...(currency ? [prisma.user.update({ where: { id: userId }, data: { currency, onboardingStep: 1 } })] :
                   [prisma.user.update({ where: { id: userId }, data: { onboardingStep: 1 } })]),
    // Upsert perfil
    prisma.userProfile.upsert({
      where: { userId },
      update: profileData,
      create: { userId, ...profileData },
    }),
  ]);

  return getOnboardingStatus(userId);
}

// Paso 2 — ingresos
export async function saveStep2(userId, data) {
  const { monthlyIncome, ...profileData } = data;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { monthlyIncome, onboardingStep: 2 },
    }),
    prisma.userProfile.upsert({
      where: { userId },
      update: profileData,
      create: { userId, ...profileData },
    }),
  ]);

  return getOnboardingStatus(userId);
}

// Paso 3 — gastos fijos
export async function saveStep3(userId, data) {
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { onboardingStep: 3 } }),
    prisma.userProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    }),
  ]);

  return getOnboardingStatus(userId);
}

// Paso 4 — comportamiento + completar onboarding
export async function saveStep4(userId, data) {
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { onboardingStep: 5 } }),  // 5 = completado
    prisma.userProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    }),
  ]);

  return getOnboardingStatus(userId);
}

// Saltar onboarding (marcar como completado sin datos completos)
export async function skipOnboarding(userId) {
  await prisma.user.update({ where: { id: userId }, data: { onboardingStep: 5 } });
  return getOnboardingStatus(userId);
}
