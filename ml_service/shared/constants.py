"""
ml_service.shared.constants

Constants, Class Names, Feature Names, and Presentation Copy Mappings.
"""

FEMALE_CLASSES = ["apple", "hourglass", "inverted_triangle", "pear", "rectangle"]
MALE_CLASSES = ["trapezoid", "rectangle", "triangle", "oval", "inverted_triangle"]

FEATURE_KEYS = [
    "shoulder_to_hip",    # primary shape discriminator — pear(<0.92) vs IT(>1.09)
    "waist_to_hip",       # waist depth relative to hips — hourglass is very low here
    "shoulder_to_waist",  # key for hourglass (high) vs apple (low)
    "chest_to_hip",       # reinforces pear (low) and inverted_triangle (high)
    "waist_definition",   # strongest hourglass signal; apple/rect have very low values
    "torso_aspect",       # torso height-to-width ratio
]

FEMALE_FEATURE_COLS = [
    "shoulder_width",
    "chest_width",
    "waist_width",
    "hip_width",
    "torso_length",
    "leg_length",
    "shoulder_hip_ratio",
    "waist_hip_ratio",
    "chest_waist_ratio",
]

MALE_FEATURE_COLS = [
    "shoulder_width",
    "chest_width",
    "waist_width",
    "hip_width",
    "torso_length",
    "leg_length",
    "shoulder_hip_ratio",
    "waist_hip_ratio",
    "chest_waist_ratio",
]

PRESENTATION = {
    "hourglass": {"emoji": "⧖", "description": "Balanced shoulder and hip line with a defined waist — the classic symmetrical silhouette."},
    "pear": {"emoji": "◐", "description": "Hips read wider than the shoulder line, with a softly defined waist."},
    "apple": {"emoji": "◉", "description": "Fullness through the midsection with a softer waist definition and slimmer lower body."},
    "rectangle": {"emoji": "▭", "description": "Shoulders, waist and hips run on a similar vertical line — a long, athletic frame."},
    "inverted_triangle": {"emoji": "▽", "description": "Strong shoulder line tapering down through a narrower hip."},
    "triangle": {"emoji": "△", "description": "Lower body anchors the silhouette, with a lighter upper frame."},
    "trapezoid": {"emoji": "⬟", "description": "Broad shoulders tapering cleanly into a proportioned waist and hips."},
    "oval": {"emoji": "◯", "description": "Soft curve through the waist and torso area with narrower shoulders and legs."}
}

DEFAULT_PRESENTATION = {"emoji": "◈", "description": "A distinctive silhouette read directly from your proportions."}
