from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.analysis import router as analysis_router


def _ensure_ml_models():
    """Train ML models if .joblib files don't exist yet."""
    ml_dir = Path(__file__).parent / "app" / "ml_models"

    if not (ml_dir / "archetype_kmeans.joblib").exists():
        from app.ml_models.train_archetypes import train as train_archetypes
        print("Training archetype KMeans model...")
        train_archetypes()

    if not (ml_dir / "concern_classifier.joblib").exists():
        from app.ml_models.train_concerns import train as train_concerns
        print("Training concern classifier model...")
        train_concerns()


@asynccontextmanager
async def lifespan(app: FastAPI):
    _ensure_ml_models()
    yield


app = FastAPI(
    title="Finmo Model API",
    description="ML micro-service for financial behavior analysis, sentiment detection, "
                "expense prediction, and behavioral profiling.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router, prefix="/analysis")


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
