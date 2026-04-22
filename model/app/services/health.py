import json
from pathlib import Path
from app.schemas.analysis import (
    AlertPriority,
    FinancialHealthResponse,
    HealthLevel,
)
from app.i18n import t

# Load empirical thresholds from config file
_CONFIG_PATH = Path(__file__).parent.parent / "config" / "research_thresholds.json"
with open(_CONFIG_PATH, encoding="utf-8") as _f:
    _cfg = json.load(_f)
    _RESEARCH_THRESHOLDS: dict[str, int] = _cfg["thresholds"]

_STUDY_CRITICAL_AVG = sum(_RESEARCH_THRESHOLDS.values()) / len(_RESEARCH_THRESHOLDS)


def analyze(
    monthly_income: float,
    fixed_expenses: float,
    total_debt: float = 0.0,
    financial_stress_level: int | None = None,
    lang: str = "es",
) -> FinancialHealthResponse:
    health_ratio = round((fixed_expenses / monthly_income) * 100, 2)

    if health_ratio <= 30:
        level = HealthLevel.HIGH_SECURITY
        priority = AlertPriority.STRENGTHENING
        recommendation = t("health.rec_high_security", lang)
    elif health_ratio <= 50:
        level = HealthLevel.BALANCED
        priority = AlertPriority.STRENGTHENING
        recommendation = t("health.rec_balanced", lang)
    elif health_ratio <= 75:
        level = HealthLevel.HIGH_BURDEN
        priority = AlertPriority.REDUCTION
        recommendation = t("health.rec_high_burden", lang)
    else:
        level = HealthLevel.CRITICAL
        priority = AlertPriority.CRITICAL
        recommendation = t("health.rec_critical", lang)

    # Adjust priority if user reports high stress (self-reported level 4-5)
    if financial_stress_level and financial_stress_level >= 4 and priority != AlertPriority.CRITICAL:
        priority = AlertPriority.CALM

    vs_thresholds = {
        category: {
            "critical_threshold_pct": threshold,
            "user_ratio": health_ratio,
            "exceeds": health_ratio > threshold,
        }
        for category, threshold in _RESEARCH_THRESHOLDS.items()
    }
    vs_thresholds["study_average"] = {
        "critical_threshold_pct": _STUDY_CRITICAL_AVG,
        "user_ratio": health_ratio,
        "exceeds": health_ratio > _STUDY_CRITICAL_AVG,
    }

    return FinancialHealthResponse(
        health_ratio=health_ratio,
        level=level,
        alert_priority=priority,
        vs_research_thresholds=vs_thresholds,
        recommendation=recommendation,
    )
