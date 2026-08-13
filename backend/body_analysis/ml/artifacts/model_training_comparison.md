# Vogue Vista: Body Shape Classifier Training & Comparison Report

This report compares the performance of 8 machine learning models trained on the preprocessed body shape features. The best model has been automatically saved to `best_bodyshape_classifier.joblib`.

## 1. Classifier Performance Comparison Table
| Classifier | CV Accuracy | CV F1-Score (Macro) | Test Accuracy | Test Precision (Macro) | Test Recall (Macro) | Test F1-Score (Macro) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **CatBoost** | 0.9437 ± 0.0091 | 0.9441 ± 0.0095 | 0.9371 | 0.9379 | 0.9368 | **0.9372** |
| **Decision Tree** | 0.9192 ± 0.0074 | 0.9199 ± 0.0070 | 0.9162 | 0.9172 | 0.9153 | **0.9156** |
| **KNN** | 0.9257 ± 0.0167 | 0.9265 ± 0.0159 | 0.9257 | 0.9254 | 0.9310 | **0.9269** |
| **Logistic Regression** | 0.9498 ± 0.0090 | 0.9505 ± 0.0080 | 0.9448 | 0.9460 | 0.9453 | **0.9455** |
| **Random Forest** | 0.9478 ± 0.0111 | 0.9483 ± 0.0111 | 0.9410 | 0.9414 | 0.9392 | **0.9402** |
| **SVM (RBF Kernel)** | 0.9465 ± 0.0133 | 0.9475 ± 0.0127 | 0.9371 | 0.9361 | 0.9405 | **0.9379** |
| **XGBoost** | 0.9376 ± 0.0080 | 0.9379 ± 0.0076 | 0.9314 | 0.9320 | 0.9309 | **0.9312** |

**Best Model Selected**: `Logistic Regression`

## 2. Confusion Matrices (Test Set)
### CatBoost Confusion Matrix
Columns represent predictions, rows represent actual ground-truth classes.

| Actual \ Predicted | `apple` | `hourglass` | `inverted_triangle` | `oval` | `pear` | `rectangle` | `trapezoid` | `triangle` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `apple` | 40 | 0 | 0 | 0 | 3 | 9 | 0 | 0 |
| `hourglass` | 0 | 52 | 0 | 0 | 0 | 0 | 0 | 0 |
| `inverted_triangle` | 0 | 1 | 103 | 0 | 0 | 0 | 1 | 0 |
| `oval` | 0 | 0 | 0 | 52 | 0 | 1 | 0 | 0 |
| `pear` | 2 | 1 | 0 | 0 | 50 | 0 | 0 | 0 |
| `rectangle` | 10 | 0 | 0 | 1 | 0 | 94 | 0 | 0 |
| `trapezoid` | 0 | 0 | 4 | 0 | 0 | 0 | 49 | 0 |
| `triangle` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 52 |

### Decision Tree Confusion Matrix
Columns represent predictions, rows represent actual ground-truth classes.

| Actual \ Predicted | `apple` | `hourglass` | `inverted_triangle` | `oval` | `pear` | `rectangle` | `trapezoid` | `triangle` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `apple` | 36 | 0 | 0 | 0 | 5 | 11 | 0 | 0 |
| `hourglass` | 0 | 51 | 0 | 0 | 1 | 0 | 0 | 0 |
| `inverted_triangle` | 0 | 2 | 99 | 0 | 0 | 0 | 4 | 0 |
| `oval` | 0 | 0 | 0 | 51 | 0 | 2 | 0 | 0 |
| `pear` | 1 | 0 | 0 | 0 | 51 | 1 | 0 | 0 |
| `rectangle` | 9 | 0 | 0 | 0 | 0 | 94 | 0 | 2 |
| `trapezoid` | 0 | 0 | 6 | 0 | 0 | 0 | 47 | 0 |
| `triangle` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 52 |

### KNN Confusion Matrix
Columns represent predictions, rows represent actual ground-truth classes.

| Actual \ Predicted | `apple` | `hourglass` | `inverted_triangle` | `oval` | `pear` | `rectangle` | `trapezoid` | `triangle` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `apple` | 44 | 0 | 0 | 0 | 2 | 6 | 0 | 0 |
| `hourglass` | 0 | 52 | 0 | 0 | 0 | 0 | 0 | 0 |
| `inverted_triangle` | 0 | 2 | 98 | 0 | 0 | 0 | 5 | 0 |
| `oval` | 0 | 0 | 0 | 52 | 0 | 1 | 0 | 0 |
| `pear` | 6 | 1 | 0 | 0 | 46 | 0 | 0 | 0 |
| `rectangle` | 12 | 0 | 0 | 1 | 0 | 92 | 0 | 0 |
| `trapezoid` | 0 | 0 | 3 | 0 | 0 | 0 | 50 | 0 |
| `triangle` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 52 |

### Logistic Regression Confusion Matrix
Columns represent predictions, rows represent actual ground-truth classes.

| Actual \ Predicted | `apple` | `hourglass` | `inverted_triangle` | `oval` | `pear` | `rectangle` | `trapezoid` | `triangle` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `apple` | 44 | 0 | 0 | 0 | 2 | 6 | 0 | 0 |
| `hourglass` | 0 | 52 | 0 | 0 | 0 | 0 | 0 | 0 |
| `inverted_triangle` | 0 | 1 | 101 | 0 | 0 | 0 | 3 | 0 |
| `oval` | 0 | 0 | 0 | 51 | 0 | 2 | 0 | 0 |
| `pear` | 2 | 1 | 0 | 0 | 50 | 0 | 0 | 0 |
| `rectangle` | 8 | 0 | 0 | 0 | 0 | 97 | 0 | 0 |
| `trapezoid` | 0 | 0 | 3 | 0 | 0 | 1 | 49 | 0 |
| `triangle` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 52 |

### Random Forest Confusion Matrix
Columns represent predictions, rows represent actual ground-truth classes.

| Actual \ Predicted | `apple` | `hourglass` | `inverted_triangle` | `oval` | `pear` | `rectangle` | `trapezoid` | `triangle` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `apple` | 42 | 0 | 0 | 0 | 3 | 7 | 0 | 0 |
| `hourglass` | 0 | 51 | 0 | 0 | 1 | 0 | 0 | 0 |
| `inverted_triangle` | 0 | 1 | 103 | 0 | 0 | 0 | 1 | 0 |
| `oval` | 0 | 0 | 0 | 51 | 0 | 2 | 0 | 0 |
| `pear` | 3 | 1 | 0 | 0 | 49 | 0 | 0 | 0 |
| `rectangle` | 9 | 0 | 0 | 0 | 0 | 96 | 0 | 0 |
| `trapezoid` | 0 | 0 | 3 | 0 | 0 | 0 | 50 | 0 |
| `triangle` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 52 |

### SVM (RBF Kernel) Confusion Matrix
Columns represent predictions, rows represent actual ground-truth classes.

| Actual \ Predicted | `apple` | `hourglass` | `inverted_triangle` | `oval` | `pear` | `rectangle` | `trapezoid` | `triangle` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `apple` | 45 | 0 | 0 | 0 | 2 | 5 | 0 | 0 |
| `hourglass` | 0 | 51 | 0 | 0 | 1 | 0 | 0 | 0 |
| `inverted_triangle` | 0 | 2 | 99 | 0 | 0 | 0 | 4 | 0 |
| `oval` | 0 | 0 | 0 | 52 | 0 | 1 | 0 | 0 |
| `pear` | 3 | 1 | 0 | 0 | 49 | 0 | 0 | 0 |
| `rectangle` | 10 | 0 | 0 | 0 | 0 | 95 | 0 | 0 |
| `trapezoid` | 0 | 0 | 4 | 0 | 0 | 0 | 49 | 0 |
| `triangle` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 52 |

### XGBoost Confusion Matrix
Columns represent predictions, rows represent actual ground-truth classes.

| Actual \ Predicted | `apple` | `hourglass` | `inverted_triangle` | `oval` | `pear` | `rectangle` | `trapezoid` | `triangle` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `apple` | 42 | 0 | 0 | 0 | 2 | 8 | 0 | 0 |
| `hourglass` | 0 | 51 | 0 | 0 | 0 | 0 | 0 | 1 |
| `inverted_triangle` | 0 | 0 | 101 | 0 | 1 | 0 | 3 | 0 |
| `oval` | 0 | 0 | 0 | 50 | 0 | 3 | 0 | 0 |
| `pear` | 4 | 1 | 0 | 0 | 48 | 0 | 0 | 0 |
| `rectangle` | 8 | 0 | 0 | 0 | 0 | 95 | 0 | 2 |
| `trapezoid` | 0 | 0 | 3 | 0 | 0 | 0 | 50 | 0 |
| `triangle` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 52 |

