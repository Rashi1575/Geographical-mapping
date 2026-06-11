import pandas as pd
from typing import Dict, List, Any
from src.config import (
    SEVERITY_THRESHOLDS,
    SPECIALIST_MAPPING,
    SERVICE_MAPPING,
    SEVERITY_CSV_PATH,
    DESCRIPTION_CSV_PATH,
    PRECAUTION_CSV_PATH
)

def load_data(file_path: str) -> pd.DataFrame:
    """Loads CSV data into a pandas DataFrame."""
    try:
        return pd.read_csv(file_path)
    except Exception as e:
        raise FileNotFoundError(f"Failed to load dataset from {file_path}: {e}")

def load_severity_map() -> Dict[str, int]:
    """Loads and formats the symptom-severity map."""
    df = load_data(str(SEVERITY_CSV_PATH))
    # Remove leading/trailing whitespaces from symptom names
    severity_map = dict(
        zip(
            df["Symptom"].str.strip(),
            df["weight"]
        )
    )
    return severity_map

def load_description_map() -> Dict[str, str]:
    """Loads and formats the disease-description map."""
    df = load_data(str(DESCRIPTION_CSV_PATH))
    description_map = {}
    for _, row in df.iterrows():
        disease = str(row["Disease"]).strip()
        desc = str(row["Description"]).strip()
        description_map[disease] = desc
    return description_map

def load_precaution_map() -> Dict[str, List[str]]:
    """Loads and formats the disease-precaution map, filtering out empty values."""
    df = load_data(str(PRECAUTION_CSV_PATH))
    precaution_map = {}
    precaution_cols = [c for c in df.columns if "Precaution" in c]
    for _, row in df.iterrows():
        disease = str(row["Disease"]).strip()
        precautions = []
        for col in precaution_cols:
            val = row[col]
            if pd.notna(val) and str(val).strip() != "":
                precautions.append(str(val).strip())
        precaution_map[disease] = precautions
    return precaution_map

def calculate_severity_score(row: pd.Series, severity_map: Dict[str, int], symptom_cols: List[str]) -> int:
    """Computes total severity score for a single row based on active symptoms."""
    score = 0
    for col in symptom_cols:
        symptom = row[col]
        if pd.notna(symptom):
            symptom_clean = str(symptom).strip()
            score += severity_map.get(symptom_clean, 0)
    return score

def get_severity_level(score: int) -> str:
    """Classifies a severity score into Low, Moderate, Serious, or Emergency."""
    if score <= SEVERITY_THRESHOLDS["Low"]:
        return "Low"
    elif score <= SEVERITY_THRESHOLDS["Moderate"]:
        return "Moderate"
    elif score <= SEVERITY_THRESHOLDS["Serious"]:
        return "Serious"
    else:
        return "Emergency"

def combine_symptoms(row: pd.Series, symptom_cols: List[str]) -> str:
    """Cleans and joins all non-null symptoms in a row into a single space-separated string."""
    symptoms = []
    for col in symptom_cols:
        val = row[col]
        if pd.notna(val):
            symptoms.append(str(val).strip())
    return " ".join(symptoms)

def preprocess_data(df: pd.DataFrame, severity_map: Dict[str, int]) -> pd.DataFrame:
    """Preprocesses dataset to generate engineered targets and features, dropping duplicates."""
    df_processed = df.copy()
    
    # Identify symptom columns
    symptom_cols = [col for col in df_processed.columns if "Symptom" in col]
    
    # Feature Engineering
    df_processed["severity_score"] = df_processed.apply(
        lambda r: calculate_severity_score(r, severity_map, symptom_cols),
        axis=1
    )
    df_processed["severity_level"] = df_processed["severity_score"].apply(get_severity_level)
    df_processed["specialist"] = df_processed["Disease"].map(SPECIALIST_MAPPING)
    df_processed["service"] = df_processed["severity_level"].map(SERVICE_MAPPING)
    df_processed["combined_symptoms"] = df_processed.apply(
        lambda r: combine_symptoms(r, symptom_cols),
        axis=1
    )
    
    # Remove duplicate combinations to replicate notebook logic
    df_unique = df_processed.drop_duplicates(subset=["combined_symptoms"]).copy()
    return df_unique
