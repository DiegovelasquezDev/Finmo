# 09 — Seguridad

Diagnóstico de partida: Auditoría §6 (brechas A-04, A-08, A-09, D-14). Los documentos se escriben **antes** de implementar la Fase 2.

| Documento | Objetivo · contenido | Depende de | Prioridad | Cuándo | Módulos | ¿Obligatorio? |
|---|---|---|---|---|---|---|
| MODELO-AMENAZAS.md | STRIDE ligero sobre los 3 servicios: actores, activos (tokens, datos financieros, datos emocionales), amenazas por superficie (SPA, API, modelo, BD, email), mitigación y estado por amenaza. Se actualiza al cerrar Fase 2 con estado "mitigado/aceptado" | Auditoría §6 | **Crítica** | Fase 2, antes de implementar | todos | **Sí** |
| POLITICAS.md | Política de sesiones (duración, rotación, reuso ⇒ revocación de familia, revocación en cambio de clave), almacenamiento de tokens (cookie httpOnly + hash en BD), retención y anonimización de datos personales (Ley 1581/2012 — texto de consentimiento incluido), manejo de secretos por entorno | MODELO-AMENAZAS.md | **Crítica** | Fase 2 | server, client | **Sí** |
| CHECKLIST-DESPLIEGUE-SEGURO.md | Verificación pre-release: swagger gate, CORS, headers/CSP, API key del modelo, secretos no commiteados, rate limits | POLITICAS.md | Media | Fase 10 | infra | No (recomendado) |
