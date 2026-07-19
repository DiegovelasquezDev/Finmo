# 07 — Base de datos

Esquema físico, migraciones y operación de datos. Diagnóstico de partida: Auditoría §9.

| Documento | Objetivo · contenido | Depende de | Prioridad | Cuándo | Módulos | ¿Obligatorio? |
|---|---|---|---|---|---|---|
| ESQUEMA.md | ERD generado desde schema.prisma + justificación de índices existentes + convenciones (uuid, Decimal(12,2), soft delete) + destino de budgets/notifications según ADR-004 | ADR-004 (18) | Media | Fase 0 (sección de tablas muertas) y Fase 8 (actualización) | server/prisma | No (recomendado) |
| OPERACION-DATOS.md | Retención y limpieza: purga de tokens expirados (A-03b), retención de ScoreSnapshot y MoodCheckin (B-05), estrategia de backups del proveedor verificada, plan de migraciones en producción y rollback | POLITICAS.md (09) | Alta | Fase 2 (tokens) + Fase 10 (backups/prod) | server, infra | Sí (la parte de tokens y backups) |
| DATOS-SEMILLA.md | Diseño del seed de demo: usuario semilla con 6+ meses de datos realistas **rotulados como demostración**, categorías por clave estable (cierra M-10), datos que disparan cada tipo de alerta para la demo | ALERTAS-PROACTIVAS (13) | Alta | Fase 8–10 | server/prisma | Sí (la demo de sustentación depende de esto) |
