"""
ml_service.measurement_models.feature_engineering.features

Scale-Invariant Geometric Feature Extraction Engine  —  v4.0

Anatomical outer-silhouette measurements with:
1. Outer shoulder width: measured from mask at shoulder height with lateral bounding.
2. Outer hip width: measured from mask at hip height and 20% below, with lateral bounding.
3. Outer waist width: minimum width in the waist zone (42-68% torso) with arm-exclusion.
4. Scale-invariant V-taper (chest_to_hip) and waist definition ratios.
"""

from __future__ import annotations
import numpy as np


def _pt(lm: dict, key: str) -> np.ndarray:
    p = lm[key]
    return np.array([p["x"], p["y"]], dtype=np.float32)


def _dist(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.linalg.norm(a - b))


def clip(val: float, lo: float, hi: float) -> float:
    return float(max(lo, min(hi, val)))


def _avg_visibility(landmarks: dict, keys: tuple) -> float:
    vis = [landmarks[k].get("visibility", 1.0) for k in keys if k in landmarks]
    return float(np.mean(vis)) if vis else 1.0


def calculate_ratios(
    shoulder: float,
    waist: float,
    hip: float,
    torso: float,
    symmetry: float = 1.0,
    midline_offset: float = 0.0,
) -> dict:
    eps = 1e-6
    return {
        "shoulder_to_hip":   float(shoulder / (hip + eps)),
        "waist_to_hip":      float(waist   / (hip + eps)),
        "shoulder_to_waist": float(shoulder / (waist + eps)),
        "torso_aspect":      float(torso   / (max(shoulder, hip) + eps)),
        "symmetry":          float(symmetry),
        "midline_offset":    float(midline_offset),
    }


def derive(landmarks: dict, segmentation_mask=None) -> dict:  # noqa: C901
    ls = _pt(landmarks, "left_shoulder")
    rs = _pt(landmarks, "right_shoulder")
    lh = _pt(landmarks, "left_hip")
    rh = _pt(landmarks, "right_hip")

    le = _pt(landmarks, "left_elbow") if "left_elbow" in landmarks else None
    re = _pt(landmarks, "right_elbow") if "right_elbow" in landmarks else None

    shoulder_mid = (ls + rs) / 2.0
    hip_mid      = (lh + rh) / 2.0

    landmark_shoulder = _dist(ls, rs)
    landmark_hip      = _dist(lh, rh)
    torso_height      = _dist(shoulder_mid, hip_mid)

    eps = 1e-6
    avg_vis = _avg_visibility(
        landmarks, ("left_shoulder", "right_shoulder", "left_hip", "right_hip")
    )

    # Default fallbacks
    shoulder_width = landmark_shoulder * 1.35
    hip_width      = landmark_hip * 1.35
    waist_width    = (shoulder_width + hip_width) / 2.0 * 0.85
    chest_width    = shoulder_width

    if segmentation_mask is not None:
        h_img, w_img = segmentation_mask.shape[:2]
        mask = (segmentation_mask > 0.5).astype(np.uint8)

        sh_y  = int(clip((ls[1] + rs[1]) / 2.0, 0, 0.999) * h_img)
        hip_y = int(clip((lh[1] + rh[1]) / 2.0, 0, 0.999) * h_img)

        # Helper to measure torso width with bounding and optional arm exclusion
        def measure_width(y_px: int, is_waist: bool = False) -> float:
            y_px = max(0, min(h_img - 1, y_px))
            y_norm = float(y_px) / h_img
            t = (y_px - sh_y) / (hip_y - sh_y) if hip_y > sh_y else 0.5

            left_x = (1 - t) * ls[0] + t * lh[0]
            right_x = (1 - t) * rs[0] + t * rh[0]

            margin = 0.35 * max(landmark_shoulder, landmark_hip)
            allowed_left_px = int((left_x + margin) * w_img)
            allowed_right_px = int((right_x - margin) * w_img)

            row = mask[y_px, :].copy()

            if is_waist:
                arm_radius = 0.12 * landmark_shoulder
                # Exclude left arm
                left_arm_x = None
                if le is not None:
                    if ls[1] <= y_norm <= le[1]:
                        t_arm = (y_norm - ls[1]) / (le[1] - ls[1]) if le[1] > ls[1] else 0.0
                        left_arm_x = (1 - t_arm) * ls[0] + t_arm * le[0]
                    else:
                        left_arm_x = le[0]
                else:
                    left_arm_x = ls[0] + 0.15 * landmark_shoulder

                la_start = int((left_arm_x - arm_radius) * w_img)
                la_end = int((left_arm_x + arm_radius) * w_img)
                row[max(0, la_start):min(w_img, la_end)] = 0

                # Exclude right arm
                right_arm_x = None
                if re is not None:
                    if rs[1] <= y_norm <= re[1]:
                        t_arm = (y_norm - rs[1]) / (re[1] - rs[1]) if re[1] > rs[1] else 0.0
                        right_arm_x = (1 - t_arm) * rs[0] + t_arm * re[0]
                    else:
                        right_arm_x = re[0]
                else:
                    right_arm_x = rs[0] - 0.15 * landmark_shoulder

                ra_start = int((right_arm_x - arm_radius) * w_img)
                ra_end = int((right_arm_x + arm_radius) * w_img)
                row[max(0, ra_start):min(w_img, ra_end)] = 0

            idx = np.where(row > 0)[0]
            idx_filtered = [x for x in idx if allowed_right_px <= x <= allowed_left_px]
            if len(idx_filtered) >= 2:
                return float(idx_filtered[-1] - idx_filtered[0]) / w_img
            return 0.0

        # Outer shoulder width
        w_sh = measure_width(sh_y, is_waist=False)
        if w_sh > 0:
            shoulder_width = w_sh

        # Outer hip width (max of hip and below hip to catch trouser flare)
        w_hip1 = measure_width(hip_y, is_waist=False)
        hip_below_y = int(hip_y + 0.20 * (hip_y - sh_y))
        w_hip2 = measure_width(hip_below_y, is_waist=False)
        w_hip = max(w_hip1, w_hip2)
        if w_hip > 0:
            hip_width = w_hip

        # Outer waist width
        wz_start = int(sh_y + 0.42 * (hip_y - sh_y))
        wz_end   = int(sh_y + 0.68 * (hip_y - sh_y))
        wz_vals = [measure_width(y, is_waist=True) for y in range(wz_start, wz_end + 1)]
        wz_valid = [v for v in wz_vals if v > 0]
        if wz_valid:
            waist_width = min(wz_valid)

        # Outer chest width
        chest_y = int(sh_y + 0.28 * (hip_y - sh_y))
        w_chest = measure_width(chest_y, is_waist=False)
        if w_chest > 0:
            chest_width = w_chest

    # Ratios
    ratios = calculate_ratios(
        shoulder_width, waist_width, hip_width, torso_height
    )

    chest_to_hip = float(chest_width / (hip_width + eps))
    chest_to_waist = float(chest_width / (waist_width + eps))

    avg_sh_hip = (shoulder_width + hip_width) / 2.0
    waist_definition = max(0.0, (avg_sh_hip - waist_width) / (avg_sh_hip + eps))

    # Symmetry
    mid_x      = 0.5
    left_dev   = abs(ls[0] - mid_x) + abs(lh[0] - mid_x)
    right_dev  = abs(rs[0] - mid_x) + abs(rh[0] - mid_x)
    sym_dev    = abs(left_dev - right_dev) / max(left_dev + right_dev, eps)
    symmetry   = float(1.0 - min(1.0, sym_dev * 2.0))

    midline_offset = float(abs(shoulder_mid[0] - hip_mid[0]))

    return {
        "shoulder_width":    float(shoulder_width),
        "chest_width":       float(chest_width),
        "waist_width":       float(waist_width),
        "hip_width":         float(hip_width),
        "torso_height":      float(torso_height),
        "shoulder_to_hip":   ratios["shoulder_to_hip"],
        "waist_to_hip":      ratios["waist_to_hip"],
        "shoulder_to_waist": ratios["shoulder_to_waist"],
        "chest_to_hip":      float(chest_to_hip),
        "chest_to_waist":    float(chest_to_waist),
        "torso_aspect":      ratios["torso_aspect"],
        "symmetry":          float(symmetry),
        "midline_offset":    float(midline_offset),
        "waist_definition":  float(waist_definition),
        "landmark_confidence": float(avg_vis),
    }
