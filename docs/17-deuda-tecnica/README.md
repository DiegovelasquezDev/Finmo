# 17 — Deuda técnica

Registro vivo. Se inicializa desde la tabla §14 de la auditoría (D-01…D-20) y se mantiene: toda deuda nueva entra aquí con severidad; toda deuda pagada se marca con la fase/commit que la cerró (no se borra — el histórico es evidencia de proceso para la sustentación).

| Documento | Objetivo · contenido | Depende de | Prioridad | Cuándo | ¿Obligatorio? |
|---|---|---|---|---|---|
| REGISTRO.md | Tabla viva: ID, descripción, evidencia (archivo:línea), severidad, fase que la paga, estado, fecha de cierre. Regla: ningún ítem Crítico/Alto abierto al llegar a Fase 11 | AUDITORIA §14 | **Crítica** | Fase 0 (inicialización) + mantenimiento continuo | **Sí** |
| POLITICA-DEUDA.md | Cuándo se acepta deuda nueva (con registro obligatorio), quién la aprueba, presupuesto de pago por fase (~20% del esfuerzo) | REGISTRO.md | Baja | Fase 1 | No |
