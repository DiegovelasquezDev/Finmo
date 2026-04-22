/**
 * @swagger
 * /goals:
 *   get:
 *     tags: [Goals]
 *     summary: Listar metas financieras
 *     description: Retorna todas las metas del usuario autenticado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de metas
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
 *                     goals:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Goal'
 *       401:
 *         description: No autorizado
 *
 *   post:
 *     tags: [Goals]
 *     summary: Crear meta financiera
 *     description: Crea una nueva meta financiera para el usuario.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGoalInput'
 *     responses:
 *       201:
 *         description: Meta creada
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
 *                     goal:
 *                       $ref: '#/components/schemas/Goal'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *
 * /goals/{id}:
 *   get:
 *     tags: [Goals]
 *     summary: Obtener meta por ID
 *     description: Retorna el detalle de una meta financiera.
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
 *         description: Detalle de la meta
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
 *                     goal:
 *                       $ref: '#/components/schemas/Goal'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Meta no encontrada
 *
 *   patch:
 *     tags: [Goals]
 *     summary: Actualizar meta
 *     description: Actualiza parcialmente una meta financiera (nombre, monto actual, estado, etc).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGoalInput'
 *     responses:
 *       200:
 *         description: Meta actualizada
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
 *                     goal:
 *                       $ref: '#/components/schemas/Goal'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Meta no encontrada
 *
 *   delete:
 *     tags: [Goals]
 *     summary: Eliminar meta
 *     description: Elimina una meta financiera del usuario.
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
 *         description: Meta eliminada
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
 *                       example: Goal deleted
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Meta no encontrada
 */
