import os
import csv
import pickle
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import learning_curve, StratifiedKFold, cross_val_score
from sklearn.preprocessing import label_binarize
from sklearn.metrics import roc_curve, auc, precision_recall_curve, average_precision_score, confusion_matrix
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC

from body_analysis.ml.training.preprocessing import preprocess_and_split

def main():
    csv_path = "d:/Projects/Vogue Vista/voguevista/sample_body_shapes.csv"
    artifacts_dir = "d:/Projects/Vogue Vista/voguevista/apps/analysis/ml/artifacts"
    plots_dir = os.path.join(artifacts_dir, "training_results", "plots")
    os.makedirs(plots_dir, exist_ok=True)

    print("Loading preprocessed splits...")
    data = preprocess_and_split(csv_path, output_dir=artifacts_dir)
    
    # Cast to contiguous arrays
    X_train = np.ascontiguousarray(data["X_train"].astype(np.float32))
    y_train = np.ascontiguousarray(data["y_train"].astype(np.int32))
    X_val = np.ascontiguousarray(data["X_val"].astype(np.float32))
    y_val = np.ascontiguousarray(data["y_val"].astype(np.int32))
    X_test = np.ascontiguousarray(data["X_test"].astype(np.float32))
    y_test = np.ascontiguousarray(data["y_test"].astype(np.int32))

    # Retrieve target class list
    enc_path = os.path.join(artifacts_dir, "shape_encoder.pkl")
    if os.path.exists(enc_path):
        with open(enc_path, 'rb') as f:
            shape_encoder = pickle.load(f)
        classes = list(shape_encoder.classes_)
    else:
        classes = ["apple", "hourglass", "inverted_triangle", "oval", "pear", "rectangle", "trapezoid", "triangle"]

    # Instantiate best model with optimized hyperparameters
    best_params = {
        'penalty': 'elasticnet',
        'l1_ratio': 0.6842105263157894,
        'C': 5.963623316594637,
        'solver': 'saga',
        'max_iter': 2000,
        'random_state': 42
    }
    model = LogisticRegression(**best_params)
    
    # Fit model on training split for evaluation
    model.fit(X_train, y_train)

    feature_names = [
        "gender", "shoulder_to_hip", "waist_to_hip", 
        "shoulder_to_waist", "torso_aspect", "symmetry", "midline_offset"
    ]

    # --- 1. Class Distribution Plot ---
    print("Generating Class Distribution plot...")
    df = pd.read_csv(csv_path)
    df['shape_label'] = df['shape_label'].str.strip().str.lower()
    df['gender'] = df['gender'].str.strip().str.title()
    
    # Group by shape_label and gender
    counts = df.groupby(['shape_label', 'gender']).size().unstack(fill_value=0)
    
    fig, ax = plt.subplots(figsize=(10, 6))
    counts.plot(kind='bar', stacked=True, color=['#ff7f0e', '#1f77b4'], ax=ax)
    ax.set_title("Class & Gender Distribution in Dataset", fontsize=14, fontweight='bold', pad=15)
    ax.set_xlabel("Body Shape Class", fontsize=12)
    ax.set_ylabel("Sample Count", fontsize=12)
    ax.legend(title="Gender", fontsize=10)
    plt.xticks(rotation=45, ha='right')
    plt.grid(axis='y', linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, "class_distribution.png"), dpi=150)
    plt.close()

    # --- 2. Correlation Heatmap Plot ---
    print("Generating Correlation Heatmap...")
    # Encode categorical features manually for correlation
    df_encoded = df.copy()
    df_encoded['gender'] = df_encoded['gender'].map({'Female': 0, 'Male': 1})
    
    # Encode target labels
    label_encoder = LabelEncoder() if 'LabelEncoder' in globals() else None
    if label_encoder is None:
        from sklearn.preprocessing import LabelEncoder
        label_encoder = LabelEncoder()
    df_encoded['shape_label'] = label_encoder.fit_transform(df_encoded['shape_label'])
    
    corr_cols = ['gender'] + feature_names[1:] + ['shape_label']
    corr_matrix = df_encoded[corr_cols].corr()

    fig, ax = plt.subplots(figsize=(10, 8))
    im = ax.imshow(corr_matrix, cmap='coolwarm', vmin=-1, vmax=1)
    ax.set_xticks(np.arange(len(corr_cols)))
    ax.set_yticks(np.arange(len(corr_cols)))
    ax.set_xticklabels(corr_cols, rotation=45, ha="right", rotation_mode="anchor", fontsize=10)
    ax.set_yticklabels(corr_cols, fontsize=10)
    
    for i in range(len(corr_cols)):
        for j in range(len(corr_cols)):
            ax.text(j, i, f"{corr_matrix.iloc[i, j]:.2f}",
                    ha="center", va="center", color="black" if abs(corr_matrix.iloc[i, j]) < 0.6 else "white", fontsize=9)
            
    ax.set_title("Feature & Label Correlation Heatmap", fontsize=14, fontweight='bold', pad=15)
    fig.colorbar(im, ax=ax)
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, "correlation_heatmap.png"), dpi=150)
    plt.close()

    # --- 3. Confusion Matrix Plot ---
    print("Generating Confusion Matrix...")
    y_pred = model.predict(X_test)
    cm = confusion_matrix(y_test, y_pred)
    
    fig, ax = plt.subplots(figsize=(9, 7))
    im = ax.imshow(cm, cmap='Blues')
    ax.set_xticks(np.arange(len(classes)))
    ax.set_yticks(np.arange(len(classes)))
    ax.set_xticklabels(classes, rotation=45, ha="right", rotation_mode="anchor", fontsize=10)
    ax.set_yticklabels(classes, fontsize=10)
    
    # Draw counts in cells
    for i in range(len(classes)):
        for j in range(len(classes)):
            ax.text(j, i, str(cm[i, j]),
                    ha="center", va="center", color="white" if cm[i, j] > np.max(cm)/2.0 else "black", fontsize=10, fontweight='bold')
            
    ax.set_title("Confusion Matrix (Test Set)", fontsize=14, fontweight='bold', pad=15)
    ax.set_xlabel("Predicted Shape", fontsize=12)
    ax.set_ylabel("Actual Shape", fontsize=12)
    fig.colorbar(im, ax=ax)
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, "confusion_matrix.png"), dpi=150)
    plt.close()

    # --- 4. Feature Importance Plot ---
    print("Generating Feature Importance plot...")
    coef_matrix = np.abs(model.coef_)
    mean_abs_coefs = np.mean(coef_matrix, axis=0)
    
    # Sort descending
    sorted_idx = np.argsort(mean_abs_coefs)
    
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.barh(np.arange(len(sorted_idx)), mean_abs_coefs[sorted_idx], color='#1f77b4', edgecolor='black', height=0.6)
    ax.set_yticks(np.arange(len(sorted_idx)))
    ax.set_yticklabels([feature_names[i] for i in sorted_idx], fontsize=11)
    ax.set_title("Feature Importance (Logistic Regression Mean Abs Coefficients)", fontsize=14, fontweight='bold', pad=15)
    ax.set_xlabel("Importance (Mean Absolute Coefficient)", fontsize=12)
    plt.grid(axis='x', linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, "feature_importance.png"), dpi=150)
    plt.close()

    # --- 5. ROC Curves (One-vs-Rest) ---
    print("Generating ROC Curves...")
    # Binarize test labels
    y_test_bin = label_binarize(y_test, classes=np.arange(len(classes)))
    y_score = model.predict_proba(X_test)
    
    fig, ax = plt.subplots(figsize=(10, 7))
    
    for i in range(len(classes)):
        fpr, tpr, _ = roc_curve(y_test_bin[:, i], y_score[:, i])
        roc_auc = auc(fpr, tpr)
        ax.plot(fpr, tpr, label=f"Class '{classes[i]}' (AUC = {roc_auc:.4f})", linewidth=1.5)
        
    ax.plot([0, 1], [0, 1], 'k--', label="Random (AUC = 0.5000)", linewidth=1.5)
    ax.set_xlim([0.0, 1.0])
    ax.set_ylim([0.0, 1.05])
    ax.set_xlabel("False Positive Rate", fontsize=12)
    ax.set_ylabel("True Positive Rate", fontsize=12)
    ax.set_title("One-vs-Rest ROC Curves (Multiclass)", fontsize=14, fontweight='bold', pad=15)
    ax.legend(loc="lower right", fontsize=9)
    plt.grid(linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, "roc_curves.png"), dpi=150)
    plt.close()

    # --- 6. Precision-Recall Curves (One-vs-Rest) ---
    print("Generating Precision-Recall Curves...")
    fig, ax = plt.subplots(figsize=(10, 7))
    
    for i in range(len(classes)):
        precision, recall, _ = precision_recall_curve(y_test_bin[:, i], y_score[:, i])
        ap = average_precision_score(y_test_bin[:, i], y_score[:, i])
        ax.plot(recall, precision, label=f"Class '{classes[i]}' (AP = {ap:.4f})", linewidth=1.5)
        
    ax.set_xlim([0.0, 1.0])
    ax.set_ylim([0.0, 1.05])
    ax.set_xlabel("Recall", fontsize=12)
    ax.set_ylabel("Precision", fontsize=12)
    ax.set_title("One-vs-Rest Precision-Recall Curves", fontsize=14, fontweight='bold', pad=15)
    ax.legend(loc="lower left", fontsize=9)
    plt.grid(linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, "precision_recall_curves.png"), dpi=150)
    plt.close()

    # --- 7. Learning Curve ---
    print("Generating Learning Curve...")
    train_sizes, train_scores, val_scores = learning_curve(
        model, X_train, y_train, cv=5, scoring='f1_weighted',
        train_sizes=np.linspace(0.1, 1.0, 10), random_state=42, n_jobs=-1
    )
    
    train_mean = np.mean(train_scores, axis=1)
    train_std = np.std(train_scores, axis=1)
    val_mean = np.mean(val_scores, axis=1)
    val_std = np.std(val_scores, axis=1)
    
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(train_sizes, train_mean, 'o-', color="#ff7f0e", label="Training Score", linewidth=2)
    ax.fill_between(train_sizes, train_mean - train_std, train_mean + train_std, alpha=0.15, color="#ff7f0e")
    ax.plot(train_sizes, val_mean, 's-', color="#1f77b4", label="Cross-Validation Score", linewidth=2)
    ax.fill_between(train_sizes, val_mean - val_std, val_mean + val_std, alpha=0.15, color="#1f77b4")
    
    ax.set_title("Learning Curve (Logistic Regression)", fontsize=14, fontweight='bold', pad=15)
    ax.set_xlabel("Training Set Size", fontsize=12)
    ax.set_ylabel("F1 Score (Weighted)", fontsize=12)
    ax.legend(loc="lower right", fontsize=10)
    plt.grid(linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, "learning_curve.png"), dpi=150)
    plt.close()

    # --- 8. Cross Validation Scores Boxplot ---
    print("Generating Cross Validation Scores comparison...")
    # Evaluate top 3 models
    rf = RandomForestClassifier(n_estimators=300, random_state=42)
    svm = SVC(kernel='rbf', probability=True, random_state=42)
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    lr_cv_scores = cross_val_score(model, X_train, y_train, cv=cv, scoring='f1_weighted', n_jobs=-1)
    rf_cv_scores = cross_val_score(rf, X_train, y_train, cv=cv, scoring='f1_weighted', n_jobs=-1)
    svm_cv_scores = cross_val_score(svm, X_train, y_train, cv=cv, scoring='f1_weighted', n_jobs=-1)
    
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.boxplot([lr_cv_scores, rf_cv_scores, svm_cv_scores], labels=["Logistic Regression (Tuned)", "Random Forest", "SVM (RBF Kernel)"])
    ax.set_title("5-Fold Cross Validation Score Comparison (Weighted F1)", fontsize=14, fontweight='bold', pad=15)
    ax.set_ylabel("F1 Score (Weighted)", fontsize=12)
    plt.grid(axis='y', linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, "cross_validation_scores.png"), dpi=150)
    plt.close()

    print(f"\nSuccessfully generated and saved all plots to: {plots_dir}")

if __name__ == "__main__":
    main()
