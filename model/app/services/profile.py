"""
Behavioral profiling service.

Analyzes transaction history to:
  1. Classify the user into a spending archetype (KMeans ML when model available,
     rule-based fallback otherwise)
  2. Compute a composite financial wellness score (0–100)
  3. Detect day-of-week spending spikes
  4. Generate plain-language insights & actionable tips (i18n)
"""

from collections import defaultdict
from datetime import datetime
from pathlib import Path
from statistics import mean, stdev
import numpy as np

from app.schemas.analysis import ProfileRequest, ProfileResponse, ScoreBreakdown
from app.i18n import t, get_dict, get_list

# ── KMeans model ──────────────────────────────────────────────────────────────
_MODEL_PATH = Path(__file__).parent.parent / "ml_models" / "archetype_kmeans.joblib"
_ARCHETYPE_KEYS = ["IMPULSIVO", "CONSERVADOR", "PLANIFICADOR", "VOLATIL", "ENDEUDADO"]

_kmeans_model = None
_kmeans_loaded = False


def _get_kmeans():
    global _kmeans_model, _kmeans_loaded
    if not _kmeans_loaded:
        _kmeans_loaded = True
        if _MODEL_PATH.exists():
            import joblib
            _kmeans_model = joblib.load(_MODEL_PATH)
    return _kmeans_model


def _monthly_buckets(transactions):
    """Return dict month_key → list[transaction]."""
    buckets = defaultdict(list)
    for tx in transactions:
        buckets[tx.date[:7]].append(tx)
    return buckets


def _day_of_week_spending(expenses):
    """Return list[float] indexed 0=Mon…6=Sun with average spend per day."""
    by_dow = defaultdict(list)
    for tx in expenses:
        try:
            dow = datetime.strptime(tx.date[:10], "%Y-%m-%d").weekday()
            by_dow[dow].append(tx.amount)
        except ValueError:
            pass
    return [mean(by_dow[d]) if by_dow[d] else 0.0 for d in range(7)]


def _classify_archetype(
    expense_ratio: float,
    volatility_coef: float,
    ant_ratio: float,
    savings_rate: float,
) -> str:
    """Classify using KMeans if available, else rules."""
    model = _get_kmeans()
    if model is not None:
        features = np.array([[expense_ratio, volatility_coef, ant_ratio, savings_rate]])
        cluster = int(model.predict(features)[0])
        return _ARCHETYPE_KEYS[cluster % len(_ARCHETYPE_KEYS)]

    # Rule-based fallback
    if expense_ratio > 0.90:
        return "ENDEUDADO"
    if volatility_coef > 0.40:
        return "VOLATIL"
    if ant_ratio > 0.35:
        return "IMPULSIVO"
    if savings_rate > 0.20 and volatility_coef < 0.20:
        return "PLANIFICADOR"
    if expense_ratio < 0.55 and savings_rate < 0.10:
        return "CONSERVADOR"
    if volatility_coef < 0.20:
        return "PLANIFICADOR"
    return "VOLATIL"


def _compute_score(
    expense_ratio: float,
    savings_rate: float,
    volatility_coef: float,
    has_unusual: bool,
    ant_ratio: float,
    goals_progress: float,
) -> tuple[int, ScoreBreakdown]:
    if expense_ratio <= 0.30:
        ctrl = 30
    elif expense_ratio <= 0.50:
        ctrl = 25
    elif expense_ratio <= 0.70:
        ctrl = 15
    elif expense_ratio <= 0.90:
        ctrl = 8
    else:
        ctrl = 0

    if savings_rate >= 0.20:
        savings = 25
    elif savings_rate >= 0.10:
        savings = 18
    elif savings_rate >= 0.05:
        savings = 10
    elif savings_rate > 0:
        savings = 5
    else:
        savings = 0

    if volatility_coef < 0.10:
        stability = 20
    elif volatility_coef < 0.20:
        stability = 15
    elif volatility_coef < 0.35:
        stability = 8
    else:
        stability = 3

    spike = 0 if has_unusual else 15
    goals = round(goals_progress * 10)
    total = ctrl + savings + stability + spike + goals

    breakdown = ScoreBreakdown(
        spending_control=ctrl,
        savings_habit=savings,
        behavioral_stability=stability,
        no_spikes=spike,
        goal_progress=goals,
    )
    return min(100, total), breakdown


def _score_label(score: int, lang: str) -> str:
    labels = get_dict("profile.score_labels", lang)
    if score >= 80:
        return labels.get("excellent", "Excellent")
    if score >= 65:
        return labels.get("good", "Good")
    if score >= 45:
        return labels.get("regular", "Fair")
    if score >= 25:
        return labels.get("at_risk", "At Risk")
    return labels.get("critical", "Critical")


def analyze(req: ProfileRequest) -> ProfileResponse:
    lang = req.lang
    expenses = [tx for tx in req.transactions if tx.type == "EXPENSE"]
    incomes  = [tx for tx in req.transactions if tx.type == "INCOME"]

    monthly_income = req.monthly_income

    # ── Monthly aggregates ────────────────────────────────────────────────
    exp_buckets = _monthly_buckets(expenses)
    inc_buckets = _monthly_buckets(incomes)
    all_months  = sorted(set(list(exp_buckets) + list(inc_buckets)))

    monthly_exp    = [sum(tx.amount for tx in exp_buckets.get(m, [])) for m in all_months]
    monthly_inc    = [sum(tx.amount for tx in inc_buckets.get(m, [])) for m in all_months]
    monthly_savings = [
        (i - e) / i if i > 0 else 0.0
        for i, e in zip(monthly_inc, monthly_exp)
    ]

    avg_expense  = mean(monthly_exp) if monthly_exp else 0.0
    avg_income   = mean(monthly_inc) if monthly_inc else monthly_income
    avg_savings  = mean(monthly_savings) if monthly_savings else 0.0

    expense_ratio   = avg_expense / avg_income if avg_income > 0 else 1.0
    volatility_coef = (stdev(monthly_exp) / avg_expense
                       if len(monthly_exp) >= 2 and avg_expense > 0 else 0.0)

    # ── Category-level metrics ────────────────────────────────────────────
    by_cat: dict[str, list[float]] = defaultdict(list)
    for tx in expenses:
        by_cat[tx.category].append(tx.amount)

    ant_cats = [
        cat for cat, amounts in by_cat.items()
        if len(amounts) >= 5 and mean(amounts) < monthly_income * 0.02
    ]
    ant_ratio = len(ant_cats) / len(by_cat) if by_cat else 0.0

    # ── Unusual spikes ────────────────────────────────────────────────────
    all_amounts = [tx.amount for tx in expenses]
    has_unusual = False
    if len(all_amounts) >= 3:
        mu, sigma = mean(all_amounts), stdev(all_amounts)
        if sigma > 0:
            has_unusual = any((tx.amount - mu) / sigma > 2.5 for tx in expenses)

    # ── Day-of-week pattern ───────────────────────────────────────────────
    day_names = get_list("profile.day_names", lang)
    dow_avg   = _day_of_week_spending(expenses)
    week_avg  = mean(dow_avg) if any(dow_avg) else 1.0
    spike_days = [
        {"day": day_names[i] if i < len(day_names) else str(i), "multiplier": round(dow_avg[i] / week_avg, 1)}
        for i in range(7)
        if week_avg > 0 and dow_avg[i] > week_avg * 1.5
    ]
    spike_days.sort(key=lambda x: x["multiplier"], reverse=True)

    # ── Archetype & score ─────────────────────────────────────────────────
    archetype_key = _classify_archetype(
        expense_ratio, volatility_coef, ant_ratio, avg_savings
    )
    archetype = get_dict(f"profile.archetypes.{archetype_key}", lang)

    score, breakdown = _compute_score(
        expense_ratio, avg_savings, volatility_coef,
        has_unusual, ant_ratio, req.goals_completion_rate,
    )

    # ── Insights (contextual, localized) ──────────────────────────────────
    insights: list[str] = []

    if spike_days:
        top = spike_days[0]
        insights.append(
            t("profile.insights.spike_day", lang,
              day=top["day"], multiplier=top["multiplier"])
        )

    if ant_cats:
        insights.append(
            t("profile.insights.ant_spending", lang,
              categories=", ".join(ant_cats[:2]))
        )

    if avg_savings < 0.05 and expense_ratio < 0.90:
        insights.append(t("profile.insights.low_savings", lang))

    if volatility_coef > 0.30:
        best_m  = all_months[monthly_exp.index(min(monthly_exp))] if monthly_exp else "—"
        worst_m = all_months[monthly_exp.index(max(monthly_exp))] if monthly_exp else "—"
        insights.append(
            t("profile.insights.high_volatility", lang,
              best_month=best_m, worst_month=worst_m)
        )

    if len(all_months) >= 3 and monthly_exp[-1] > monthly_exp[-2] * 1.20:
        insights.append(t("profile.insights.spending_increase", lang))

    return ProfileResponse(
        archetype_key=archetype_key,
        archetype_emoji=archetype.get("emoji", ""),
        archetype_name=archetype.get("name", archetype_key),
        archetype_description=archetype.get("description", ""),
        archetype_strengths=archetype.get("strengths", ""),
        archetype_risk=archetype.get("risk", ""),
        archetype_tip=archetype.get("tip", ""),
        score=score,
        score_breakdown=breakdown,
        score_label=_score_label(score, lang),
        spike_days=spike_days,
        insights=insights,
        avg_monthly_expense=round(avg_expense, 2),
        avg_savings_rate=round(avg_savings * 100, 1),
        expense_ratio=round(expense_ratio * 100, 1),
        months_analyzed=len(all_months),
    )
