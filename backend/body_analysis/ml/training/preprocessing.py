import csv
import os
import pickle
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

def load_dataset(csv_path):
    """Loads the CSV dataset and splits it into columns."""
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"CSV dataset not found at: {csv_path}")
        
    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        rows = list(reader)
        
    return rows, fieldnames

def preprocess_and_split(csv_path, output_dir=None):
    """
    Runs the complete preprocessing pipeline:
      1. Loads the raw CSV.
      2. Performs a stratified 70/15/15 Train/Val/Test split.
      3. Fits LabelEncoders and StandardScaler on the Train split ONLY.
      4. Transforms the Train, Validation, and Test splits.
      5. Saves scaler.pkl, gender_encoder.pkl, and shape_encoder.pkl.
    """
    if output_dir is None:
        # Default to Vogue Vista's ML artifacts folder
        output_dir = "d:/Projects/Vogue Vista/voguevista/apps/analysis/ml/artifacts"
    os.makedirs(output_dir, exist_ok=True)

    rows, headers = load_dataset(csv_path)
    
    # Extract data columns as lists
    genders = [r["gender"].strip().lower() for r in rows]
    labels = [r["shape_label"].strip().lower() for r in rows]
    
    numeric_keys = [
        "shoulder_to_hip", "waist_to_hip", "shoulder_to_waist",
        "torso_aspect", "symmetry", "midline_offset"
    ]
    
    # Parse numerical features
    numeric_data = []
    for r in rows:
        feats = [float(r[k]) for k in numeric_keys]
        numeric_data.append(feats)
    numeric_data = np.array(numeric_data, dtype=np.float32)

    # 1. First Split: 85% Train/Val, 15% Test (stratified by shape_label)
    # We temporarily zip gender and label to stratify by both if needed, 
    # but stratifying by shape_label is standard.
    idx = np.arange(len(rows))
    idx_train_val, idx_test = train_test_split(
        idx, test_size=0.15, stratify=labels, random_state=42
    )
    
    # 2. Second Split: 70% Train, 15% Val (which is 15/85 = 17.647% of the train_val subset)
    labels_train_val = [labels[i] for i in idx_train_val]
    idx_train, idx_val = train_test_split(
        idx_train_val, test_size=15/85, stratify=labels_train_val, random_state=42
    )

    print(f"Dataset split counts:")
    print(f"  - Train:      {len(idx_train)} samples")
    print(f"  - Validation: {len(idx_val)} samples")
    print(f"  - Test:       {len(idx_test)} samples")

    # Fit LabelEncoders on the training set ONLY to prevent leakage
    gender_encoder = LabelEncoder()
    gender_encoder.fit([genders[i] for i in idx_train])
    
    shape_encoder = LabelEncoder()
    shape_encoder.fit([labels[i] for i in idx_train])
    
    # Fit StandardScaler on numeric features of the training set ONLY
    scaler = StandardScaler()
    scaler.fit(numeric_data[idx_train])

    # Save encoders and scaler
    scaler_path = os.path.join(output_dir, "scaler.pkl")
    gender_enc_path = os.path.join(output_dir, "gender_encoder.pkl")
    shape_enc_path = os.path.join(output_dir, "shape_encoder.pkl")
    
    with open(scaler_path, 'wb') as f:
        pickle.dump(scaler, f)
    with open(gender_enc_path, 'wb') as f:
        pickle.dump(gender_encoder, f)
    with open(shape_enc_path, 'wb') as f:
        pickle.dump(shape_encoder, f)
        
    print(f"Saved preprocessing objects to: {output_dir}")
    print(f"  - Scaler:        {scaler_path}")
    print(f"  - Gender Encoder:{gender_enc_path}")
    print(f"  - Shape Encoder: {shape_enc_path}")

    # Transformation function to apply the fitted objects consistently
    def transform_split(indices):
        split_genders = [genders[i] for i in indices]
        split_labels = [labels[i] for i in indices]
        split_numeric = numeric_data[indices]
        
        # 1. Encode gender
        enc_gender = gender_encoder.transform(split_genders).reshape(-1, 1).astype(np.float32)
        # 2. Standardize numerical features
        std_numeric = scaler.transform(split_numeric)
        # 3. Concatenate (gender stays encoded, numeric standardized)
        X = np.hstack([enc_gender, std_numeric])
        # 4. Encode labels
        y = shape_encoder.transform(split_labels).astype(np.int64)
        
        return X, y

    X_train, y_train = transform_split(idx_train)
    X_val, y_val = transform_split(idx_val)
    X_test, y_test = transform_split(idx_test)

    return {
        "X_train": X_train, "y_train": y_train,
        "X_val": X_val, "y_val": y_val,
        "X_test": X_test, "y_test": y_test,
        "scaler": scaler,
        "gender_encoder": gender_encoder,
        "shape_encoder": shape_encoder
    }

if __name__ == "__main__":
    csv_path = "d:/Projects/Vogue Vista/voguevista/sample_body_shapes.csv"
    preprocess_and_split(csv_path)
