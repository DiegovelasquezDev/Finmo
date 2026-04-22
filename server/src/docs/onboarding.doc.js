/**
 * @swagger
 * /onboarding/status:
 *   get:
 *     tags: [Onboarding]
 *     summary: Obtener estado del onboarding
 *     description: Retorna el paso actual de onboarding y los datos guardados hasta ahora.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado del onboarding
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     onboardingStep:
 *                       type: integer
 *                       description: "0=no iniciado, 1-4=paso actual, 5=completado"
 *                     profile:
 *                       type: object
 *                       nullable: true
 *       401:
 *         description: No autorizado
 *
 * /onboarding/step/1:
 *   post:
 *     tags: [Onboarding]
 *     summary: "Paso 1 — Datos personales"
 *     description: Guarda datos demográficos y contexto personal del usuario.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OnboardingStep1'
 *     responses:
 *       200:
 *         description: Paso 1 guardado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *
 * /onboarding/step/2:
 *   post:
 *     tags: [Onboarding]
 *     summary: "Paso 2 — Fuentes de ingreso"
 *     description: Guarda información sobre ingresos y tipo de empleo.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OnboardingStep2'
 *     responses:
 *       200:
 *         description: Paso 2 guardado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *
 * /onboarding/step/3:
 *   post:
 *     tags: [Onboarding]
 *     summary: "Paso 3 — Gastos fijos mensuales"
 *     description: Guarda los gastos fijos mensuales del usuario.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OnboardingStep3'
 *     responses:
 *       200:
 *         description: Paso 3 guardado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *
 * /onboarding/step/4:
 *   post:
 *     tags: [Onboarding]
 *     summary: "Paso 4 — Comportamiento financiero y metas"
 *     description: Guarda preferencias financieras, nivel de estrés, y meta principal. Completa el onboarding.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OnboardingStep4'
 *     responses:
 *       200:
 *         description: Paso 4 guardado — onboarding completado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *
 * /onboarding/skip:
 *   post:
 *     tags: [Onboarding]
 *     summary: Saltar onboarding
 *     description: Marca el onboarding como completado sin llenar los datos.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding saltado
 *       401:
 *         description: No autorizado
 */
