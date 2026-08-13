# Vogue Vista: Hyperparameter Tuning Report

This report summarizes the hyperparameter tuning process for the best performing body shape classifier (Logistic Regression) using `RandomizedSearchCV`.

## 1. Best Configuration Details
* **Optimized Metric**: Weighted F1-Score
* **Best Cross-Validation Score**: **0.9534**
* **Best Test Set Score**: **0.9413**

### Selected Hyperparameters:
| Hyperparameter | Selected Value |
| :--- | :---: |
| `penalty` | elasticnet |
| `l1_ratio` | 0.6842105263157894 |
| `C` | 5.963623316594637 |

## 2. Feature Importances (Mean Absolute Coefficients)
For Logistic Regression, overall feature importance is represented by the mean absolute value of the model's coefficients across all target classes.

| Feature Name | Importance (Mean Abs Coef) |
| :--- | :---: |
| `gender` | 5.9438 |
| `waist_to_hip` | 5.6759 |
| `shoulder_to_hip` | 4.0481 |
| `shoulder_to_waist` | 2.6508 |
| `torso_aspect` | 0.5391 |
| `midline_offset` | 0.1780 |
| `symmetry` | 0.1049 |

## 3. Results Summary
The tuned model has been refitted on the combined training and validation sets and successfully saved to `best_bodyshape_classifier.joblib`.
The complete grid search statistics are stored in `training_report.csv`.
