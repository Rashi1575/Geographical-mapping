import joblib
from sklearn.pipeline import Pipeline
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from src.config import DATASET_PATH, DISEASE_MODEL_PATH
from src.data_preprocessing import load_data, load_severity_map, preprocess_data

def train_disease_model() -> None:
    """Trains the disease prediction model and saves it to the models/ directory."""
    print("Loading data...")
    df = load_data(str(DATASET_PATH))
    severity_map = load_severity_map()
    
    print("Preprocessing data...")
    df_unique = preprocess_data(df, severity_map)
    
    X = df_unique["combined_symptoms"]
    y = df_unique["Disease"]
    
    print(f"Total Unique Samples: {len(X)}")
    print(f"Number of Unique Diseases: {y.nunique()}")
    
    # Define pipeline
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer()),
        ("clf", LogisticRegression(max_iter=2000, random_state=42))
    ])
    
    # Perform cross-validation
    print("Evaluating model with 5-Fold Stratified Cross-Validation...")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = cross_val_score(pipeline, X, y, cv=cv, scoring="accuracy")
    
    print(f"Fold Accuracies: {scores}")
    print(f"Mean Accuracy: {scores.mean():.4f}")
    print(f"Standard Deviation: {scores.std():.4f}")
    
    # Fit on all unique combinations
    print("Fitting model on all unique samples...")
    pipeline.fit(X, y)
    
    # Save the pipeline
    joblib.dump(pipeline, str(DISEASE_MODEL_PATH))
    print(f"Disease prediction model pipeline saved to: {DISEASE_MODEL_PATH}")

if __name__ == "__main__":
    train_disease_model()
