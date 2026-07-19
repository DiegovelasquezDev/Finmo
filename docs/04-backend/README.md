# 04 — Backend

Convenciones del servidor Express y su integración con el microservicio de IA. Hallazgos de origen: Auditoría §5 y §8.

| Documento | Objetivo · contenido | Depende de | Prioridad | Cuándo | Módulos | ¿Obligatorio? |
|---|---|---|---|---|---|---|
| INTEGRACION-MODELO.md | Contrato de resiliencia por endpoint de análisis: timeout, retries, circuit breaker, **qué ve el usuario en degradación** (caché del último resultado vs fallback de reglas vs estado vacío), límites de payload (`take`), propagación de request-id, manejo de "sin ingreso configurado" (A-09b) | Auditoría §5, PROTOCOLO (15) | **Crítica** | Fase 3, antes de implementar | server, model, client | **Sí** |
| CONVENCIONES-FEATURES.md | Anatomía estándar de una feature (controller/routes/schemas/service), helpers obligatorios (response, paginate), taxonomía AppError, cuándo un service llama a otro (regla: alerts es el único escritor de alertas) | — | Media | Fase 8 (antes de crear reports/budgets, las primeras features nuevas) | server | No (recomendado) |
| JOBS-Y-WORKERS.md | Arquitectura del scheduler de Fase 8: tecnología elegida (ADR-00x), catálogo de jobs, idempotencia, locks, reintentos, observabilidad de jobs | ADR de scheduler (18), ALERTAS-PROACTIVAS (13) | Alta | Fase 8 | server, infra | Sí (si Fase 8 se ejecuta — y es no recortable) |
