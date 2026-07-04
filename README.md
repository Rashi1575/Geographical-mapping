# 🏥 OHSL Healthcare AI Recommendation System

A machine learning-powered healthcare recommendation system that predicts diseases, assesses severity, recommends specialists, and suggests appropriate healthcare services based on patient symptoms.

Developed as part of the **OHSL Internship Program**.

---

## 📌 Project Overview

Healthcare access often begins with symptom identification and deciding the appropriate level of care.

This project provides an intelligent recommendation engine that analyzes symptoms and predicts:

* Disease
* Severity Level
* Recommended Specialist
* Recommended Healthcare Service

The system combines machine learning models with healthcare recommendation logic to assist users in identifying the most suitable healthcare pathway.

---

## 🚀 Features

### Disease Prediction

Predicts likely diseases from symptom combinations.

```text
Symptoms → Disease
```

---

### Severity Assessment

Classifies cases into:

* Low
* Moderate
* Serious
* Emergency

```text
Symptoms → Severity
```

---

### Specialist Recommendation

Recommends the most appropriate healthcare specialist.

Examples:

* Cardiologist
* Dermatologist
* Pulmonologist
* Neurologist
* Gastroenterologist

```text
Symptoms → Specialist
```

---

### Service Recommendation

Maps severity levels to healthcare services.

| Severity  | Service        |
| --------- | -------------- |
| Low       | Pharmacy       |
| Moderate  | Telemedicine   |
| Serious   | Clinic         |
| Emergency | Emergency Care |

---

### Healthcare Recommendation Engine

Combines all model outputs into a single recommendation.

Example:

```json
{
  "disease": "Bronchial Asthma",
  "severity": "Emergency",
  "specialist": "Pulmonologist",
  "service": "Emergency Care"
}
```

---

# 🏗 System Architecture

```text
User Symptoms
      │
      ▼
──────────────────────────
 Disease Prediction Model
 Severity Prediction Model
 Specialist Recommendation Model
──────────────────────────
      │
      ▼
Recommendation Engine
      │
      ▼
Service Recommendation
      │
      ▼
Final Healthcare Guidance
```

---

# 📂 Repository Structure

```text
OHSL/
│
├── app/
│   └── main.py
│
├── data/
│   ├── dataset.csv
│   ├── Symptom-severity.csv
│   ├── symptom_Description.csv
│   └── symptom_precaution.csv
│
├── models/
│   ├── disease_model.pkl
│   ├── specialist_model.pkl
│   ├── severity_model.pkl
│   └── severity_tfidf.pkl
│
├── notebooks/
│   └── OSHL_ML_MODEL.ipynb
│
├── src/
│   ├── config.py
│   ├── data_preprocessing.py
│   ├── recommendation_engine.py
│   ├── train_disease.py
│   ├── train_specialist.py
│   └── train_severity.py
│
├── tests/
│   ├── test_preprocessing.py
│   └── test_recommendation.py
│
├── requirements.txt
└── README.md
```

---

# 📊 Dataset Information

The project uses four healthcare datasets:

### dataset.csv

Contains diseases and associated symptoms.

### Symptom-severity.csv

Contains symptom severity weights used for severity scoring.

### symptom_Description.csv

Provides descriptions of diseases.

### symptom_precaution.csv

Provides recommended precautions for diseases.

---

# 🤖 Machine Learning Models

## 1. Disease Prediction Model

**Task**

```text
Symptoms → Disease
```

**Algorithm**

* TF-IDF Vectorization
* Logistic Regression

**Evaluation**

* Stratified 5-Fold Cross Validation

**Accuracy**

```text
99.67%
```

---

## 2. Specialist Recommendation Model

**Task**

```text
Symptoms → Specialist
```

**Algorithm**

* TF-IDF Vectorization
* Logistic Regression

**Evaluation**

* Stratified 5-Fold Cross Validation

**Accuracy**

```text
98.35%
```

---

## 3. Severity Prediction Model

**Task**

```text
Symptoms → Severity
```

**Algorithm**

* TF-IDF Vectorization
* Logistic Regression

**Evaluation**

* Stratified Train/Test Split

**Accuracy**

```text
83.61%
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone <repository-url>
cd OHSL
```

---

## Create Virtual Environment

### Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

### Linux / Mac

```bash
python -m venv .venv
source .venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

# 🏋️ Training Models

## Train Disease Model

```bash
python -m src.train_disease
```

---

## Train Specialist Model

```bash
python -m src.train_specialist
```

---

## Train Severity Model

```bash
python -m src.train_severity
```

---

# 🔮 Using the Recommendation Engine

Example:

```python
from src.recommendation_engine import RecommendationEngine

engine = RecommendationEngine()

result = engine.recommend(
    "itching skin_rash nodal_skin_eruptions"
)

print(result)
```

Output:

```python
{
    "disease": "Fungal infection",
    "severity": "Low",
    "specialist": "Dermatologist",
    "service": "Pharmacy",
    "description": "...",
    "precautions": [...]
}
```

---

# 🌐 Running the API

Start FastAPI server:

```bash
uvicorn app.main:app --reload
```

Server:

```text
http://127.0.0.1:8000
```

---

# 📡 API Endpoints

## Health Check

### GET

```http
/health
```

Response:

```json
{
  "status": "healthy",
  "models_loaded": true
}
```

---

## Prediction Endpoint

### POST

```http
/predict
```

Request:

```json
{
  "symptoms": "itching skin_rash nodal_skin_eruptions"
}
```

Response:

```json
{
  "disease": "Fungal infection",
  "severity": "Low",
  "specialist": "Dermatologist",
  "service": "Pharmacy",
  "description": "...",
  "precautions": [...]
}
```

---

# 🧪 Running Tests

Run all tests:

```bash
pytest
```

Run specific test file:

```bash
pytest tests/test_recommendation.py
```

---

# 🔬 Future Enhancements

* GIS-Based Healthcare Facility Recommendation
* Hospital Ranking System
* Route Optimization with OSRM
* Real-Time Ambulance Tracking
* Telemedicine Integration
* Priority Scoring Engine
* Clinical Safety Rule Layer
* Multilingual Symptom Input
* Explainable AI Recommendations

---

# 👥 Contributors

OHSL Internship Team

AI/ML Module:

* Uzair Sabir
* Sreyanka Sarkar

---

# 📄 License

This project was developed for educational, research, and internship purposes.

Use responsibly and do not treat predictions as medical diagnoses.

Always consult licensed healthcare professionals for medical decisions.
