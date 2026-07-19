# 02 — Arquitectura

Vista de conjunto del sistema y sus contratos. Complementa (no duplica) los ADRs de `18-decisiones-arquitectura/`.

| Documento | Objetivo · contenido | Depende de | Prioridad | Cuándo | Módulos | ¿Obligatorio? |
|---|---|---|---|---|---|---|
| VISION-GENERAL.md | Diagrama C4 nivel 1–2 real (client/server/model/MySQL/Redis-si-Fase-8), flujos principales (auth, análisis, alerta proactiva), y el diagrama corregido que reemplaza al del README (que hoy muestra Redis inexistente y omite el modelo) | Auditoría §5 | Alta | Fase 3 | todos | Sí — es la figura central de la sustentación |
| CONTRATOS-SERVICIOS.md | Contrato server↔model endpoint por endpoint: request/response, timeouts, reintentos, comportamiento degradado; fuente contra la que se validan los tests de contrato (M-08) | INTEGRACION-MODELO.md (04) | Alta | Fase 3 | server, model | Sí |
| DIAGRAMA-DESPLIEGUE.md | Topología de producción (Railway u alternativa), puertos, URLs internas/públicas, secretos | DESPLIEGUE.md (11) | Media | Fase 10 | infra | No (recomendado) |
