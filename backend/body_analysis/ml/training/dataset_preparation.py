import csv
import logging
import os
import math
from pathlib import Path
import numpy as np

from body_analysis.ml import preprocessing, landmarks, features, classifier, pipeline

logger = logging.getLogger("dataset_preparation")
logger.setLevel(logging.INFO)

# Setup basic console logging handler if not already present
if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    ch.setFormatter(formatter)
    logger.addHandler(ch)

CSV_HEADERS = [
    "gender",
    "shoulder_to_hip",
    "waist_to_hip",
    "shoulder_to_waist",
    "torso_aspect",
    "symmetry",
    "midline_offset",
    "pseudo_label",
    "ground_truth_label",
    "source_image_id",
    "data_source",
    "validation_status"
]

def batch_extract_features(image_dir, gender, output_csv, data_source="batch_upload"):
    """
    Iterates through a folder of body images, extracts geometric feature ratios
    reusing the application's existing pipeline, validates them, assigns the legacy
    rule-based prediction as a pseudo_label, and exports everything to CSV.
    """
    gender = gender.lower().strip()
    image_dir_path = Path(image_dir)
    
    if not image_dir_path.exists():
        raise FileNotFoundError(f"Image directory not found: {image_dir}")

    # Find all images
    valid_exts = {".jpg", ".jpeg", ".png", ".webp"}
    image_paths = [
        p for p in image_dir_path.iterdir()
        if p.suffix.lower() in valid_exts
    ]
    
    logger.info(f"Found {len(image_paths)} images in {image_dir}")

    records = []
    
    for idx, img_path in enumerate(image_paths, start=1):
        filename = img_path.name
        logger.info(f"[{idx}/{len(image_paths)}] Processing {filename}...")
        
        record = {
            "gender": gender,
            "shoulder_to_hip": "",
            "waist_to_hip": "",
            "shoulder_to_waist": "",
            "torso_aspect": "",
            "symmetry": "",
            "midline_offset": "",
            "pseudo_label": "",
            "ground_truth_label": "",  # left empty for human annotation/correction
            "source_image_id": filename,
            "data_source": data_source,
            "validation_status": "valid"
        }
        
        try:
            # 1. Preprocess
            img_rgb = preprocessing.preprocess(str(img_path))
            
            # 2. Extract Landmarks & Mask
            extracted = landmarks.extract(img_rgb)
            if len(extracted) == 3:
                named, raw, segmentation_mask = extracted
            else:
                named, raw = extracted
                segmentation_mask = None
                
            # 3. Derive Features (using existing logic)
            derived = features.derive(named, segmentation_mask=segmentation_mask)
            feats = derived["features"]
            
            # Populate features
            for key in classifier.FEATURE_KEYS:
                record[key] = f"{feats[key]:.6f}"

            # 4. Validate ratios using existing validator (if exists)
            # Since we restored the original state, features.validate_features is NOT in the file,
            # but we can validate it ourselves or catch any math errors.
            # Let's perform basic anatomical checks
            sh_hip = feats.get("shoulder_to_hip", 1.0)
            w_hip = feats.get("waist_to_hip", 1.0)
            if not (0.35 <= sh_hip <= 2.5) or not (0.3 <= w_hip <= 1.8):
                record["validation_status"] = "invalid_impossible_ratios"
            
            # 5. Extract rule-based prediction as pseudo_label (without treating it as ground truth)
            # The restored classifier.predict executes rule-based models first
            prediction = classifier.predict(feats, gender)
            record["pseudo_label"] = prediction["label"]
            
        except landmarks.PoseExtractionError as e:
            record["validation_status"] = f"invalid_pose_extraction: {str(e)}"
        except Exception as e:
            record["validation_status"] = f"invalid_failed_processing: {str(e)}"

        records.append(record)

    # Write records to CSV
    csv_exists = os.path.exists(output_csv)
    mode = 'a' if csv_exists else 'w'
    
    with open(output_csv, mode=mode, newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=CSV_HEADERS)
        if not csv_exists:
            writer.writeheader()
        for rec in records:
            writer.writerow(rec)

    logger.info(f"Batch processing completed. Results written to: {output_csv}")
    return records

def validate_csv_dataset(csv_path):
    """
    Reads the CSV dataset, runs validation checks, and prints comprehensive
    statistics about class balance, genders, invalid entries, and duplicates.
    """
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"CSV file not found at: {csv_path}")

    total_samples = 0
    valid_samples = 0
    invalid_samples = 0
    
    gender_dist = {"female": 0, "male": 0}
    invalid_reasons = {}
    
    gt_class_dist = {}
    pseudo_class_dist = {}
    
    missing_features_count = 0
    missing_targets_count = 0
    
    seen_feature_vectors = set()
    duplicate_count = 0
    
    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        # Verify required headers
        fieldnames = reader.fieldnames
        for col in CSV_HEADERS:
            if col not in fieldnames:
                raise ValueError(f"CSV missing column: '{col}'")

        for row_idx, row in enumerate(reader, start=2):
            total_samples += 1
            
            gender = (row.get("gender") or "").lower().strip()
            if gender in gender_dist:
                gender_dist[gender] += 1

            status = row.get("validation_status") or "valid"
            if not status.startswith("valid"):
                invalid_samples += 1
                invalid_reasons[status] = invalid_reasons.get(status, 0) + 1
                continue
            
            # Check for missing features
            has_missing_feature = False
            feats_list = []
            for key in classifier.FEATURE_KEYS:
                val_str = row.get(key)
                if val_str is None or val_str.strip() == "":
                    has_missing_feature = True
                else:
                    try:
                        feats_list.append(float(val_str))
                    except ValueError:
                        has_missing_feature = True
            
            if has_missing_feature:
                missing_features_count += 1
                invalid_samples += 1
                invalid_reasons["missing_features"] = invalid_reasons.get("missing_features", 0) + 1
                continue

            # Check for duplicates
            # A duplicate is defined by identical float values for all 6 features in the batch
            feat_vector = tuple(feats_list)
            if feat_vector in seen_feature_vectors:
                duplicate_count += 1
                # Still count as valid for feature space, but note duplicate status
            else:
                seen_feature_vectors.add(feat_vector)

            valid_samples += 1
            
            # Read labels
            gt_label = (row.get("ground_truth_label") or "").strip().lower()
            pseudo_label = (row.get("pseudo_label") or "").strip().lower()
            
            if not gt_label and not pseudo_label:
                missing_targets_count += 1
                
            if gt_label:
                gt_class_dist[gt_label] = gt_class_dist.get(gt_label, 0) + 1
            if pseudo_label:
                pseudo_class_dist[pseudo_label] = pseudo_class_dist.get(pseudo_label, 0) + 1

    stats = {
        "total_samples": total_samples,
        "valid_samples": valid_samples,
        "invalid_samples": invalid_samples,
        "duplicate_count": duplicate_count,
        "missing_features_count": missing_features_count,
        "missing_targets_count": missing_targets_count,
        "gender_distribution": gender_dist,
        "invalid_reasons": invalid_reasons,
        "ground_truth_class_distribution": gt_class_dist,
        "pseudo_label_class_distribution": pseudo_class_dist
    }

    logger.info("=== Dataset Statistics ===")
    logger.info(f"Total samples processed:   {total_samples}")
    logger.info(f"Valid samples (pass checks): {valid_samples}")
    logger.info(f"Invalid/Corrupted samples:  {invalid_samples}")
    if invalid_reasons:
        logger.info("  Breakdown of invalid reasons:")
        for reason, count in invalid_reasons.items():
            logger.info(f"    - {reason}: {count}")
            
    logger.info(f"Duplicate samples:          {duplicate_count}")
    logger.info(f"Gender distribution:")
    for g, count in gender_dist.items():
        logger.info(f"  - {g}: {count}")
        
    logger.info(f"Missing features:           {missing_features_count}")
    logger.info(f"Missing target labels:      {missing_targets_count}")
    
    logger.info("Ground Truth class distribution:")
    if gt_class_dist:
        for cls, count in gt_class_dist.items():
            logger.info(f"  - {cls}: {count}")
    else:
        logger.info("  (No ground truth labels assigned yet)")
        
    logger.info("Pseudo-Label class distribution:")
    for cls, count in pseudo_class_dist.items():
        logger.info(f"  - {cls}: {count}")

    return stats

def generate_csv_template(output_path):
    """
    Creates an empty CSV template file showing the exact feature schema
    expected by the pipeline.
    """
    with open(output_path, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(CSV_HEADERS)
    logger.info(f"CSV template generated at: {output_path}")
