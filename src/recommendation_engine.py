import joblib
from typing import Dict, List, Any, Union
from sklearn.pipeline import Pipeline
from src.config import (
    DISEASE_MODEL_PATH,
    SPECIALIST_MODEL_PATH,
    SEVERITY_MODEL_PATH,
    SEVERITY_TFIDF_PATH,
    SERVICE_MAPPING
)
from src.data_preprocessing import (
    load_description_map,
    load_precaution_map
)

class RecommendationEngine:
    """Unified healthcare recommendation engine that predicts disease, severity,

    specialist, and recommended services based on input symptoms, enriched with

    disease descriptions and precautions.

    """
    
    def __init__(self) -> None:
        """Initializes the recommendation engine by loading models and lookup databases."""
        try:
            self.disease_model = joblib.load(str(DISEASE_MODEL_PATH))
            self.specialist_model = joblib.load(str(SPECIALIST_MODEL_PATH))
            self.severity_model = joblib.load(str(SEVERITY_MODEL_PATH))
            
            # Load TF-IDF vectorizer if path exists (required for pre-trained raw model format)
            if SEVERITY_TFIDF_PATH.exists():
                self.severity_tfidf = joblib.load(str(SEVERITY_TFIDF_PATH))
            else:
                self.severity_tfidf = None
        except FileNotFoundError as e:
            raise FileNotFoundError(
                f"Model file not found. Ensure all training scripts have been run first: {e}"
            )
        
        # Load descriptive resources
        self.description_map = load_description_map()
        self.precaution_map = load_precaution_map()
        
    def _clean_symptoms(self, symptoms: Union[str, List[str]]) -> str:
        """Normalizes symptoms into a space-separated string of cleaned symptom tokens."""
        if isinstance(symptoms, list):
            symptoms_list = symptoms
        else:
            # Replace commas or semicolons with spaces to handle multiple formats
            normalized = symptoms.replace(",", " ").replace(";", " ")
            symptoms_list = normalized.split()
            
        # Clean each symptom token (lowercase, strip underscores or spaces)
        cleaned = [s.strip().lower() for s in symptoms_list if s.strip() != ""]
        return " ".join(cleaned)
        
    def recommend(self, symptoms: Union[str, List[str]]) -> Dict[str, Any]:
        """Generates disease, severity, specialist, and service recommendations for input symptoms.

        

        Args:

            symptoms: A string or list of symptoms (e.g., "cough high_fever breathlessness").

            

        Returns:

            A dictionary containing:

                - disease: Predicted disease name

                - severity: Classified severity level (Low, Moderate, Serious, Emergency)

                - specialist: Recommended healthcare specialist type

                - service: Suggested service action (Pharmacy, Telemedicine, Clinic, Emergency Care)

                - description: Text explanation of the predicted disease

                - precautions: List of preventative steps to take

        """
        cleaned_text = self._clean_symptoms(symptoms)
        
        if not cleaned_text:
            return {
                "disease": "Unknown",
                "severity": "Low",
                "specialist": "General Physician",
                "service": "Pharmacy",
                "description": "No symptoms provided.",
                "precautions": []
            }
            
        # Predict targets using trained pipelines
        disease = self.disease_model.predict([cleaned_text])[0]
        specialist = self.specialist_model.predict([cleaned_text])[0]
        
        # Predict severity depending on whether severity_model is a Pipeline or raw classifier
        if isinstance(self.severity_model, Pipeline):
            severity = self.severity_model.predict([cleaned_text])[0]
        else:
            if self.severity_tfidf is None:
                raise ValueError(
                    "The loaded severity model requires a separate TF-IDF vectorizer, "
                    "but severity_tfidf.pkl was not found."
                )
            symptoms_vector = self.severity_tfidf.transform([cleaned_text])
            severity = self.severity_model.predict(symptoms_vector)[0]
        
        # Map severity to service recommendations
        service = SERVICE_MAPPING.get(severity, "Pharmacy")
        
        # Standardize disease name matching (handling possible leading/trailing spaces in models)
        disease_clean = disease.strip()
        
        # Enrich predictions with metadata lookups
        description = self.description_map.get(
            disease_clean, 
            self.description_map.get(disease, "Description not available.")
        )
        precautions = self.precaution_map.get(
            disease_clean, 
            self.precaution_map.get(disease, [])
        )
        
        return {
            "disease": disease,
            "severity": severity,
            "specialist": specialist,
            "service": service,
            "description": description,
            "precautions": precautions
        }
