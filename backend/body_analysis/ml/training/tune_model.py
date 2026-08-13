import os
import joblib
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import RandomizedSearchCV, StratifiedKFold
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, f1_score

from body_analysis.ml.training.preprocessing import preprocess_and_split

def tune_best_model():
    csv_path = "d:/Projects/Vogue Vista/voguevista/sample_body_shapes.csv"
    output_dir = "d:/Projects/Vogue Vista/voguevista/apps/analysis/ml/artifacts"
    
    print("Loading preprocessed splits...")
    data = preprocess_and_split(csv_path, output_dir=output_dir)
    
    X_train = np.ascontiguousarray(data["X_train"].astype(np.float32))
    y_train = np.ascontiguousarray(data["y_train"].astype(np.int32))
    X_val = np.ascontiguousarray(data["X_val"].astype(np.float32))
    y_val = np.ascontiguousarray(data["y_val"].astype(np.int32))
    X_test = np.ascontiguousarray(data["X_test"].astype(np.float32))
    y_test = np.ascontiguousarray(data["y_test"].astype(np.int32))
    
    # 1. Define model and parameter grid
    # We use solver='saga' as it supports l1, l2, and elasticnet penalties
    model = LogisticRegression(solver='saga', max_iter=2000, random_state=42)
    
    param_dist = {
        'penalty': ['l1', 'l2', 'elasticnet', None],
        'C': np.logspace(-4, 2, 50),
        'l1_ratio': np.linspace(0, 1, 20)  # only used if penalty='elasticnet'
    }
    
    # Stratified K-Fold CV
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    # 2. Randomized Search
    print("Starting RandomizedSearchCV (optimizing for weighted F1)...")
    search = RandomizedSearchCV(
        estimator=model,
        param_distributions=param_dist,
        n_iter=30,
        scoring='f1_weighted',
        cv=cv,
        random_state=42,
        n_jobs=-1,
        verbose=1
    )
    
    search.fit(X_train, y_train)
    
    print("\nBest Parameters Found:")
    for param, val in search.best_params_.items():
        print(f"  {param}: {val}")
        
    print(f"Best CV F1-Weighted Score: {search.best_score_:.4f}")
    
    # 3. Save tuning results to CSV
    report_csv_path = os.path.join(output_dir, "training_report.csv")
    cv_results_df = pd.DataFrame(search.cv_results_)
    cv_results_df.to_csv(report_csv_path, index=False)
    print(f"Tuning search results saved to: {report_csv_path}")
    
    # Evaluate best estimator on the test split
    best_estimator = search.best_estimator_
    y_pred = best_estimator.predict(X_test)
    test_f1_weighted = f1_score(y_test, y_pred, average='weighted')
    print(f"Test Set F1-Weighted Score (Tuned): {test_f1_weighted:.4f}")
    
    print("\nClassification Report (Test Set):")
    print(classification_report(y_test, y_pred))

    # 4. Feature Importance (Coefficients for Logistic Regression)
    # Since Logistic Regression is multiclass, coef_ has shape (n_classes, n_features)
    # We calculate the mean absolute coefficient across classes for each feature.
    feature_names = [
        "gender", "shoulder_to_hip", "waist_to_hip", 
        "shoulder_to_waist", "torso_aspect", "symmetry", "midline_offset"
    ]
    
    coef_matrix = np.abs(best_estimator.coef_)
    mean_abs_coefs = np.mean(coef_matrix, axis=0)
    
    print("\nFeature Importances (Mean Absolute Coefficients):")
    print("="*50)
    print(f"{'Feature Name':<25} | {'Importance (Mean Abs Coef)':<25}")
    print("="*50)
    
    feature_importances = []
    for name, coef in zip(feature_names, mean_abs_coefs):
        print(f"{name:<25} | {coef:.4f}")
        feature_importances.append((name, float(coef)))
        
    print("="*50)

    # 5. Refit best estimator on combined training + validation sets
    X_train_val = np.ascontiguousarray(np.vstack([X_train, X_val]).astype(np.float32))
    y_train_val = np.ascontiguousarray(np.concatenate([y_train, y_val]).astype(np.int32))
    
    print(f"Refitting best tuned model on combined train+val sets ({len(X_train_val)} samples)...")
    best_estimator.fit(X_train_val, y_train_val)
    
    best_model_path = os.path.join(output_dir, "best_bodyshape_classifier.joblib")
    joblib.dump(best_estimator, best_model_path)
    print(f"Successfully saved tuned model to: {best_model_path}")
    
    # Save a summary report artifact
    write_tuning_report(output_dir, search.best_params_, search.best_score_, test_f1_weighted, feature_importances)

def write_tuning_report(output_dir, best_params, best_cv_score, test_score, feature_importances):
    report_path = os.path.join(output_dir, "hyperparameter_tuning_report.md")
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("# Vogue Vista: Hyperparameter Tuning Report\n\n")
        f.write("This report summarizes the hyperparameter tuning process for the best performing body shape classifier (Logistic Regression) ")
        f.write("using `RandomizedSearchCV`.\n\n")
        
        f.write("## 1. Best Configuration Details\n")
        f.write(f"* **Optimized Metric**: Weighted F1-Score\n")
        f.write(f"* **Best Cross-Validation Score**: **{best_cv_score:.4f}**\n")
        f.write(f"* **Best Test Set Score**: **{test_score:.4f}**\n\n")
        
        f.write("### Selected Hyperparameters:\n")
        f.write("| Hyperparameter | Selected Value |\n")
        f.write("| :--- | :---: |\n")
        for param, val in best_params.items():
            f.write(f"| `{param}` | {val} |\n")
        f.write("\n")
        
        f.write("## 2. Feature Importances (Mean Absolute Coefficients)\n")
        f.write("For Logistic Regression, overall feature importance is represented by the mean absolute value of the model's coefficients across all target classes.\n\n")
        
        f.write("| Feature Name | Importance (Mean Abs Coef) |\n")
        f.write("| :--- | :---: |\n")
        # Sort importances descending
        sorted_importances = sorted(feature_importances, key=lambda x: x[1], reverse=True)
        for name, imp in sorted_importances:
            f.write(f"| `{name}` | {imp:.4f} |\n")
        f.write("\n")
        
        f.write("## 3. Results Summary\n")
        f.write("The tuned model has been refitted on the combined training and validation sets and successfully saved to `best_bodyshape_classifier.joblib`.\n")
        f.write("The complete grid search statistics are stored in `training_report.csv`.\n")

    print(f"Hyperparameter tuning summary report written to: {report_path}")

if __name__ == "__main__":
    tune_best_model()
