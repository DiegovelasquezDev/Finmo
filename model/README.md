# Finmo Model — Microservicio de Análisis Financiero con IA

## Índice

1. [Objetivo y Propósito](#1-objetivo-y-propósito)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Ciclo de Vida de la Aplicación](#4-ciclo-de-vida-de-la-aplicación)
5. [Endpoints de la API](#5-endpoints-de-la-api)
6. [Servicio: Análisis de Sentimiento (`sentiment.py`)](#6-servicio-análisis-de-sentimiento)
7. [Servicio: Salud Financiera (`health.py`)](#7-servicio-salud-financiera)
8. [Servicio: Patrones de Gasto (`patterns.py`)](#8-servicio-patrones-de-gasto)
9. [Servicio: Predicción de Gastos (`prediction.py`)](#9-servicio-predicción-de-gastos)
10. [Servicio: Impacto de Compra (`purchase.py`)](#10-servicio-impacto-de-compra)
11. [Servicio: Perfil Comportamental (`profile.py`)](#11-servicio-perfil-comportamental)
12. [Servicio: Clasificación de Preocupaciones (`concerns.py`)](#12-servicio-clasificación-de-preocupaciones)
13. [Modelos de Machine Learning](#13-modelos-de-machine-learning)
14. [Sistema de Internacionalización (i18n)](#14-sistema-de-internacionalización-i18n)
15. [Schemas Pydantic](#15-schemas-pydantic)
16. [Configuración Externalizada](#16-configuración-externalizada)
17. [Despliegue con Docker](#17-despliegue-con-docker)
18. [Documentación Interactiva (Swagger)](#18-documentación-interactiva-swagger)
19. [Fórmulas y Fundamento Teórico Consolidado](#19-fórmulas-y-fundamento-teórico-consolidado)

---

## 1. Objetivo y Propósito

Este microservicio es el **motor de inteligencia artificial** de Finmo, un sistema web inteligente para el monitoreo de comportamientos financieros y generación de alertas preventivas. Forma parte de un proyecto de tesis universitaria en el ITM (Instituto Tecnológico Metropolitano), Medellín, Colombia.

### Propósito general

Recibir datos financieros del usuario (transacciones, ingresos, textos libres) y devolver análisis accionables mediante técnicas de Machine Learning y procesamiento de lenguaje natural, incluyendo:

| Capacidad | Técnica ML utilizada | Propósito |
|---|---|---|
| Análisis de sentimiento financiero | BERT multilingüe (Transformer) | Detectar estrés financiero crónico en texto libre |
| Evaluación de salud financiera | Reglas basadas en umbrales empíricos | Comparar ratios del usuario contra datos del estudio Zhu (2022) |
| Detección de patrones de gasto | Detección de anomalías por z-score | Identificar gastos hormiga, outliers y patrones negativos |
| Predicción de gastos futuros | LinearRegression + RandomForest | Proyectar gastos a 1–3 meses con auto-selección de modelo |
| Impacto de una compra potencial | Cálculo de ratio ingreso-precio | Evaluar si una compra es financieramente segura |
| Perfil comportamental | KMeans clustering (5 arquetipos) | Clasificar al usuario en un arquetipo financiero con score 0–100 |
| Clasificación de preocupaciones | TF-IDF + LogisticRegression | Categorizar texto libre en 7 tipos de preocupación financiera |

### Principios de diseño

- **Multilingüe**: Español e inglés nativos, extensible a más idiomas.
- **ML real**: Modelos entrenados (no solo reglas), con fallback por reglas cuando no hay datos suficientes.
- **Auto-entrenamiento**: Los modelos `.joblib` se generan automáticamente en el primer arranque.
- **Desacoplado**: Funciona como microservicio independiente, consumido por el server Express vía HTTP.

---

## 2. Stack Tecnológico

| Tecnología | Versión | Rol |
|---|---|---|
| **Python** | 3.12 | Lenguaje principal |
| **FastAPI** | 0.115.6 | Framework web asíncrono con validación automática |
| **Uvicorn** | 0.32.1 | Servidor ASGI de producción |
| **Pydantic** | 2.10.4 | Validación de schemas request/response |
| **Transformers** (HuggingFace) | ≥4.40.0 | Pipeline BERT para análisis de sentimiento |
| **PyTorch** | ≥2.2.0 | Backend del modelo BERT |
| **scikit-learn** | ≥1.6.0 | LinearRegression, RandomForest, KMeans, TF-IDF, LogisticRegression |
| **NumPy** | ≥2.0.0 | Operaciones matriciales y estadísticas |
| **joblib** | ≥1.4.0 | Serialización/deserialización de modelos entrenados |
| **httpx** | 0.28.1 | Cliente HTTP asíncrono |

---

## 3. Estructura del Proyecto

```
model/
├── main.py                          # Entry point de FastAPI + lifespan (auto-training)
├── requirements.txt                 # Dependencias Python
├── Dockerfile                       # Imagen Docker (python:3.12-slim)
├── app/
│   ├── __init__.py
│   ├── config/
│   │   └── research_thresholds.json # Umbrales empíricos Zhu (2022) externalizados
│   ├── i18n/
│   │   ├── __init__.py              # Módulo de traducción: t(), get_dict(), get_list()
│   │   ├── es.json                  # Traducciones completas en español
│   │   └── en.json                  # Traducciones completas en inglés
│   ├── ml_models/
│   │   ├── __init__.py
│   │   ├── train_archetypes.py      # Script de entrenamiento KMeans (arquetipos)
│   │   ├── train_concerns.py        # Script de entrenamiento TF-IDF + LR (preocupaciones)
│   │   ├── archetype_kmeans.joblib  # (generado) Modelo KMeans serializado
│   │   ├── concern_vectorizer.joblib# (generado) Vectorizador TF-IDF serializado
│   │   └── concern_classifier.joblib# (generado) Clasificador LR serializado
│   ├── routes/
│   │   ├── __init__.py
│   │   └── analysis.py              # 7 endpoints POST bajo /analysis
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── analysis.py              # Todos los modelos Pydantic (Request/Response)
│   └── services/
│       ├── __init__.py
│       ├── sentiment.py             # BERT multilingüe
│       ├── health.py                # Evaluación reglas + umbrales
│       ├── patterns.py              # Detección estadística de patrones
│       ├── prediction.py            # LR + RandomForest auto-selección
│       ├── purchase.py              # Ratio de impacto
│       ├── profile.py               # KMeans + score compuesto
│       └── concerns.py              # TF-IDF + LogisticRegression
```

### Flujo de datos

```
Client (React) → Server (Express) → HTTP POST → Model (FastAPI) → Service → Response JSON
                                                     ↓
                                              ML Models (.joblib)
                                              i18n (es.json/en.json)
                                              Config (research_thresholds.json)
```

---

## 4. Ciclo de Vida de la Aplicación

### `main.py` — Entry Point

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    _ensure_ml_models()   # ← Entrena modelos si no existen
    yield
```

Al iniciar la aplicación:

1. **`_ensure_ml_models()`** verifica si los archivos `.joblib` existen en `app/ml_models/`.
2. Si **no** existen, ejecuta automáticamente:
   - `train_archetypes.py` → genera `archetype_kmeans.joblib`
   - `train_concerns.py` → genera `concern_vectorizer.joblib` + `concern_classifier.joblib`
3. El modelo BERT de sentimiento (`nlptown/bert-base-multilingual-uncased-sentiment`) se descarga bajo demanda en la primera petición a `/analysis/sentiment` (lazy loading via singleton `_classifier`).

### Middleware configurado

- **CORS**: `allow_origins=["*"]` (desarrollo), `allow_methods=["*"]`, `allow_headers=["*"]`

### Montaje de rutas

- **`/analysis/*`** → 7 endpoints de análisis
- **`/health`** → Health check (`{"status": "ok"}`)
- **`/docs`** → Swagger UI automático de FastAPI
- **`/redoc`** → ReDoc automático de FastAPI

---

## 5. Endpoints de la API

Todos bajo el prefijo `/analysis`, método `POST`, con `Content-Type: application/json`.

| Endpoint | Servicio | Modelo ML | Input principal |
|---|---|---|---|
| `POST /analysis/sentiment` | `sentiment.py` | BERT multilingüe | `text`, `lang` |
| `POST /analysis/financial-health` | `health.py` | Reglas + umbrales | `monthly_income`, `fixed_expenses` |
| `POST /analysis/spending-pattern` | `patterns.py` | Estadística (z-score) | `transactions[]`, `monthly_income` |
| `POST /analysis/predict-expenses` | `prediction.py` | LR + RandomForest | `transactions[]`, `months_to_predict` |
| `POST /analysis/purchase-impact` | `purchase.py` | Ratio aritmético | `product_name`, `price`, `monthly_income` |
| `POST /analysis/profile` | `profile.py` | KMeans + score | `transactions[]`, `monthly_income` |
| `POST /analysis/concerns` | `concerns.py` | TF-IDF + LogReg | `text`, `lang` |

> Todos los endpoints aceptan un parámetro `lang` (`"es"` | `"en"`, default `"es"`) que controla el idioma de las respuestas textuales.

---

## 6. Servicio: Análisis de Sentimiento

**Archivo**: `app/services/sentiment.py`

### Modelo utilizado

[`nlptown/bert-base-multilingual-uncased-sentiment`](https://huggingface.co/nlptown/bert-base-multilingual-uncased-sentiment) — un modelo BERT fine-tuneado sobre reseñas de productos en 6 idiomas (inglés, holandés, alemán, francés, español, italiano) para clasificar sentimiento en una escala de 1 a 5 estrellas.

- **Arquitectura**: BERT base uncased (110M parámetros)
- **Entrada máxima**: 512 tokens (truncamiento automático)
- **Salida**: Etiqueta de estrellas (`"1 star"` a `"5 stars"`) + score de confianza

### Pipeline de procesamiento

```
Texto del usuario
    ↓
HuggingFace pipeline("sentiment-analysis")
    ↓
Resultado: { label: "2 stars", score: 0.87 }
    ↓
Mapeo a escala normalizada 0.0–1.0
    ↓
Clasificación financiera + recomendación i18n
```

### Fórmulas y mapeos

**Normalización de estrellas a escala 0–1:**

| Etiqueta BERT | `normalized` |
|---|---|
| `"1 star"` | 0.00 |
| `"2 stars"` | 0.25 |
| `"3 stars"` | 0.50 |
| `"4 stars"` | 0.75 |
| `"5 stars"` | 1.00 |

**Nivel de energía emocional** (cuánta intensidad emocional hay, sin importar dirección):

$$\text{energy\_level} = |normalized - 0.5| \times 2$$

- Rango: `0.0` (neutral) a `1.0` (máxima intensidad)
- Un valor alto indica emoción fuerte (positiva o negativa)

**Clasificación de estrés:**

$$\text{is\_stressed} = \begin{cases} \text{true} & \text{si } normalized \leq 0.35 \\ \text{false} & \text{si } normalized > 0.35 \end{cases}$$

**Mapeo de etiquetas financieras:**

| Condición | Label (es) | Label (en) | AlertPriority |
|---|---|---|---|
| `normalized ≤ 0.35` | `ESTRES_CRONICO` | `CHRONIC_STRESS` | `CALMA` |
| `normalized > 0.35` | `RESILIENCIA` | `RESILIENCE` | `FORTALECIMIENTO` |

### Ejemplo de respuesta

```json
{
  "score": 0.25,
  "label": "ESTRES_CRONICO",
  "energy_level": 0.5,
  "alert_priority": "CALMA",
  "recommendation": "Tu estado emocional refleja estrés financiero crónico..."
}
```

### ¿Por qué BERT y no VADER?

| Aspecto | VADER (anterior) | BERT multilingüe (actual) |
|---|---|---|
| Español nativo | ❌ Solo inglés, se hacían hacks con keywords | ✅ Entrenado en español real |
| Contexto | ❌ Bag-of-words, sin contexto | ✅ Entiende contexto bidireccional |
| Precisión en finanzas | ❌ Diseñado para redes sociales | ✅ Fine-tuned en reseñas reales |
| Multilingüe | ❌ Solo inglés | ✅ 6 idiomas nativos |

---

## 7. Servicio: Salud Financiera

**Archivo**: `app/services/health.py`

### Fundamento teórico

Los umbrales provienen del estudio **Zhu (2022)** realizado con una muestra de N=264 personas, que identificó los porcentajes críticos de preocupación financiera por categoría. Estos datos están externalizados en `app/config/research_thresholds.json`:

```json
{
  "source": "Zhu (2022), N=264",
  "thresholds": {
    "Deudas": 65,
    "Ahorro": 25,
    "Gastos Hormiga": 15,
    "Seguros": 10
  }
}
```

**Interpretación**: El 65% de los encuestados reportaron preocupación por deudas, el 25% por ahorro, etc. Estos porcentajes se usan como benchmarks para comparar al usuario.

### Fórmula principal

$$\text{health\_ratio} = \frac{\text{fixed\_expenses}}{\text{monthly\_income}} \times 100$$

### Clasificación por niveles

| Rango de `health_ratio` | Nivel | Significado | AlertPriority |
|---|---|---|---|
| ≤ 30% | `ALTA_SEGURIDAD` | Gastos fijos muy controlados, margen amplio | `FORTALECIMIENTO` |
| 31% – 50% | `EQUILIBRIO` | Balance saludable, puede optimizar | `FORTALECIMIENTO` |
| 51% – 75% | `CARGA_ELEVADA` | Gastos fijos consumen mayoría del ingreso | `REDUCCION` |
| > 75% | `CRITICO` | Situación insostenible, necesita intervención | `CRITICO` |

### Ajuste por estrés auto-reportado

Si el usuario reporta un `financial_stress_level ≥ 4` (en escala 1–5) Y la prioridad actual no es `CRITICO`, se ajusta la prioridad a `CALMA` para indicar que necesita acompañamiento emocional además de financiero.

### Comparación contra umbrales del estudio

La respuesta incluye `vs_research_thresholds`, que compara el `health_ratio` del usuario contra cada categoría del estudio:

```json
{
  "Deudas": {
    "critical_threshold_pct": 65,
    "user_ratio": 42.5,
    "exceeds": false
  },
  "study_average": {
    "critical_threshold_pct": 28.75,
    "user_ratio": 42.5,
    "exceeds": true
  }
}
```

El promedio del estudio se calcula como:

$$\text{study\_avg} = \frac{65 + 25 + 15 + 10}{4} = 28.75\%$$

---

## 8. Servicio: Patrones de Gasto

**Archivo**: `app/services/patterns.py`

### Constantes de configuración

| Constante | Valor | Significado |
|---|---|---|
| `_ANT_MIN_COUNT` | 5 | Mínimo de transacciones para considerarse gasto hormiga |
| `_ANT_MAX_UNIT_PCT` | 2.0% | Cada transacción individual debe ser < 2% del ingreso |
| `_UNUSUAL_SIGMA` | 2.0 | Umbral de z-score para considerar un gasto como inusual |

### Algoritmo paso a paso

#### 1. Agrupación por categoría

Se filtran solo las transacciones de tipo `EXPENSE` y se agrupan por `category`. Para cada categoría se calcula:

$$\text{percentage\_of\_income} = \frac{\text{total\_categoría}}{\text{monthly\_income}} \times 100$$

#### 2. Detección de gastos hormiga

Una categoría se marca como **gasto hormiga** (`is_ant_spending = true`) cuando cumple **ambas** condiciones:

$$\text{is\_ant} = (\text{count} \geq 5) \wedge \left(\frac{\text{avg\_unit}}{\text{monthly\_income}} \times 100 < 2.0\right)$$

Donde `avg_unit` es el monto promedio por transacción en esa categoría.

**Intuición**: Muchas transacciones pequeñas (café diario, snacks, suscripciones) que individualmente parecen insignificantes pero acumulan un monto significativo.

#### 3. Detección de gastos inusuales (outliers)

Se usa la **puntuación z (z-score)** sobre todos los montos de gastos:

$$z_i = \frac{x_i - \mu}{\sigma}$$

Donde:
- $x_i$ = monto de la transacción $i$
- $\mu$ = media de todos los montos de gastos
- $\sigma$ = desviación estándar de todos los montos

Se requieren **mínimo 3 transacciones** para calcular estadísticas. Una transacción se marca como inusual si:

$$z_i > 2.0$$

Esto identifica gastos que están a más de 2 desviaciones estándar por encima de la media.

#### 4. Patrones negativos detectados

| Patrón | Condición | Mensaje (i18n) |
|---|---|---|
| Gastos excesivos | `expense_to_income > 75%` | "Tus gastos superan el 75% de tus ingresos" |
| Gastos hormiga | Alguna categoría cumple condiciones ant | "Gastos hormiga detectados en: {categories}" |
| Gastos inusuales | z-score > 2.0 en alguna transacción | "Se detectaron N gasto(s) inusualmente altos" |
| Concentración | Top categoría > 40% del ingreso | "La categoría X concentra más del 40% de tus ingresos" |

---

## 9. Servicio: Predicción de Gastos

**Archivo**: `app/services/prediction.py`

### Modelos utilizados

| Modelo | Biblioteca | Cuándo se usa |
|---|---|---|
| **LinearRegression** | scikit-learn | Siempre (baseline) |
| **RandomForestRegressor** | scikit-learn | Cuando hay ≥ 4 meses de datos |
| **Promedio simple** | — | Fallback cuando hay < 2 meses |

### Feature Engineering

#### Features básicas (LinearRegression)

| Feature | Descripción |
|---|---|
| `month_index` | Índice numérico del mes: $y \times 12 + m$ |

#### Features extendidas (RandomForest)

| Feature | Descripción |
|---|---|
| `month_index` | Índice numérico del mes |
| `month_num` | Número del mes (1–12), captura estacionalidad |
| `quincena_count` | Cantidad de transacciones en días 14–16 y 28–31 |
| `dow_0` ... `dow_6` | Distribución de gasto por día de la semana (Lun–Dom) |

**Total: 10 features** para el RandomForest vs 1 feature para LinearRegression.

La **quincena** es un patrón cultural colombiano/latinoamericano donde los pagos de nómina ocurren típicamente el 15 y el 30 de cada mes, generando picos de gasto en esas fechas.

### Algoritmo de selección de modelo

```
1. Entrenar LinearRegression con X_base (1 feature)
2. Calcular R² de LR
3. Si hay ≥ 4 meses de datos:
   a. Entrenar RandomForest con X_ext (10 features)
   b. Calcular R² de RF
   c. Si R²_RF > R²_LR → usar RandomForest
4. Predecir con el mejor modelo
```

### Fórmulas

**Regresión lineal**: $\hat{y} = \beta_0 + \beta_1 \cdot x$ donde $x$ es el `month_index`

**Random Forest**: Ensemble de 50 árboles de decisión (`n_estimators=50`, `max_depth=5`)

**Coeficiente de determinación (R²)**:

$$R^2 = 1 - \frac{\sum_i (y_i - \hat{y}_i)^2}{\sum_i (y_i - \bar{y})^2}$$

### Clasificación de confianza

| Rango de R² | Confianza |
|---|---|
| ≥ 0.70 | `ALTA` / `HIGH` |
| 0.40 – 0.69 | `MEDIA` / `MEDIUM` |
| < 0.40 | `BAJA` / `LOW` |

### Clasificación de tendencia

Se usa la **pendiente** ($\beta_1$) de la regresión lineal como indicador de tendencia:

$$\text{trend} = \begin{cases} \text{CRECIENTE} & \text{si } \beta_1 > \bar{y} \times 0.03 \\ \text{DECRECIENTE} & \text{si } \beta_1 < -\bar{y} \times 0.03 \\ \text{ESTABLE} & \text{en otro caso} \end{cases}$$

Donde $\bar{y}$ es el promedio mensual de gastos. El umbral del 3% evita clasificar fluctuaciones mínimas como tendencia.

### Ejemplo de respuesta

```json
{
  "predictions": [
    { "month": "2026-05", "predicted_expense": 2150000.00, "confidence": "ALTA" }
  ],
  "trend": "CRECIENTE",
  "avg_monthly_expense": 1980000.00,
  "model_used": "random_forest",
  "model_score": 0.8234
}
```

---

## 10. Servicio: Impacto de Compra

**Archivo**: `app/services/purchase.py`

### Fórmula principal

$$\text{impact\_pct} = \frac{\text{price}}{\text{monthly\_income}} \times 100$$

### Niveles de impacto

| Rango | Nivel (es) | Nivel (en) | Acción recomendada |
|---|---|---|---|
| ≤ 5% | `IMPACTO_BAJO` | `LOW_IMPACT` | Compra segura |
| 6% – 15% | `IMPACTO_MEDIO` | `MEDIUM_IMPACT` | Evaluar necesidad real |
| > 15% | `IMPACTO_CRITICO` | `CRITICAL_IMPACT` | Postergar o buscar alternativa |

### Ratio combinado

Si el usuario envía su `current_expense_ratio` actual (porcentaje de gastos fijos sobre ingreso), se calcula el ratio combinado post-compra:

$$\text{combined\_ratio} = \text{current\_expense\_ratio} + \text{impact\_pct}$$

Esto permite evaluar si la compra llevaría al usuario a una zona de riesgo según los umbrales de salud financiera.

---

## 11. Servicio: Perfil Comportamental

**Archivo**: `app/services/profile.py`

Este es el servicio más complejo del sistema. Combina clustering ML, scoring compuesto, detección de patrones temporales y generación de insights en lenguaje natural.

### 11.1 Arquetipos financieros

| Arquetipo | Emoji | Perfil típico |
|---|---|---|
| **IMPULSIVO** | 🦁 | Gastos frecuentes y pequeños sin patrón, alto ant_ratio |
| **CONSERVADOR** | 🐢 | Gastos bajos, ingresos estables, bajo ahorro real |
| **PLANIFICADOR** | 🦊 | Baja volatilidad, ahorro consistente >20% |
| **VOLATIL** | 🦋 | Meses muy buenos y muy malos, flujo impredecible |
| **ENDEUDADO** | ⚠️ | Gastos >90% del ingreso, ahorro negativo |

### 11.2 Clasificación: KMeans clustering

**Modelo**: `KMeans(n_clusters=5)` entrenado sobre 1000 muestras sintéticas (200 por arquetipo).

**Vector de features** (4 dimensiones):

| Feature | Fórmula | Rango típico |
|---|---|---|
| `expense_ratio` | $\frac{\text{avg\_monthly\_expense}}{\text{avg\_monthly\_income}}$ | 0.0 – 1.1+ |
| `volatility_coef` | $\frac{\sigma(\text{monthly\_expenses})}{\mu(\text{monthly\_expenses})}$ (coeficiente de variación) | 0.0 – 1.0 |
| `ant_ratio` | $\frac{\text{categorías\_hormiga}}{\text{total\_categorías}}$ | 0.0 – 1.0 |
| `savings_rate` | $\frac{\text{income} - \text{expense}}{\text{income}}$ promediado por mes | -0.1 – 0.5 |

**Proceso de clasificación:**

```
1. Cargar modelo KMeans (.joblib) — lazy loading, una sola vez
2. Crear vector: [expense_ratio, volatility_coef, ant_ratio, savings_rate]
3. Predecir cluster: model.predict(features)
4. Mapear cluster → arquetipo via ARCHETYPE_KEYS[cluster_id % 5]
```

**Fallback por reglas** (si el modelo .joblib no existe):

```python
if expense_ratio > 0.90:      return "ENDEUDADO"
if volatility_coef > 0.40:    return "VOLATIL"
if ant_ratio > 0.35:          return "IMPULSIVO"
if savings > 0.20 and vol < 0.20: return "PLANIFICADOR"
if expense < 0.55 and savings < 0.10: return "CONSERVADOR"
if volatility_coef < 0.20:    return "PLANIFICADOR"
else:                          return "VOLATIL"
```

### 11.3 Score financiero compuesto (0–100)

El score se compone de **5 dimensiones** con pesos distintos:

| Dimensión | Peso máx. | Qué mide | Cómo se calcula |
|---|---|---|---|
| **Spending Control** | 30 pts | Qué tan controlados están los gastos | Basado en `expense_ratio` |
| **Savings Habit** | 25 pts | Capacidad de ahorro | Basado en `savings_rate` |
| **Behavioral Stability** | 20 pts | Consistencia mes a mes | Basado en `volatility_coef` |
| **No Spikes** | 15 pts | Ausencia de gastos anómalos | z-score > 2.5 = 0 pts |
| **Goal Progress** | 10 pts | Avance en metas financieras | `goals_completion_rate × 10` |

**Tablas de puntuación detalladas:**

#### Spending Control (30 pts)

| `expense_ratio` | Puntos |
|---|---|
| ≤ 0.30 | 30 |
| 0.31 – 0.50 | 25 |
| 0.51 – 0.70 | 15 |
| 0.71 – 0.90 | 8 |
| > 0.90 | 0 |

#### Savings Habit (25 pts)

| `savings_rate` | Puntos |
|---|---|
| ≥ 0.20 | 25 |
| 0.10 – 0.19 | 18 |
| 0.05 – 0.09 | 10 |
| 0.01 – 0.04 | 5 |
| ≤ 0 | 0 |

#### Behavioral Stability (20 pts)

| `volatility_coef` | Puntos |
|---|---|
| < 0.10 | 20 |
| 0.10 – 0.19 | 15 |
| 0.20 – 0.34 | 8 |
| ≥ 0.35 | 3 |

#### No Spikes (15 pts)

| Condición | Puntos |
|---|---|
| Sin gastos inusuales (z > 2.5) | 15 |
| Con gastos inusuales | 0 |

#### Goal Progress (10 pts)

$$\text{goal\_pts} = \text{round}(\text{goals\_completion\_rate} \times 10)$$

#### Score total

$$\text{score} = \min(100, \text{ctrl} + \text{savings} + \text{stability} + \text{spike} + \text{goals})$$

### Etiquetas del score

| Rango | Etiqueta (es) | Etiqueta (en) |
|---|---|---|
| ≥ 80 | Excelente | Excellent |
| 65 – 79 | Bueno | Good |
| 45 – 64 | Regular | Fair |
| 25 – 44 | En riesgo | At Risk |
| < 25 | Crítico | Critical |

### 11.4 Detección de picos por día de la semana

Para cada día (Lunes a Domingo) se calcula el gasto promedio diario:

$$\text{dow\_avg}[d] = \frac{\sum_{tx \in d} tx.\text{amount}}{|\{tx \in d\}|}$$

Luego se calcula el promedio semanal general:

$$\text{week\_avg} = \frac{\sum_{d=0}^{6} \text{dow\_avg}[d]}{7}$$

Un día es un **spike** si:

$$\text{dow\_avg}[d] > \text{week\_avg} \times 1.5$$

El **multiplicador** se reporta como:

$$\text{multiplier} = \frac{\text{dow\_avg}[d]}{\text{week\_avg}}$$

### 11.5 Generación de insights

Se generan insights contextuales (máximo 5) basados en las métricas calculadas:

| Condición | Insight generado |
|---|---|
| Hay spike_days | "Los {día}s gastas {multiplier}x más que el resto de la semana" |
| Hay categorías hormiga | "En {categorías} tienes muchos gastos pequeños que suman..." |
| `avg_savings < 0.05` y `expense_ratio < 0.90` | "Casi no queda margen de ahorro..." |
| `volatility_coef > 0.30` | "Tus gastos varían mucho entre meses..." |
| Gasto del último mes > 120% del anterior | "Este mes gastaste un 20% más que el anterior" |

---

## 12. Servicio: Clasificación de Preocupaciones

**Archivo**: `app/services/concerns.py`

### Categorías de clasificación

| Código | Descripción (es) | Descripción (en) |
|---|---|---|
| `DEBT` | Deudas | Debt |
| `SAVINGS` | Ahorro | Savings |
| `ANT_SPENDING` | Gastos Hormiga | Ant Spending |
| `INSURANCE` | Seguros | Insurance |
| `INVESTMENT` | Inversión | Investment |
| `RETIREMENT` | Jubilación | Retirement |
| `OTHER` | Otro | Other |

### Pipeline ML

```
Texto libre del usuario
    ↓
TfidfVectorizer.transform(text)     ← Vectorización TF-IDF
    ↓
Vector disperso de dimensión ≤3000
    ↓
LogisticRegression.predict_proba()   ← Clasificación multiclase
    ↓
Categoría con mayor probabilidad + confianza
    ↓
Extracción de top-5 keywords TF-IDF
```

### Configuración del vectorizador TF-IDF

| Parámetro | Valor | Propósito |
|---|---|---|
| `max_features` | 3000 | Limita el vocabulario a las 3000 palabras más relevantes |
| `ngram_range` | (1, 2) | Unigramas y bigramas (ej: "tarjeta crédito") |
| `min_df` | 1 | Incluir palabras que aparecen al menos 1 vez |
| `strip_accents` | `"unicode"` | Normalizar acentos (café → cafe) |
| `lowercase` | `true` | Todo a minúsculas |

### Fórmula TF-IDF

$$\text{TF-IDF}(t, d) = \text{TF}(t, d) \times \text{IDF}(t)$$

Donde:

$$\text{TF}(t, d) = \frac{f_{t,d}}{\sum_{t' \in d} f_{t',d}}$$

$$\text{IDF}(t) = \log\left(\frac{N}{|\{d : t \in d\}|}\right) + 1$$

- $f_{t,d}$ = frecuencia del término $t$ en el documento $d$
- $N$ = número total de documentos en el corpus

### Datos de entrenamiento

El clasificador se entrena con un corpus bilingüe de **150+ frases** distribuidas así:

| Categoría | Frases (es) | Frases (en) | Total |
|---|---|---|---|
| DEBT | 15 | 10 | 25 |
| SAVINGS | 15 | 10 | 25 |
| ANT_SPENDING | 15 | 10 | 25 |
| INSURANCE | 10 | 10 | 20 |
| INVESTMENT | 10 | 10 | 20 |
| RETIREMENT | 10 | 10 | 20 |
| **Total** | | | **135** |

### Fallback por keywords

Si los modelos `.joblib` no existen, se usa un sistema de coincidencia de palabras clave:

```python
confidence = min(0.85, hits_mejor_categoría / (total_hits + 1))
```

Si ninguna keyword coincide, retorna `"OTHER"` con confianza 0.3.

---

## 13. Modelos de Machine Learning

### 13.1 KMeans — Arquetipos financieros

**Archivo de entrenamiento**: `app/ml_models/train_archetypes.py`
**Output**: `archetype_kmeans.joblib`

| Hiperparámetro | Valor |
|---|---|
| `n_clusters` | 5 |
| `n_init` | 20 (repeticiones con diferentes centroides) |
| `max_iter` | 500 |
| `random_state` | 42 |

**Datos de entrenamiento**: 1000 muestras sintéticas (200 × 5 arquetipos) con distribuciones uniformes calibradas:

| Arquetipo | expense_ratio | volatility | ant_ratio | savings_rate |
|---|---|---|---|---|
| IMPULSIVO | U(0.50, 0.80) | U(0.15, 0.35) | U(0.35, 0.70) | U(0.02, 0.15) |
| CONSERVADOR | U(0.30, 0.55) | U(0.05, 0.20) | U(0.05, 0.20) | U(0.01, 0.10) |
| PLANIFICADOR | U(0.35, 0.60) | U(0.03, 0.18) | U(0.05, 0.25) | U(0.20, 0.45) |
| VOLATIL | U(0.45, 0.80) | U(0.40, 0.80) | U(0.10, 0.40) | U(0.00, 0.20) |
| ENDEUDADO | U(0.85, 1.10) | U(0.15, 0.50) | U(0.10, 0.40) | U(-0.10, 0.02) |

> U(a, b) = distribución uniforme entre a y b

**Verificación de clusters**: Tras entrenar, cada centroide se compara contra centroides de referencia usando distancia euclidiana para asegurar que el mapeo cluster→arquetipo es correcto.

### 13.2 TF-IDF + LogisticRegression — Clasificador de preocupaciones

**Archivo de entrenamiento**: `app/ml_models/train_concerns.py`
**Output**: `concern_vectorizer.joblib` + `concern_classifier.joblib`

**LogisticRegression config:**

| Hiperparámetro | Valor |
|---|---|
| `max_iter` | 1000 |
| `multi_class` | `"multinomial"` (softmax sobre todas las clases) |
| `solver` | `"lbfgs"` (optimización quasi-Newton) |
| `C` | 1.0 (regularización L2 estándar) |
| `random_state` | 42 |

**Validación**: Cross-validation con 3 folds sobre el corpus de entrenamiento.

### 13.3 BERT — Análisis de sentimiento

| Aspecto | Detalle |
|---|---|
| Modelo | `nlptown/bert-base-multilingual-uncased-sentiment` |
| Fuente | HuggingFace Hub |
| Parámetros | ~110M |
| Idiomas | en, nl, de, fr, es, it |
| Carga | Lazy (primera petición), singleton |
| Almacenamiento | Cache de HuggingFace (`~/.cache/huggingface/`) |
| Truncamiento | 512 tokens |

### 13.4 LinearRegression + RandomForest — Predicción

Se entrenan **en tiempo real** (no pre-entrenados) con los datos del usuario en cada petición:

| Modelo | Features | Mín. datos | Hiperparámetros |
|---|---|---|---|
| LinearRegression | 1 (month_index) | 2 meses | — |
| RandomForest | 10 (extendidas) | 4 meses | `n_estimators=50`, `max_depth=5`, `random_state=42` |

---

## 14. Sistema de Internacionalización (i18n)

**Directorio**: `app/i18n/`

### Arquitectura

```
i18n/
├── __init__.py    ← Módulo con t(), get_dict(), get_list()
├── es.json        ← 100+ strings en español
└── en.json        ← 100+ strings en inglés
```

### API del módulo

| Función | Firma | Propósito | Ejemplo |
|---|---|---|---|
| `t()` | `t(key, lang, **kwargs) → str` | Traducir string con interpolación | `t("purchase.rec_low", "en", product="TV", pct=4.5)` |
| `get_dict()` | `get_dict(key, lang) → dict` | Obtener dict anidado | `get_dict("profile.archetypes.IMPULSIVO", "en")` |
| `get_list()` | `get_list(key, lang) → list` | Obtener lista | `get_list("profile.day_names", "en")` |

### Resolución de claves

Las claves usan notación de punto (dot-notation):

```
"profile.archetypes.IMPULSIVO.name" → es.json["profile"]["archetypes"]["IMPULSIVO"]["name"]
```

### Interpolación

Los strings soportan placeholders `{nombre}` que se reemplazan vía `**kwargs`:

```python
t("patterns.ant_spending", "es", categories="Comida, Transporte")
# → "Gastos hormiga detectados en: Comida, Transporte. Muchas transacciones..."
```

### Fallback

1. Si el idioma no está soportado → fallback a español (`"es"`)
2. Si la clave no existe en el idioma solicitado → intento en español
3. Si la clave no existe en español → retorna la clave misma como string

### Performance

Los archivos JSON se cargan con `@lru_cache(maxsize=4)`, por lo que solo se leen del disco una vez y se mantienen en memoria.

### Idiomas soportados

| Código | Idioma | Estado |
|---|---|---|
| `es` | Español | ✅ Completo (default) |
| `en` | Inglés | ✅ Completo |

Para agregar un nuevo idioma, crear `app/i18n/{code}.json` y agregar el código a `_SUPPORTED` en `__init__.py`.

---

## 15. Schemas Pydantic

**Archivo**: `app/schemas/analysis.py`

Todos los schemas usan Pydantic v2 con validación estricta via `Field()`.

### Modelos compartidos

| Schema | Campos | Uso |
|---|---|---|
| `TransactionItem` | `amount`, `type`, `category`, `date` | Representación de una transacción individual |
| `HealthLevel` (Enum) | `ALTA_SEGURIDAD`, `EQUILIBRIO`, `CARGA_ELEVADA`, `CRITICO` | Niveles de salud financiera |
| `AlertPriority` (Enum) | `REDUCCION`, `CALMA`, `FORTALECIMIENTO`, `CRITICO` | Prioridad de alertas |

### Validaciones por endpoint

| Endpoint | Campo | Validación |
|---|---|---|
| Sentiment | `text` | `min_length=3`, `max_length=2000` |
| Sentiment | `lang` | `pattern="^(es|en)$"` |
| Financial Health | `monthly_income` | `gt=0` |
| Financial Health | `financial_stress_level` | `ge=1, le=5` |
| Prediction | `months_to_predict` | `ge=1, le=3` |
| Purchase | `price` | `gt=0` |
| Purchase | `current_expense_ratio` | `ge=0, le=100` |
| Profile | `goals_completion_rate` | `ge=0.0, le=1.0` |
| Concern | `text` | `min_length=3`, `max_length=2000` |

---

## 16. Configuración Externalizada

### `app/config/research_thresholds.json`

Los umbrales del estudio Zhu (2022) están externalizados para poder actualizarlos sin modificar código. Estructura:

```json
{
  "source": "Zhu (2022), N=264",
  "thresholds": {
    "Deudas": 65,
    "Ahorro": 25,
    "Gastos Hormiga": 15,
    "Seguros": 10
  }
}
```

Se carga una sola vez al importar el módulo `health.py`. Si se reemplaza por un estudio más reciente, solo se edita este archivo.

---

## 17. Despliegue con Docker

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Al iniciar el contenedor:
1. Uvicorn arranca FastAPI en puerto 8000
2. El lifespan hook entrena los modelos KMeans y TF-IDF (solo la primera vez)
3. Los `.joblib` persisten dentro del contenedor (usar volúmenes si se quiere persistir entre recreaciones)

---

## 18. Documentación Interactiva (Swagger)

FastAPI genera documentación OpenAPI automáticamente:

| URL | Interfaz |
|---|---|
| `http://localhost:8000/docs` | Swagger UI interactivo |
| `http://localhost:8000/redoc` | ReDoc (vista alternativa) |
| `http://localhost:8000/openapi.json` | Spec OpenAPI 3.1 en JSON |

Cada endpoint incluye `summary` y `description` detallada con el modelo ML utilizado.

---

## 19. Fórmulas y Fundamento Teórico Consolidado

### Resumen de todas las fórmulas utilizadas

| # | Fórmula | Servicio | Propósito |
|---|---|---|---|
| 1 | $\text{normalized} = \text{STAR\_MAP}[\text{label}]$ | Sentiment | Mapear 1–5 estrellas a 0–1 |
| 2 | $\text{energy} = \|normalized - 0.5\| \times 2$ | Sentiment | Intensidad emocional |
| 3 | $\text{health\_ratio} = \frac{expenses}{income} \times 100$ | Health | Ratio de gastos fijos |
| 4 | $\text{study\_avg} = \frac{\sum thresholds}{n}$ | Health | Promedio del estudio Zhu |
| 5 | $z_i = \frac{x_i - \mu}{\sigma}$ | Patterns | Detección de outliers |
| 6 | $\text{is\_ant} = (count \geq 5) \wedge (avg\_unit\% < 2)$ | Patterns | Gastos hormiga |
| 7 | $\hat{y} = \beta_0 + \beta_1 x$ | Prediction | Regresión lineal |
| 8 | $R^2 = 1 - \frac{SS_{res}}{SS_{tot}}$ | Prediction | Bondad de ajuste |
| 9 | $\text{trend} = f(\beta_1, \bar{y})$ | Prediction | Dirección del gasto |
| 10 | $\text{impact} = \frac{price}{income} \times 100$ | Purchase | Impacto porcentual |
| 11 | $\text{CV} = \frac{\sigma(expenses)}{\mu(expenses)}$ | Profile | Coeficiente de variación |
| 12 | $\text{savings\_rate} = \frac{income - expense}{income}$ | Profile | Tasa de ahorro |
| 13 | $\text{spike} = dow\_avg[d] > week\_avg \times 1.5$ | Profile | Pico de gasto por día |
| 14 | $\text{TF-IDF}(t,d) = TF(t,d) \times IDF(t)$ | Concerns | Vectorización de texto |
| 15 | $\text{score} = \sum_i \text{dimension}_i$ (max 100) | Profile | Score compuesto |

### Fuentes académicas

| Referencia | Uso en el sistema |
|---|---|
| **Zhu (2022)**, N=264 | Umbrales de preocupación financiera en `health.py` |
| **BERT** (Devlin et al., 2019) | Arquitectura base del modelo de sentimiento |
| **nlptown fine-tuning** | Modelo específico entrenado en reseñas multilingües |
| **z-score** (estadística clásica) | Detección de gastos anómalos en `patterns.py` |
| **KMeans** (Lloyd, 1982) | Clustering de arquetipos en `profile.py` |
| **TF-IDF** (Salton & Buckley, 1988) | Vectorización de texto en `concerns.py` |
| **Random Forest** (Breiman, 2001) | Predicción de gastos en `prediction.py` |
