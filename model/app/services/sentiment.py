"""
Sentiment analysis using a multilingual BERT model.

Uses nlptown/bert-base-multilingual-uncased-sentiment which natively
supports: English, Dutch, German, French, Spanish and Italian.
The model outputs 1–5 stars which we map to a financial stress scale.
"""

from transformers import pipeline
from app.schemas.analysis import AlertPriority, SentimentResponse
from app.i18n import t

_classifier = None


def _get_classifier():
    global _classifier
    if _classifier is None:
        _classifier = pipeline(
            "sentiment-analysis",
            model="nlptown/bert-base-multilingual-uncased-sentiment",
            truncation=True,
            max_length=512,
        )
    return _classifier


# Map star labels to a 0–1 normalized score (1 star = 0.0, 5 stars = 1.0)
_STAR_MAP = {
    "1 star": 0.0,
    "2 stars": 0.25,
    "3 stars": 0.5,
    "4 stars": 0.75,
    "5 stars": 1.0,
}


def analyze(text: str, lang: str = "es") -> SentimentResponse:
    result = _get_classifier()(text)[0]
    star_label = result["label"]
    confidence = result["score"]

    normalized = _STAR_MAP.get(star_label, 0.5)
    energy_level = round(abs(normalized - 0.5) * 2, 4)  # distance from neutral

    is_stressed = normalized <= 0.35

    label = t("sentiment.label_stress", lang) if is_stressed else t("sentiment.label_resilience", lang)
    priority = AlertPriority.CALM if is_stressed else AlertPriority.STRENGTHENING

    if is_stressed:
        recommendation = t("sentiment.rec_stress", lang)
    else:
        recommendation = t("sentiment.rec_resilience", lang)

    return SentimentResponse(
        score=round(normalized, 4),
        label=label,
        energy_level=energy_level,
        alert_priority=priority,
        recommendation=recommendation,
    )
