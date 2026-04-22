from fastapi import APIRouter
from app.schemas.analysis import (
    ConcernRequest,
    ConcernResponse,
    FinancialHealthRequest,
    FinancialHealthResponse,
    PredictionRequest,
    PredictionResponse,
    ProfileRequest,
    ProfileResponse,
    PurchaseImpactRequest,
    PurchaseImpactResponse,
    SentimentRequest,
    SentimentResponse,
    SpendingPatternRequest,
    SpendingPatternResponse,
)
from app.services import sentiment, health, patterns, prediction, purchase, profile, concerns

router = APIRouter(tags=["analysis"])


@router.post(
    "/sentiment",
    response_model=SentimentResponse,
    summary="Analyze financial sentiment",
    description="Uses multilingual BERT (nlptown/bert-base-multilingual-uncased-sentiment) "
                "to classify the emotional tone of financial text. Supports Spanish and English. "
                "Returns a normalized 0–1 score, stress label, and a localized recommendation.",
)
def analyze_sentiment(body: SentimentRequest) -> SentimentResponse:
    return sentiment.analyze(body.text, lang=body.lang)


@router.post(
    "/financial-health",
    response_model=FinancialHealthResponse,
    summary="Evaluate financial health",
    description="Rule-based evaluation comparing the user's expense-to-income ratio "
                "against empirical thresholds from Zhu (2022, N=264). "
                "Returns a health level, alert priority, and comparison vs. research data.",
)
def analyze_financial_health(body: FinancialHealthRequest) -> FinancialHealthResponse:
    return health.analyze(
        monthly_income=body.monthly_income,
        fixed_expenses=body.fixed_expenses,
        total_debt=body.total_debt or 0.0,
        financial_stress_level=body.financial_stress_level,
        lang=body.lang,
    )


@router.post(
    "/spending-pattern",
    response_model=SpendingPatternResponse,
    summary="Detect spending patterns",
    description="Analyzes transaction history to identify top spending categories, "
                "ant spending (many small transactions), z-score outlier expenses, "
                "and negative financial patterns. Uses statistical anomaly detection.",
)
def analyze_spending_pattern(body: SpendingPatternRequest) -> SpendingPatternResponse:
    return patterns.analyze(body)


@router.post(
    "/predict-expenses",
    response_model=PredictionResponse,
    summary="Predict future expenses",
    description="Trains LinearRegression and RandomForestRegressor on monthly expense history, "
                "auto-selects the best model by R², and projects expenses for the next 1–3 months. "
                "Feature engineering includes day-of-week distribution and quincena patterns.",
)
def predict_expenses(body: PredictionRequest) -> PredictionResponse:
    return prediction.analyze(body)


@router.post(
    "/purchase-impact",
    response_model=PurchaseImpactResponse,
    summary="Assess purchase impact",
    description="Calculates the financial impact of a potential purchase as a percentage "
                "of monthly income. Returns impact level (LOW/MEDIUM/CRITICAL) and a "
                "localized recommendation.",
)
def analyze_purchase_impact(body: PurchaseImpactRequest) -> PurchaseImpactResponse:
    return purchase.analyze(body)


@router.post(
    "/profile",
    response_model=ProfileResponse,
    summary="Generate behavioral profile",
    description="Classifies the user into one of 5 financial archetypes using KMeans clustering "
                "(with rule-based fallback). Computes a 0–100 wellness score, detects day-of-week "
                "spending spikes, and generates localized insights.",
)
def analyze_profile(body: ProfileRequest) -> ProfileResponse:
    return profile.analyze(body)


@router.post(
    "/concerns",
    response_model=ConcernResponse,
    summary="Classify financial concern",
    description="Uses TF-IDF + LogisticRegression trained on bilingual (es/en) financial phrases "
                "to classify free-text into one of 7 concern categories: DEBT, SAVINGS, ANT_SPENDING, "
                "INSURANCE, INVESTMENT, RETIREMENT, OTHER. Returns category, confidence, and top keywords.",
)
def classify_concern(body: ConcernRequest) -> ConcernResponse:
    return concerns.analyze(body.text, lang=body.lang)
