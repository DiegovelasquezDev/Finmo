# Sentido Financiero — Modelo de IA (finmomodelia)

Repositorio complementario a Finmo que implementa análisis de NLP y estadísticas sobre bienestar financiero personal. Es una app Streamlit basada en una investigación académica de Jinfei Zhu (University of Chicago) sobre preocupaciones financieras en Reddit.

**Autor académico:** Jhony Mira — ITM Medellín, proyecto de grado 2026  
**Deploy:** https://appfinanzasproyectogradoitmjhonymira20261-dfcmmuscpkcbvmupbt3x.streamlit.app/

---

## ¿Qué hace?

Aplicación de 7 pestañas que combina análisis de texto libre del usuario con sus métricas financieras para generar recomendaciones personalizadas:

| Pestaña | Función |
|---------|---------|
| **Inicio** | Presentación de la propuesta de valor |
| **Bienestar** | Análisis de sentimiento del texto del usuario (VADER) |
| **Conecta** | Ingreso/gasto fijo → cálculo del índice de salud financiera |
| **Comparativa** | Ratio del usuario vs. umbrales de ansiedad del estudio (N=264) |
| **Planificador** | Impacto de una compra como % del ingreso mensual |
| **Acción** | Plan de acción personalizado (sentimiento + ratio financiero) |
| **Estudio** | Datos crudos y visualizaciones de la investigación base |

---

## Modelos y técnicas utilizadas

### 1. VADER — Análisis de sentimiento
- Lexicón rule-based optimizado para texto social (no requiere entrenamiento)
- Entrada: texto libre del usuario describiendo sus preocupaciones financieras
- Salida: `compound score` en [-1, +1]
- Umbrales:
  - `score ≤ -0.05` → estrés financiero crónico
  - `score > -0.05` → control emocional y resiliencia

### 2. LDA — Modelado de tópicos (fase investigación)
- Latent Dirichlet Allocation sobre posts de Reddit r/personalfinance (2009–2021)
- Extrajo 4 categorías de preocupaciones:
  - **Deudas** (117 menciones, umbral crítico ≈ 65% del ingreso)
  - **Ahorro** (72 menciones, umbral ≈ 25%)
  - **Gastos Hormiga** (42 menciones, umbral ≈ 15%)
  - **Seguros** (33 menciones, umbral ≈ 10%)

### 3. Umbrales estadísticos hardcoded
Derivados del estudio empírico (N=264). La app los usa para comparar directamente con el ratio del usuario, sin inferencia ML en tiempo real.

---

## Pipeline de datos

```
Reddit (r/personalfinance)
  └─ Pushshift API / PRAW
       └─ ~900,000 posts (2009-2021)
            └─ NLTK preprocessing
                 └─ LDA topic modeling  →  categorías + frecuencias + umbrales
                      └─ resultados hardcodeados en app_ayuda_financiera.py

Usuario (tiempo real)
  ├─ Texto libre  →  VADER  →  compound score
  ├─ Ingreso + Gastos  →  ratio = (gastos/ingreso) × 100
  └─ Precio compra  →  impacto = (precio/ingreso) × 100
```

---

## Lógica de recomendaciones

```
ratio > 50%                      →  Prioridad: "Reducción" (reducir deudas)
score ≤ -0.05                    →  Prioridad: "Calma" (no tomar decisiones hoy)
ratio ≤ 50% AND score > -0.05   →  Prioridad: "Fortalecimiento"
```

---

## Stack tecnológico

| Componente | Librería |
|------------|----------|
| Web app | `streamlit` |
| NLP / Sentiment | `nltk` (VADER) |
| Topic modeling | `scikit-learn` (LDA + CountVectorizer) |
| Data | `pandas` |
| Visualizaciones | `plotly`, `matplotlib` |
| Scraping (investigación) | `praw`, `pmaw` (Pushshift) |

---

## Estructura del repositorio

```
finmomodelia/
├── app_ayuda_financiera.py          # App principal (único archivo de producción)
├── scrape_reddit.py                 # Utilidad de scraping
├── scrape_pushshift.ipynb           # Recolección histórica de datos
├── [Notebook]Content Analysis.ipynb # Pipeline completo de análisis (2.9 MB)
├── data_summary.ipynb               # Exploración y estadísticas del dataset
├── requirements.txt
└── image/                           # Assets visuales
```

Los datos crudos (`data/`, CSVs, modelos LDA entrenados) están en `.gitignore` por tamaño.

---

## Fundamento académico

- **Zhu, Jinfei (2021)** — Content analysis on personal finance concerns from Reddit  
- **Blei et al. (2003)** — Latent Dirichlet Allocation  
- **Hutto & Gilbert (2014)** — VADER: A Parsimonious Rule-based Model for Sentiment Analysis  
- **Federal Reserve (2018)** — Report on economic well-being of U.S. households
