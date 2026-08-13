"""
ml_service.measurement_models.feature_engineering.measurements

Measurement Extractor Engine.
"""

from ml_service.measurement_models.preprocessing.normalization import (
    PoseNormalizer,
    calculate_distance,
    midpoint,
    LEFT_SHOULDER,
    RIGHT_SHOULDER,
    LEFT_HIP,
    RIGHT_HIP,
)


class MeasurementExtractor:
    """Extracts anatomical body measurements and ratios from normalized keypoints."""
    NORMALIZER = PoseNormalizer()
    WAIST_CONCAVITY = 0.10
    CLOTHING_BUFFER = 0.15

    def extract(self, landmarks_data):
        landmarks = landmarks_data['landmarks']
        width = landmarks_data['image_width']
        height = landmarks_data['image_height']

        lms = self.NORMALIZER.normalize(landmarks, width, height)

        left_shoulder = (lms[LEFT_SHOULDER]['x'] * width, lms[LEFT_SHOULDER]['y'] * height)
        right_shoulder = (lms[RIGHT_SHOULDER]['x'] * width, lms[RIGHT_SHOULDER]['y'] * height)
        left_hip = (lms[LEFT_HIP]['x'] * width, lms[LEFT_HIP]['y'] * height)
        right_hip = (lms[RIGHT_HIP]['x'] * width, lms[RIGHT_HIP]['y'] * height)

        shoulder_width = calculate_distance(left_shoulder, right_shoulder)
        hip_width = calculate_distance(left_hip, right_hip)

        waist_width = self._estimate_waist_width(
            left_shoulder, right_shoulder,
            left_hip, right_hip
        )

        shoulder_width, hip_width, waist_width = self._apply_clothing_buffer(
            shoulder_width, hip_width, waist_width
        )

        shoulder_to_hip = shoulder_width / hip_width if hip_width > 0 else 0.0
        waist_to_hip = waist_width / hip_width if hip_width > 0 else 0.0
        shoulder_to_waist = shoulder_width / waist_width if waist_width > 0 else 0.0

        avg_sw_hw = (shoulder_width + hip_width) / 2.0
        waist_definition = max(0.0, (avg_sw_hw - waist_width) / avg_sw_hw) if avg_sw_hw > 0 else 0.0
        body_balance = shoulder_to_hip

        shoulder_mid = midpoint(left_shoulder, right_shoulder)
        hip_mid = midpoint(left_hip, right_hip)
        torso_height = calculate_distance(shoulder_mid, hip_mid)

        key_visibilities = [
            lms[LEFT_SHOULDER]['visibility'],
            lms[RIGHT_SHOULDER]['visibility'],
            lms[LEFT_HIP]['visibility'],
            lms[RIGHT_HIP]['visibility'],
        ]
        avg_visibility = sum(key_visibilities) / len(key_visibilities)

        return {
            'shoulder_width': round(shoulder_width, 2),
            'hip_width': round(hip_width, 2),
            'waist_width': round(waist_width, 2),
            'torso_height': round(torso_height, 2),
            'shoulder_to_hip': round(shoulder_to_hip, 4),
            'waist_to_hip': round(waist_to_hip, 4),
            'shoulder_to_waist': round(shoulder_to_waist, 4),
            'waist_definition': round(waist_definition, 4),
            'body_balance': round(body_balance, 4),
            'landmark_confidence': round(avg_visibility, 4),
        }

    def _estimate_waist_width(self, ls, rs, lh, rh):
        left_mid = midpoint(ls, lh)
        right_mid = midpoint(rs, rh)
        interpolated_width = calculate_distance(left_mid, right_mid)
        return interpolated_width * (1.0 - self.WAIST_CONCAVITY)

    def _apply_clothing_buffer(self, sw, hw, ww):
        max_allowed_sw = hw * (1.0 + self.CLOTHING_BUFFER * 2)
        max_allowed_hw = sw * (1.0 + self.CLOTHING_BUFFER * 2)
        sw_clamped = min(sw, max_allowed_sw) if max_allowed_sw > 0 else sw
        hw_clamped = min(hw, max_allowed_hw) if max_allowed_hw > 0 else hw
        return sw_clamped, hw_clamped, ww
