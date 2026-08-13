import os
import sys
import subprocess
import json
import pickle

def run_subprocess_eval(model_name):
    """Runs eval_single_model.py in a separate Python process to prevent OpenMP/DLL conflicts."""
    print(f"Starting subprocess evaluation for: {model_name}...")
    cmd = [sys.executable, "-m", "body_analysis.ml.training.eval_single_model", "--model", model_name]
    
    # Run the command and capture output
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding='utf-8')
    
    if result.returncode != 0:
        print(f"Error evaluating {model_name}:")
        print(result.stderr)
        return None
        
    # Extract JSON between JSON_START and JSON_END tags
    output = result.stdout
    if "JSON_START" in output and "JSON_END" in output:
        try:
            start_idx = output.find("JSON_START") + len("JSON_START")
            end_idx = output.find("JSON_END")
            json_str = output[start_idx:end_idx].strip()
            return json.loads(json_str)
        except Exception as e:
            print(f"Failed to parse JSON for {model_name}: {e}")
            print("Output was:")
            print(output)
            return None
    else:
        print(f"Subprocess output for {model_name} did not contain valid JSON markers.")
        print(output)
        return None

def refit_and_save_best(model_name, output_path):
    """Spawns a subprocess to refit and save the selected best model."""
    print(f"Refitting and saving best model ({model_name}) in an isolated subprocess...")
    cmd = [
        sys.executable, "-m", "body_analysis.ml.training.eval_single_model",
        "--model", model_name,
        "--save",
        "--output-path", output_path
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding='utf-8')
    if result.returncode != 0:
        print(f"Error saving model: {result.stderr}")
    else:
        print(result.stdout.strip())

def main():
    model_names = [
        "Random Forest",
        "XGBoost",
        "LightGBM",
        "CatBoost",
        "Logistic Regression",
        "SVM (RBF Kernel)",
        "KNN",
        "Decision Tree"
    ]
    
    results = {}
    
    print("="*80)
    print(" Vogue Vista: Multiprocess Model Training & Comparison")
    print("="*80)
    
    for name in model_names:
        res = run_subprocess_eval(name)
        if res is not None:
            results[name] = res
            
    if not results:
        print("Error: No models were successfully evaluated.")
        return
        
    # Print Comparison Table
    print("\n" + "="*85)
    print(f"{'Classifier Name':<25} | {'CV F1 (Macro)':<18} | {'Test Acc':<10} | {'Test F1 (Macro)':<16}")
    print("="*85)
    for name in results:
        res = results[name]
        cv_f1_str = f"{res['cv_f1_mean']:.4f} ± {res['cv_f1_std']:.4f}"
        print(f"{name:<25} | {cv_f1_str:<18} | {res['test_acc']:.4f}   | {res['test_f1']:.4f}")
    print("="*85)

    # Determine best model based on Test F1 macro score
    best_name = max(results, key=lambda k: results[k]["test_f1"])
    
    output_dir = "d:/Projects/Vogue Vista/voguevista/apps/analysis/ml/artifacts"
    best_model_path = os.path.join(output_dir, "best_bodyshape_classifier.joblib")
    
    print(f"\n--> Selected Best Model: {best_name} (Test F1 Score: {results[best_name]['test_f1']:.4f})")
    
    # Refit and save in subprocess
    refit_and_save_best(best_name, best_model_path)
    
    # Save a detailed training report artifact
    report_path = os.path.join(output_dir, "model_training_comparison.md")
    write_markdown_report(report_path, results, best_name)

def write_markdown_report(report_path, results, best_name):
    """Writes a markdown report containing the model comparison table and confusion matrices."""
    report_dir = os.path.dirname(report_path)
    os.makedirs(report_dir, exist_ok=True)
    
    # Get target class list from the shape encoder
    enc_path = os.path.join(report_dir, "shape_encoder.pkl")
    if os.path.exists(enc_path):
        with open(enc_path, 'rb') as f:
            shape_encoder = pickle.load(f)
        classes = list(shape_encoder.classes_)
    else:
        classes = ["apple", "hourglass", "inverted_triangle", "oval", "pear", "rectangle", "trapezoid", "triangle"]

    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("# Vogue Vista: Body Shape Classifier Training & Comparison Report\n\n")
        f.write(f"This report compares the performance of 8 machine learning models trained on the preprocessed body shape features. ")
        f.write(f"The best model has been automatically saved to `best_bodyshape_classifier.joblib`.\n\n")
        
        f.write("## 1. Classifier Performance Comparison Table\n")
        f.write("| Classifier | CV Accuracy | CV F1-Score (Macro) | Test Accuracy | Test Precision (Macro) | Test Recall (Macro) | Test F1-Score (Macro) |\n")
        f.write("| :--- | :---: | :---: | :---: | :---: | :---: | :---: |\n")
        
        for name in sorted(results.keys()):
            res = results[name]
            cv_acc = f"{res['cv_acc_mean']:.4f} ± {res['cv_acc_std']:.4f}"
            cv_f1 = f"{res['cv_f1_mean']:.4f} ± {res['cv_f1_std']:.4f}"
            f.write(f"| **{name}** | {cv_acc} | {cv_f1} | {res['test_acc']:.4f} | {res['test_prec']:.4f} | {res['test_rec']:.4f} | **{res['test_f1']:.4f}** |\n")
            
        f.write(f"\n**Best Model Selected**: `{best_name}`\n\n")
        
        f.write("## 2. Confusion Matrices (Test Set)\n")
        for name in sorted(results.keys()):
            res = results[name]
            f.write(f"### {name} Confusion Matrix\n")
            f.write("Columns represent predictions, rows represent actual ground-truth classes.\n\n")
            
            f.write("| Actual \\ Predicted | " + " | ".join([f"`{c}`" for c in classes]) + " |\n")
            f.write("| :--- | " + " | ".join([":---:" for _ in classes]) + " |\n")
            
            cm = res["confusion_matrix"]
            for i, row in enumerate(cm):
                f.write(f"| `{classes[i]}` | " + " | ".join([str(val) for val in row]) + " |\n")
            f.write("\n")

    print(f"Detailed comparison report written to: {report_path}")

if __name__ == "__main__":
    main()
