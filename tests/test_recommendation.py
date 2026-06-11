import pytest
from src.recommendation_engine import RecommendationEngine

@pytest.fixture(scope="module")
def engine():
    return RecommendationEngine()

def test_engine_recommendation_fungal(engine):
    # Fungal infection symptoms
    result = engine.recommend("itching skin_rash nodal_skin_eruptions")
    
    assert "disease" in result
    assert "severity" in result
    assert "specialist" in result
    assert "service" in result
    assert "description" in result
    assert "precautions" in result
    
    assert result["disease"] == "Fungal infection"
    assert result["severity"] == "Low"
    assert result["specialist"] == "Dermatologist"
    assert result["service"] == "Pharmacy"
    assert "fungal" in result["description"].lower()
    assert len(result["precautions"]) > 0

def test_engine_recommendation_asthma(engine):
    # Asthma symptoms
    result = engine.recommend("cough high_fever breathlessness")
    
    assert result["disease"] == "Bronchial Asthma"
    assert result["specialist"] == "Pulmonologist"
    assert result["severity"] == "Emergency"
    assert result["service"] == "Emergency Care"

def test_engine_recommendation_empty(engine):
    # Empty query fallback behavior
    result = engine.recommend("")
    assert result["disease"] == "Unknown"
    assert result["severity"] == "Low"
    assert result["specialist"] == "General Physician"
    assert result["service"] == "Pharmacy"
    assert result["precautions"] == []
