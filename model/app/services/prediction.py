from collections import defaultdict
from datetime import datetime
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from app.schemas.analysis import MonthPrediction, PredictionRequest, PredictionResponse
from app.i18n import t


def _month_key(date_str: str) -> str:
    return date_str[:7]  # "YYYY-MM"


def _month_index(month_key: str) -> int:
    y, m = map(int, month_key.split("-"))
    return y * 12 + m


def _next_month(month_key: str, offset: int) -> str:
    y, m = map(int, month_key.split("-"))
    m += offset
    y += (m - 1) // 12
    m = (m - 1) % 12 + 1
    return f"{y}-{m:02d}"


def _day_of_week_features(transactions, month_key: str) -> dict:
    """Count expenses per day-of-week for a given month."""
    counts = [0] * 7
    for tx in transactions:
        if tx.type == "EXPENSE" and tx.date[:7] == month_key:
            dt = datetime.fromisoformat(tx.date[:10])
            counts[dt.weekday()] += tx.amount
    return counts


def analyze(req: PredictionRequest) -> PredictionResponse:
    lang = req.lang
    expenses = [tx for tx in req.transactions if tx.type == "EXPENSE"]

    monthly_totals: dict[str, float] = defaultdict(float)
    for tx in expenses:
        monthly_totals[_month_key(tx.date)] += tx.amount

    sorted_months = sorted(monthly_totals.keys())
    avg = round(sum(monthly_totals.values()) / len(monthly_totals), 2) if monthly_totals else 0.0

    if len(sorted_months) < 2:
        # Not enough data for regression — return simple average
        last_month = sorted_months[-1] if sorted_months else _month_key(
            datetime.now().isoformat()
        )
        predictions = [
            MonthPrediction(
                month=_next_month(last_month, i + 1),
                predicted_expense=avg,
                confidence=t("prediction.confidence_low", lang),
            )
            for i in range(req.months_to_predict)
        ]
        return PredictionResponse(
            predictions=predictions,
            trend=t("prediction.trend_stable", lang),
            avg_monthly_expense=avg,
            model_used="average_fallback",
            model_score=0.0,
        )

    # ── Feature engineering ──────────────────────────────────────────────
    X_base = np.array([_month_index(m) for m in sorted_months]).reshape(-1, 1)
    y = np.array([monthly_totals[m] for m in sorted_months])

    # Extended features: month_index, day_of_week distribution (7 features),
    # is_quincena flag (based on count of txns on 15th or 30th)
    features = []
    for m in sorted_months:
        idx = _month_index(m)
        dow = _day_of_week_features(req.transactions, m)
        month_num = int(m.split("-")[1])
        # quincena: count transactions around 15th and end of month
        quincena_count = sum(
            1 for tx in expenses
            if tx.date[:7] == m and int(tx.date[8:10]) in (14, 15, 16, 28, 29, 30, 31)
        )
        features.append([idx, month_num, quincena_count] + dow)

    X_ext = np.array(features)

    # ── Train two models and pick the best ───────────────────────────────
    lr = LinearRegression()
    lr.fit(X_base, y)
    lr_r2 = float(lr.score(X_base, y))

    model_used = "linear_regression"
    best_model = lr
    best_r2 = lr_r2
    use_extended = False

    if len(sorted_months) >= 4:
        rf = RandomForestRegressor(n_estimators=50, max_depth=5, random_state=42)
        rf.fit(X_ext, y)
        rf_r2 = float(rf.score(X_ext, y))
        if rf_r2 > lr_r2:
            best_model = rf
            best_r2 = rf_r2
            model_used = "random_forest"
            use_extended = True

    best_r2 = round(best_r2, 4)

    last_idx = _month_index(sorted_months[-1])
    last_month_num = int(sorted_months[-1].split("-")[1])
    # Average dow distribution for future prediction
    avg_dow = np.mean([_day_of_week_features(req.transactions, m) for m in sorted_months], axis=0).tolist()
    avg_quincena = int(np.mean([f[2] for f in features]))

    predictions: list[MonthPrediction] = []
    for i in range(1, req.months_to_predict + 1):
        future_idx = last_idx + i
        future_month_num = ((last_month_num + i - 1) % 12) + 1

        if use_extended:
            future_feat = np.array([[future_idx, future_month_num, avg_quincena] + avg_dow])
            predicted = float(best_model.predict(future_feat)[0])
        else:
            predicted = float(best_model.predict([[future_idx]])[0])

        predicted = max(0.0, round(predicted, 2))

        if best_r2 >= 0.7:
            confidence = t("prediction.confidence_high", lang)
        elif best_r2 >= 0.4:
            confidence = t("prediction.confidence_medium", lang)
        else:
            confidence = t("prediction.confidence_low", lang)

        predictions.append(
            MonthPrediction(
                month=_next_month(sorted_months[-1], i),
                predicted_expense=predicted,
                confidence=confidence,
            )
        )

    slope = lr.coef_[0]
    if slope > avg * 0.03:
        trend = t("prediction.trend_increasing", lang)
    elif slope < -avg * 0.03:
        trend = t("prediction.trend_decreasing", lang)
    else:
        trend = t("prediction.trend_stable", lang)

    return PredictionResponse(
        predictions=predictions,
        trend=trend,
        avg_monthly_expense=avg,
        model_used=model_used,
        model_score=best_r2,
    )
