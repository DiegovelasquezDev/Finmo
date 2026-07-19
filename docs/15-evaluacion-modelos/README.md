# 15 — Evaluación de modelos

Responde "establecer métricas de evaluación" del comité. Aquí vive el protocolo y los resultados; los diseños de modelos viven en `05-inteligencia-artificial/`.

| Documento | Objetivo · contenido | Depende de | Prioridad | Cuándo | Módulos | ¿Obligatorio? |
|---|---|---|---|---|---|---|
| PROTOCOLO.md | El contrato experimental: hipótesis por experimento; métricas por tarea (clasificación: F1 macro, precision/recall, matriz de confusión, kappa del dataset; regresión: MAE/MAPE/RMSE **vs baselines naive** con backtesting rolling-origin; clustering: silhouette, Davies-Bouldin, estabilidad ARI, justificación de k); particiones congeladas y semillas; regla de honestidad (los resultados negativos se reportan, no se ocultan); formato estándar de tabla de resultados | DATASETS.md (05) | **Crítica** | Fase 4, antes de todo experimento | model/experiments | **Sí** |
| RESULTADOS.md | Tablas reproducibles por modelo con enlace al experimento versionado en `model/experiments/`: concerns (F1 vs baseline keywords — el experimento "¿por qué ML?"), sentiment (F1 en corpus propio, decisión tomada con datos), archetypes (validación interna + estabilidad), prediction (backtesting vs naive); análisis de errores por modelo; las figuras exportadas para la sustentación (matriz de confusión, curvas) | PROTOCOLO.md, Fase 5 | **Crítica** | Fase 5 (y ampliación en 7 y 9) | model | **Sí** |
| EVALUACION-PRODUCTO.md | Evaluación con usuarios: instrumento SUS (≥10 usuarios piloto), tareas de comprensión de alertas/explicaciones, resultados y hallazgos accionables — cierra el objetivo específico 4 | GUION de pruebas, Fase 6 | **Crítica** | Fase 11 (recolección desde Fase 6) | client | **Sí** |
