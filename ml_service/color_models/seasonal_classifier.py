from .color_detector import SkinColorDetector

class SeasonalColorClassifier:
    """
    Classifies seasonal color palette based on undertone and skin tone.
    Strictly isolated from body_models.
    """
    def __init__(self):
        self.detector = SkinColorDetector()

    def classify_season(self, undertone, skin_tone):
        if undertone == "Cool" and skin_tone == "Fair":
            return "Winter"
        elif undertone == "Cool":
            return "Summer"
        elif undertone == "Warm" and skin_tone in ["Fair", "Medium"]:
            return "Spring"
        else:
            return "Autumn"
