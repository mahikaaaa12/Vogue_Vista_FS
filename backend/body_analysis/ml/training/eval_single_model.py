import argparse
import json
import os
import pickle
import sys
import numpy as np

# Suppress warnings to keep stdout clean for JSON parsing
import warnings
warnings.filterwarnings('ignore')

def get_model(model_name):
    """Dynamically imports and returns the requested model to avoid DLL conflicts."""
    if model_name == "Random Forest":
        from sklearn.ensemble import RandomForestClassifier
        return RandomForestClassifier(n_estimators=300, random_state=42)
        
    elif model_name == "XGBoost":
        import xgboost as xgb
        return xgb.XGBClassifier(random_state=42, eval_metric='mlogloss')
        
    elif model_name == "LightGBM":
        import lightgbm as lgb
        return lgb.LGBMClassifier(random_state=42, verbose=-1)
        
    elif model_name == "CatBoost":
        import catboost as cb
        return cb.CatBoostClassifier(random_state=42, verbose=0)
        
    elif model_name == "Logistic Regression":
        from sklearn.linear_model import LogisticRegression
        return LogisticRegression(max_iter=1000, random_state=42)
        
    elif model_name == "SVM (RBF Kernel)":
        from sklearn.svm import SVC
        return SVC(kernel='rbf', probability=True, random_state=42)
        
    elif model_name == "KNN":
        from sklearn.neighbors import KNeighborsClassifier
        return KNeighborsClassifier()
        
    elif model_name == "Decision Tree":
        from sklearn.tree import DecisionTreeClassifier
        return DecisionTreeClassifier(random_state=42)
        
    else:
        raise ValueError(f"Unknown model name: {model_name}")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=str, required=True, help="Model to evaluate")
    parser.add_argument("--save", action="store_true", help="Refit and save the model")
    parser.add_argument("--output-path", type=str, help="Path to save the model to")
    args = parser.parse_args()

    # Load data from preprocessing module
    from body_analysis.ml.training.preprocessing import preprocess_and_split
    csv_path = "d:/Projects/Vogue Vista/voguevista/sample_body_shapes.csv"
    output_dir = "d:/Projects/Vogue Vista/voguevista/apps/analysis/ml/artifacts"
    
    data = preprocess_and_split(csv_path, output_dir=output_dir)
    
    # Cast to contiguous arrays
    X_train = np.ascontiguousarray(data["X_train"].astype(np.float32))
    y_train = np.ascontiguousarray(data["y_train"].astype(np.int32))
    X_val = np.ascontiguousarray(data["X_val"].astype(np.float32))
    y_val = np.ascontiguousarray(data["y_val"].astype(np.int32))
    X_test = np.ascontiguousarray(data["X_test"].astype(np.float32))
    y_test = np.ascontiguousarray(data["y_test"].astype(np.int32))

    model = get_model(args.model)

    if args.save:
        # Refit on combined training and validation sets
        X_train_val = np.ascontiguousarray(np.vstack([X_train, X_val]).astype(np.float32))
        y_train_val = np.ascontiguousarray(np.concatenate([y_train, y_val]).astype(np.int32))
        
        model.fit(X_train_val, y_train_val)
        
        import joblib
        joblib.dump(model, args.output_path)
        print(f"SAVED:{args.output_path}")
        return

    # Run Stratified 5-Fold CV
    from sklearn.model_selection import StratifiedKFold, cross_validate
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_results = cross_validate(
        model, X_train, y_train, cv=cv,
        scoring={
            'accuracy': 'accuracy',
            'precision': 'precision_macro',
            'recall': 'recall_macro',
            'f1': 'f1_macro'
        }
    )

    # Train on train set and evaluate on test set
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    test_acc = accuracy_score(y_test, y_pred)
    test_prec = precision_score(y_test, y_pred, average='macro', zero_division=0)
    test_rec = recall_score(y_test, y_pred, average='macro', zero_division=0)
    test_f1 = f1_score(y_test, y_pred, average='macro', zero_division=0)
    cm = confusion_matrix(y_test, y_pred).tolist()

    result = {
        "model": args.model,
        "cv_acc_mean": float(np.mean(cv_results['test_accuracy'])),
        "cv_acc_std": float(np.std(cv_results['test_accuracy'])),
        "cv_f1_mean": float(np.mean(cv_results['test_f1'])),
        "cv_f1_std": float(np.std(cv_results['test_f1'])),
        "test_acc": float(test_acc),
        "test_prec": float(test_prec),
        "test_rec": float(test_rec),
        "test_f1": float(test_f1),
        "confusion_matrix": cm
    }

    # Print JSON result to stdout so parent process can parse it
    print(f"JSON_START\n{json.dumps(result)}\nJSON_END")

if __name__ == "__main__":
    main()
