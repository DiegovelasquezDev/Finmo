/**
 * @swagger
 * /analysis/profile:
 *   get:
 *     tags: [Analysis]
 *     summary: Perfil financiero del usuario
 *     description: >
 *       Genera un análisis completo del perfil financiero usando KMeans clustering,
 *       incluyendo arquetipo, score 0–100, fortalezas, picos de gasto y recomendaciones.
 *       Respuestas localizadas según el idioma del usuario (Accept-Language).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil financiero analizado
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
 *                     archetype_key:
 *                       type: string
 *                       description: "Clave del arquetipo (IMPULSIVO, CONSERVADOR, PLANIFICADOR, VOLATIL, ENDEUDADO)"
 *                     archetype_emoji:
 *                       type: string
 *                     archetype_name:
 *                       type: string
 *                     archetype_description:
 *                       type: string
 *                     archetype_strengths:
 *                       type: string
 *                     archetype_risk:
 *                       type: string
 *                     archetype_tip:
 *                       type: string
 *                     score:
 *                       type: integer
 *                       description: "Score compuesto 0–100"
 *                     score_label:
 *                       type: string
 *                     score_breakdown:
 *                       type: object
 *                       properties:
 *                         spending_control:
 *                           type: integer
 *                         savings_habit:
 *                           type: integer
 *                         behavioral_stability:
 *                           type: integer
 *                         no_spikes:
 *                           type: integer
 *                         goal_progress:
 *                           type: integer
 *                     spike_days:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           day:
 *                             type: string
 *                           multiplier:
 *                             type: number
 *                     insights:
 *                       type: array
 *                       items:
 *                         type: string
 *                     avg_monthly_expense:
 *                       type: number
 *                     avg_savings_rate:
 *                       type: number
 *                     expense_ratio:
 *                       type: number
 *                     months_analyzed:
 *                       type: integer
 *       401:
 *         description: No autorizado
 *
 * /analysis/sentiment:
 *   post:
 *     tags: [Analysis]
 *     summary: Análisis de sentimiento
 *     description: >
 *       Analiza el sentimiento financiero de un texto usando BERT multilingüe.
 *       Retorna score normalizado 0–1, etiqueta de estrés y recomendación localizada.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SentimentInput'
 *     responses:
 *       200:
 *         description: Resultado del análisis de sentimiento
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
 *                     score:
 *                       type: number
 *                       description: "Score normalizado (0.0 – 1.0)"
 *                     label:
 *                       type: string
 *                       description: "ESTRES_CRONICO / CHRONIC_STRESS o RESILIENCIA / RESILIENCE"
 *                     energy_level:
 *                       type: number
 *                       description: "Intensidad emocional (0.0 – 1.0)"
 *                     alert_priority:
 *                       type: string
 *                       description: "CALMA, FORTALECIMIENTO, REDUCCION o CRITICO"
 *                     recommendation:
 *                       type: string
 *       400:
 *         description: Texto inválido
 *       401:
 *         description: No autorizado
 *
 * /analysis/financial-health:
 *   post:
 *     tags: [Analysis]
 *     summary: Análisis de salud financiera
 *     description: >
 *       Evalúa la salud financiera comparando el ratio gastos/ingresos contra
 *       umbrales empíricos de Zhu (2022, N=264). Retorna nivel, prioridad de alerta
 *       y comparación con datos del estudio.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FinancialHealthInput'
 *     responses:
 *       200:
 *         description: Resultado del análisis de salud financiera
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
 *                     health_ratio:
 *                       type: number
 *                       description: "(fixed_expenses / income) * 100"
 *                     level:
 *                       type: string
 *                       description: "ALTA_SEGURIDAD, EQUILIBRIO, CARGA_ELEVADA o CRITICO"
 *                     alert_priority:
 *                       type: string
 *                     vs_research_thresholds:
 *                       type: object
 *                       description: "Comparación contra umbrales del estudio Zhu (2022)"
 *                     recommendation:
 *                       type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *
 * /analysis/spending-pattern:
 *   get:
 *     tags: [Analysis]
 *     summary: Patrón de gastos
 *     description: >
 *       Analiza transacciones históricas para identificar categorías top, gastos hormiga,
 *       outliers por z-score y patrones negativos.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Inicio del período
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fin del período
 *     responses:
 *       200:
 *         description: Patrón de gastos analizado
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
 *                     top_categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                           total:
 *                             type: number
 *                           percentage_of_income:
 *                             type: number
 *                           transaction_count:
 *                             type: integer
 *                           is_ant_spending:
 *                             type: boolean
 *                     ant_spending_detected:
 *                       type: boolean
 *                     unusual_expenses:
 *                       type: array
 *                       items:
 *                         type: object
 *                     negative_patterns:
 *                       type: array
 *                       items:
 *                         type: string
 *                     total_expenses:
 *                       type: number
 *                     expense_to_income_ratio:
 *                       type: number
 *       401:
 *         description: No autorizado
 *
 * /analysis/predict-expenses:
 *   get:
 *     tags: [Analysis]
 *     summary: Predicción de gastos
 *     description: >
 *       Entrena LinearRegression + RandomForest sobre el historial, auto-selecciona
 *       el mejor modelo por R² y proyecta gastos futuros a 1–3 meses.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 3
 *           default: 1
 *         description: Meses a predecir (1-3)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: Inicio del período de datos históricos
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: Fin del período de datos históricos
 *     responses:
 *       200:
 *         description: Predicción de gastos
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
 *                     predictions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                           predicted_expense:
 *                             type: number
 *                           confidence:
 *                             type: string
 *                     trend:
 *                       type: string
 *                       description: "CRECIENTE/INCREASING, ESTABLE/STABLE, DECRECIENTE/DECREASING"
 *                     avg_monthly_expense:
 *                       type: number
 *                     model_used:
 *                       type: string
 *                       description: "linear_regression o random_forest"
 *                     model_score:
 *                       type: number
 *                       description: "R² del modelo seleccionado"
 *       401:
 *         description: No autorizado
 *
 * /analysis/purchase-impact:
 *   post:
 *     tags: [Analysis]
 *     summary: Impacto de una compra
 *     description: >
 *       Calcula el impacto financiero de una compra potencial como porcentaje
 *       del ingreso mensual. Retorna nivel (LOW/MEDIUM/CRITICAL) y recomendación.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PurchaseImpactInput'
 *     responses:
 *       200:
 *         description: Resultado del análisis de impacto
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
 *                     impact_pct:
 *                       type: number
 *                       description: "(price / monthly_income) * 100"
 *                     level:
 *                       type: string
 *                       description: "IMPACTO_BAJO/LOW_IMPACT, IMPACTO_MEDIO/MEDIUM_IMPACT, IMPACTO_CRITICO/CRITICAL_IMPACT"
 *                     recommendation:
 *                       type: string
 *                     combined_ratio_after:
 *                       type: number
 *                       description: "Ratio combinado tras la compra (si se envió current_expense_ratio)"
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *
 * /analysis/score-history:
 *   get:
 *     tags: [Analysis]
 *     summary: Historial de score financiero
 *     description: Retorna el historial de snapshots del score financiero del usuario.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial de scores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       score:
 *                         type: integer
 *                       archetypeKey:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: No autorizado
 *
 * /analysis/concerns:
 *   post:
 *     tags: [Analysis]
 *     summary: Clasificación de preocupaciones financieras
 *     description: >
 *       Clasifica texto libre en una de 7 categorías de preocupación financiera
 *       usando TF-IDF + LogisticRegression: DEBT, SAVINGS, ANT_SPENDING,
 *       INSURANCE, INVESTMENT, RETIREMENT, OTHER.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConcernInput'
 *     responses:
 *       200:
 *         description: Clasificación de la preocupación financiera
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
 *                     category:
 *                       type: string
 *                       description: "Categoría clasificada (DEBT, SAVINGS, ANT_SPENDING, etc.)"
 *                     category_label:
 *                       type: string
 *                       description: "Etiqueta localizada de la categoría"
 *                     confidence:
 *                       type: number
 *                       description: "Confianza de la clasificación (0.0 – 1.0)"
 *                     top_keywords:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Texto inválido
 *       401:
 *         description: No autorizado
 */
