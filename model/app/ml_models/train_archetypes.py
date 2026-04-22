"""
Train KMeans model for financial archetype classification.

Generates synthetic feature vectors and trains a KMeans(n_clusters=5) model.
Features: [expense_ratio, volatility_coef, ant_ratio, savings_rate]

Run: python -m app.ml_models.train_archetypes
Output: app/ml_models/archetype_kmeans.joblib
"""

import numpy as np
from sklearn.cluster import KMeans
from pathlib import Path
import joblib

OUTPUT = Path(__file__).parent / "archetype_kmeans.joblib"

# Archetype cluster labels ordered by index:
#   0: IMPULSIVO    - high ant_ratio, moderate expense
#   1: CONSERVADOR  - low expense, low savings growth
#   2: PLANIFICADOR - low volatility, good savings
#   3: VOLATIL      - high volatility
#   4: ENDEUDADO    - very high expense ratio

np.random.seed(42)
N = 200  # samples per archetype


def _generate_samples():
    """Generate synthetic training data for each archetype."""

    # [expense_ratio, volatility_coef, ant_ratio, savings_rate]
    impulsivo = np.column_stack([
        np.random.uniform(0.50, 0.80, N),   # expense_ratio
        np.random.uniform(0.15, 0.35, N),   # volatility_coef
        np.random.uniform(0.35, 0.70, N),   # ant_ratio (high)
        np.random.uniform(0.02, 0.15, N),   # savings_rate (low)
    ])

    conservador = np.column_stack([
        np.random.uniform(0.30, 0.55, N),   # expense_ratio (low)
        np.random.uniform(0.05, 0.20, N),   # volatility_coef (low)
        np.random.uniform(0.05, 0.20, N),   # ant_ratio (low)
        np.random.uniform(0.01, 0.10, N),   # savings_rate (low)
    ])

    planificador = np.column_stack([
        np.random.uniform(0.35, 0.60, N),   # expense_ratio (moderate)
        np.random.uniform(0.03, 0.18, N),   # volatility_coef (very low)
        np.random.uniform(0.05, 0.25, N),   # ant_ratio (low)
        np.random.uniform(0.20, 0.45, N),   # savings_rate (high)
    ])

    volatil = np.column_stack([
        np.random.uniform(0.45, 0.80, N),   # expense_ratio (variable)
        np.random.uniform(0.40, 0.80, N),   # volatility_coef (very high)
        np.random.uniform(0.10, 0.40, N),   # ant_ratio (variable)
        np.random.uniform(0.00, 0.20, N),   # savings_rate (variable)
    ])

    endeudado = np.column_stack([
        np.random.uniform(0.85, 1.10, N),   # expense_ratio (very high, >1 means debt)
        np.random.uniform(0.15, 0.50, N),   # volatility_coef
        np.random.uniform(0.10, 0.40, N),   # ant_ratio
        np.random.uniform(-0.10, 0.02, N),  # savings_rate (negative = losing money)
    ])

    X = np.vstack([impulsivo, conservador, planificador, volatil, endeudado])
    return X


def train():
    X = _generate_samples()

    model = KMeans(n_clusters=5, random_state=42, n_init=20, max_iter=500)
    model.fit(X)

    # Verify cluster assignment matches expected archetypes by checking centroids
    centroids = model.cluster_centers_
    print("Cluster centroids [expense_ratio, volatility, ant_ratio, savings]:")
    archetype_names = ["IMPULSIVO", "CONSERVADOR", "PLANIFICADOR", "VOLATIL", "ENDEUDADO"]

    # Map clusters to archetypes by checking which synthetic group each centroid
    # is closest to
    reference_centroids = np.array([
        [0.65, 0.25, 0.525, 0.085],   # IMPULSIVO
        [0.425, 0.125, 0.125, 0.055],  # CONSERVADOR
        [0.475, 0.105, 0.15, 0.325],   # PLANIFICADOR
        [0.625, 0.60, 0.25, 0.10],     # VOLATIL
        [0.975, 0.325, 0.25, -0.04],   # ENDEUDADO
    ])

    for i, centroid in enumerate(centroids):
        distances = np.linalg.norm(reference_centroids - centroid, axis=1)
        closest = archetype_names[np.argmin(distances)]
        print(f"  Cluster {i}: {centroid.round(3)} → {closest}")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, OUTPUT)
    print(f"\nModel saved to {OUTPUT}")
    print(f"Inertia: {model.inertia_:.2f}")


if __name__ == "__main__":
    train()
