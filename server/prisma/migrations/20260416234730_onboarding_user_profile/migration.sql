-- AlterTable
ALTER TABLE `users` ADD COLUMN `onboardingStep` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `user_profiles` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `birthYear` INTEGER NULL,
    `occupation` VARCHAR(100) NULL,
    `educationLevel` ENUM('PRIMARY', 'SECONDARY', 'TECHNICAL', 'UNDERGRADUATE', 'GRADUATE', 'POSTGRADUATE') NULL,
    `householdSize` INTEGER NULL,
    `financialKnowledge` ENUM('BASIC', 'INTERMEDIATE', 'ADVANCED') NOT NULL DEFAULT 'BASIC',
    `primaryIncomeSource` ENUM('SALARY', 'FREELANCE', 'BUSINESS', 'INVESTMENTS', 'PENSION', 'MIXED', 'OTHER') NULL,
    `hasSecondaryIncome` BOOLEAN NOT NULL DEFAULT false,
    `secondaryIncomeAmount` DECIMAL(12, 2) NULL,
    `employmentType` ENUM('EMPLOYED_FULL', 'EMPLOYED_PART', 'SELF_EMPLOYED', 'UNEMPLOYED', 'STUDENT', 'RETIRED') NULL,
    `rentMortgage` DECIMAL(12, 2) NULL,
    `utilities` DECIMAL(12, 2) NULL,
    `transportFixed` DECIMAL(12, 2) NULL,
    `insurances` DECIMAL(12, 2) NULL,
    `subscriptions` DECIMAL(12, 2) NULL,
    `loanPayments` DECIMAL(12, 2) NULL,
    `otherFixed` DECIMAL(12, 2) NULL,
    `savingsGoalPct` INTEGER NULL,
    `hasEmergencyFund` BOOLEAN NOT NULL DEFAULT false,
    `emergencyFundMonths` INTEGER NULL,
    `hasDebts` BOOLEAN NOT NULL DEFAULT false,
    `totalDebtAmount` DECIMAL(12, 2) NULL,
    `financialStressLevel` INTEGER NULL,
    `spendingBehavior` ENUM('SAVER', 'PLANNER', 'IMPULSIVE', 'BALANCED') NULL,
    `mainFinancialGoal` ENUM('EMERGENCY_FUND', 'PAY_DEBT', 'SAVE_TRAVEL', 'BUY_PROPERTY', 'RETIREMENT', 'EDUCATION', 'INVESTMENT', 'OTHER') NULL,
    `alertBudgetPct` INTEGER NOT NULL DEFAULT 80,
    `preferredTheme` VARCHAR(10) NOT NULL DEFAULT 'system',
    `language` VARCHAR(5) NOT NULL DEFAULT 'es',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
