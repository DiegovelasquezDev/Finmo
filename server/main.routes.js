import { Router } from 'express';
import authRoutes from './src/features/auth/routes/auth.routes.js';
import onboardingRoutes from './src/features/onboarding/routes/onboarding.routes.js';
import usersRoutes from './src/features/users/routes/users.routes.js';
import transactionsRoutes from './src/features/transactions/routes/transactions.routes.js';
import categoriesRoutes from './src/features/categories/routes/categories.routes.js';
import goalsRoutes from './src/features/goals/routes/goals.routes.js';
import alertsRoutes from './src/features/alerts/routes/alerts.routes.js';
import dashboardRoutes from './src/features/dashboard/routes/dashboard.routes.js';
import analysisRoutes from './src/features/analysis/routes/analysis.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

router.use('/auth', authRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/users', usersRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/goals', goalsRoutes);
router.use('/alerts', alertsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/analysis', analysisRoutes);

export default router;
