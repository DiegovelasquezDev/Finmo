"""
Train TF-IDF + LogisticRegression model for financial concern classification.

Uses synthetic bilingual training data (Spanish + English) with phrases
that represent each financial concern category.

Run: python -m app.ml_models.train_concerns
Output: app/ml_models/concern_vectorizer.joblib, concern_classifier.joblib
"""

from pathlib import Path
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
import joblib

OUTPUT_DIR = Path(__file__).parent

# Bilingual training data — representative phrases per category
TRAINING_DATA = {
    "DEBT": [
        # Spanish
        "tengo muchas deudas y no sé cómo pagarlas",
        "me preocupa mi tarjeta de crédito",
        "debo mucho dinero al banco",
        "no puedo pagar mis cuotas del préstamo",
        "estoy en mora con el banco",
        "los intereses de mi crédito me están ahogando",
        "tengo deudas acumuladas de varios meses",
        "no logro salir de las deudas",
        "cada mes pago más intereses que capital",
        "mi deuda crece más rápido de lo que pago",
        "estoy endeudado hasta el cuello",
        "necesito reestructurar mis deudas",
        "las cuotas del préstamo hipotecario me agobian",
        "debo plata a varias personas",
        "mi crédito de consumo es muy alto",
        # English
        "I have too much debt and can't pay it off",
        "my credit card balance keeps growing",
        "I owe a lot of money to the bank",
        "I can't keep up with my loan payments",
        "I'm behind on my mortgage payments",
        "interest rates are killing me financially",
        "I'm drowning in student loan debt",
        "my debt to income ratio is terrible",
        "I need a debt consolidation plan",
        "how do I get out of credit card debt",
    ],
    "SAVINGS": [
        # Spanish
        "quiero empezar a ahorrar pero no sé cómo",
        "no logro guardar dinero a fin de mes",
        "necesito un fondo de emergencia",
        "me cuesta ahorrar con mis gastos actuales",
        "quiero ahorrar para comprar casa",
        "no tengo ahorros para emergencias",
        "cada mes gasto todo lo que gano",
        "quiero crear un hábito de ahorro",
        "cuánto debería ahorrar mensualmente",
        "cómo puedo ahorrar ganando poco",
        "mis ahorros no alcanzan para nada",
        "necesito mejorar mi capacidad de ahorro",
        "quiero tener un colchón financiero",
        "me preocupa no tener reservas",
        "cómo puedo ahorrar para el futuro",
        # English
        "I want to start saving but don't know how",
        "I can't seem to save any money each month",
        "I need to build an emergency fund",
        "how much should I save monthly",
        "I spend everything I earn",
        "I want to save for a house down payment",
        "my savings account is always empty",
        "tips for saving money on a tight budget",
        "I need better saving habits",
        "how to save when expenses are high",
    ],
    "ANT_SPENDING": [
        # Spanish
        "gasto mucho en cosas pequeñas sin darme cuenta",
        "los cafés y snacks me salen caros al mes",
        "tengo muchas suscripciones que no uso",
        "compro por impulso cosas que no necesito",
        "mis gastos hormiga se comen mi salario",
        "gasto en tonterías todos los días",
        "no me doy cuenta en qué se me va el dinero",
        "las compras pequeñas me están arruinando",
        "gasto mucho en delivery y comida rápida",
        "mis gastos del día a día son excesivos",
        "compro café todos los días y es mucho al mes",
        "las apps de delivery me hacen gastar mucho",
        "mis gastos menores suman más de lo que creo",
        "tengo el hábito de comprar impulsivamente",
        "cada compra pequeña parece nada pero suman",
        # English
        "I spend too much on small things without realizing",
        "coffee and snacks add up to a lot each month",
        "I have too many subscriptions I don't use",
        "impulse buying is destroying my budget",
        "my daily small purchases are eating my salary",
        "I don't know where my money goes each day",
        "small purchases are ruining my finances",
        "I spend too much on food delivery",
        "my minor expenses are more than I think",
        "how to stop impulse buying habits",
    ],
    "INSURANCE": [
        # Spanish
        "necesito un seguro de vida pero son caros",
        "no tengo seguro médico y me preocupa",
        "debería contratar un seguro de hogar",
        "cuánto cuesta un buen seguro de salud",
        "no entiendo las pólizas de seguros",
        "me preocupa no tener cobertura médica",
        "los seguros son muy caros para mi presupuesto",
        "necesito asegurar mi carro pero es costoso",
        "vale la pena un seguro de vida a mi edad",
        "qué tipo de seguro necesito primero",
        # English
        "I need life insurance but it's expensive",
        "I don't have health insurance and I'm worried",
        "should I get home insurance",
        "how much does good health coverage cost",
        "insurance premiums are too high for my budget",
        "I need car insurance but can't afford it",
        "is life insurance worth it at my age",
        "what type of insurance should I get first",
        "I don't understand insurance policies",
        "my insurance deductible is too high",
    ],
    "INVESTMENT": [
        # Spanish
        "quiero empezar a invertir pero no sé en qué",
        "cómo puedo invertir con poco dinero",
        "las acciones me dan miedo por la volatilidad",
        "debería invertir en fondos de inversión",
        "cuál es la mejor inversión para principiantes",
        "quiero que mi dinero trabaje para mí",
        "me interesa invertir en bienes raíces",
        "cómo diversificar mis inversiones",
        "es buen momento para invertir en bolsa",
        "quiero generar ingresos pasivos invirtiendo",
        # English
        "I want to start investing but don't know where",
        "how can I invest with little money",
        "stocks scare me because of volatility",
        "should I invest in index funds",
        "what's the best investment for beginners",
        "I want my money to work for me",
        "I'm interested in real estate investing",
        "how to diversify my portfolio",
        "is it a good time to invest in stocks",
        "I want passive income from investments",
    ],
    "RETIREMENT": [
        # Spanish
        "no tengo plan de pensión y ya tengo 40 años",
        "me preocupa mi jubilación",
        "cuánto necesito para retirarme",
        "no he ahorrado nada para la vejez",
        "debería empezar a planificar mi retiro",
        "mi pensión no va a alcanzar para vivir",
        "cómo puedo prepararme para la jubilación",
        "a qué edad puedo jubilarme con lo que tengo",
        "necesito un plan de retiro complementario",
        "me da ansiedad pensar en la vejez sin dinero",
        # English
        "I don't have a retirement plan and I'm already 40",
        "I'm worried about retirement",
        "how much do I need to retire comfortably",
        "I haven't saved anything for old age",
        "I should start planning for retirement",
        "my pension won't be enough to live on",
        "how can I prepare for retirement",
        "at what age can I retire with what I have",
        "I need a supplemental retirement plan",
        "thinking about growing old without money gives me anxiety",
    ],
}


def train():
    texts = []
    labels = []
    for category, phrases in TRAINING_DATA.items():
        texts.extend(phrases)
        labels.extend([category] * len(phrases))

    vectorizer = TfidfVectorizer(
        max_features=3000,
        ngram_range=(1, 2),
        min_df=1,
        strip_accents="unicode",
        lowercase=True,
    )
    X = vectorizer.fit_transform(texts)

    classifier = LogisticRegression(
        max_iter=1000,
        solver="lbfgs",
        C=1.0,
        random_state=42,
    )
    classifier.fit(X, labels)

    # Cross-validation
    scores = cross_val_score(classifier, X, labels, cv=3, scoring="accuracy")
    print(f"Cross-val accuracy: {scores.mean():.3f} (+/- {scores.std():.3f})")
    print(f"Classes: {classifier.classes_}")
    print(f"Features: {X.shape[1]}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(vectorizer, OUTPUT_DIR / "concern_vectorizer.joblib")
    joblib.dump(classifier, OUTPUT_DIR / "concern_classifier.joblib")
    print(f"Models saved to {OUTPUT_DIR}")


if __name__ == "__main__":
    train()
