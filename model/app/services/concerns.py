"""
Financial concern classifier using TF-IDF + LogisticRegression.

Classifies user text into one of these financial concern categories:
  DEBT, SAVINGS, ANT_SPENDING, INSURANCE, INVESTMENT, RETIREMENT, OTHER

Uses pre-trained models from app/ml_models/ if available,
otherwise falls back to keyword matching.
"""

from pathlib import Path
import numpy as np
from app.schemas.analysis import ConcernResponse
from app.i18n import t, get_dict

_MODEL_DIR = Path(__file__).parent.parent / "ml_models"
_VECTORIZER_PATH = _MODEL_DIR / "concern_vectorizer.joblib"
_CLASSIFIER_PATH = _MODEL_DIR / "concern_classifier.joblib"

_vectorizer = None
_classifier = None
_models_loaded = False

_CATEGORIES = ["DEBT", "SAVINGS", "ANT_SPENDING", "INSURANCE", "INVESTMENT", "RETIREMENT", "OTHER"]

# Keyword fallback when no ML model is available
_KEYWORDS = {
    "DEBT": {"deuda", "préstamo", "prestamo", "crédito", "credito", "mora", "embargo",
             "debt", "loan", "credit", "owe", "mortgage", "interest"},
    "SAVINGS": {"ahorro", "guardar", "reserva", "fondo", "emergencia",
                "saving", "save", "emergency fund", "reserve"},
    "ANT_SPENDING": {"hormiga", "pequeño", "café", "snack", "suscripción", "impulso",
                     "ant spending", "small purchase", "impulse", "subscription", "coffee"},
    "INSURANCE": {"seguro", "póliza", "poliza", "cobertura", "prima",
                  "insurance", "policy", "coverage", "premium"},
    "INVESTMENT": {"inversión", "inversion", "invertir", "acciones", "bolsa", "fondo",
                   "invest", "stock", "portfolio", "return", "dividend"},
    "RETIREMENT": {"jubilación", "jubilacion", "pensión", "pension", "retiro", "vejez",
                   "retirement", "retire", "pension", "401k"},
}


def _load_models():
    global _vectorizer, _classifier, _models_loaded
    if not _models_loaded:
        _models_loaded = True
        if _VECTORIZER_PATH.exists() and _CLASSIFIER_PATH.exists():
            import joblib
            _vectorizer = joblib.load(_VECTORIZER_PATH)
            _classifier = joblib.load(_CLASSIFIER_PATH)


def _keyword_classify(text: str) -> tuple[str, float]:
    lowered = text.lower()
    scores = {}
    for cat, keywords in _KEYWORDS.items():
        hits = sum(1 for kw in keywords if kw in lowered)
        if hits:
            scores[cat] = hits

    if not scores:
        return "OTHER", 0.3

    best = max(scores, key=scores.get)
    confidence = min(0.85, scores[best] / (sum(scores.values()) + 1))
    return best, round(confidence, 4)


def analyze(text: str, lang: str = "es") -> ConcernResponse:
    _load_models()

    top_keywords: list[str] = []

    if _vectorizer is not None and _classifier is not None:
        X = _vectorizer.transform([text])
        proba = _classifier.predict_proba(X)[0]
        idx = int(np.argmax(proba))
        category = _classifier.classes_[idx]
        confidence = round(float(proba[idx]), 4)

        # Extract top TF-IDF features for this text
        feature_names = _vectorizer.get_feature_names_out()
        tfidf_scores = X.toarray()[0]
        top_indices = tfidf_scores.argsort()[-5:][::-1]
        top_keywords = [feature_names[i] for i in top_indices if tfidf_scores[i] > 0]
    else:
        category, confidence = _keyword_classify(text)
        lowered = text.lower()
        if category in _KEYWORDS:
            top_keywords = [kw for kw in _KEYWORDS[category] if kw in lowered][:5]

    labels = get_dict("concerns.categories", lang)
    category_label = labels.get(category, category)

    return ConcernResponse(
        category=category,
        category_label=category_label,
        confidence=confidence,
        top_keywords=top_keywords,
    )
