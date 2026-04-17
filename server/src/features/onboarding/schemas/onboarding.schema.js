import { z } from 'zod';

// Paso 1 — Datos personales y contexto demográfico
export const step1Schema = z.object({
  body: z.object({
    birthYear:          z.number().int().min(1940).max(2010).optional(),
    occupation:         z.string().max(100).optional(),
    educationLevel:     z.enum(['PRIMARY','SECONDARY','TECHNICAL','UNDERGRADUATE','GRADUATE','POSTGRADUATE']).optional(),
    householdSize:      z.number().int().min(1).max(20).optional(),
    financialKnowledge: z.enum(['BASIC','INTERMEDIATE','ADVANCED']).optional(),
    currency:           z.string().length(3).optional(),
  }),
});

// Paso 2 — Fuentes de ingreso
export const step2Schema = z.object({
  body: z.object({
    monthlyIncome:        z.number().positive(),
    primaryIncomeSource:  z.enum(['SALARY','FREELANCE','BUSINESS','INVESTMENTS','PENSION','MIXED','OTHER']),
    employmentType:       z.enum(['EMPLOYED_FULL','EMPLOYED_PART','SELF_EMPLOYED','UNEMPLOYED','STUDENT','RETIRED']),
    hasSecondaryIncome:   z.boolean().optional(),
    secondaryIncomeAmount:z.number().min(0).optional(),
  }),
});

// Paso 3 — Gastos fijos mensuales
export const step3Schema = z.object({
  body: z.object({
    rentMortgage:    z.number().min(0).optional(),
    utilities:       z.number().min(0).optional(),
    transportFixed:  z.number().min(0).optional(),
    insurances:      z.number().min(0).optional(),
    subscriptions:   z.number().min(0).optional(),
    loanPayments:    z.number().min(0).optional(),
    otherFixed:      z.number().min(0).optional(),
  }),
});

// Paso 4 — Comportamiento financiero y metas
export const step4Schema = z.object({
  body: z.object({
    savingsGoalPct:      z.number().int().min(0).max(100).optional(),
    hasEmergencyFund:    z.boolean().optional(),
    emergencyFundMonths: z.number().int().min(0).max(36).optional(),
    hasDebts:            z.boolean().optional(),
    totalDebtAmount:     z.number().min(0).optional(),
    financialStressLevel:z.number().int().min(1).max(5).optional(),
    spendingBehavior:    z.enum(['SAVER','PLANNER','IMPULSIVE','BALANCED']).optional(),
    mainFinancialGoal:   z.enum(['EMERGENCY_FUND','PAY_DEBT','SAVE_TRAVEL','BUY_PROPERTY','RETIREMENT','EDUCATION','INVESTMENT','OTHER']).optional(),
    alertBudgetPct:      z.number().int().min(50).max(100).optional(),
  }),
});
