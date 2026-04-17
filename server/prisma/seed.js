import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Alimentación', icon: '🍔', color: '#FF6B6B' },
  { name: 'Transporte', icon: '🚗', color: '#4ECDC4' },
  { name: 'Vivienda', icon: '🏠', color: '#45B7D1' },
  { name: 'Salud', icon: '💊', color: '#96CEB4' },
  { name: 'Educación', icon: '📚', color: '#FFEAA7' },
  { name: 'Entretenimiento', icon: '🎬', color: '#DDA0DD' },
  { name: 'Ropa', icon: '👗', color: '#F0E68C' },
  { name: 'Tecnología', icon: '💻', color: '#87CEEB' },
  { name: 'Deudas', icon: '💳', color: '#FA8072' },
  { name: 'Gastos hormiga', icon: '☕', color: '#D2691E' },
  { name: 'Otros gastos', icon: '📦', color: '#808080' },
];

const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salario', icon: '💼', color: '#2ECC71' },
  { name: 'Freelance', icon: '💻', color: '#3498DB' },
  { name: 'Inversiones', icon: '📈', color: '#F39C12' },
  { name: 'Arriendo', icon: '🏢', color: '#9B59B6' },
  { name: 'Otros ingresos', icon: '💵', color: '#1ABC9C' },
];

async function upsertDefaultCategory(data) {
  const existing = await prisma.category.findFirst({
    where: { userId: null, name: data.name, type: data.type },
  });
  if (!existing) {
    await prisma.category.create({ data });
  }
}

async function main() {
  console.log('🌱 Seeding database...');

  // Categorías globales de gastos
  for (const cat of DEFAULT_EXPENSE_CATEGORIES) {
    await upsertDefaultCategory({ ...cat, type: 'EXPENSE', isDefault: true });
  }

  // Categorías globales de ingresos
  for (const cat of DEFAULT_INCOME_CATEGORIES) {
    await upsertDefaultCategory({ ...cat, type: 'INCOME', isDefault: true });
  }

  // Usuario de prueba
  const passwordHash = await bcrypt.hash('Admin1234', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@finmo.app' },
    update: {},
    create: {
      email: 'demo@finmo.app',
      passwordHash,
      firstName: 'Demo',
      lastName: 'User',
      isVerified: true,
      monthlyIncome: 3000000,
      currency: 'COP',
    },
  });

  console.log(`✅ Created demo user: ${user.email}`);
  console.log(`✅ Created ${DEFAULT_EXPENSE_CATEGORIES.length} expense categories`);
  console.log(`✅ Created ${DEFAULT_INCOME_CATEGORIES.length} income categories`);
  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
