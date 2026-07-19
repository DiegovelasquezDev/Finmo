# Backlog priorizado — Finmo

Todas las tareas derivadas de la auditoría ([`AUDITORIA-INTEGRAL.md`](../00-auditoria/AUDITORIA-INTEGRAL.md)), clasificadas por prioridad. Cada tarea referencia su hallazgo (A-xx / D-xx / §) y su fase del [plan](FASES.md).

**Esfuerzo:** S (<1 día) · M (1–3 días) · L (0.5–2 semanas) · XL (>2 semanas)

---

## CRÍTICO

| # | Tarea | Origen | Fase | Esfuerzo | Por qué existe / qué resuelve | Impacto |
|---|---|---|---|---|---|---|
| C-01 | Corregir `err.errors`→`err.issues` en error-handler (bug Zod 4 verificado) | A-03 | 0 | S | Toda petición inválida devuelve 500; el pipeline de validación está roto en su salida | **Téc:** API usable; **Usuario:** errores de campo visibles; **Acad:** evita el 500 en demo en vivo |
| C-02 | Neutralizar Reports falso (rotular maqueta u ocultar de demo) hasta implementar el real | A-01/D-03 | 0 | S | Datos fabricados presentados como reales = riesgo de integridad académica en sustentación | **Acad:** elimina el riesgo fatal de la pregunta "¿de dónde salen estos datos?" |
| C-03 | Sincronizar README/env/compose con la realidad (vars faltantes, base `dbname`→`finmo_dev`, quitar Redis del diagrama) | A-06/A-10/D-12/D-13 | 0 | M | El server no arranca siguiendo el README; compose apunta a base inexistente | **Téc:** onboarding reproducible; **Acad:** coherencia documental ante evaluadores |
| C-04 | Decidir por ADR el destino de deps muertas (bullmq/ioredis/multer/node-schedule/pdfkit) y tablas muertas (budgets/notifications) | D-02/D-04 | 0 | S | Deps y esquema fantasma invitan preguntas sin respuesta; BullMQ/pdfkit se justifican si Fase 8 los usa | **Téc:** superficie honesta; **Acad:** cada pieza del repo defendible |
| C-05 | Suite de tests server (auth, analysis mockeado, validación) + pytest model + CI GitHub Actions | A-02 | 1 | XL | Cero pruebas en el monorepo con tooling declarado; sin red, todo lo demás es andamiaje sin verificación | **Téc:** red de seguridad; **Acad:** evidencia de calidad exigible en Ing. de Sistemas |
| C-06 | API key interna + CORS cerrado + gate de /docs en el microservicio FastAPI | A-04 | 2 | M | Modelo abierto al mundo: abuso de cómputo BERT y payloads arbitrarios en cualquier despliegue público | **Téc:** superficie de ataque; **Acad:** pregunta de seguridad respondida |
| C-07 | Refresh token a cookie httpOnly; access en memoria | A-08 | 2 | L | Refresh de 7 días exfiltrable por XSS en app de datos financieros/emocionales | **Téc:** vector principal cerrado; **Usuario:** protección real |
| C-08 | Revocar sesiones en cambio/reset de contraseña y desactivación; detección de reuso de refresh | A-09 | 2 | M | El escenario "me robaron la sesión, cambio la clave" hoy no expulsa al atacante | **Téc/Usuario:** semántica de seguridad correcta |
| C-09 | Dataset Reddit (Zhu) etiquetado con protocolo (guía, doble anotador, kappa) + particiones congeladas | §3.3/§3.7 | 4 | XL | Sin datos reales no hay IA defendible; el corpus está público y citado en la propia propuesta | **Acad:** convierte el clasificador de juguete en contribución evaluable |
| C-10 | Protocolo experimental completo (métricas por tarea, baselines, semillas, formato de reporte) | §3.7 | 4 | M | El comité pidió métricas explícitamente; sin protocolo, cualquier experimento posterior es improvisación | **Acad:** blindaje metodológico de la sustentación |
| C-11 | Re-entrenar concerns con datos reales + umbral→OTHER + F1/matriz de confusión + comparación vs keywords | §3.3 | 5 | L | CV sobre frases propias es inválida; OTHER inalcanzable por la vía ML; la comparación vs keywords responde "¿por qué ML?" | **Acad:** primer modelo genuinamente defendible |
| C-12 | Backtesting rolling-origin de predicción + baselines naive + eliminar R² in-sample de la UI | §3.5 | 5 | L | "Confianza alta" mostrada al usuario con R²=1.0 sobre 2 puntos es indefendible y engañosa | **Acad:** evaluación honesta; **Usuario:** confianza con significado |
| C-13 | Arquetipos: clustering validado (k, silhouette, estabilidad) con mapeo cluster→label persistido, o degradar a sistema experto declarado | §3.4/D-06 | 5 | L | Circularidad sintética + bug de mapeo posicional: usuarios pueden recibir arquetipo equivocado | **Téc:** corrección; **Acad:** honestidad metodológica |
| C-14 | Evaluar sentiment (BERT actual) en corpus financiero ES propio; decidir con datos si se cambia | §3.2 | 5 | L | Modelo de reseñas aplicado a estrés financiero sin una sola medición en dominio | **Acad:** cierra la pregunta 4 del jurado |
| C-15 | Reescribir doc/app.md: metodología detallada, cronograma real, objetivos medibles, APA, sin notas de borrador | A-11/D-16 | 11 | L | Es el documento que el comité lee; hoy contiene "postgress/phyton" y un cronograma vacío | **Acad:** respuesta directa a 3 observaciones del comité |
| C-16 | Alertas proactivas: scheduler/worker + los 8 tipos + deduplicación | A-07/D-05 | 8 | XL | El título promete alertas preventivas; hoy solo hay reactivas bajo demanda y 5 tipos jamás se generan | **Acad:** cumple el objetivo general; **Usuario:** el valor central del producto |

## ALTO

| # | Tarea | Origen | Fase | Esfuerzo | Por qué / qué resuelve | Impacto |
|---|---|---|---|---|---|---|
| A-01b | Retry+circuit breaker+degradación en modelClient; `take` en findMany de análisis | §5 | 3 | L | Modelo caído = página muerta tras 10s; payloads sin cota | **Téc:** resiliencia demostrable en vivo |
| A-02b | Logging estructurado en FastAPI + request-id propagado + contadores (inferencia/fallback/latencia) | §12 | 3 | M | Modelo opaco: imposible diagnosticar o citar métricas operativas | **Téc/Acad:** números de sistema para la sustentación |
| A-03b | Hash de refresh/verification tokens en BD + limpieza programada de expirados | §6.4/D-14 | 2 | M | Dump de BD entrega sesiones vivas; tabla crece sin cota | **Téc:** defensa en profundidad |
| A-04b | Persistir mood check-ins (tabla+endpoint) — hoy se descartan | D-20 | 7 | M | El dato emocional diferencial del proyecto se está tirando a la basura | **Acad:** habilita el diferencial 2; **Usuario:** histórico emocional |
| A-05b | Correlación emoción↔gasto + insight explicado | §3.8.2 | 7 | L | El componente que ninguna app de referencia tiene; sugerido por el comité | **Acad:** EL diferencial; **Usuario:** insight único |
| A-06b | XAI: narrativa de score, "por qué esta alerta", pesos de concerns, importancias de predicción | §3.8.1 | 6 | L | Responde a Gorai & Maurya (XAI) ya citado; score_breakdown ya existe a medio camino | **Acad:** diferencial 1; **Usuario:** confianza |
| A-07b | Reports real (agregados desde BD + export PDF con pdfkit) | A-01 | 8 | L | Reemplaza el mock; pdfkit pasa de dep muerta a justificada | **Usuario:** feature completa; **Acad:** cierra A-01 de raíz |
| A-08b | Budgets end-to-end (la tabla ya existe) + alertas BUDGET_* | D-04 | 8 | L | Prometido en README/propuesta; las alertas de presupuesto necesitan presupuestos | **Usuario:** feature núcleo de finanzas personales |
| A-09b | Manejo explícito de "sin ingreso configurado" (eliminar `monthly_income \|\| 1`) | D-19 | 3 | S | Usuario sin ingreso recibe arquetipo ENDEUDADO y score 0 absurdos | **Usuario:** análisis honesto; **Téc:** caso borde correcto |
| A-10b | Snapshot de score programado (job) en vez de bajo demanda | D-18 | 8 | S | Historial con huecos ⇒ sparkline engañosa | **Usuario:** evolución real |
| A-11b | Registro asíncrono del email de verificación (cola/retry; SMTP caído no bloquea registro) | §8 | 8 | M | Hoy si SMTP falla, nadie se registra | **Téc:** disponibilidad |
| A-12b | Desplegar model en Railway + imagen optimizada (multi-stage, HF horneado, healthcheck, non-root) | A-05 | 10 | L | Producción actual no tiene IA; imagen multi-GB con cold start de minutos | **Téc:** demo pública viable |
| A-13b | Refactor frontend: TanStack Query (estado de servidor) + lazy() por ruta | §7 | 6–8* | L | Sin caché ni revalidación; bundle único con ApexCharts | **Usuario:** velocidad; **Téc:** mantenibilidad (*oportunista, junto a las fases que tocan cada página) |
| A-14b | Evaluación SUS con ≥10 usuarios + tareas de comprensión de alertas | §15 | 11 | L | Objetivo específico 4 ("evaluar usabilidad") sin instrumento hoy | **Acad:** cierra el objetivo 4 con datos |
| A-15b | Consentimiento de datos (Ley 1581) + política de retención documentada | §6.8 | 2 | M | Datos financieros+emocionales sin base legal documentada | **Acad/Legal:** pregunta de jurado cubierta |

## MEDIO

| # | Tarea | Origen | Fase | Esfuerzo | Por qué |
|---|---|---|---|---|---|
| M-01 | Descomponer páginas monolíticas (Analysis 860, Dashboard 716, Settings 619, Goals 618, Transactions 544) | D-09 | 6–8* | L | Testabilidad y mantenibilidad; hacerlo al tocar cada página en su fase (*oportunista) |
| M-02 | Unificar fmtDate/timeAgo/PASSWORD_RULES/ALERT_ICONS en shared (fmtDate sensible a idioma — hoy Goals fija es-CO) | D-07/D-10 | 6* | S | Duplicación + bug i18n visible |
| M-03 | Unificar toModelTransactions (analysis/dashboard) | D-08 | 3 | S | Duplicación de contrato |
| M-04 | Importación CSV/OFX + auto-categorización ML | §3.8.3 | 9 | XL | Diferencial 3 (recortable con ADR si el semestre aprieta) |
| M-05 | Auditoría de accesibilidad (Lighthouse/axe) + correcciones documentadas | §7 | 10 | M | Evidencia a11y citable en sustentación |
| M-06 | Warmup de BERT en lifespan del model | D-15 | 3 | S | Primer request tarda minutos |
| M-07 | Versionar API (/api/v1) | §5 | 8 | S | Barato ahora, caro después |
| M-08 | Tests de contrato server↔model (requests del server validados contra schemas pydantic) | §5 | 1 | M | Drift silencioso entre 3 definiciones del mismo contrato |
| M-09 | Swagger: URL por entorno + retirar lo no implementado + gate en prod | D-17/§6.6 | 2 | S | Documentación API honesta |
| M-10 | Desacoplar categorías genéricas del string del seed (flag `isDefault`/clave estable) | §8 | 8 | S | Renombrar el seed rompe detección silenciosamente |
| M-11 | Frontend Railway con `serve` (no `vite preview`) | A-05 | 10 | S | vite preview no es servidor de producción |
| M-12 | Tabla comparativa vs Fintonic/Mobills/Monefy + pricing en landing + canvas | §4/§16 | 10 | M | Observación "comercialización" del comité |
| M-13 | Corregir/retirar comparación vs umbrales de Zhu en health.py (error de categorías) y citar fuente propia para 30/50/75 | §3.6 | 5 | S | La única "fundamentación" visible es conceptualmente errónea |
| M-14 | UptimeRobot/healthchecks + runbook de incidentes de 1 página | §12 | 3 | S | Saber que se cayó antes que el jurado |

## BAJO

| # | Tarea | Origen | Fase | Esfuerzo | Por qué |
|---|---|---|---|---|---|
| B-01 | Unificar naming ES/EN en componentes (TabCuenta/TabPreferencias) | §7 | oportunista | S | Consistencia |
| B-02 | Strings hardcodeadas a i18n (Analysis.jsx:215) | D-10 | 6 | S | Fuga de i18n visible al cambiar idioma |
| B-03 | Colores hardcodeados en Reports/charts → variables de tema | §7 | 8 | S | Consistencia de tema |
| B-04 | `refreshTokens` verifica usuario activo antes de rotar | §6.5 | 2 | S | Higiene de sesiones |
| B-05 | Retención de ScoreSnapshot decidida por escrito | §9 | 8 | S | Decisión pendiente barata |
| B-06 | CSP para el SPA servido | §6.9 | 10 | S | Defensa en profundidad post-cookies |

---

## Lectura recomendada del backlog

- **Si solo se pudieran hacer 5 cosas:** C-01, C-02, C-05, C-09+C-11 (par indivisible), C-16. Son la diferencia entre "CRUD con adornos" y "proyecto defendible".
- **La cadena académica crítica** es C-09 → C-10 → C-11/C-12/C-13/C-14 → A-06b → A-14b → C-15: datos → protocolo → modelos válidos → explicabilidad → usabilidad medida → propuesta reescrita. Esa cadena responde, en orden, cada observación del comité.
- Las tareas marcadas *oportunistas* no merecen fase propia: se ejecutan cuando su fase anfitriona toque ese archivo.
