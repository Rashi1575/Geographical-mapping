import joblib
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from src.config import DATASET_PATH, SEVERITY_MODEL_PATH, SEVERITY_TFIDF_PATH
from src.data_preprocessing import load_data, load_severity_map, preprocess_data

def train_severity_model() -> None:
    """Trains the severity prediction model and saves the pipeline to models/."""
    print("Loading data...")
    df = load_data(str(DATASET_PATH))
    severity_map = load_severity_map()
    
    print("Preprocessing data...")
    df_unique = preprocess_data(df, severity_map)
    
    X = df_unique["combined_symptoms"]
    y = df_unique["severity_level"]
    
    print(f"Total Unique Samples: {len(X)}")
    print("Severity Class Distribution:\n", y.value_counts())
    
    # Stratified Train/Test split (80/20) to replicate notebook evaluation
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )
    
    print(f"Training Samples: {len(X_train)}")
    print(f"Testing Samples: {len(X_test)}")
    
    # Define severity pipeline
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer()),
        ("clf", LogisticRegression(max_iter=1000, random_state=42))
    ])
    
    print("Training Logistic Regression pipeline...")
    pipeline.fit(X_train, y_train)
    
    # Evaluate
    print("Evaluating model...")
    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Test Accuracy: {accuracy:.4f}")
    print("\nClassification Report:\n", classification_report(y_test, y_pred))
    
    # Save the pipeline and TF-IDF separately for full backward compatibility
    joblib.dump(pipeline, str(SEVERITY_MODEL_PATH))
    joblib.dump(pipeline.named_steps["tfidf"], str(SEVERITY_TFIDF_PATH))
    print(f"Severity prediction model pipeline saved to: {SEVERITY_MODEL_PATH}")
    print(f"Severity TF-IDF vectorizer saved to: {SEVERITY_TFIDF_PATH}")

if __name__ == "__main__":
    train_severity_model()
