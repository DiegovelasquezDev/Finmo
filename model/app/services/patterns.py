from collections import defaultdict
from statistics import mean, stdev
from app.schemas.analysis import (
    CategorySummary,
    SpendingPatternRequest,
    SpendingPatternResponse,
)
from app.i18n import t

# A category is "ant spending" when it has many small transactions
_ANT_MIN_COUNT = 5
_ANT_MAX_UNIT_PCT = 2.0    # each transaction < 2% of income
_UNUSUAL_SIGMA = 2.0       # flag transactions beyond 2 standard deviations


def analyze(req: SpendingPatternRequest) -> SpendingPatternResponse:
    lang = req.lang
    expenses = [tx for tx in req.transactions if tx.type == "EXPENSE"]
    total_expenses = sum(tx.amount for tx in expenses)
    expense_to_income = round((total_expenses / req.monthly_income) * 100, 2)

    # Group by category
    by_category: dict[str, list[float]] = defaultdict(list)
    for tx in expenses:
        by_category[tx.category].append(tx.amount)

    # Build category summaries sorted by total desc
    summaries: list[CategorySummary] = []
    for category, amounts in by_category.items():
        total = sum(amounts)
        count = len(amounts)
        avg_unit = total / count if count else 0
        pct_of_income = round((avg_unit / req.monthly_income) * 100, 2)
        is_ant = count >= _ANT_MIN_COUNT and pct_of_income < _ANT_MAX_UNIT_PCT

        summaries.append(
            CategorySummary(
                category=category,
                total=round(total, 2),
                percentage_of_income=round((total / req.monthly_income) * 100, 2),
                transaction_count=count,
                is_ant_spending=is_ant,
            )
        )

    summaries.sort(key=lambda s: s.total, reverse=True)
    ant_detected = any(s.is_ant_spending for s in summaries)

    # Detect unusual expense amounts (global outlier detection)
    all_amounts = [tx.amount for tx in expenses]
    unusual: list[dict] = []
    if len(all_amounts) >= 3:
        mu = mean(all_amounts)
        sigma = stdev(all_amounts)
        if sigma > 0:
            for tx in expenses:
                z = (tx.amount - mu) / sigma
                if z > _UNUSUAL_SIGMA:
                    unusual.append({
                        "category": tx.category,
                        "amount": tx.amount,
                        "date": tx.date,
                        "z_score": round(z, 2),
                    })

    # Build human-readable negative patterns (localized)
    negative_patterns: list[str] = []
    if expense_to_income > 75:
        negative_patterns.append(t("patterns.expense_over_75", lang))
    if ant_detected:
        ant_cats = [s.category for s in summaries if s.is_ant_spending]
        negative_patterns.append(
            t("patterns.ant_spending", lang, categories=", ".join(ant_cats))
        )
    if unusual:
        negative_patterns.append(
            t("patterns.unusual_count", lang, count=len(unusual))
        )
    top = summaries[0] if summaries else None
    if top and top.percentage_of_income > 40:
        negative_patterns.append(
            t("patterns.top_category_over_40", lang, category=top.category)
        )

    return SpendingPatternResponse(
        top_categories=summaries[:5],
        ant_spending_detected=ant_detected,
        unusual_expenses=unusual,
        negative_patterns=negative_patterns,
        total_expenses=round(total_expenses, 2),
        expense_to_income_ratio=expense_to_income,
    )
