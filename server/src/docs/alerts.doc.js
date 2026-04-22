/**
 * @swagger
 * /alerts:
 *   get:
 *     tags: [Alerts]
 *     summary: Listar alertas
 *     description: Retorna las alertas del usuario con paginación.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista paginada de alertas
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
 *                     $ref: '#/components/schemas/Alert'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: No autorizado
 *
 * /alerts/unread-count:
 *   get:
 *     tags: [Alerts]
 *     summary: Obtener cantidad de alertas no leídas
 *     description: Retorna el conteo de alertas no leídas del usuario.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conteo de alertas no leídas
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
 *                     count:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: No autorizado
 *
 * /alerts/read-all:
 *   patch:
 *     tags: [Alerts]
 *     summary: Marcar todas como leídas
 *     description: Marca todas las alertas del usuario como leídas.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las alertas marcadas como leídas
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
 *                     message:
 *                       type: string
 *                       example: All alerts marked as read
 *       401:
 *         description: No autorizado
 *
 * /alerts/{id}/read:
 *   patch:
 *     tags: [Alerts]
 *     summary: Marcar alerta como leída
 *     description: Marca una alerta específica como leída.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Alerta marcada como leída
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
 *                     message:
 *                       type: string
 *                       example: Alert marked as read
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Alerta no encontrada
 */
