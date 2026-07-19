# Auditoría Integral — Finmo

**Fecha:** 2026-07-18
**Perspectivas aplicadas:** comité evaluador de proyecto de grado · arquitecto de software senior · tech lead · investigador en IA · desarrollador senior SaaS
**Método:** grafo de conocimiento del repositorio (804 nodos, 1.351 aristas, 66 comunidades vía graphify) + lectura directa del código fuente de las tres capas + verificación ejecutable de hipótesis (los bugs reportados como "verificados" fueron reproducidos, no inferidos).
**Alcance:** monorepo completo — `client/` (React 19 + Vite), `server/` (Express 5 + Prisma/MySQL), `model/` (FastAPI + scikit-learn/transformers), infraestructura (Docker, Railway), documentación técnica y propuesta académica (`doc/app.md`).

Este documento es la **fuente de verdad** del estado real del proyecto. Ninguna implementación futura debe contradecirlo sin actualizar primero este documento y los ADRs correspondientes.

---

## 0. Veredicto ejecutivo

Finmo es hoy un **CRUD full-stack bien construido con una capa de heurísticas financieras presentada como IA**. La arquitectura de tres niveles es correcta y la calidad estructural del código está por encima del promedio de un proyecto de grado (features modulares, validación centralizada, i18n bilingüe en dos capas, rotación de refresh tokens). Ese es el activo.

El pasivo es exactamente el que señaló el comité, y es más profundo de lo que el comité pudo ver desde la propuesta:

1. **No existe aprendizaje real.** De los 7 servicios "de IA", 4 son reglas/estadística determinista, y los 3 que usan modelos tienen fallas metodológicas que un jurado con formación en ML desmonta en minutos: entrenamiento con datos sintéticos generados por las mismas reglas que el modelo "descubre", validación cruzada sobre las frases de entrenamiento inventadas por los autores, y un R² in-sample mostrado al usuario como "confianza" (con 2 meses de datos da 1.0 por construcción).
2. **La promesa central del proyecto no está implementada.** El título dice "alertas preventivas automáticas"; el sistema solo genera alertas cuando el usuario abre la página de análisis (reactivas, bajo demanda). No hay ningún job, scheduler ni worker.
3. **Hay datos falsos presentados como reales** (página de Reportes completa) y **funcionalidades prometidas en README/propuesta que no existen** (presupuestos, notificaciones, Redis/BullMQ).
4. **Cero pruebas automatizadas** en las tres capas, con la infraestructura de testing declarada e instalada.
5. **La propuesta académica está incompleta** en exactamente los puntos que el comité pidió: cronograma vacío, metodología con notas de borrador, sin métricas, sin definición de modelos.

**Nada de esto es irrecuperable.** El proyecto tiene la infraestructura correcta para convertirse en sobresaliente: existe el microservicio, existe el pipeline de entrenamiento, existe una encuesta propia (N=131), y el dataset del antecedente principal (Zhu 2022, Reddit) es público y está citado en la propia propuesta. El plan de fases (`docs/01-roadmap/FASES.md`) convierte cada hallazgo de esta auditoría en trabajo ordenado.

### Calificación por dimensión (1–5)

| Dimensión | Nota | Justificación breve |
|---|---|---|
| Arquitectura | 3.5 | Separación correcta de 3 niveles; integración server↔model frágil y sin resiliencia |
| Calidad de código backend | 4.0 | Capas consistentes, validación, helpers; 1 bug verificado en manejo de errores |
| Calidad de código frontend | 2.5 | Funcional pero monolítico (páginas de 600–860 líneas), duplicación, sin caché ni code splitting |
| Inteligencia artificial | 1.5 | Infraestructura ML real, aprendizaje real inexistente, evaluación inválida |
| Seguridad | 2.5 | Buenas bases (rotación, bcrypt, rate limit) anuladas por tokens en localStorage y modelo sin auth |
| Testing | 0.5 | Cero pruebas; tooling declarado sin uso |
| Observabilidad | 2.0 | pino estructurado en server; nada en model; sin métricas ni trazas |
| Base de datos | 3.5 | Esquema bien diseñado e indexado; 2 tablas muertas; sin mantenimiento de datos |
| DevOps/Despliegue | 1.5 | compose roto tal como está commiteado; Railway no despliega el modelo |
| Documentación técnica | 2.5 | README extenso pero desactualizado y con drift contra el código; model/README bueno |
| Propuesta académica | 1.5 | Antecedentes sólidos; metodología, cronograma y evaluación incompletos |
| Innovación | 2.0 | Integración correcta de ideas conocidas; sin componente diferencial demostrable aún |

---

## 1. Estado funcional por módulo

Convención: ✅ terminado · 🟡 parcial · 🔴 mock/ausente · ⚫ muerto (existe en esquema/deps sin implementación)

### 1.1 Backend (server/)

| Módulo | Estado | Qué falta / problemas | Estado final esperado |
|---|---|---|---|
| Auth | 🟡 | Rotación de refresh OK; **falta**: revocar sesiones al cambiar/resetear contraseña, detección de reuso de refresh token, reenvío de email de verificación, revocación al desactivar cuenta. `register` falla completo si SMTP falla (acoplamiento a disponibilidad del correo) | Sesiones revocables, reuso detectado, email desacoplado (cola) |
| Users | 🟡 | CRUD de perfil OK; `deleteAccount` es soft-delete pero no revoca refresh tokens ni anonimiza PII (Ley 1581 de habeas data aplica a datos financieros) | Borrado con revocación + política de retención documentada |
| Onboarding | ✅ | Completo (4 pasos + skip + estado). Único riesgo: usuarios que saltan onboarding quedan con `monthlyIncome` nulo y rompen la calidad de todos los análisis (ver hallazgo A-18) | Igual + manejo explícito de ingreso ausente |
| Transactions | ✅ | CRUD + paginación + filtros OK. Falta importación masiva (CSV) y no hay tope `take` cuando análisis las consume | Igual + import + límites |
| Categories | ✅ | CRUD OK, categorías globales + personalizadas | Sin cambios mayores |
| Goals | 🟡 | CRUD OK; **nunca** genera alertas `GOAL_ACHIEVED`/`GOAL_DEADLINE` aunque el enum y el swagger las prometen | Alertas de metas reales (job diario) |
| Alerts | 🟡 | Listado/lectura OK. **Solo 3 de 8 tipos** se generan; creación exclusivamente reactiva (dentro de llamadas de análisis); **sin deduplicación** — cada visita a Análisis puede crear la misma alerta otra vez | Motor proactivo (scheduler), 8 tipos, dedupe por tipo+ventana |
| Dashboard | ✅ | Resumen y tendencia mensual reales desde BD | Sin cambios mayores |
| Analysis | 🟡 | Orquesta bien las 7 llamadas al modelo; problemas: `monthly_income \|\| 1` (análisis absurdo si no hay ingreso), categorías genéricas acopladas por string en español, snapshot de score solo cuando el usuario abre la página (historial con huecos), sin caché de resultados | Ingreso ausente manejado, snapshot programado, caché corto |
| Budgets | ⚫ | Tabla `budgets` completa en Prisma con enum `Period` y constraint único; **cero** código de feature, cero rutas, cero UI. README la anuncia como funcionalidad | Implementar end-to-end o eliminar del esquema y README |
| Notifications | ⚫ | Tabla `notifications` con canales/estados/scheduling diseñados; **cero** implementación. README la anuncia | Pipeline real (job + email) o eliminación |
| Reports (server) | 🔴 | **No existe** ninguna feature de reportes en el servidor; `pdfkit` instalado sin un solo uso | Endpoint de reporte mensual real + export PDF |

### 1.2 Microservicio de IA (model/)

| Servicio | Estado | Problemas | Estado final esperado |
|---|---|---|---|
| sentiment | 🟡 | Funciona; modelo de dominio ajeno sin evaluación (ver §3.2) | Evaluado en corpus financiero ES; idealmente emociones específicas |
| concerns | 🟡 | Funciona; entrenamiento inválido (ver §3.3) | Re-entrenado con datos reales de Reddit + clase OTHER + F1 reportado |
| profile | 🟡 | Score útil pero determinista; KMeans con bug de mapeo (ver §3.4) | Clustering validado con mapeo persistido, o sistema experto honesto |
| prediction | 🟡 | Funciona; evaluación inválida (ver §3.5) | Backtesting + baselines + confianza honesta |
| health | 🟡 | Funciona; umbrales de Zhu mal aplicados conceptualmente (ver §3.6) | Umbrales propios justificados; comparación con Zhu corregida o retirada |
| patterns | ✅ | Estadística descriptiva correcta; z-score global mejorable (por categoría, MAD) | Igual + robustez estadística |
| purchase | ✅ | Matemática financiera correcta (amortización) | Sin cambios; reclasificar como "herramienta", no IA |
| **Transversal** | 🔴 | **Sin autenticación, CORS `*`, /docs público** ([main.py:39-44](../../model/main.py)); sin logging estructurado; sin tests; BERT se descarga en el primer request (cold start de minutos) | API key interna, CORS cerrado, logging, warmup |

### 1.3 Frontend (client/)

| Módulo | Estado | Problemas | Estado final esperado |
|---|---|---|---|
| Landing | ✅ | Completa y bien ejecutada (secciones, i18n, tema) | Añadir pricing (comercialización) |
| Auth (páginas) | ✅ | Flujo completo; `PASSWORD_RULES` duplicado en 2 páginas | Regla compartida |
| Onboarding | ✅ | 4 pasos completos con UI dedicada | Sin cambios |
| Dashboard | ✅ | Datos reales; 716 líneas en un archivo, `fmtDate` local | Descomposición en componentes |
| Transactions | ✅ | CRUD completo con modales; 544 líneas, `fmtDate` local | Descomposición |
| Goals | ✅ | CRUD + contribuciones; `fmtDate` local hardcodea locale `es-CO` ignorando el idioma activo ([Goals.jsx:9](../../client/src/app/pages/Goals.jsx)) | Helper compartido sensible a i18n |
| Analysis | 🟡 | 860 líneas; consume los 7 endpoints reales; string hardcodeada en español fuera de i18n ("Crear meta:", [Analysis.jsx:215](../../client/src/app/pages/Analysis.jsx)); mood check-in **no se persiste** (se pierde el histórico emocional — justo el dato diferencial del proyecto) | Persistir check-ins; descomponer; i18n completo |
| **Reports** | 🔴 | **100% datos inventados** (`MONTHLY_DATA` hardcodeado con meses Feb–Abr 2026, [Reports.jsx:7-57](../../client/src/app/pages/Reports.jsx)); botón "Exportar" **sin handler** ([Reports.jsx:124](../../client/src/app/pages/Reports.jsx)). Riesgo de integridad académica si un jurado la abre en vivo | Página real alimentada por transacciones + export PDF |
| Alerts | ✅ | Listado real con estados; `timeAgo`/`ALERT_ICONS` duplicados con AppTopbar | Utilidades compartidas |
| Settings | ✅ | 3 tabs completos (cuenta, perfil financiero, preferencias); 619 líneas | Descomposición |
| Help | ✅ | FAQ con i18n | Sin cambios |
| Infraestructura UI | 🟡 | Sin code splitting (cero `lazy()` en el router — todo el bundle junto, ApexCharts incluido); sin librería de estado de servidor (fetch manual por página, sin caché ni revalidación); accesibilidad no evidenciada (sin auditoría aria/contraste) | Lazy por ruta, TanStack Query o equivalente, auditoría a11y |

---

## 2. Hallazgos críticos verificados

Cada hallazgo tiene evidencia en archivo:línea. Los marcados **[REPRODUCIDO]** fueron ejecutados/verificados durante la auditoría, no inferidos.

### A-01 · Página de Reportes con datos fabricados — riesgo de integridad académica
[Reports.jsx:7-57](../../client/src/app/pages/Reports.jsx) define `MONTHLY_DATA` con tres meses inventados (ingresos, gastos, desgloses y tendencias ficticias). El selector de mes navega datos falsos y el botón "Exportar" ([línea 124](../../client/src/app/pages/Reports.jsx)) no tiene `onClick`. **Por qué es crítico:** en una sustentación, mostrar datos que no provienen del sistema, sin rotularlos como maqueta, puede interpretarse como falseamiento de resultados. Es el hallazgo con mayor riesgo reputacional del proyecto y el más barato de neutralizar (implementar la página real o rotularla "vista de diseño" y sacarla del build de demo).

### A-02 · Cero pruebas automatizadas en todo el monorepo
No existe un solo archivo de test en `server/`, `client/` ni `model/` (verificado sobre los 174 archivos del corpus). `vitest` y `supertest` están declarados en [server/package.json:33-34](../../server/package.json) y el script `npm test` existe — apuntando a nada. `model/requirements.txt` ni siquiera incluye pytest. **Impacto académico:** el objetivo específico 4 de la propuesta ("Evaluar la utilidad del software") es indefendible sin ninguna evidencia de verificación. **Impacto técnico:** cada fase futura del roadmap se construiría sobre terreno no verificable.

### A-03 · **[REPRODUCIDO]** Toda petición inválida devuelve 500 en lugar de 422
[error-handler.js:10](../../server/src/middlewares/error-handler.js) hace `err.errors.map(...)` sobre un `ZodError`. Con el Zod instalado (4.3.6), `ZodError.errors` **no existe** (fue eliminado en v4; la propiedad es `.issues`). Verificación ejecutada contra `server/node_modules`:

```
typeof .errors: undefined
errors.map THROWS: TypeError: Cannot read properties of undefined (reading 'map')
```

Consecuencia: [validate.js:8](../../server/src/middlewares/validate.js) pasa el ZodError crudo al handler, el handler lanza TypeError, y Express responde 500 genérico. El cliente jamás recibe los errores de campo que el código intenta construir. Todo el pipeline de validación — una de las fortalezas aparentes del backend — está roto en su salida.

### A-04 · Microservicio de IA sin autenticación y abierto a cualquier origen
[main.py:39-44](../../model/main.py): `allow_origins=["*"]`, sin API key, sin rate limit, `/docs` y `/redoc` públicos. [model.js](../../server/src/configs/model.js) no envía ninguna credencial. En cualquier despliegue con URL pública, terceros pueden consumir BERT gratis (costo/DoS) y enviar payloads arbitrarios. La red interna de Docker no mitiga esto en Railway, donde cada servicio recibe URL pública por defecto.

### A-05 · La configuración de despliegue no incluye el microservicio de IA
[railway.json](../../railway.json) define solo `backend` y `frontend`. Sin el servicio `model`, **los 7 endpoints de análisis fallan en producción** (timeout de 10s y error 500). Adicionalmente el `startCommand` del frontend es `npm run preview` — vite preview no es un servidor de producción (el propio `package.json` del cliente tiene un script `start` con `serve` que sería el correcto).

### A-06 · docker-compose roto tal como está commiteado
[docker-compose.yml:13](../../docker-compose.yml) fija `DATABASE_URL=mysql://user:password@db:3306/dbname` pero MySQL crea la base `finmo_dev` ([línea 28](../../docker-compose.yml)). El environment inline pisa al env_file en compose, así que el backend apunta a una base inexistente. Sin healthchecks ni `depends_on: condition:`, el backend además corre `migrate deploy` en el arranque contra un MySQL que puede no estar listo.

### A-07 · Alertas "preventivas" que no previenen nada
El título del proyecto promete "generación de alertas preventivas". La realidad: `createAlert` se invoca únicamente desde [analysis.service.js](../../server/src/features/analysis/service/analysis.service.js) (líneas 31, 68, 135), es decir, **solo cuando el usuario abre la página de Análisis**. No existe scheduler, worker ni cron (cero usos de `bullmq`/`node-schedule`/`ioredis` en `server/src` — verificado por búsqueda exhaustiva). 5 de los 8 tipos de alerta del enum (`UNUSUAL_EXPENSE`, `GOAL_ACHIEVED`, `GOAL_DEADLINE`, `RECURRING_DUE`, `LOW_INCOME_RATIO`) no se generan jamás — solo existen en el swagger. Y las que sí se generan no se deduplican: tres visitas a Análisis con carga elevada = tres alertas idénticas.

### A-08 · Tokens de sesión en localStorage
[api.js:18-19](../../client/src/shared/lib/api.js) y [AuthContext.jsx:45-47](../../client/src/shared/context/AuthContext.jsx) guardan access token, **refresh token (7 días)** y el objeto de usuario completo en localStorage — legible por cualquier XSS. Para una aplicación cuyo dominio son datos financieros y emocionales, es el vector de mayor severidad. El servidor ya tiene `cookie-parser` montado ([app.js:27](../../server/app.js)) sin usarlo para esto; la mitigación estándar (refresh en cookie httpOnly + access en memoria) está a mitad de camino de estar disponible.

### A-09 · Sesiones inmortales tras cambio de contraseña
[users.service.js:34-43](../../server/src/features/users/service/users.service.js) (`changePassword`) y [auth.service.js:170-181](../../server/src/features/auth/service/auth.service.js) (`resetPassword`) no revocan los refresh tokens existentes. Un atacante con sesión robada sobrevive al cambio de contraseña de la víctima — exactamente el escenario en el que la víctima intenta expulsarlo. Tampoco hay detección de reuso de refresh token rotado (el estándar es: token usado dos veces ⇒ revocar toda la familia).

### A-10 · README y propuesta prometen infraestructura y features inexistentes
El [README](../../README.md) presenta diagrama de arquitectura con Redis+BullMQ (líneas 78-93), tech stack con "Redis + BullMQ — Colas de trabajo y caché", y las features "Presupuestos" y "Notificaciones". Nada de eso existe. Cinco dependencias de producción están muertas: `bullmq`, `ioredis`, `multer`, `node-schedule`, `pdfkit` (cero imports en `server/`). Además el README documenta variables que el código no lee (`CLIENT_URL`, `MAIL_FROM`) y omite dos obligatorias ([env.js](../../server/src/configs/env.js) exige `JWT_REFRESH_SECRET` min 32 chars, y `MODEL_URL`): **siguiendo el README, el servidor no arranca**. Para un evaluador, README ≠ código es evidencia de descontrol documental; para un desarrollador nuevo, es una tarde perdida.

### A-11 · Propuesta académica incompleta en los puntos exactos del comité
[doc/app.md](../../doc/app.md): el cronograma (§7) tiene una sola X y las metas 3–7 vacías; la metodología (§5) contiene notas de borrador sin depurar — líneas 441-442: *"base de datos: postgress, backend: phyton e investigar que framework"* — que contradicen el stack real y contienen erratas; las referencias (§6) conservan el texto de instrucciones de la plantilla y una lista de URLs crudas sin formato APA; los objetivos específicos no mencionan IA, modelos, ni métricas de éxito medibles; el "compromiso" final es una plantilla sin diligenciar. La propuesta ni siquiera refleja que el microservicio ya existe (el README lo lista como "planeado").

---

## 3. Análisis de Inteligencia Artificial

Esta sección responde la pregunta central: **¿existe IA real o solo reglas de negocio?**

### 3.1 Inventario honesto

| Servicio | Técnica real | ¿Aprende de datos? | Datos de entrenamiento | Evaluación actual |
|---|---|---|---|---|
| sentiment | BERT multilingüe preentrenado (nlptown, clasificación de reseñas 1–5 estrellas) | No (transfer sin fine-tuning) | Reseñas de productos (dominio ajeno) | **Ninguna** en dominio financiero |
| concerns | TF-IDF + Regresión Logística | Sí, de 145 frases | Frases inventadas por los autores | CV 3-fold **sobre esas mismas frases** |
| profile (arquetipo) | KMeans(5) | Sí, de 1.000 muestras | Sintéticas: uniformes generadas por reglas | Ninguna (solo inercia impresa) |
| profile (score) | Rúbrica if/elif determinista | No | — | — |
| prediction | LinearRegression / RandomForest ajustados por request | Sí, de 2–6 puntos | Agregados mensuales del propio usuario | R² **in-sample** |
| health | Umbrales fijos 30/50/75 | No | — | — |
| patterns | Estadística descriptiva + z-score | No | — | — |
| purchase | Fórmula de amortización | No | — | — |

**Respuesta directa:** existe *infraestructura* de ML real (microservicio dedicado, pipeline de entrenamiento, artefactos versionados, lazy loading de modelos) — eso es mérito. Pero no existe *aprendizaje* real: ningún modelo ha aprendido nada de datos del mundo, y ninguno ha sido evaluado de forma metodológicamente válida. En su estado actual, el componente de IA **automatiza reglas tradicionales con vocabulario de ML**, que es literalmente la observación del comité ("básica").

### 3.2 sentiment — modelo prestado de otro dominio, sin evaluación

[sentiment.py](../../model/app/services/sentiment.py) usa `nlptown/bert-base-multilingual-uncased-sentiment`, entrenado para predecir **estrellas de reseñas de productos**. Se le da texto sobre angustia financiera ("me siento ahogado por mis deudas") y se mapean estrellas→estrés con un umbral arbitrario (≤0.35). Usar un modelo preentrenado es legítimo y práctico; usarlo **sin medir su desempeño en el dominio objetivo** no lo es. No hay un solo dato de qué tan bien discrimina estrés financiero en español colombiano. Además el parámetro `lang` que recibe se ignora (el modelo es multilingüe), y la primera petición descarga ~600 MB (cold start de minutos en producción).

**Qué exige el nivel académico:** corpus de evaluación propio (200–500 textos financieros en español etiquetados con protocolo de doble anotador + kappa de Cohen), F1 macro reportado, análisis de errores, y comparación contra al menos un baseline (léxico tipo VADER-es, que el equipo ya usó en finmomodelia — la comparación BERT vs VADER es un experimento natural que ya tienen a medio camino).

### 3.3 concerns — el problema circular

[train_concerns.py:21-181](../../model/app/ml_models/train_concerns.py): el "dataset" son ~145 frases **escritas a mano por los autores** para representar cada categoría. La validación cruzada ([línea 209](../../model/app/ml_models/train_concerns.py)) se calcula sobre esas mismas frases: mide qué tan bien el modelo memoriza el estilo de redacción de los autores, no su capacidad de clasificar texto real de usuarios. Es un ejercicio de separabilidad de un dataset de juguete, y cualquier accuracy que imprima es información vacía.

Defecto funcional adicional: el clasificador se entrenó con 6 clases, pero el contrato del servicio incluye `OTHER` ([concerns.py:24](../../model/app/services/concerns.py)). Por la vía ML, **`OTHER` es inalcanzable**: un softmax siempre reparte el 100% entre las 6 clases financieras, así que "me gusta el fútbol" será clasificado como preocupación financiera con confianza aparente. (La vía fallback por keywords sí devuelve OTHER — el sistema es inconsistente consigo mismo según qué artefactos existan en disco.) Falta un umbral de confianza mínima que derive a OTHER.

**La ironía aprovechable:** la propuesta cita a Zhu (2022), cuyo dataset de posts de Reddit es **público** (el repositorio de GitHub está citado en [doc/app.md:480](../../doc/app.md)). El proyecto tiene a un clic el corpus real con el que este clasificador se vuelve defendible: etiquetar 500–1.000 posts con guía de anotación, split train/test honesto, F1 macro + matriz de confusión, y el clasificador pasa de juguete a contribución.

### 3.4 profile/arquetipos — clustering circular con bug de mapeo

Dos problemas distintos:

**(a) Circularidad.** [train_archetypes.py:29-69](../../model/app/ml_models/train_archetypes.py) genera 5 nubes uniformes con rangos elegidos a mano por arquetipo y entrena KMeans(5) para "descubrirlas". El modelo no puede aprender nada que no esté ya en las reglas del generador; es el sistema de reglas de [profile.py:72-85](../../model/app/services/profile.py) (que existe como fallback) disfrazado de aprendizaje no supervisado. Un jurado preguntará: *"¿qué aprendió el KMeans que sus reglas no supieran?"* — y la respuesta honesta hoy es "nada".

**(b) Bug de mapeo cluster→arquetipo.** Los índices de cluster de KMeans son arbitrarios. El script de entrenamiento lo sabe: calcula a qué arquetipo corresponde cada centroide ([train_archetypes.py:93-96](../../model/app/ml_models/train_archetypes.py)) — pero **solo lo imprime en consola, nunca lo persiste**. En producción, [profile.py:70](../../model/app/services/profile.py) asume mapeo posicional (`_ARCHETYPE_KEYS[cluster % len(...)]`). Si el orden de clusters del artefacto commiteado no coincide con el orden de la lista (nada lo garantiza entre versiones de sklearn ni re-entrenamientos), **los usuarios reciben el arquetipo equivocado** — p.ej. un "ENDEUDADO" etiquetado "PLANIFICADOR". El `%` defensivo delata que la incertidumbre era conocida. Correctitud por accidente.

Sin escalado de features, sin selección de k (elbow/silhouette), sin validación interna, sin análisis de estabilidad.

**Camino defendible:** clustering sobre features de usuarios reales (aunque sean decenas: usuarios semilla + demo con generación sintética *documentada y separada de la evaluación*), con selección de k justificada, silhouette/Davies-Bouldin reportados, caracterización de centroides y mapeo persistido junto al artefacto. Alternativa igualmente honesta: declarar el arquetipo como **sistema experto basado en umbrales de literatura** y retirar el KMeans — es preferible un sistema de reglas bien justificado a un ML falso.

### 3.5 prediction — R² in-sample presentado como confianza al usuario

[prediction.py:92 y 102](../../model/app/services/prediction.py): `lr.score(X_base, y)` y `rf.score(X_ext, y)` son R² **sobre los datos de entrenamiento**. Consecuencias matemáticas directas:

- Con exactamente 2 meses de datos, una recta pasa por ambos puntos: **R²=1.0 por construcción** → el usuario ve "confianza alta" derivada de 2 números.
- Con ≥4 meses se ajusta un RandomForest de 10 features sobre 4–6 muestras: sobreajuste garantizado, R² in-sample alto siempre → de nuevo "confianza alta" sin fundamento.

El diseño de re-entrenar por petición sobre los datos del usuario es defendible (personalización online, datasets diminutos); lo indefendible es la evaluación. **Lo que exige el nivel académico:** backtesting rolling-origin (entrenar hasta el mes t, predecir t+1, repetir), MAE/MAPE agregados, y comparación contra baselines naive (último mes; media móvil de 3). Si la regresión no supera al baseline naive — resultado probable con tan pocos puntos — ese hallazgo negativo **también es publicable y defendible**: motiva la recomendación de mínimo de datos y el fallback por promedio que ya existe.

### 3.6 health — los umbrales de Zhu, mal aplicados

[health.py:49-61](../../model/app/services/health.py) compara el `health_ratio` del usuario (gastos fijos como % del ingreso) contra los valores de [research_thresholds.json](../../model/app/config/research_thresholds.json) `{Deudas: 65, Ahorro: 25, Gastos Hormiga: 15, Seguros: 10}`. Esos números de Zhu (2022) son, por su naturaleza, **prevalencias de categorías de preocupación** en la muestra del estudio (qué % de personas se preocupa por deudas, etc.) — no umbrales críticos de un ratio de gasto. Comparar "tu ratio de gastos es 47%" contra "65% de la gente se preocupa por deudas" es un error de categorías: las magnitudes no son conmensurables. El `study_average` (promedio de las 4 prevalencias = 28.75) es una cantidad sin significado. Un jurado con formación estadística lo detecta de inmediato, y es doblemente peligroso porque es la única "fundamentación en investigación" que el sistema exhibe.

Los umbrales operativos reales (30/50/75) son razonables como heurística financiera — pero necesitan cita propia (regla 50/30/20, literatura de asesoría financiera) en lugar de la conexión espuria con Zhu. La conexión correcta con Zhu está en **concerns** (§3.3), no aquí.

### 3.7 Qué se necesita para que la IA sea defendible

**Datasets (todos viables en el alcance):**
1. **Concerns:** dataset Reddit de Zhu (público, ya citado) → etiquetado propio de 500–1.000 posts, guía de anotación, doble anotador, kappa de Cohen, split 70/15/15.
2. **Sentimiento/emociones ES:** corpus de evaluación propio (200–500 textos financieros etiquetados); opcionalmente TASS/EmoEvent como referencia externa; BETO como candidato de fine-tuning si el tiempo alcanza.
3. **Predicción/arquetipos:** transacciones reales de usuarios piloto + generador sintético **documentado como metodología** (distribuciones justificadas con la encuesta N=131 y literatura), con separación estricta generación/evaluación.
4. La **encuesta propia (N=131)** ya realizada es un activo: usarla para justificar prevalencias, priorización de alertas y diseño de arquetipos.

**Métricas por tarea (el comité las pidió explícitamente):**
- Clasificación (concerns, emociones): accuracy, precision/recall/**F1 macro**, matriz de confusión, kappa inter-anotador del dataset.
- Regresión (predicción): MAE, MAPE, RMSE **vs baselines naive**; cobertura del intervalo si se reporta incertidumbre.
- Clustering (arquetipos): silhouette, Davies-Bouldin, estabilidad (ARI entre re-muestreos), justificación de k.
- Sistema: latencia p95 por endpoint, tasa de error, disponibilidad.
- Producto (objetivo específico 4): **SUS** (System Usability Scale) con usuarios piloto + tareas de comprensión de alertas (¿el usuario entiende por qué se le alertó?).

**Protocolo experimental mínimo:** hipótesis por experimento, datos y particiones congeladas, semillas fijadas, resultados en tabla reproducible, análisis de errores, registro versionado (basta un `experiments/` con MD+JSON versionado en git; MLflow es opcional).

**Justificación académica del uso de IA:** el argumento correcto no es "usamos IA porque es el título del proyecto", sino: (1) la clasificación de texto libre de preocupaciones **no es expresable con reglas** (vocabulario abierto — se demuestra comparando F1 del clasificador vs el fallback de keywords que ya existe: esa comparación es un experimento gratis); (2) la predicción personalizada por usuario requiere ajuste a datos individuales; (3) la detección de anomalías se beneficia de métodos estadísticos adaptativos. Donde las reglas ganen (score, health), **defenderlas como sistema experto transparente es una fortaleza XAI**, no una debilidad — pero hay que decirlo honestamente.

### 3.8 Componentes diferenciales recomendados (en alcance)

Priorizados por relación impacto/esfuerzo y por conexión con lo ya construido:

1. **Explicabilidad (XAI) transversal** — responde a Gorai & Maurya (2025) que ya citan. El `score_breakdown` ya existe; falta convertirlo en narrativa ("tu score bajó 7 puntos porque tu volatilidad subió"), exponer los pesos de la regresión logística de concerns (los top-keywords ya se extraen — [concerns.py:82-85](../../model/app/services/concerns.py)), importancias/SHAP en predicción, y "por qué esta alerta" con la regla y el dato que la disparó. Esfuerzo moderado, diferenciación alta, cero riesgo de alcance.
2. **Análisis de emociones ligado al gasto** — el comité lo sugirió textualmente. Ya existe el mood check-in en la UI ([Analysis.jsx:399](../../client/src/app/pages/Analysis.jsx)) — hoy **ni siquiera se persiste**. Persistirlo, clasificar emociones específicas (miedo/ansiedad/culpa/esperanza — léxico NRC-ES como mínimo viable, BETO fine-tuned como versión plus) y **correlacionar emoción reportada con comportamiento de gasto de los días siguientes** produce el insight distintivo del proyecto ("gastas 34% más los fines de semana posteriores a check-ins de estrés"). Conecta la encuesta propia, Romero (2024) y Zhu (2022) en una sola narrativa.
3. **Importación de extractos bancarios (CSV/OFX) + auto-categorización ML** — versión realista de "integración con APIs bancarias" (la integración real con open banking colombiano excede el alcance legal/operativo de un proyecto de grado; decirlo explícitamente en la sustentación es un punto a favor, y Belvo sandbox puede quedar como demo opcional). El clasificador de categorías entrenado con las transacciones ya categorizadas de los usuarios es un segundo modelo ML legítimo, útil y evaluable.
4. **Alertas proactivas reales** (scheduler + los 8 tipos + dedupe) — no es "diferencial" frente al estado del arte, pero es la promesa del título; sin esto, el proyecto es indefendible ante su propio objetivo general.

---

## 4. Innovación

**Veredicto honesto:** innovación baja-moderada. Cada pieza individual (CRUD financiero, score, sentimiento, predicción de gastos) existe en productos comerciales (Fintonic, Mobills, Monefy) y en la literatura citada. La app hoy no hace nada que un evaluador no haya visto.

**Dónde sí hay semilla de novedad (integración, no invención):**
- La combinación *check-in emocional persistido + correlación con transacciones + alerta preventiva explicada* no está presente en las apps de referencia del mercado hispanohablante. Es una novedad de **integración** demostrable con una tabla comparativa de features contra 4–5 competidores (esa tabla debe existir en `docs/16-innovacion/`).
- El anclaje en **datos propios** (encuesta N=131 + corpus Reddit etiquetado por el equipo) convierte umbrales y prioridades en decisiones fundamentadas — la mayoría de proyectos de grado usan números mágicos; este puede citar los suyos.
- La **transparencia XAI** como principio de diseño (cada número explicable) es una postura diferenciadora defendible frente a apps caja-negra.

**Qué no proponer** (fuera de alcance y el comité lo notaría): LSTM/Prophet con 6 puntos de datos por usuario (Manasa et al. lo listan como trabajo futuro con datasets grandes — no aplica aquí y hay que saber decir por qué), open banking productivo, blockchain (Gorai & Maurya lo mencionan; sería adorno sin sustancia aquí).

---

## 5. Arquitectura

**Fortalezas (defenderlas como decisiones, documentarlas como ADRs):**
- Separación en 3 niveles con microservicio Python dedicado a ML — decisión correcta: el ecosistema sklearn/transformers no existe en Node. Hoy no está escrita en ninguna parte como decisión; un ADR-001 la vuelve mérito evaluable.
- `server/src/features/*` con controller/routes/schemas/service consistente en las 9 features — mantenible y fácil de recorrer.
- Validación de entorno con Zod al arranque ([env.js](../../server/src/configs/env.js)) — el server no arranca con config inválida.
- Helper de respuesta uniforme + taxonomía de errores (`AppError` y subclases) + paginación compartida.

**Debilidades:**
- **Acoplamiento síncrono sin resiliencia:** toda la "IA" está en el request path del usuario. Un modelo caído = página de Análisis muerta tras 10s de espera. Sin retry, sin circuit breaker, sin degradación (p.ej. servir el último resultado cacheado o el fallback de reglas que el modelo ya contiene). El timeout de 10s ([model.js:10](../../server/src/configs/model.js)) es la única defensa.
- **Contratos duplicados a mano:** los schemas Zod del server, los pydantic del model y los consumidores del client describen las mismas formas sin ninguna verificación cruzada — drift silencioso garantizado con el tiempo. Mínimo: tests de contrato; ideal: contrato OpenAPI del model como fuente.
- **Payloads sin acotar:** `findMany` sin `take` en [analysis.service.js:53,84,103](../../server/src/features/analysis/service/analysis.service.js) — un usuario con miles de transacciones envía todas al modelo en cada análisis.
- **Sin versionado de API** (`/api` sin `/v1`) — barato ahora, caro después.
- La misma función `toModelTransactions` está duplicada en analysis y dashboard services.

---

## 6. Seguridad

**Base sólida:** bcrypt con 12 rounds configurables, rotación de refresh tokens con single-use ([auth.service.js:113-141](../../server/src/features/auth/service/auth.service.js)), no-enumeración de emails en forgot-password ([línea 145](../../server/src/features/auth/service/auth.service.js)), tokens de verificación/reset aleatorios de 32 bytes con expiración y single-use, helmet+hpp+rate limiting global y de auth, CORS con lista de orígenes, body limit 10kb, soft-delete de usuarios.

**Brechas, por severidad:**
1. Tokens en localStorage (A-08) — el refresh de 7 días exfiltrable por XSS.
2. Modelo sin auth (A-04).
3. Sesiones no revocadas en cambio/reset de contraseña ni al desactivar cuenta; sin detección de reuso de refresh (A-09).
4. Refresh tokens y tokens de verificación almacenados **en claro** en la tabla `tokens` — un dump de BD entrega sesiones vivas; deben guardarse hasheados (SHA-256 basta).
5. `refreshTokens` no verifica que el usuario siga activo ([auth.service.js:113-141](../../server/src/features/auth/service/auth.service.js)) — cuenta desactivada puede seguir rotando tokens (el acceso muere en `authenticate`, pero la rotación no debería sobrevivir).
6. Swagger UI expuesto sin gate por entorno ([app.js:34](../../server/app.js)), con server URL hardcodeada a localhost.
7. Sin lockout ni backoff progresivo por cuenta en login (el rate limit por IP no frena credential stuffing distribuido).
8. Datos sensibles (financieros + emocionales) sin política de retención/anonimización documentada — en Colombia aplica Ley 1581/2012; un jurado puede preguntarlo y la respuesta hoy es vacía. El registro además exige consentimiento de tratamiento de datos que la UI no presenta.
9. Sin CSP en el frontend (helmet protege al API, no al SPA servido por `serve`).

---

## 7. Frontend — calidad y UX

- **Monolitos por página:** [Analysis.jsx](../../client/src/app/pages/Analysis.jsx) 860 líneas, [Dashboard.jsx](../../client/src/app/pages/Dashboard.jsx) 716, [Settings.jsx](../../client/src/app/pages/Settings.jsx) 619, [Goals.jsx](../../client/src/app/pages/Goals.jsx) 618, [Transactions.jsx](../../client/src/app/pages/Transactions.jsx) 544 — cada una con 8–15 componentes internos. Dificulta testing, revisión y reutilización.
- **Duplicación sistemática:** `fmtDate` ×3 (y la de Goals hardcodea `es-CO` ignorando el idioma activo — bug de i18n visible), `timeAgo` ×2, `PASSWORD_RULES` ×2, `ALERT_ICONS` ×2, constantes de opciones de Settings duplicadas contra las de Onboarding. Ya existe `shared/lib/format.js` — el patrón correcto existe y no se aplicó de forma consistente.
- **Sin gestión de estado de servidor:** cada página hace fetch manual con `useEffect`; sin caché, sin revalidación, sin deduplicación de requests. Cambiar una transacción y volver al Dashboard = datos viejos o refetch completo artesanal.
- **Sin code splitting:** cero `lazy()` — landing, auth, onboarding y app entera (con ApexCharts) viajan en un solo bundle al primer visitante de la landing.
- **Mood check-in no persistido:** el dato emocional — el diferencial del proyecto — se envía a `/analysis/sentiment` y **se descarta**; no hay tabla, no hay histórico, no hay correlación posible.
- **i18n con fugas:** strings en español fuera del sistema de traducción ([Analysis.jsx:215](../../client/src/app/pages/Analysis.jsx) "Crear meta:"), nombres de componentes mezclando idiomas (TabCuenta, TabPreferencias).
- **Accesibilidad sin evidencia:** sin atributos aria consistentes, sin verificación de contraste, sin navegación por teclado auditada. Para la sustentación basta una auditoría Lighthouse/axe documentada con correcciones.
- **Score history engañoso:** el sparkline de score se alimenta de snapshots que solo se crean cuando el usuario abre Análisis — un usuario que entra 2 veces al mes ve una "evolución" de 2 puntos interpolados.

---

## 8. Backend — calidad y API

- Bug A-03 (validación → 500) es el hallazgo dominante.
- `register` acopla la creación de cuenta al éxito del SMTP (sin cola ni retry — si Gmail falla, nadie se registra). El envío debe ser asíncrono y reintentable.
- `analyzeProfile` pasa `monthly_income || 1` ([analysis.service.js:128](../../server/src/features/analysis/service/analysis.service.js)): usuario sin ingreso ⇒ ratio de gastos dividido por $1 ⇒ arquetipo ENDEUDADO y score ~0 sin explicación. El caso "sin ingreso configurado" debe ser un estado explícito de la UI, no un análisis absurdo.
- Acoplamiento por strings al seed: `GENERIC_CATEGORIES = ['Otros gastos', ...]` ([analysis.service.js:162](../../server/src/features/analysis/service/analysis.service.js)) — renombrar una categoría en el seed rompe la detección silenciosamente.
- Los `.doc.js` de swagger describen los 8 tipos de alerta y presupuestos como si existieran — la documentación API promete más que el sistema.
- Sin request-id propagado hacia el modelo (imposible correlacionar un error del modelo con la petición del usuario que lo causó).

---

## 9. Base de datos

**Bien:** esquema normalizado y completo, índices compuestos correctos (`[userId, date]`, `[userId, type]`, `[userId, isRead]`, `[status, scheduledAt]`), enums exhaustivos, Decimal(12,2) para dinero, cascadas de borrado bien elegidas (transactions→category usa Restrict implícito, correcto para integridad).

**Problemas:**
- `budgets` y `notifications` son **esquema muerto** (0 lecturas/escrituras en el código). O se implementan (Fase 8) o se retiran; mantener tablas fantasma en la sustentación invita a la pregunta "¿y esto?".
- Tabla `tokens` sin limpieza: cada login crea un refresh (7d) y nada borra los expirados/usados — crecimiento sin cota y la columna indexada es VarChar(500).
- Sin estrategia de backups documentada (basta un párrafo + verificación en el proveedor).
- `ScoreSnapshot` crece un registro/día/usuario sin retención definida (aceptable, pero debe estar decidido por escrito).

---

## 10. Testing — el vacío completo

No hay nada que auditar: **cero tests**. Lo que el nivel del proyecto exige como mínimo defendible:

1. **server:** unit tests de services (auth completo: registro/login/refresh/rotación/reuso; analysis con el modelo mockeado; alerts dedupe) + integración HTTP con supertest (flujo auth completo, CRUD de transacciones, validaciones→422).
2. **model:** pytest por servicio (casos borde: 0 transacciones, 1 mes, ingreso mínimo, texto vacío/ajeno al dominio) + tests del contrato pydantic.
3. **client:** al mínimo, tests de `format.js` y de guards de router; ideal: 2–3 flujos con Testing Library (login, crear transacción).
4. **Contrato server↔model:** los requests que el server construye deben validar contra los schemas pydantic (esto habría detectado varias inconsistencias ya).
5. **CI (GitHub Actions):** lint + test + build en cada push; badge en README. Sin CI, los tests se pudren en una semana.

Meta razonable y honesta para la sustentación: **≥70% en services del server y model**; no perseguir cobertura de UI.

---

## 11. DevOps y despliegue

- A-05 (Railway sin modelo) y A-06 (compose roto) son los bloqueantes.
- [model/Dockerfile](../../model/Dockerfile): single-stage, torch CPU completo (imagen de varios GB), sin healthcheck, corre como root, y BERT se descarga en runtime (primer request lento y dependiente de HuggingFace disponible). Mejoras: multi-stage, `torch --index-url` CPU slim, baking del modelo HF en build o volumen persistente, HEALTHCHECK, usuario no-root.
- Frontend en Railway con `vite preview` (A-05); el script `start` con `serve` ya existe y es el correcto.
- Sin entornos diferenciados documentados (dev/staging/prod), sin estrategia de migraciones en prod más allá de `migrate deploy` en el arranque (aceptable, pero sin plan de rollback).
- No hay CI/CD de ningún tipo (ver §10).

---

## 12. Observabilidad

- **server:** pino + pino-http correctos. Falta: request-id (correlación), niveles por entorno documentados, y sobre todo **propagación hacia el modelo**.
- **model:** `print()` como único logging ([main.py:14,19](../../model/main.py)); sin logs de acceso estructurados, sin tiempos por inferencia, sin contadores de fallback (¿cuántas veces respondió el fallback de reglas vs el modelo? — dato que además alimenta la evaluación académica).
- Sin métricas (`/metrics` prometheus en ambos servicios es barato), sin alerta de caída del modelo (el server ni se entera hasta el timeout del usuario), sin uptime monitoring del despliegue.
- Propuesta mínima para el alcance: request-id compartido + logs JSON en model + contadores de inferencia/fallback/latencia + UptimeRobot (gratis) sobre /health de ambos.

---

## 13. Documentación

- **README:** drift verificado contra el código (A-10). Necesita: quitar lo no implementado, corregir variables, añadir `model/` a la arquitectura (hoy el diagrama muestra Redis que no existe y omite el microservicio que sí existe).
- **model/README.md:** el mejor documento del repo (961 líneas, endpoints, ejemplos). Hereda el error conceptual de Zhu (§3.6) que habrá que corregir.
- **doc/app.md:** ver A-11. Es la pieza que el comité lee — su estado actual es el mayor riesgo académico después de la IA.
- **Faltan:** ADRs (ninguna decisión arquitectónica está escrita), documentación de la API real vs swagger aspiracional, runbook de despliegue, guía de contribución/estilo, y todo el paquete de metodología/evaluación que pide el comité. La estructura `docs/` creada con esta auditoría define el plan completo (ver `docs/README.md`).

---

## 14. Inventario de deuda técnica

| # | Ítem | Severidad | Evidencia |
|---|---|---|---|
| D-01 | Bug ZodError.errors → 500 en toda validación | Crítica | [error-handler.js:10](../../server/src/middlewares/error-handler.js) |
| D-02 | 5 dependencias de producción muertas | Alta | server/package.json (bullmq, ioredis, multer, node-schedule, pdfkit) |
| D-03 | Reports.jsx con datos fabricados y botón muerto | Crítica | [Reports.jsx:7-57,124](../../client/src/app/pages/Reports.jsx) |
| D-04 | Tablas budgets/notifications muertas | Alta | schema.prisma vs cero usos |
| D-05 | 5/8 tipos de alerta no implementados | Alta | grep AlertType vs createAlert |
| D-06 | Mapeo cluster→arquetipo no persistido | Alta | [profile.py:70](../../model/app/services/profile.py) |
| D-07 | fmtDate ×3 / timeAgo ×2 / PASSWORD_RULES ×2 / ALERT_ICONS ×2 | Media | grep en client/src |
| D-08 | toModelTransactions duplicado (analysis/dashboard) | Media | ambos services |
| D-09 | Páginas monolíticas 544–860 líneas | Media | wc -l client pages |
| D-10 | Strings fuera de i18n + locale hardcodeado es-CO | Media | Analysis.jsx:215, Goals.jsx:9 |
| D-11 | Sin code splitting | Media | router/index.jsx sin lazy() |
| D-12 | README/env drift (server no arranca siguiendo README) | Alta | README vs env.js |
| D-13 | compose DATABASE_URL → base inexistente | Alta | docker-compose.yml:13 vs 28 |
| D-14 | Tokens en claro en BD, tabla sin limpieza | Alta | schema Token + auth.service |
| D-15 | Cold start BERT en primer request | Media | sentiment.py lazy pipeline |
| D-16 | Notas de borrador en propuesta formal | Alta | doc/app.md:441-442 |
| D-17 | Swagger documenta features inexistentes | Media | docs/*.doc.js |
| D-18 | Snapshot de score solo bajo demanda | Media | analysis.service.js:146-159 |
| D-19 | monthly_income \|\| 1 | Alta | analysis.service.js:128 |
| D-20 | Mood check-in sin persistencia | Alta | Analysis.jsx (HowAreYouFeeling) |

---

## 15. Análisis académico (perspectiva de jurado)

### ¿Tiene el nivel para Ingeniería de Sistemas?

Como **software**, sí — la ejecución full-stack está por encima del promedio de pregrado. Como **proyecto de grado con "IA" en el título**, hoy no: el componente inteligente no resiste preguntas de segundo nivel, y la promesa central (alertas preventivas) no está implementada. El comité lo llamó "básico" viendo solo la propuesta; el código confirma el diagnóstico y añade riesgos que el comité aún no ha visto (Reports falso, cero tests).

### Fortalezas para explotar en la sustentación

1. Arquitectura de microservicio ML — pocos proyectos de grado la tienen; con un ADR y un diagrama honesto, es el argumento de "complejidad técnica y operativa" que pidió el comité.
2. Encuesta propia N=131 + análisis previo de Reddit (finmomodelia con VADER/LDA) — datos primarios que la mayoría no tiene; hoy están desconectados del sistema; conectarlos (umbrales, priorización) es oro académico barato.
3. i18n bilingüe en cliente **y** en el microservicio — señal de ingeniería cuidadosa, mostrable en vivo.
4. Seguridad con rotación de refresh tokens — mostrable como diagrama de secuencia (una vez cerradas las brechas A-08/A-09).
5. El fallback de reglas del modelo — re-enmarcado como "degradación elegante + comparación baseline", se convierte en diseño defendible.

### Preguntas de sustentación que hoy no tienen buena respuesta

1. ¿Qué aprendió su KMeans que sus reglas no supieran ya? (§3.4)
2. ¿Con qué datos entrenaron el clasificador de preocupaciones y qué F1 tiene sobre texto real de usuarios? (§3.3)
3. Muéstrenme la matriz de confusión de cualquiera de sus modelos. (no existe ninguna)
4. ¿Por qué un modelo de reseñas de productos mide estrés financiero? ¿Lo midieron? (§3.2)
5. Su "confianza alta" en predicción, ¿sobre qué conjunto de validación se calcula? (§3.5 — in-sample)
6. ¿De dónde salen 30/50/75 y qué tienen que ver las prevalencias de Zhu con el ratio de gastos? (§3.6)
7. ¿Dónde está la alerta *preventiva*? Denme un ejemplo de alerta generada sin que el usuario abriera la app. (A-07 — no existe)
8. ¿Qué pasa si el microservicio de IA se cae un viernes por la noche? (§5 — la página muere)
9. ¿Cómo protegen datos financieros y emocionales? ¿Cumplen la Ley 1581? (§6.8 — sin respuesta)
10. ¿Qué cobertura de pruebas tienen? (§10 — cero)
11. Esta página de reportes, ¿de dónde salen los datos? (A-01 — pregunta fatal si ocurre en demo en vivo)
12. ¿Cómo evaluaron la usabilidad que promete su objetivo específico 4? (sin SUS ni protocolo)
13. ¿Su cronograma? (vacío en la propuesta)
14. ¿Qué hace Finmo que Fintonic no haga? (sin tabla comparativa)
15. ¿Por qué Python aparte y no todo en Node? (respuesta buena existe — no está escrita)

### Evidencia faltante para respaldar el proyecto

Dataset etiquetado con protocolo · resultados experimentales en tablas reproducibles · comparación contra baselines · SUS con usuarios piloto · tabla comparativa de mercado · cronograma real ejecutado vs planeado · ADRs · reporte de cobertura de tests · demo con datos reales de un usuario semilla (no fabricados).

---

## 16. Respuesta punto a punto a las observaciones del comité

| Observación del comité | Estado real hoy | Respuesta del roadmap |
|---|---|---|
| "Profundizar el componente de IA" | 1 modelo prestado sin evaluar + 3 usos de ML inválidos + 4 reglas (§3) | Fases 4–5: datasets reales, re-entrenamiento, evaluación válida con métricas |
| "Ampliar la innovación tecnológica" | Integración estándar de features conocidas (§4) | Fases 6–7: XAI + emociones↔gasto (diferenciales); Fase 9: import + auto-categorización |
| "Detallar la metodología" | Scrum genérico + notas de borrador (A-11) | Fase 11: metodología reescrita (Scrum operativo + metodología experimental de IA) — `docs/14-metodologia/` |
| "Ajustar el cronograma" | Vacío (una X) | `docs/01-roadmap/FASES.md` es el cronograma real; Fase 11 lo traslada a la propuesta |
| "Definir con precisión los modelos de IA" | Indefinidos en la propuesta; el código usa modelos sin justificar | §3.1 (inventario) + `docs/05-inteligencia-artificial/` por modelo: tarea, features, arquitectura, datos, justificación |
| "Establecer métricas de evaluación" | Ninguna válida | §3.7 + `docs/15-evaluacion-modelos/` (protocolo y resultados) |
| "Componentes diferenciales (emociones, APIs bancarias, explicabilidad)" | Mood check-in sin persistir; sin import; sin XAI | Fase 6 (XAI), Fase 7 (emociones), Fase 9 (import CSV/OFX + Belvo sandbox opcional) |
| "Ampliar complejidad técnica y operativa" | Microservicio existe pero sin resiliencia/observabilidad/tests/jobs | Fases 1–3 y 8: CI, seguridad, resiliencia, observabilidad, workers |
| "Fortalecer la comercialización" | Landing sin pricing; sin análisis de mercado | Fase 10: pricing + doc de negocio (canvas, costos, comparativa) — `docs/16-innovacion/` |

---

*Continúa en: [`docs/01-roadmap/FASES.md`](../01-roadmap/FASES.md) (plan por fases doc-first) y [`docs/01-roadmap/BACKLOG-PRIORIZADO.md`](../01-roadmap/BACKLOG-PRIORIZADO.md) (todas las tareas con prioridad y justificación).*
