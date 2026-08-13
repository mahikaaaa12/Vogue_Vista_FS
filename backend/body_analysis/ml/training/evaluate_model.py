import os
import joblib
import pickle
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix

from body_analysis.ml.training.preprocessing import preprocess_and_split

def run_evaluation():
    csv_path = "d:/Projects/Vogue Vista/voguevista/sample_body_shapes.csv"
    artifacts_dir = "d:/Projects/Vogue Vista/voguevista/apps/analysis/ml/artifacts"
    
    print("Loading data and model...")
    data = preprocess_and_split(csv_path, output_dir=artifacts_dir)
    
    # Cast to contiguous arrays
    X_test = np.ascontiguousarray(data["X_test"].astype(np.float32))
    y_test = np.ascontiguousarray(data["y_test"].astype(np.int32))
    
    # Load class labels
    enc_path = os.path.join(artifacts_dir, "shape_encoder.pkl")
    if os.path.exists(enc_path):
        with open(enc_path, 'rb') as f:
            shape_encoder = pickle.load(f)
        classes = list(shape_encoder.classes_)
    else:
        classes = ["apple", "hourglass", "inverted_triangle", "oval", "pear", "rectangle", "trapezoid", "triangle"]

    # Load best model
    model_path = os.path.join(artifacts_dir, "best_bodyshape_classifier.joblib")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Trained model not found at {model_path}")
    model = joblib.load(model_path)

    # 1. Predictions and Probabilities
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)
    
    # 2. Compute Metrics
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
    
    report_str = classification_report(y_test, y_pred, target_names=classes)
    cm = confusion_matrix(y_test, y_pred)

    # 3. Identify Top 10 Prediction Errors (Confident Errors)
    error_indices = np.where(y_pred != y_test)[0]
    error_probs = y_prob[error_indices]
    error_predicted_confs = np.max(error_probs, axis=1)
    
    # Sort errors descending by confidence
    sorted_error_sort_idx = np.argsort(error_predicted_confs)[::-1]
    top_10_error_idx = error_indices[sorted_error_sort_idx[:10]]
    
    # Construct Report Output String
    output_lines = []
    output_lines.append("="*80)
    output_lines.append(" VOGUE VISTA: MODEL EVALUATION REPORT")
    output_lines.append("="*80)
    output_lines.append(f"Model File: {os.path.basename(model_path)}")
    output_lines.append(f"Test Split Size: {len(X_test)} samples")
    output_lines.append("\n" + "-"*40)
    output_lines.append(" 1. PERFORMANCE METRICS (TEST SET)")
    output_lines.append("-"*40)
    output_lines.append(f"Accuracy:  {acc:.4f}")
    output_lines.append(f"Precision: {prec:.4f} (Weighted)")
    output_lines.append(f"Recall:    {rec:.4f} (Weighted)")
    output_lines.append(f"F1 Score:  {f1:.4f} (Weighted)")
    
    output_lines.append("\n" + "-"*40)
    output_lines.append(" 2. DETAILED CLASSIFICATION REPORT")
    output_lines.append("-"*40)
    output_lines.append(report_str)
    
    output_lines.append("-"*40)
    output_lines.append(" 3. CONFUSION MATRIX")
    output_lines.append("-"*40)
    # Print neat confusion matrix header
    col_header = 'Actual \\ Pred'
    header_row = f"{col_header:<20} | " + " | ".join([f"{c[:10]:<10}" for c in classes])
    output_lines.append(header_row)
    output_lines.append("-" * len(header_row))
    for i, row in enumerate(cm):
        row_str = f"{classes[i]:<20} | " + " | ".join([f"{val:<10}" for val in row])
        output_lines.append(row_str)
        
    output_lines.append("\n" + "-"*40)
    output_lines.append(" 4. TOP 10 CONFIDENT PREDICTION ERRORS")
    output_lines.append("-"*40)
    output_lines.append(f"Found {len(error_indices)} total classification errors out of {len(X_test)} test samples.")
    output_lines.append("Showing the 10 errors where the model was most confident in its incorrect guess:\n")
    
    feature_names = [
        "gender", "shoulder_to_hip", "waist_to_hip", 
        "shoulder_to_waist", "torso_aspect", "symmetry", "midline_offset"
    ]
    
    for rank, idx in enumerate(top_10_error_idx, 1):
        actual_cls = classes[y_test[idx]]
        pred_cls = classes[y_pred[idx]]
        conf = y_prob[idx, y_pred[idx]]
        feats = X_test[idx]
        
        output_lines.append(f"Rank {rank}: Test Sample Index {idx}")
        output_lines.append(f"  [Actual Class]    : {actual_cls}")
        output_lines.append(f"  [Predicted Class] : {pred_cls} (Confidence: {conf:.4f})")
        output_lines.append("  [Feature Values]  :")
        for name, val in zip(feature_names, feats):
            output_lines.append(f"    - {name:<20}: {val:.4f}")
        output_lines.append("  [Probability Distribution] :")
        prob_dist = ", ".join([f"'{classes[i]}': {y_prob[idx, i]:.4f}" for i in range(len(classes))])
        output_lines.append(f"    {prob_dist}")
        output_lines.append("")
        
    output_lines.append("="*80)
    
    final_report = "\n".join(output_lines)
    print(final_report)
    
    # 4. Save report in local and app artifacts paths
    local_report_path = os.path.join(artifacts_dir, "evaluation_report.txt")
    app_report_path = "C:/Users/Mahika/.gemini/antigravity/brain/86133526-5d2c-41c5-ae28-c6dea7c80091/evaluation_report.txt"
    
    with open(local_report_path, 'w', encoding='utf-8') as f:
        f.write(final_report)
        
    with open(app_report_path, 'w', encoding='utf-8') as f:
        f.write(final_report)
        
    print(f"\nEvaluation reports saved to:\n  - {local_report_path}\n  - {app_report_path}")

if __name__ == "__main__":
    run_evaluation()
