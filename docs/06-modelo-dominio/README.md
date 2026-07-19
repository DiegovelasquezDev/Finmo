# 06 — Modelo de dominio

Entidades, invariantes y reglas de negocio independientes de la tecnología. Complementa `07-base-datos/` (que documenta el esquema físico).

| Documento | Objetivo · contenido | Depende de | Prioridad | Cuándo | Módulos | ¿Obligatorio? |
|---|---|---|---|---|---|---|
| ENTIDADES.md | Diccionario del dominio: User/Profile/Transaction/Category/Goal/Alert/Budget/Notification/ScoreSnapshot + MoodCheckin (Fase 7); invariantes por entidad (p.ej. "una alerta del mismo tipo no se repite dentro de su ventana de dedupe", "un snapshot por usuario/día"); glosario ES/EN de términos (arquetipo, gasto hormiga, ratio de carga) | Auditoría §1/§9 | Media | Fase 7 (cuando entra la primera entidad nueva) | server, model | No (recomendado) |
| REGLAS-NEGOCIO.md | Catálogo de reglas hoy dispersas en código: umbrales de salud (30/50/75 con su cita corregida — M-13), definición de gasto hormiga (≥5 tx, <2% ingreso), z-score de gasto inusual, criterios de arquetipo del sistema experto; cada regla con fuente y dueño | MODELOS.md (05) | Media | Fase 5 | model | No (muy citable en sustentación) |
