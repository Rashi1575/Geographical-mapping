import argparse
import sys
import json
from src.recommendation_engine import RecommendationEngine

def print_result(result: dict) -> None:
    """Prints recommendation results in a highly readable format."""
    print("\n" + "=" * 55)
    print("OHSL HEALTHCARE RECOMMENDATION")
    print("=" * 55)
    print(f"Predicted Disease:       {result.get('disease')}")
    print(f"Severity Classification:  {result.get('severity')}")
    print(f"Recommended Specialist:   {result.get('specialist')}")
    print(f"Suggested Service Type:   {result.get('service')}")
    print("-" * 55)
    print(f"Medical Description:\n{result.get('description')}")
    print("-" * 55)
    print("Recommended Precautions / First-Aid:")
    precautions = result.get("precautions", [])
    if precautions:
        for i, prec in enumerate(precautions, 1):
            print(f"  {i}. {prec.capitalize()}")
    else:
        print("  No standard precautions available for this disease.")
    print("=" * 55 + "\n")

def main() -> None:
    """Main execution point supporting single CLI arguments and interactive REPL."""
    parser = argparse.ArgumentParser(
        description="OHSL Healthcare Recommendation Engine Terminal Shell"
    )
    parser.add_argument(
        "--symptoms",
        type=str,
        help="Space-separated or comma-separated symptom string (e.g. 'cough, high_fever, breathlessness')"
    )
    args = parser.parse_args()

    print("Initializing Recommendation Engine...")
    try:
        engine = RecommendationEngine()
    except Exception as e:
        print(f"\n[Error] Loading machine learning models failed: {e}")
        print("Ensure model .pkl files are relocated to the 'models/' directory:")
        print("  - models/disease_model.pkl")
        print("  - models/specialist_model.pkl")
        print("  - models/severity_model.pkl")
        print("  - models/severity_tfidf.pkl")
        sys.exit(1)

    if args.symptoms:
        # Run one-off query mode
        result = engine.recommend(args.symptoms)
        print_result(result)
    else:
        # Run interactive prompt loop
        print("\n" + "=" * 60)
        print("OHSL HEALTHCARE RECOMMENDATION INTERACTIVE TERMINAL")
        print("=" * 60)
        print("Type your symptoms (e.g. 'itching skin_rash nodal_skin_eruptions')")
        print("Type 'exit' or 'quit' to close the terminal session.\n")
        
        while True:
            try:
                symptoms_input = input("symptoms> ").strip()
            except (KeyboardInterrupt, EOFError):
                print("\nExiting interactive shell. Stay healthy!")
                break
                
            if not symptoms_input:
                continue
                
            if symptoms_input.lower() in ["exit", "quit"]:
                print("Exiting interactive shell. Stay healthy!")
                break
                
            result = engine.recommend(symptoms_input)
            print_result(result)

if __name__ == "__main__":
    main()
