# 08 — API

Contrato HTTP real del servidor. Principio: el swagger documenta **lo que existe** (cierra D-17), no lo aspiracional.

| Documento | Objetivo · contenido | Depende de | Prioridad | Cuándo | Módulos | ¿Obligatorio? |
|---|---|---|---|---|---|---|
| CONTRATO.md | Convenciones transversales: envelope de respuesta (success/data/message), formato de error y códigos (tras el fix C-01: 422 con `errors[]` de campo), paginación estándar, Accept-Language, autenticación (cookie httpOnly tras Fase 2), versionado /v1 (M-07) | Fase 0 y 2 | Alta | Fase 2 | server, client | Sí |
| ENDPOINTS.md | Inventario endpoint por endpoint con estado (estable/nuevo/deprecado) y enlace a su .doc.js; auditoría periódica swagger-vs-código | CONTRATO.md | Media | Fase 8 (cuando entran reports/budgets) | server | No (el swagger corregido puede bastar) |
