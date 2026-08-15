"""
body_analysis.intelligence.body_traits

Anatomical Trait Extraction and Shape Explanation Engine.

Produces:
  - extract_traits(features)       → list of descriptive trait strings (backward-compatible)
  - generate_explanation(features, shape) → dict with anatomical reasoning + key measurements
"""
from __future__ import annotations


def extract_traits(features: dict) -> list:
    """
    Returns a list of descriptive trait strings based on anatomical measurements.
    Backward-compatible with existing frontend consumption.
    """
    traits = []

    s2h = features.get("shoulder_to_hip", 1.0)
    wd  = features.get("waist_definition", 0.0)
    vis = features.get("avg_visibility", features.get("landmark_confidence", 1.0))
    w2h = features.get("waist_to_hip", 0.85)
    c2h = features.get("chest_to_hip", 1.0)

    # Shoulder-to-hip balance
    if s2h > 1.09:
        traits.append("Shoulder dominant")
    elif s2h < 0.92:
        traits.append("Hip dominant")
    else:
        traits.append("Balanced frame")

    # Waist definition
    if wd > 0.24:
        traits.append("Defined waist")
    elif wd < 0.12:
        traits.append("Straight waistline")
    else:
        traits.append("Soft waist definition")

    # Landmark confidence
    if vis > 0.90:
        traits.append("High landmark confidence")
    elif vis < 0.60:
        traits.append("Low landmark confidence — re-take with better lighting")

    return traits


def generate_explanation(features: dict, predicted_shape: str) -> dict:
    """
    Generates personalized anatomical reasoning for the predicted body shape.

    Returns a dict with:
      - reasoning: str — a paragraph explaining which measurements led to the classification
      - key_measurements: dict — the 5 key ratio values that drove the decision
    """
    s2h = features.get("shoulder_to_hip", 1.0)
    w2h = features.get("waist_to_hip", 0.85)
    wd  = features.get("waist_definition", 0.15)
    s2w = features.get("shoulder_to_waist", 1.2)
    c2h = features.get("chest_to_hip", 1.0)

    shape_key = (predicted_shape or "").lower().replace(" ", "_")

    _TEMPLATES = {
        # Female & General
        "hourglass": (
            "Your shoulder-to-hip ratio of {s2h:.2f} shows near-perfect balance between "
            "your upper and lower body frames. The clearest signal is your waist definition "
            "score of {wd:.2f} — one of the highest possible readings — which indicates a "
            "deeply curved waist. Your waist-to-hip ratio of {w2h:.2f} confirms significant "
            "narrowing through the midsection. Your shoulder-to-waist ratio of {s2w:.2f} "
            "further shows how dramatically the waist draws inward relative to the shoulder "
            "line. These measurements are the anatomical hallmarks of the hourglass silhouette."
        ),
        "pear": (
            "Your shoulder-to-hip ratio of {s2h:.2f} reveals that your hip line is measurably "
            "wider than your shoulder line — the defining characteristic of the pear shape. "
            "Your chest-to-hip ratio of {c2h:.2f} confirms a narrower upper body relative to "
            "the lower frame. A waist definition score of {wd:.2f} indicates a naturally curved "
            "waist that creates a distinct silhouette through the midsection. The lower body "
            "anchors the silhouette while the upper body tapers upward."
        ),
        "inverted_triangle": (
            "Your shoulder-to-hip ratio of {s2h:.2f} indicates that your shoulder and chest "
            "line is significantly broader than your hip line — the primary marker of the "
            "inverted triangle shape. Your chest-to-hip ratio of {c2h:.2f} reinforces this "
            "reading with a wide chest relative to narrower hips. Your shoulder-to-waist "
            "ratio of {s2w:.2f} shows the characteristic V-shaped taper through the torso. "
            "This creates a strong, athletic upper silhouette."
        ),
        "apple": (
            "Your waist-to-hip ratio of {w2h:.2f} and low waist definition score of {wd:.2f} "
            "indicate fullness through the midsection with minimal waist curve — the signature "
            "of the apple shape. Your shoulder-to-waist ratio of {s2w:.2f} shows that the "
            "waist carries most of the body's width rather than tapering inward. Your "
            "shoulder-to-hip ratio of {s2h:.2f} shows a relatively balanced upper-to-lower "
            "frame, with volume concentrated in the midsection."
        ),
        "rectangle": (
            "Your shoulder-to-hip ratio of {s2h:.2f} shows nearly equal width across the "
            "shoulder and hip line, creating a straight vertical silhouette. A waist "
            "definition score of {wd:.2f} reflects minimal waist narrowing — the shoulder, "
            "waist, and hip measurements run on a similar vertical axis. Your shoulder-to-waist "
            "ratio of {s2w:.2f} confirms that the waist is proportionally close to the shoulder "
            "width. This straight, athletic frame is the signature of the rectangle shape."
        ),
        # Male-specific shapes
        "trapezoid": (
            "Your shoulder-to-hip ratio of {s2h:.2f} shows a broad, athletic shoulder and chest "
            "line that tapers cleanly into a well-proportioned waist and hips. Your chest-to-hip "
            "ratio of {c2h:.2f} indicates an expansive upper torso with balanced lower proportions. "
            "Your waist-to-hip ratio of {w2h:.2f} and waist definition of {wd:.2f} reflect a "
            "natural, versatile athletic taper — the defining hallmark of the trapezoid silhouette."
        ),
        "triangle": (
            "Your shoulder-to-hip ratio of {s2h:.2f} indicates that your lower torso and hip line "
            "are slightly broader than your upper shoulder frame. Your chest-to-hip ratio of {c2h:.2f} "
            "shows a narrower upper chest line relative to the lower body, with your waist-to-hip "
            "ratio of {w2h:.2f} confirming that the lower frame anchors the silhouette. This "
            "clean anatomical distribution is the signature of the triangle body shape."
        ),
        "oval": (
            "Your waist-to-hip ratio of {w2h:.2f} and waist definition score of {wd:.2f} "
            "indicate central torso volume with a soft, rounded midsection profile. Your "
            "shoulder-to-hip ratio of {s2h:.2f} and chest-to-hip ratio of {c2h:.2f} show a "
            "harmonious, continuous curve through the torso rather than sharp angular lines, "
            "which characterizes the oval silhouette."
        ),
    }

    template = _TEMPLATES.get(
        shape_key,
        "Body shape classification based on geometric proportions extracted from pose "
        "estimation landmarks. Shoulder-to-hip ratio: {s2h:.2f}, waist definition: {wd:.2f}."
    )

    try:
        reasoning = template.format(s2h=s2h, w2h=w2h, wd=wd, s2w=s2w, c2h=c2h)
    except (KeyError, ValueError):
        reasoning = template

    return {
        "reasoning": reasoning,
        "key_measurements": {
            "shoulder_to_hip_ratio":    round(float(s2h), 3),
            "waist_to_hip_ratio":       round(float(w2h), 3),
            "waist_definition_score":   round(float(wd),  3),
            "shoulder_to_waist_ratio":  round(float(s2w), 3),
            "chest_to_hip_ratio":       round(float(c2h), 3),
        },
    }