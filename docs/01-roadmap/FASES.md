# Plan de implementación por fases — Finmo

**Regla de oro:** cada fase produce primero su documentación (en la carpeta `docs/` indicada) y solo después permite implementación. Ninguna fase inicia sin que la anterior cumpla sus criterios de finalización. Cada fase es independiente y entregable por sí misma.

**Supuestos de planeación:** equipo de 3 estudiantes con dedicación parcial; horizonte de un semestre académico (~16–18 semanas efectivas desde ago-2026). El esfuerzo se expresa en semanas-calendario del equipo completo. Las fases 4–7 (IA) son el corazón académico; las fases 0–3 son el piso técnico que evita que todo lo demás se caiga en la demo.

**Referencia cruzada:** los IDs de hallazgos (A-xx) y deuda (D-xx) provienen de [`docs/00-auditoria/AUDITORIA-INTEGRAL.md`](../00-auditoria/AUDITORIA-INTEGRAL.md).

---

## Fase 0 — Saneamiento y verdad del repositorio

- **Objetivo:** que todo lo que el repo afirma sea cierto; eliminar los riesgos de integridad y los bugs verificados baratos.
- **Descripción:** corregir el bug de validación (D-01), decidir el destino de cada dependencia muerta y tabla muerta (implementar en fase futura ⇒ se documenta; no ⇒ se elimina), corregir README/env/compose, neutralizar Reports (rotular como maqueta y ocultarla del build de demo hasta la Fase 8), escribir los primeros ADRs de decisiones ya tomadas.
- **Documentación requerida (antes de tocar código):** `18-decisiones-arquitectura/ADR-001` (microservicio Python), `ADR-002` (JWT + rotación), `ADR-003` (monorepo 3 apps), `ADR-004` (destino de budgets/notifications/deps muertas); `17-deuda-tecnica/REGISTRO.md` inicializado con la tabla §14 de la auditoría.
- **Módulos:** server (error-handler, package.json), client (Reports, router), raíz (README, compose, railway).
- **Dependencias:** ninguna.
- **Riesgos:** decidir eliminar budgets/notifications y arrepentirse (mitigación: ADR-004 los difiere a Fase 8 en lugar de borrarlos).
- **Criterios de aceptación:** petición inválida devuelve 422 con errores de campo; README reproducible desde cero (server arranca siguiéndolo); compose levanta las 4 piezas; Reports no accesible en demo o rotulada; 4 ADRs escritos.
- **Criterios de finalización:** revisión cruzada de un integrante distinto al autor por cada cambio; auditoría §2 actualizada marcando A-03, A-06, A-10 como resueltos.
- **Esfuerzo:** 1 semana. **Prioridad: CRÍTICA.**

## Fase 1 — Testing y CI

- **Objetivo:** piso de verificación automatizada; nada posterior se construye sin red.
- **Descripción:** infraestructura vitest+supertest (server), pytest (model), tests de los flujos críticos existentes (auth completo con rotación/reuso, analysis con modelo mockeado, services del model con casos borde), GitHub Actions (lint+test+build en las 3 apps).
- **Documentación requerida:** `10-testing/ESTRATEGIA.md` (pirámide, qué se prueba y qué no, convenciones, metas de cobertura por capa).
- **Módulos:** server, model, CI raíz.
- **Dependencias:** Fase 0 (el bug D-01 rompería los tests de validación).
- **Riesgos:** sobre-invertir en cobertura de UI (fuera de meta); tests acoplados a implementación.
- **Criterios de aceptación:** CI verde obligatorio en PRs; cobertura ≥60% en services de server y model; el contrato server↔model tiene al menos 1 test que valida los requests del server contra los schemas pydantic.
- **Criterios de finalización:** badge en README; doc de estrategia refleja lo realmente construido.
- **Esfuerzo:** 2 semanas. **Prioridad: CRÍTICA.**

## Fase 2 — Seguridad

- **Objetivo:** cerrar las brechas A-04, A-08, A-09 y las de §6 de la auditoría.
- **Descripción:** refresh token a cookie httpOnly (access en memoria), revocación de sesiones en cambio/reset de contraseña y desactivación, detección de reuso de refresh (revocar familia), hash de tokens en BD, API key interna server↔model + CORS cerrado en FastAPI, gate de swagger por entorno, limpieza programada de tokens expirados, texto de consentimiento de datos (Ley 1581) en registro.
- **Documentación requerida:** `09-seguridad/MODELO-AMENAZAS.md` (STRIDE ligero sobre los 3 servicios) y `09-seguridad/POLITICAS.md` (sesiones, retención, consentimiento) — escritas antes de implementar.
- **Módulos:** server (auth, users, configs), model (main.py), client (api.js, AuthContext).
- **Dependencias:** Fase 1 (los tests de auth existentes protegen la migración de tokens).
- **Riesgos:** la migración a cookies toca CORS/credentials y puede romper login en despliegue (mitigación: tests E2E del flujo + feature flag).
- **Criterios de aceptación:** XSS simulado no obtiene refresh token; cambio de contraseña mata las demás sesiones (test); modelo rechaza requests sin API key; dump de tabla tokens no contiene tokens utilizables.
- **Criterios de finalización:** threat model actualizado con estado "mitigado" por amenaza.
- **Esfuerzo:** 1.5 semanas. **Prioridad: CRÍTICA.**

## Fase 3 — Resiliencia de integración y observabilidad

- **Objetivo:** que la caída o lentitud del modelo no mate la experiencia, y que todo sea diagnosticable.
- **Descripción:** retry con backoff + circuit breaker en modelClient, degradación documentada por endpoint (último resultado cacheado o fallback de reglas), `take` en los findMany de análisis, request-id propagado server→model, logging estructurado en FastAPI (reemplazar prints), contadores básicos (inferencias, fallbacks, latencia p95) en ambos, healthchecks en compose y Dockerfiles, warmup de BERT al arranque, uptime monitoring externo.
- **Documentación requerida:** `12-observabilidad/DISENO.md` y `04-backend/INTEGRACION-MODELO.md` (contrato de degradación por endpoint: qué ve el usuario cuando el modelo no está).
- **Módulos:** server (configs/model.js, analysis), model (main.py, logging), infra.
- **Dependencias:** Fase 1 (tests de integración con modelo mockeado).
- **Riesgos:** sobredimensionar (Prometheus+Grafana no son necesarios; contadores en logs + /metrics simple bastan).
- **Criterios de aceptación:** matar el contenedor del modelo con la app en uso ⇒ Análisis muestra estado degradado en <2s (no timeout de 10s); cada línea de log del modelo lleva el request-id del server; demo de caída ensayada (es una pregunta de sustentación — §15.8).
- **Criterios de finalización:** runbook de incidentes de 1 página en `12-observabilidad/`.
- **Esfuerzo:** 1.5 semanas. **Prioridad: ALTA.**

## Fase 4 — Datos y metodología experimental de IA

- **Objetivo:** construir los datasets y el protocolo que vuelven evaluable toda la IA. **Fase de documentación y datos; prohibido tocar código de producto.**
- **Descripción:** descargar y preparar el corpus Reddit de Zhu (2022); guía de anotación + etiquetado de 500–1.000 posts por 2 anotadores con kappa de Cohen; corpus de evaluación de sentimiento/emociones financiero en ES (200–500 textos); generador sintético de transacciones/perfiles documentado y justificado (distribuciones ancladas en la encuesta N=131), con separación estricta generación/evaluación; particiones congeladas train/val/test para todo.
- **Documentación requerida (es el entregable):** `05-inteligencia-artificial/DATASETS.md`, `05-inteligencia-artificial/GUIA-ANOTACION.md`, `15-evaluacion-modelos/PROTOCOLO.md` (hipótesis, métricas por tarea, baselines, semillas, formato de reporte).
- **Módulos:** ninguno de producto; carpeta `model/experiments/` nueva para datos y scripts de preparación.
- **Dependencias:** ninguna técnica (paralelizable con Fases 2–3 — la hace quien no esté en seguridad/resiliencia).
- **Riesgos:** el etiquetado es lento (mitigación: lotes de 100 con medición de kappa temprana; si kappa <0.6, refinar la guía antes de seguir); dataset de Zhu con estructura inesperada (mitigación: exploración en la semana 1 de la fase).
- **Criterios de aceptación:** kappa ≥0.6 reportado; particiones congeladas y versionadas; protocolo revisado contra las observaciones del comité (métricas definidas para cada modelo).
- **Criterios de finalización:** el asesor valida el protocolo (es el documento que blinda la sustentación).
- **Esfuerzo:** 2 semanas. **Prioridad: CRÍTICA (académica).**

## Fase 5 — Re-entrenamiento y evaluación válida de modelos

- **Objetivo:** que cada número que el sistema muestra tenga un experimento detrás.
- **Descripción:** (a) **concerns**: re-entrenar con el corpus etiquetado real, añadir umbral de confianza→OTHER, reportar F1 macro + matriz de confusión, comparar contra el fallback de keywords (experimento "¿por qué ML?"); (b) **sentiment**: evaluar el BERT actual en el corpus propio; si F1 es pobre, evaluar BETO fine-tuned o léxico como alternativa — decidir con datos; (c) **arquetipos**: clustering con selección de k (elbow+silhouette), validación interna, estabilidad bootstrap, **mapeo cluster→label persistido en el artefacto** (elimina D-06), y comparación honesta contra el sistema de reglas; (d) **prediction**: backtesting rolling-origin sobre usuarios semilla + sintéticos, MAE/MAPE vs baselines naive (último mes, media móvil 3m), reemplazar el R² in-sample por la métrica de backtesting en la respuesta al usuario; (e) registro de experimentos versionado en `model/experiments/`.
- **Documentación requerida:** `15-evaluacion-modelos/RESULTADOS.md` (tablas reproducibles) y `05-inteligencia-artificial/MODELOS.md` (ficha por modelo: tarea, features, arquitectura, datos, métricas, limitaciones) — la ficha se escribe antes de re-entrenar; los resultados después.
- **Módulos:** model (ml_models, services, schemas si cambia el contrato de confianza).
- **Dependencias:** Fase 4 (datasets y protocolo) y Fase 1 (tests del model).
- **Riesgos:** resultados negativos (p.ej. la regresión no supera al baseline) — **no es fracaso**: se reporta, se explica y se ajusta el producto (mínimo de datos, fallback). El protocolo de Fase 4 debe decirlo explícitamente.
- **Criterios de aceptación:** cada modelo en producción tiene ficha + métricas sobre test set congelado; ningún número mostrado al usuario proviene de una métrica in-sample; matriz de confusión de concerns y curvas de backtesting exportadas para la sustentación.
- **Criterios de finalización:** §3 de la auditoría re-escrita con el nuevo estado (la tabla 3.1 debe quedar obsoleta).
- **Esfuerzo:** 2.5 semanas. **Prioridad: CRÍTICA (académica).**

## Fase 6 — Explicabilidad (XAI) — componente diferencial 1

- **Objetivo:** que cada score, alerta y predicción responda "¿por qué?" en lenguaje del usuario.
- **Descripción:** narrativa del score desde el `score_breakdown` existente (incluida la variación contra el snapshot anterior); "por qué esta alerta" (regla + dato que la disparó, persistido en `Alert.metadata` que ya existe); pesos/odds de la regresión logística de concerns expuestos como "términos que influyeron"; importancias de features (RF) o coeficientes (LR) en predicción; pantalla/panel de explicación en el cliente.
- **Documentación requerida:** `05-inteligencia-artificial/EXPLICABILIDAD.md` (técnica por modelo + principios de redacción de explicaciones) y `13-funcionalidades/EXPLICACIONES.md` (UX).
- **Módulos:** model (services — añadir campos de explicación a las respuestas), server (persistir explicación en alertas), client (UI).
- **Dependencias:** Fase 5 (explicar modelos válidos, no los actuales).
- **Riesgos:** explicaciones técnicamente correctas pero incomprensibles (mitigación: prueba con 3–5 usuarios piloto, medir comprensión — alimenta el SUS de Fase 11).
- **Criterios de aceptación:** toda alerta visible incluye su porqué; el score muestra desglose y causa del cambio; demo de sustentación puede responder "¿por qué me alertó?" señalando la pantalla.
- **Esfuerzo:** 1.5 semanas. **Prioridad: ALTA (diferencial pedido por el comité).**

## Fase 7 — Emociones ↔ finanzas — componente diferencial 2

- **Objetivo:** convertir el check-in emocional en el insight distintivo del proyecto.
- **Descripción:** persistir los mood check-ins (hoy se descartan — D-20): tabla nueva + endpoint; clasificación de emociones específicas del texto (mínimo viable: léxico NRC-ES; plus: BETO fine-tuned del corpus de Fase 4); correlación emoción↔gasto (ventanas de días posteriores al check-in vs línea base del usuario) con umbral mínimo de datos para no reportar espurios; insight en Dashboard/Análisis ("tras check-ins de estrés tu gasto en X sube Y%"); alerta `NEGATIVE_PATTERN` enriquecida con el componente emocional.
- **Documentación requerida:** `05-inteligencia-artificial/EMOCIONES.md` (modelo, corpus, validación, umbrales de reporte) y `06-modelo-dominio/` actualizado (nueva entidad).
- **Módulos:** server (nueva feature + migración), model (servicio de emociones), client (Analysis, Dashboard).
- **Dependencias:** Fases 4–5 (corpus y protocolo); Fase 6 (las correlaciones se muestran explicadas).
- **Riesgos:** pocos check-ins reales para correlaciones (mitigación: usuarios semilla con historial simulado *rotulado como tal* para la demo + el mecanismo real funcionando; el experimento académico se hace sobre datos semilla documentados).
- **Criterios de aceptación:** check-ins persistidos con histórico visible; correlación calculada y explicada solo con datos suficientes; evaluación del clasificador de emociones reportada en `15-evaluacion-modelos/`.
- **Esfuerzo:** 2 semanas. **Prioridad: ALTA (diferencial pedido por el comité).**

## Fase 8 — Alertas proactivas y features prometidas

- **Objetivo:** cumplir la promesa del título ("alertas preventivas automáticas") y eliminar los mocks/esquema muerto.
- **Descripción:** worker con BullMQ+Redis (deps ya declaradas — pasan de muertas a justificadas; ADR si se prefiere node-schedule por simplicidad): job diario de evaluación de umbrales por usuario (LOW_INCOME_RATIO, GOAL_DEADLINE, RECURRING_DUE), evaluación post-transacción (UNUSUAL_EXPENSE, BUDGET_*), GOAL_ACHIEVED en contribuciones; deduplicación por tipo+ventana; snapshot de score programado (elimina D-18); pipeline de Notification por email (la tabla revive); **Reports real**: endpoint de agregados mensuales + export PDF con pdfkit (la página falsa muere — cierra A-01 definitivamente); **Budgets end-to-end** (tabla ya existe): CRUD + UI + conexión con alertas BUDGET_WARNING/EXCEEDED.
- **Documentación requerida:** `13-funcionalidades/ALERTAS-PROACTIVAS.md` (catálogo: disparador, condición, ventana de dedupe, canal por cada uno de los 8 tipos), `13-funcionalidades/REPORTES.md`, `13-funcionalidades/PRESUPUESTOS.md`.
- **Módulos:** server (worker nuevo, alerts, reports feature nueva, budgets feature nueva), client (Reports real, Budgets UI), infra (Redis en compose y despliegue).
- **Dependencias:** Fases 1–3 (tests, seguridad, observabilidad del worker).
- **Riesgos:** Redis añade una pieza operativa (mitigación: ADR comparando con node-schedule in-process; para el alcance, un scheduler in-process con lock simple es defendible si se documenta el trade-off).
- **Criterios de aceptación:** demo: registrar un gasto inusual ⇒ alerta aparece **sin abrir Análisis**; los 8 tipos generables con datos que los disparen; Reports muestra los datos del usuario logueado y exporta PDF; presupuesto excedido alerta.
- **Esfuerzo:** 2.5 semanas. **Prioridad: ALTA.**

## Fase 9 — Importación de datos — componente diferencial 3

- **Objetivo:** reducir la fricción del registro manual (limitación citada en los antecedentes — Manasa et al.) con importación + auto-categorización ML.
- **Descripción:** importación CSV (formato Bancolombia/genérico) y OFX con preview y confirmación; clasificador de categorías entrenado con transacciones categorizadas (features: descripción TF-IDF + monto + día; evaluado con el protocolo de Fase 4); botón "aceptar/corregir" que además genera datos de re-entrenamiento; Belvo sandbox como demo opcional documentada (con el porqué de no ir a producción bancaria real — argumento de alcance para la sustentación).
- **Documentación requerida:** `13-funcionalidades/IMPORTACION.md` + ficha del modelo de categorización en `05-inteligencia-artificial/MODELOS.md`.
- **Módulos:** server (import feature, multer revive justificado), model (servicio de categorización), client (flujo de import).
- **Dependencias:** Fase 5 (protocolo de evaluación) y Fase 1.
- **Riesgos:** zoo de formatos CSV bancarios (mitigación: 1 formato real + 1 genérico documentado; no prometer universalidad).
- **Criterios de aceptación:** importar un CSV real de 100+ movimientos con ≥80% de categorización correcta medida; corrección manual fluida.
- **Esfuerzo:** 1.5 semanas. **Prioridad: MEDIA (recortable si el semestre aprieta — decisión explícita con el asesor).**

## Fase 10 — Despliegue productivo y comercialización

- **Objetivo:** demo pública estable y respuesta a "fortalecer la comercialización".
- **Descripción:** Railway con el servicio model incluido (imagen optimizada multi-stage, modelo HF horneado, healthcheck) o alternativa documentada; frontend con `serve` (no `vite preview`); seed de demo curado (usuario semilla con 6+ meses de datos realistas *rotulados como datos de demostración*); monitoreo de uptime; sección de pricing en la landing; documento de negocio: canvas, análisis de competidores (la tabla de §4 de la auditoría), costos reales de infraestructura medidos, modelo freemium propuesto.
- **Documentación requerida:** `11-devops/DESPLIEGUE.md` (runbook completo), `16-innovacion/COMERCIALIZACION.md`, `16-innovacion/COMPARATIVA-MERCADO.md`.
- **Módulos:** infra, landing.
- **Dependencias:** Fases 2–3 (no publicar el modelo sin auth ni observabilidad).
- **Criterios de aceptación:** URL pública funcional con los 3 servicios; uptime ≥99% en las 2 semanas previas a la sustentación; costos mensuales documentados con cifras reales.
- **Esfuerzo:** 1.5 semanas. **Prioridad: ALTA.**

## Fase 11 — Paquete académico y sustentación

- **Objetivo:** que la propuesta y la defensa reflejen el proyecto real y anticipen al jurado.
- **Descripción:** reescritura de `doc/app.md`: metodología detallada (Scrum operativo con evidencia de sprints + metodología experimental de IA), cronograma real (planeado vs ejecutado), objetivos específicos con criterios medibles, referencias en APA, eliminación de notas de borrador; evaluación de usabilidad SUS con ≥10 usuarios piloto + tareas de comprensión de alertas (cierra el objetivo específico 4); documento de resultados experimentales consolidado; guion de demo con ruta segura ensayada (incluye el ensayo de caída del modelo); banco de preguntas/respuestas construido desde §15 de la auditoría; slides.
- **Documentación requerida (es el entregable):** `14-metodologia/METODOLOGIA.md`, `14-metodologia/CRONOGRAMA.md`, `19-sustentacion/GUION-DEMO.md`, `19-sustentacion/BANCO-PREGUNTAS.md`, `19-sustentacion/RESULTADOS.md`.
- **Dependencias:** todas las fases que se hayan completado (el paquete reporta lo real; si la Fase 9 se recortó, se reporta el recorte con su justificación — honestidad ante el comité).
- **Criterios de aceptación:** simulacro de sustentación con el asesor usando el banco de preguntas; ninguna pregunta de §15 de la auditoría queda sin respuesta preparada.
- **Esfuerzo:** 1.5 semanas (con recolección de SUS iniciada 3 semanas antes). **Prioridad: CRÍTICA (académica).**

---

## Resumen de secuencia y paralelismo

| Semana | Track técnico | Track académico/datos |
|---|---|---|
| 1 | Fase 0 | — |
| 2–3 | Fase 1 | Fase 4 arranca (exploración dataset Zhu, guía de anotación) |
| 4–5 | Fase 2 | Fase 4 (etiquetado) |
| 6–7 | Fase 3 | Fase 4 cierra / Fase 5 arranca |
| 8–9 | Fase 5 (código de modelos) | Fase 5 (experimentos) |
| 10–11 | Fase 6 | SUS piloto temprano con XAI |
| 12–13 | Fase 7 | — |
| 14–15 | Fase 8 | Fase 11 arranca (metodología, cronograma) |
| 16 | Fase 9 (si hay margen) o refuerzo | Fase 11 |
| 17–18 | Fase 10 | Fase 11 cierra (simulacro) |

**Decisiones de recorte preautorizadas** (si el semestre aprieta, en este orden): Fase 9 completa → Belvo sandbox → BETO fine-tuned (queda léxico NRC) → Budgets UI (queda API). Lo **no recortable**: Fases 0–5, 8 (alertas proactivas) y 11 — son la respuesta directa al comité.
