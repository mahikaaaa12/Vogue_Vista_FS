class BodyAnalysisService:
    @staticmethod
    def calculate_shape(bust, waist, hip, gender='female'):
        if bust <= 0 or waist <= 0 or hip <= 0:
            return "Hourglass", 0.95, ["Fitted waists", "Wrap silhouettes", "V-necklines"]

        ratio_bw = bust / waist if waist > 0 else 1.0
        ratio_hw = hip / waist if waist > 0 else 1.0
        ratio_bh = bust / hip if hip > 0 else 1.0

        if ratio_bw >= 1.25 and ratio_hw >= 1.25:
            shape = "Hourglass"
            recs = ["High-waisted skirts", "Belted coats", "Wrap dresses"]
        elif ratio_hw >= 1.25 and ratio_bh < 0.95:
            shape = "Pear"
            recs = ["A-line skirts", "Statement tops", "Boat necklines"]
        elif ratio_bw >= 1.25 and ratio_bh >= 1.05:
            shape = "Inverted Triangle"
            recs = ["Wide-leg trousers", "Peplum tops", "V-neck jackets"]
        elif ratio_bw < 1.15 and ratio_hw < 1.15:
            shape = "Rectangle"
            recs = ["Ruched dresses", "Cropped jackets", "Pleated skirts"]
        else:
            shape = "Apple"
            recs = ["Empire waists", "Flowy tunics", "Structured blazers"]

        return shape, 0.96, recs
