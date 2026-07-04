# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Union
from contextlib import asynccontextmanager
from src.recommendation_engine import RecommendationEngine

# Create a lifespan manager for clean startup/shutdown resource handling
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load RecommendationEngine (loads ML models and resources once)
    print("FastAPI: Loading ML Models and lookup tables...")
    try:
        app.state.engine = RecommendationEngine()
        app.state.models_loaded = True
    except Exception as e:
        print(f"FastAPI initialization error: {e}")
        app.state.models_loaded = False
        
    yield
    # Clean up resources if any
    print("FastAPI: Shutting down and cleaning resources...")

app = FastAPI(
    title="OHSL Healthcare Recommendation API",
    description="Production-ready API for predicting diseases, severity, recommended specialists, and care levels from symptoms.",
    version="1.0.0",
    lifespan=lifespan
)

# Pydantic Schemas for validation
class PredictRequest(BaseModel):
    symptoms: Union[str, List[str]] = Field(
        ...,
        examples=["itching skin_rash nodal_skin_eruptions", ["cough", "high_fever", "breathlessness"]],
        description="A space-separated string of symptoms or a list of symptom terms."
    )

class PredictResponse(BaseModel):
    disease: str = Field(..., description="The predicted disease.")
    severity: str = Field(..., description="The severity score level classification.")
    specialist: str = Field(..., description="The medical specialist recommended for consultation.")
    service: str = Field(..., description="The level/type of service recommended.")
    description: str = Field(..., description="Brief description of the predicted disease.")
    precautions: List[str] = Field(..., description="Recommended actions or precautions.")

@app.post(
    "/predict",
    response_model=PredictResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate recommendation from symptoms",
    description="Accepts a query of symptoms and returns predictions along with disease description and precautions."
)
async def predict(request: PredictRequest):
    if not getattr(app.state, "models_loaded", False):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Machine learning models are not loaded. Ensure training was completed."
        )
        
    try:
        recommendations = app.state.engine.recommend(request.symptoms)
        return recommendations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating recommendation: {str(e)}"
        )

@app.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Health check endpoint",
    description="Check backend server and model initialization status."
)
async def health():
    models_ready = getattr(app.state, "models_loaded", False)
    return {
        "status": "healthy" if models_ready else "degraded",
        "models_loaded": models_ready
    }
