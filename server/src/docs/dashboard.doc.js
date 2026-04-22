/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Resumen del dashboard
 *     description: >
 *       Retorna totales de ingresos/gastos, transacciones recientes, top categorías de gasto,
 *       progreso de metas e insights de IA (patrones, predicciones, salud financiera).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Inicio del período (por defecto inicio del mes actual)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fin del período (por defecto fin del mes actual)
 *     responses:
 *       200:
 *         description: Resumen completo del dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DashboardSummary'
 *       401:
 *         description: No autorizado
 *
 * /dashboard/monthly-trend:
 *   get:
 *     tags: [Dashboard]
 *     summary: Tendencia mensual
 *     description: Retorna ingresos, gastos y balance por mes para los últimos N meses.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 6
 *         description: Cantidad de meses hacia atrás
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Tendencia mensual
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
 *                     trend:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MonthlyTrendItem'
 *       401:
 *         description: No autorizado
 */
