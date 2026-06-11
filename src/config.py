import os
from pathlib import Path

# Paths config (relative to project root)
SRC_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SRC_DIR.parent

DATA_DIR = PROJECT_ROOT / "data"
MODELS_DIR = PROJECT_ROOT / "models"

# Dataset paths
DATASET_PATH = DATA_DIR / "dataset.csv"
SEVERITY_CSV_PATH = DATA_DIR / "Symptom-severity.csv"
DESCRIPTION_CSV_PATH = DATA_DIR / "symptom_Description.csv"
PRECAUTION_CSV_PATH = DATA_DIR / "symptom_precaution.csv"

# Model paths
DISEASE_MODEL_PATH = MODELS_DIR / "disease_model.pkl"
SPECIALIST_MODEL_PATH = MODELS_DIR / "specialist_model.pkl"
SEVERITY_MODEL_PATH = MODELS_DIR / "severity_model.pkl"
SEVERITY_TFIDF_PATH = MODELS_DIR / "severity_tfidf.pkl"

# Ensure models directory exists
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Severity Classification Configuration
SEVERITY_THRESHOLDS = {
    "Low": 18,
    "Moderate": 27,
    "Serious": 42
}

# Specialist Mapping Configuration
SPECIALIST_MAPPING = {
    "(vertigo) Paroymsal  Positional Vertigo": "Neurologist",
    "AIDS": "Infectious Disease Specialist",
    "Acne": "Dermatologist",
    "Alcoholic hepatitis": "Gastroenterologist",
    "Allergy": "Allergist",
    "Arthritis": "Orthopedic",
    "Bronchial Asthma": "Pulmonologist",
    "Cervical spondylosis": "Orthopedic",
    "Chicken pox": "Infectious Disease Specialist",
    "Chronic cholestasis": "Gastroenterologist",
    "Common Cold": "General Physician",
    "Dengue": "General Physician",
    "Diabetes ": "Endocrinologist",
    "Dimorphic hemmorhoids(piles)": "General Surgeon",
    "Drug Reaction": "General Physician",
    "Fungal infection": "Dermatologist",
    "GERD": "Gastroenterologist",
    "Gastroenteritis": "Gastroenterologist",
    "Heart attack": "Cardiologist",
    "Hepatitis B": "Gastroenterologist",
    "Hepatitis C": "Gastroenterologist",
    "Hepatitis D": "Gastroenterologist",
    "Hepatitis E": "Gastroenterologist",
    "Hypertension ": "Cardiologist",
    "Hyperthyroidism": "Endocrinologist",
    "Hypoglycemia": "Endocrinologist",
    "Hypothyroidism": "Endocrinologist",
    "Impetigo": "Dermatologist",
    "Jaundice": "Gastroenterologist",
    "Malaria": "General Physician",
    "Migraine": "Neurologist",
    "Osteoarthristis": "Orthopedic",
    "Paralysis (brain hemorrhage)": "Neurologist",
    "Peptic ulcer diseae": "Gastroenterologist",
    "Pneumonia": "Pulmonologist",
    "Psoriasis": "Dermatologist",
    "Tuberculosis": "Pulmonologist",
    "Typhoid": "General Physician",
    "Urinary tract infection": "Urologist",
    "Varicose veins": "Vascular Surgeon",
    "hepatitis A": "Gastroenterologist"
}

# Service Mapping Configuration
SERVICE_MAPPING = {
    "Low": "Pharmacy",
    "Moderate": "Telemedicine",
    "Serious": "Clinic",
    "Emergency": "Emergency Care"
}
