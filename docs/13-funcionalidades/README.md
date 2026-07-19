# 13 — Funcionalidades

Especificación funcional de las features nuevas o reconstruidas. Cada spec se escribe y revisa antes de su implementación (regla doc-first).

| Documento | Objetivo · contenido | Depende de | Prioridad | Cuándo | Módulos | ¿Obligatorio? |
|---|---|---|---|---|---|---|
| ALERTAS-PROACTIVAS.md | Catálogo de los 8 tipos de alerta: disparador (job diario / post-transacción / evento), condición exacta con sus umbrales y fuente, ventana de deduplicación, canal (in-app/email), texto ES/EN, explicación XAI adjunta; arquitectura del worker (referencia a JOBS-Y-WORKERS de 04) | Fases 1–3; ADR scheduler (18) | **Crítica** | Fase 8, antes de implementar | server, client, infra | **Sí** (cierra A-07/D-05) |
| REPORTES.md | Spec de la página real que reemplaza el mock (A-01): agregados mensuales desde transacciones, desgloses, comparativa mes anterior, export PDF (pdfkit), estados vacíos | Fase 8 | Alta | Fase 8 | server (feature nueva), client | **Sí** |
| PRESUPUESTOS.md | Spec de budgets end-to-end sobre la tabla existente: CRUD, períodos, cálculo de consumo, conexión con alertas BUDGET_WARNING/EXCEEDED, UI | ALERTAS-PROACTIVAS.md | Alta | Fase 8 | server, client | **Sí** (o se elimina la tabla por ADR-004) |
| EXPLICACIONES.md | UX de la explicabilidad: dónde y cómo se muestra cada "por qué" (score, alerta, predicción, concern), tono y redacción, ejemplos ES/EN | EXPLICABILIDAD (05) | Alta | Fase 6 | client | **Sí** (diferencial 1) |
| IMPORTACION.md | Spec de importación CSV/OFX: formatos soportados (1 real + 1 genérico), flujo preview→confirmación, auto-categorización con corrección manual, manejo de duplicados | Fase 5 (protocolo del modelo de categorización) | Media | Fase 9 | server, model, client | No (recortable por ADR) |
| CHECKIN-EMOCIONAL.md | Spec de persistencia e histórico del mood check-in (cierra D-20): entidad, frecuencia, UI del histórico, privacidad del dato emocional | EMOCIONES (05), POLITICAS (09) | Alta | Fase 7 | server, client | **Sí** (diferencial 2) |
