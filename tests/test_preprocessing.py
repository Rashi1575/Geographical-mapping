import pandas as pd
from src.data_preprocessing import (
    calculate_severity_score,
    get_severity_level,
    combine_symptoms
)

def test_calculate_severity_score():
    severity_map = {"itching": 1, "skin_rash": 3, "chills": 3}
    symptom_cols = ["Symptom_1", "Symptom_2", "Symptom_3"]
    
    # Row with valid symptoms
    row_1 = pd.Series({"Symptom_1": " itching ", "Symptom_2": "skin_rash", "Symptom_3": None})
    score_1 = calculate_severity_score(row_1, severity_map, symptom_cols)
    assert score_1 == 4  # 1 + 3 + 0
    
    # Row with unrecognized symptoms
    row_2 = pd.Series({"Symptom_1": "headache", "Symptom_2": None, "Symptom_3": None})
    score_2 = calculate_severity_score(row_2, severity_map, symptom_cols)
    assert score_2 == 0

def test_get_severity_level():
    assert get_severity_level(5) == "Low"
    assert get_severity_level(18) == "Low"
    assert get_severity_level(19) == "Moderate"
    assert get_severity_level(27) == "Moderate"
    assert get_severity_level(28) == "Serious"
    assert get_severity_level(42) == "Serious"
    assert get_severity_level(43) == "Emergency"
    assert get_severity_level(100) == "Emergency"

def test_combine_symptoms():
    symptom_cols = ["Symptom_1", "Symptom_2", "Symptom_3"]
    row = pd.Series({"Symptom_1": " itching ", "Symptom_2": None, "Symptom_3": " chills"})
    combined = combine_symptoms(row, symptom_cols)
    assert combined == "itching chills"
