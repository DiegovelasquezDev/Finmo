# 03 — Frontend

Convenciones y decisiones del cliente React. Los hallazgos de origen están en Auditoría §7.

| Documento | Objetivo · contenido | Depende de | Prioridad | Cuándo | Módulos | ¿Obligatorio? |
|---|---|---|---|---|---|---|
| CONVENCIONES.md | Estructura de páginas/componentes (límite de líneas por archivo, criterio de extracción), utilidades compartidas obligatorias (format.js, timeAgo, PASSWORD_RULES — cierra D-07), reglas i18n (cero strings hardcodeadas, locale desde el idioma activo — cierra D-10), naming (un solo idioma) | Auditoría §7 | Alta | Fase 6 (antes del primer refactor de páginas) | client | Sí |
| ESTADO-SERVIDOR.md | Adopción de TanStack Query: claves de caché por recurso, invalidación tras mutaciones, política de revalidación; plan de migración página por página (A-13b) | CONVENCIONES.md | Media | Fase 6 | client | No (recomendado) |
| ACCESIBILIDAD.md | Resultado de auditoría Lighthouse/axe, correcciones aplicadas, checklist para nuevas pantallas (M-05) | — | Media | Fase 10 | client | No (citable en sustentación) |
