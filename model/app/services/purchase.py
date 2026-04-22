import math

from app.schemas.analysis import PurchaseImpactRequest, PurchaseImpactResponse
from app.i18n import t


def _monthly_payment(principal: float, annual_rate: float, months: int) -> float:
    """Amortized monthly payment formula."""
    if annual_rate == 0:
        return principal / months
    r = annual_rate / 100 / 12
    return principal * r * math.pow(1 + r, months) / (math.pow(1 + r, months) - 1)


def analyze(req: PurchaseImpactRequest) -> PurchaseImpactResponse:
    lang = req.lang
    is_financed = req.payment_method == "financed" and req.installment_months is not None

    monthly_pmt: float | None = None
    total_cost: float | None = None
    total_interest: float | None = None
    installment_months: int | None = None

    if is_financed:
        months = req.installment_months
        rate = req.annual_interest_rate or 0.0
        monthly_pmt = round(_monthly_payment(req.price, rate, months), 2)
        total_cost = round(monthly_pmt * months, 2)
        total_interest = round(total_cost - req.price, 2)
        installment_months = months
        # Impact = monthly payment as % of monthly income
        impact_pct = round((monthly_pmt / req.monthly_income) * 100, 2)
    else:
        # Cash: full price vs income
        impact_pct = round((req.price / req.monthly_income) * 100, 2)

    if impact_pct <= 5:
        level = t("purchase.level_low", lang)
        if is_financed:
            recommendation = t("purchase.rec_financed_low", lang,
                               product=req.product_name, pct=impact_pct,
                               monthly_pmt=monthly_pmt, months=installment_months,
                               total_cost=total_cost, total_interest=total_interest)
        else:
            recommendation = t("purchase.rec_low", lang, product=req.product_name, pct=impact_pct)
    elif impact_pct <= 15:
        level = t("purchase.level_medium", lang)
        if is_financed:
            recommendation = t("purchase.rec_financed_medium", lang,
                               product=req.product_name, pct=impact_pct,
                               monthly_pmt=monthly_pmt, months=installment_months,
                               total_cost=total_cost, total_interest=total_interest)
        else:
            recommendation = t("purchase.rec_medium", lang, product=req.product_name, pct=impact_pct)
    else:
        level = t("purchase.level_critical", lang)
        if is_financed:
            recommendation = t("purchase.rec_financed_critical", lang,
                               product=req.product_name, pct=impact_pct,
                               monthly_pmt=monthly_pmt, months=installment_months,
                               total_cost=total_cost, total_interest=total_interest)
        else:
            recommendation = t("purchase.rec_critical", lang, product=req.product_name, pct=impact_pct)

    combined_ratio = None
    if req.current_expense_ratio is not None:
        combined_ratio = round(req.current_expense_ratio + impact_pct, 2)

    return PurchaseImpactResponse(
        impact_pct=impact_pct,
        level=level,
        recommendation=recommendation,
        payment_method=req.payment_method,
        monthly_payment=monthly_pmt,
        total_cost=total_cost,
        total_interest=total_interest,
        installment_months=installment_months,
        combined_ratio_after=combined_ratio,
    )
