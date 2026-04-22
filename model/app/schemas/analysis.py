from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional


# ── Shared ──────────────────────────────────────────────────────────────────

class TransactionItem(BaseModel):
    amount: float
    type: str                   # "INCOME" | "EXPENSE"
    category: str
    date: str                   # ISO date string


class HealthLevel(str, Enum):
    HIGH_SECURITY = "ALTA_SEGURIDAD"
    BALANCED = "EQUILIBRIO"
    HIGH_BURDEN = "CARGA_ELEVADA"
    CRITICAL = "CRITICO"


class AlertPriority(str, Enum):
    REDUCTION = "REDUCCION"
    CALM = "CALMA"
    STRENGTHENING = "FORTALECIMIENTO"
    CRITICAL = "CRITICO"


# ── Sentiment ────────────────────────────────────────────────────────────────

class SentimentRequest(BaseModel):
    text: str = Field(..., min_length=3, max_length=2000)
    lang: str = Field(default="es", pattern="^(es|en)$")


class SentimentResponse(BaseModel):
    score: float                # 1–5 star mapping → 0.0–1.0
    label: str                  # "CHRONIC_STRESS" / "ESTRES_CRONICO" etc.
    energy_level: float         # abs(normalized), 0.0–1.0
    alert_priority: AlertPriority
    recommendation: str


# ── Financial health ─────────────────────────────────────────────────────────

class FinancialHealthRequest(BaseModel):
    monthly_income: float = Field(..., gt=0)
    fixed_expenses: float = Field(..., ge=0)
    total_debt: Optional[float] = Field(default=0.0, ge=0)
    financial_stress_level: Optional[int] = Field(default=None, ge=1, le=5)
    lang: str = Field(default="es", pattern="^(es|en)$")


class FinancialHealthResponse(BaseModel):
    health_ratio: float         # (fixed_expenses / income) * 100
    level: HealthLevel
    alert_priority: AlertPriority
    vs_research_thresholds: dict  # comparison against study data
    recommendation: str


# ── Spending patterns ────────────────────────────────────────────────────────

class SpendingPatternRequest(BaseModel):
    transactions: list[TransactionItem]
    monthly_income: float = Field(..., gt=0)
    lang: str = Field(default="es", pattern="^(es|en)$")


class CategorySummary(BaseModel):
    category: str
    total: float
    percentage_of_income: float
    transaction_count: int
    is_ant_spending: bool       # many small transactions in same category


class SpendingPatternResponse(BaseModel):
    top_categories: list[CategorySummary]
    ant_spending_detected: bool
    unusual_expenses: list[dict]  # transactions that deviate significantly
    negative_patterns: list[str]  # human-readable pattern descriptions
    total_expenses: float
    expense_to_income_ratio: float


# ── Expense prediction ───────────────────────────────────────────────────────

class PredictionRequest(BaseModel):
    transactions: list[TransactionItem]
    months_to_predict: int = Field(default=1, ge=1, le=3)
    lang: str = Field(default="es", pattern="^(es|en)$")


class MonthPrediction(BaseModel):
    month: str                  # "2025-06"
    predicted_expense: float
    confidence: str             # "ALTA"/"HIGH" | "MEDIA"/"MEDIUM" | "BAJA"/"LOW"


class PredictionResponse(BaseModel):
    predictions: list[MonthPrediction]
    trend: str                  # "CRECIENTE"/"INCREASING" | "ESTABLE"/"STABLE" | "DECRECIENTE"/"DECREASING"
    avg_monthly_expense: float
    model_used: str             # "linear_regression" | "random_forest"
    model_score: float          # R² of the best model


# ── Purchase impact ──────────────────────────────────────────────────────────

class PurchaseImpactRequest(BaseModel):
    product_name: str
    price: float = Field(..., gt=0)
    monthly_income: float = Field(..., gt=0)
    payment_method: str = Field(default="cash", pattern="^(cash|financed)$")
    installment_months: Optional[int] = Field(default=None, ge=1, le=120)
    annual_interest_rate: Optional[float] = Field(default=None, ge=0, le=100)
    current_expense_ratio: Optional[float] = Field(default=None, ge=0, le=100)
    lang: str = Field(default="es", pattern="^(es|en)$")


class PurchaseImpactResponse(BaseModel):
    impact_pct: float           # effective cost / monthly_income * 100
    level: str                  # "IMPACTO_BAJO" | "LOW_IMPACT" etc.
    recommendation: str
    payment_method: str         # "cash" | "financed"
    monthly_payment: Optional[float]       # monthly installment if financed
    total_cost: Optional[float]            # total with interest if financed
    total_interest: Optional[float]        # total interest paid if financed
    installment_months: Optional[int]      # number of months if financed
    combined_ratio_after: Optional[float]  # health ratio after purchase


# ── Behavioral profile ───────────────────────────────────────────────────────

class ProfileRequest(BaseModel):
    transactions: list[TransactionItem]
    monthly_income: float = Field(..., gt=0)
    goals_completion_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    lang: str = Field(default="es", pattern="^(es|en)$")


class ScoreBreakdown(BaseModel):
    spending_control: int       # 0–30
    savings_habit: int          # 0–25
    behavioral_stability: int   # 0–20
    no_spikes: int              # 0–15
    goal_progress: int          # 0–10


class SpikeDayInfo(BaseModel):
    day: str
    multiplier: float


class ProfileResponse(BaseModel):
    archetype_key: str
    archetype_emoji: str
    archetype_name: str
    archetype_description: str
    archetype_strengths: str
    archetype_risk: str
    archetype_tip: str
    score: int                  # 0–100
    score_label: str            # "Excelente"/"Excellent" etc.
    score_breakdown: ScoreBreakdown
    spike_days: list[SpikeDayInfo]
    insights: list[str]
    avg_monthly_expense: float
    avg_savings_rate: float     # percentage
    expense_ratio: float        # percentage
    months_analyzed: int


# ── Financial concern classification ─────────────────────────────────────────

class ConcernRequest(BaseModel):
    text: str = Field(..., min_length=3, max_length=2000)
    lang: str = Field(default="es", pattern="^(es|en)$")


class ConcernResponse(BaseModel):
    category: str               # "DEBT" | "SAVINGS" | "ANT_SPENDING" | etc.
    category_label: str         # Localized label
    confidence: float           # 0.0–1.0
    top_keywords: list[str]     # top TF-IDF features that triggered the classification
