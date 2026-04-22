import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { env } from './env.js';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Finmo API',
      version: '1.0.0',
      description:
        'API de finanzas personales — gestión de transacciones, metas, presupuestos, análisis con IA y más.',
      contact: { name: 'Finmo Team' },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api`,
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // ── Shared ──
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },

        // ── Auth ──
        RegisterInput: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            firstName: { type: 'string', minLength: 2, maxLength: 100 },
            lastName: { type: 'string', minLength: 2, maxLength: 100 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8, description: 'Min 8 chars, 1 uppercase, 1 number' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        TokenPair: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        RefreshInput: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },
        ForgotPasswordInput: {
          type: 'object',
          required: ['email'],
          properties: { email: { type: 'string', format: 'email' } },
        },
        ResetPasswordInput: {
          type: 'object',
          required: ['token', 'password'],
          properties: {
            token: { type: 'string' },
            password: { type: 'string', minLength: 8 },
          },
        },

        // ── User ──
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            avatarUrl: { type: 'string', nullable: true },
            isVerified: { type: 'boolean' },
            monthlyIncome: { type: 'number', nullable: true },
            currency: { type: 'string', example: 'COP' },
            onboardingStep: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        UpdateProfileInput: {
          type: 'object',
          properties: {
            firstName: { type: 'string', minLength: 2, maxLength: 100 },
            lastName: { type: 'string', minLength: 2, maxLength: 100 },
            monthlyIncome: { type: 'number' },
            currency: { type: 'string', minLength: 3, maxLength: 3 },
          },
        },
        ChangePasswordInput: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string' },
            newPassword: { type: 'string', minLength: 8 },
          },
        },

        // ── Onboarding ──
        OnboardingStep1: {
          type: 'object',
          properties: {
            birthYear: { type: 'integer', minimum: 1940, maximum: 2010 },
            occupation: { type: 'string', maxLength: 100 },
            educationLevel: { type: 'string', enum: ['PRIMARY','SECONDARY','TECHNICAL','UNDERGRADUATE','GRADUATE','POSTGRADUATE'] },
            householdSize: { type: 'integer', minimum: 1, maximum: 20 },
            financialKnowledge: { type: 'string', enum: ['BASIC','INTERMEDIATE','ADVANCED'] },
            currency: { type: 'string', minLength: 3, maxLength: 3 },
          },
        },
        OnboardingStep2: {
          type: 'object',
          required: ['monthlyIncome', 'primaryIncomeSource', 'employmentType'],
          properties: {
            monthlyIncome: { type: 'number' },
            primaryIncomeSource: { type: 'string', enum: ['SALARY','FREELANCE','BUSINESS','INVESTMENTS','PENSION','MIXED','OTHER'] },
            employmentType: { type: 'string', enum: ['EMPLOYED_FULL','EMPLOYED_PART','SELF_EMPLOYED','UNEMPLOYED','STUDENT','RETIRED'] },
            hasSecondaryIncome: { type: 'boolean' },
            secondaryIncomeAmount: { type: 'number' },
          },
        },
        OnboardingStep3: {
          type: 'object',
          properties: {
            rentMortgage: { type: 'number' },
            utilities: { type: 'number' },
            transportFixed: { type: 'number' },
            insurances: { type: 'number' },
            subscriptions: { type: 'number' },
            loanPayments: { type: 'number' },
            otherFixed: { type: 'number' },
          },
        },
        OnboardingStep4: {
          type: 'object',
          properties: {
            savingsGoalPct: { type: 'integer', minimum: 0, maximum: 100 },
            hasEmergencyFund: { type: 'boolean' },
            emergencyFundMonths: { type: 'integer', minimum: 0, maximum: 36 },
            hasDebts: { type: 'boolean' },
            totalDebtAmount: { type: 'number' },
            financialStressLevel: { type: 'integer', minimum: 1, maximum: 5 },
            spendingBehavior: { type: 'string', enum: ['SAVER','PLANNER','IMPULSIVE','BALANCED'] },
            mainFinancialGoal: { type: 'string', enum: ['EMERGENCY_FUND','PAY_DEBT','SAVE_TRAVEL','BUY_PROPERTY','RETIREMENT','EDUCATION','INVESTMENT','OTHER'] },
            alertBudgetPct: { type: 'integer', minimum: 50, maximum: 100 },
          },
        },

        // ── Transaction ──
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            categoryId: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
            amount: { type: 'number' },
            description: { type: 'string', nullable: true },
            date: { type: 'string', format: 'date-time' },
            isRecurring: { type: 'boolean' },
            recurrence: { type: 'string', enum: ['DAILY','WEEKLY','BIWEEKLY','MONTHLY','YEARLY'], nullable: true },
            tags: { type: 'string', nullable: true },
            notes: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateTransactionInput: {
          type: 'object',
          required: ['categoryId', 'type', 'amount', 'date'],
          properties: {
            categoryId: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
            amount: { type: 'number' },
            description: { type: 'string', maxLength: 500 },
            date: { type: 'string', format: 'date-time' },
            isRecurring: { type: 'boolean' },
            recurrence: { type: 'string', enum: ['DAILY','WEEKLY','BIWEEKLY','MONTHLY','YEARLY'] },
            tags: { type: 'array', items: { type: 'string' } },
            notes: { type: 'string' },
          },
        },

        // ── Category ──
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid', nullable: true },
            name: { type: 'string' },
            icon: { type: 'string', nullable: true },
            color: { type: 'string', nullable: true, example: '#FF5733' },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
            isDefault: { type: 'boolean' },
            isActive: { type: 'boolean' },
          },
        },
        CreateCategoryInput: {
          type: 'object',
          required: ['name', 'type'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
            icon: { type: 'string', maxLength: 50 },
            color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
          },
        },

        // ── Goal ──
        Goal: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            targetAmount: { type: 'number' },
            currentAmount: { type: 'number' },
            deadline: { type: 'string', format: 'date-time', nullable: true },
            status: { type: 'string', enum: ['ACTIVE','COMPLETED','PAUSED','CANCELLED'] },
            icon: { type: 'string', nullable: true },
            color: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateGoalInput: {
          type: 'object',
          required: ['name', 'targetAmount'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 200 },
            description: { type: 'string' },
            targetAmount: { type: 'number' },
            deadline: { type: 'string', format: 'date-time' },
            icon: { type: 'string', maxLength: 50 },
            color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
          },
        },
        UpdateGoalInput: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 200 },
            description: { type: 'string' },
            targetAmount: { type: 'number' },
            currentAmount: { type: 'number', minimum: 0 },
            deadline: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['ACTIVE','COMPLETED','PAUSED','CANCELLED'] },
            icon: { type: 'string', maxLength: 50 },
            color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
          },
        },

        // ── Alert ──
        Alert: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['BUDGET_EXCEEDED','BUDGET_WARNING','UNUSUAL_EXPENSE','GOAL_ACHIEVED','GOAL_DEADLINE','RECURRING_DUE','NEGATIVE_PATTERN','LOW_INCOME_RATIO'] },
            title: { type: 'string' },
            message: { type: 'string' },
            threshold: { type: 'number', nullable: true },
            isRead: { type: 'boolean' },
            isActive: { type: 'boolean' },
            triggeredAt: { type: 'string', format: 'date-time' },
            readAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },

        // ── Dashboard ──
        DashboardSummary: {
          type: 'object',
          properties: {
            period: {
              type: 'object',
              properties: {
                start: { type: 'string', format: 'date-time' },
                end: { type: 'string', format: 'date-time' },
              },
            },
            totals: {
              type: 'object',
              properties: {
                income: { type: 'number' },
                expense: { type: 'number' },
                balance: { type: 'number' },
                savingsRate: { type: 'number' },
              },
            },
            recentTransactions: { type: 'array', items: { $ref: '#/components/schemas/Transaction' } },
            topExpenseCategories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { $ref: '#/components/schemas/Category' },
                  total: { type: 'number' },
                },
              },
            },
            goalsProgress: { type: 'array', items: { type: 'object' } },
            insights: {
              type: 'object',
              properties: {
                spendingPattern: { type: 'object', nullable: true },
                prediction: { type: 'object', nullable: true },
                financialHealth: { type: 'object', nullable: true },
              },
            },
          },
        },
        MonthlyTrendItem: {
          type: 'object',
          properties: {
            month: { type: 'string', example: '2026-04' },
            income: { type: 'number' },
            expense: { type: 'number' },
            balance: { type: 'number' },
          },
        },

        // ── Analysis ──
        SentimentInput: {
          type: 'object',
          required: ['text'],
          properties: { text: { type: 'string', minLength: 3, maxLength: 2000 } },
        },
        FinancialHealthInput: {
          type: 'object',
          required: ['monthly_income', 'fixed_expenses'],
          properties: {
            monthly_income: { type: 'number' },
            fixed_expenses: { type: 'number' },
            total_debt: { type: 'number' },
            financial_stress_level: { type: 'integer', minimum: 1, maximum: 5 },
          },
        },
        PurchaseImpactInput: {
          type: 'object',
          required: ['product_name', 'price', 'monthly_income'],
          properties: {
            product_name: { type: 'string' },
            price: { type: 'number' },
            monthly_income: { type: 'number' },
            current_expense_ratio: { type: 'number', minimum: 0, maximum: 100 },
          },
        },
        ConcernInput: {
          type: 'object',
          required: ['text'],
          properties: {
            text: { type: 'string', minLength: 3, maxLength: 2000, description: 'Free text describing a financial concern' },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Health check del servidor' },
      { name: 'Auth', description: 'Registro, login, tokens y recuperación de contraseña' },
      { name: 'Users', description: 'Perfil y configuración del usuario' },
      { name: 'Onboarding', description: 'Flujo de onboarding en 4 pasos' },
      { name: 'Transactions', description: 'CRUD de transacciones (ingresos/gastos)' },
      { name: 'Categories', description: 'Gestión de categorías de transacciones' },
      { name: 'Goals', description: 'Metas financieras' },
      { name: 'Alerts', description: 'Alertas y notificaciones financieras' },
      { name: 'Dashboard', description: 'Resumen y tendencias del dashboard' },
      { name: 'Analysis', description: 'Análisis con IA — sentimiento, salud financiera, patrones, predicciones' },
    ],
  },
  apis: ['./src/docs/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Finmo API Docs',
  }));
  app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));
}
