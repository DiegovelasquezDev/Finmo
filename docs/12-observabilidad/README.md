# 12 — Observabilidad

Diagnóstico de partida: Auditoría §12 (model con `print`, sin correlación, sin métricas).

| Documento | Objetivo · contenido | Depende de | Prioridad | Cuándo | Módulos | ¿Obligatorio? |
|---|---|---|---|---|---|---|
| DISENO.md | Qué se observa y cómo, dimensionado al alcance: request-id generado en server y propagado al model, logging JSON en FastAPI (niveles, campos), contadores mínimos (inferencias, fallbacks, latencia p95, errores por endpoint), exposición (/metrics simple o logs agregados), uptime externo sobre /health; explícitamente qué NO se monta (Grafana/tracing distribuido) y por qué | Auditoría §12 | Alta | Fase 3, antes de implementar | server, model | **Sí** |
| RUNBOOK-INCIDENTES.md | 1 página: síntomas→causa probable→acción para los 4 incidentes previsibles (modelo caído, MySQL caído, SMTP caído, cold start BERT); incluye el guion del ensayo "matar el modelo en vivo" usado en la sustentación (pregunta 8 del jurado) | DISENO.md | Alta | Fase 3 | — | **Sí** |
| METRICAS-SISTEMA.md | Números operativos citables: latencia p95 por endpoint de análisis, tasa de fallback, uptime del período previo a sustentación | DISENO.md | Media | Fase 10–11 | — | No (pero muy citable) |
