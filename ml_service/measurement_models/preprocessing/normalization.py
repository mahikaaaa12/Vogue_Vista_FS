"""
ml_service.measurement_models.preprocessing.normalization

Pose Normalizer and Measurement Preprocessing Utilities.
"""

import math


def calculate_distance(a, b):
    return math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)


def midpoint(a, b):
    return ((a[0] + b[0]) / 2.0, (a[1] + b[1]) / 2.0)


def rotate_point(px, py, cx, cy, angle_rad):
    cos_a = math.cos(angle_rad)
    sin_a = math.sin(angle_rad)
    dx = px - cx
    dy = py - cy
    return (
        cx + dx * cos_a - dy * sin_a,
        cy + dx * sin_a + dy * cos_a
    )


LEFT_SHOULDER = 11
RIGHT_SHOULDER = 12
LEFT_ELBOW = 13
RIGHT_ELBOW = 14
LEFT_HIP = 23
RIGHT_HIP = 24
LEFT_KNEE = 25
RIGHT_KNEE = 26


class PoseNormalizer:
    """
    Rotates all landmarks so that:
      • The shoulder line is perfectly horizontal (corrects camera/body tilt).
      • The torso vertical axis aligns with the image vertical axis.
    """

    def normalize(self, landmarks, width, height):
        ls = landmarks[LEFT_SHOULDER]
        rs = landmarks[RIGHT_SHOULDER]

        ls_px = (ls['x'] * width, ls['y'] * height)
        rs_px = (rs['x'] * width, rs['y'] * height)

        dy = rs_px[1] - ls_px[1]
        dx = rs_px[0] - ls_px[0]
        tilt_angle = math.atan2(dy, dx)

        cx, cy = midpoint(ls_px, rs_px)

        corrected = []
        for lm in landmarks:
            px = lm['x'] * width
            py = lm['y'] * height
            nx, ny = rotate_point(px, py, cx, cy, -tilt_angle)
            corrected.append({
                'x': nx / width,
                'y': ny / height,
                'z': lm.get('z', 0.0),
                'visibility': lm.get('visibility', 1.0),
            })

        return corrected
