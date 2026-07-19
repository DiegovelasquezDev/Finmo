# 18 — Decisiones de arquitectura (ADRs)

Formato estándar por ADR: Contexto → Decisión → Alternativas consideradas → Consecuencias → Estado. Un ADR nunca se edita tras aceptarse: se supersede con otro. Las decisiones ya tomadas se documentan retroactivamente (son mérito evaluable hoy invisible — Auditoría §5).

| ADR | Título | Cuándo | ¿Obligatorio? |
|---|---|---|---|
| ADR-001 | Microservicio Python separado para ML (vs todo-en-Node) — la respuesta a la pregunta 15 del jurado | Fase 0 (retroactivo) | **Sí** |
| ADR-002 | Autenticación JWT con rotación de refresh tokens (y su evolución a cookie httpOnly en Fase 2) | Fase 0 (retroactivo) + Fase 2 (supersede parcial) | **Sí** |
| ADR-003 | Monorepo de 3 aplicaciones | Fase 0 (retroactivo) | **Sí** |
| ADR-004 | Destino de dependencias muertas (bullmq/ioredis/multer/node-schedule/pdfkit) y tablas muertas (budgets/notifications): qué se implementa en Fase 8–9 y qué se elimina | Fase 0 | **Sí** |
| ADR-005 | Tecnología del scheduler de alertas proactivas (BullMQ+Redis vs node-schedule in-process) con trade-offs operativos | Fase 8, antes de implementar | **Sí** |
| ADR-006 | Estrategia de modelos por servicio tras la Fase 5 (qué quedó como ML, qué quedó como sistema experto declarado, y por qué) | Fase 5 | **Sí** |
| ADR-007 | Gestión de estado de servidor en el cliente (TanStack Query) y code splitting | Fase 6 | No |
