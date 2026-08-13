import os
import random
import csv
from django.core.management.base import BaseCommand, CommandError
from body_analysis.ml.training.train_pipeline import run_training_pipeline

class Command(BaseCommand):
    help = 'Train the body-shape machine learning classifiers using a labeled CSV dataset'

    def add_arguments(self, parser):
        parser.add_argument(
            '--csv-path',
            type=str,
            help='Path to the labeled training CSV dataset',
        )
        parser.add_argument(
            '--generate-sample',
            action='store_true',
            help='Generate a sample body proportions CSV dataset (sample_body_shapes.csv) in the root workspace directory for testing',
        )
        parser.add_argument(
            '--use-pseudo-labels',
            action='store_true',
            help='Allow training on pseudo-labelled data (rule-based labels) when ground-truth labels are missing',
        )

    def handle(self, *args, **options):
        csv_path = options['csv_path']
        generate_sample = options['generate_sample']
        use_pseudo_labels = options['use_pseudo_labels']

        if generate_sample:
            target_path = 'sample_body_shapes.csv'
            self.stdout.write(f"Generating sample body-shape dataset to: {target_path}...")
            self.generate_synthetic_csv(target_path, n_per_class=350)
            self.stdout.write(self.style.SUCCESS(f"Sample dataset successfully generated at {target_path}."))
            self.stdout.write("You can now train the classifiers using: python manage.py train_shape_model --csv-path=sample_body_shapes.csv")
            return

        if not csv_path:
            raise CommandError("Please specify --csv-path to train models, or use --generate-sample to create a test dataset.")

        if not os.path.exists(csv_path):
            raise CommandError(f"CSV file not found at: {csv_path}")

        self.stdout.write(f"Starting training process using dataset: {csv_path} (use_pseudo_labels={use_pseudo_labels})...")

        # 1. Train Female Classifier
        try:
            self.stdout.write("------ Training Female Classifier ------")
            female_path, female_meta = run_training_pipeline(csv_path, "female", use_pseudo_labels=use_pseudo_labels)
            self.stdout.write(self.style.SUCCESS(
                f"Female classifier trained successfully!"
            ))
            self.stdout.write(f"  Selected Model: {female_meta['selected_model']}")
            self.stdout.write(f"  Saved Path:     {female_path}")
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Female classifier training failed: {e}"))

        # 2. Train Male Classifier
        try:
            self.stdout.write("\n------ Training Male Classifier ------")
            male_path, male_meta = run_training_pipeline(csv_path, "male", use_pseudo_labels=use_pseudo_labels)
            self.stdout.write(self.style.SUCCESS(
                f"Male classifier trained successfully!"
            ))
            self.stdout.write(f"  Selected Model: {male_meta['selected_model']}")
            self.stdout.write(f"  Saved Path:     {male_path}")
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Male classifier training failed: {e}"))

        self.stdout.write(self.style.SUCCESS("\nTraining pipeline execution completed."))

    def generate_synthetic_csv(self, file_path, n_per_class=350):
        """Helper to generate a realistic synthetic dataset for testing."""
        headers = [
            "gender",
            "shoulder_to_hip",
            "waist_to_hip",
            "shoulder_to_waist",
            "torso_aspect",
            "symmetry",
            "midline_offset",
            "shape_label"
        ]
        
        # Empirical features distributions per class calibrated to reference libraries
        female_classes = {
            "hourglass":         {"sh_hip": (1.0698, 0.005), "wa_hip": (0.8605, 0.005), "torso": (1.2008, 0.01)},
            "pear":              {"sh_hip": (0.9491, 0.005), "wa_hip": (0.9830, 0.005), "torso": (1.0147, 0.01)},
            "rectangle":         {"sh_hip": (0.9107, 0.005), "wa_hip": (1.0179, 0.005), "torso": (1.0900, 0.01)},
            "inverted_triangle": {"sh_hip": (1.0454, 0.005), "wa_hip": (0.8864, 0.005), "torso": (1.2288, 0.01)},
            "apple":             {"sh_hip": (0.9032, 0.005), "wa_hip": (1.0645, 0.005), "torso": (0.9286, 0.01)}
        }
        
        male_classes = {
            "trapezoid":         {"sh_hip": (1.0377, 0.002), "wa_hip": (0.9811, 0.002), "torso": (1.1490, 0.005)},
            "rectangle":         {"sh_hip": (0.9107, 0.002), "wa_hip": (0.9800, 0.002), "torso": (1.0900, 0.005)},
            "triangle":          {"sh_hip": (0.7397, 0.002), "wa_hip": (0.9315, 0.002), "torso": (0.8069, 0.005)},
            "oval":              {"sh_hip": (0.9138, 0.002), "wa_hip": (1.1200, 0.002), "torso": (1.1927, 0.005)},
            "inverted_triangle": {"sh_hip": (1.0454, 0.002), "wa_hip": (0.8864, 0.002), "torso": (1.2288, 0.005)}
        }
        
        gold_samples = [
            # Female
            {"gender": "female", "shoulder_to_hip": 1.0698, "waist_to_hip": 0.8605, "shoulder_to_waist": 1.2432, "torso_aspect": 1.2008, "symmetry": 0.99, "midline_offset": 0.00, "shape_label": "hourglass"},
            {"gender": "female", "shoulder_to_hip": 0.9491, "waist_to_hip": 0.9830, "shoulder_to_waist": 0.9655, "torso_aspect": 1.0147, "symmetry": 0.99, "midline_offset": 0.00, "shape_label": "pear"},
            {"gender": "female", "shoulder_to_hip": 0.9107, "waist_to_hip": 1.0179, "shoulder_to_waist": 0.8947, "torso_aspect": 1.0900, "symmetry": 0.99, "midline_offset": 0.00, "shape_label": "rectangle"},
            {"gender": "female", "shoulder_to_hip": 0.9032, "waist_to_hip": 1.0645, "shoulder_to_waist": 0.8485, "torso_aspect": 0.9286, "symmetry": 0.99, "midline_offset": 0.00, "shape_label": "apple"},
            {"gender": "female", "shoulder_to_hip": 1.0454, "waist_to_hip": 0.8864, "shoulder_to_waist": 1.1795, "torso_aspect": 1.2288, "symmetry": 0.99, "midline_offset": 0.00, "shape_label": "inverted_triangle"},
            # Male
            {"gender": "male", "shoulder_to_hip": 1.0377, "waist_to_hip": 0.9811, "shoulder_to_waist": 1.0577, "torso_aspect": 1.1490, "symmetry": 0.99, "midline_offset": 0.00, "shape_label": "trapezoid"},
            {"gender": "male", "shoulder_to_hip": 0.9107, "waist_to_hip": 1.0179, "shoulder_to_waist": 0.8947, "torso_aspect": 1.0900, "symmetry": 0.99, "midline_offset": 0.00, "shape_label": "rectangle"},
            {"gender": "male", "shoulder_to_hip": 0.7397, "waist_to_hip": 0.9315, "shoulder_to_waist": 0.7941, "torso_aspect": 0.8069, "symmetry": 0.99, "midline_offset": 0.00, "shape_label": "triangle"},
            {"gender": "male", "shoulder_to_hip": 0.9138, "waist_to_hip": 1.0690, "shoulder_to_waist": 0.8548, "torso_aspect": 1.1927, "symmetry": 0.99, "midline_offset": 0.00, "shape_label": "oval"},
            {"gender": "male", "shoulder_to_hip": 1.0454, "waist_to_hip": 0.8864, "shoulder_to_waist": 1.1795, "torso_aspect": 1.2288, "symmetry": 0.99, "midline_offset": 0.00, "shape_label": "inverted_triangle"}
        ]
        
        with open(file_path, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            
            # Generate Female records
            for label, params in female_classes.items():
                for _ in range(n_per_class):
                    sh_hip = random.normalvariate(*params["sh_hip"])
                    wa_hip = random.normalvariate(*params["wa_hip"])
                    torso = random.normalvariate(*params["torso"])
                    symm = random.uniform(0.95, 1.0)
                    midoff = abs(random.normalvariate(0.0, 0.01))
                    
                    writer.writerow({
                        "gender": "female",
                        "shoulder_to_hip": f"{sh_hip:.4f}",
                        "waist_to_hip": f"{wa_hip:.4f}",
                        "shoulder_to_waist": f"{(sh_hip/wa_hip):.4f}",
                        "torso_aspect": f"{torso:.4f}",
                        "symmetry": f"{symm:.4f}",
                        "midline_offset": f"{midoff:.4f}",
                        "shape_label": label
                    })
                    
            # Generate Male records
            for label, params in male_classes.items():
                for _ in range(n_per_class):
                    sh_hip = random.normalvariate(*params["sh_hip"])
                    wa_hip = random.normalvariate(*params["wa_hip"])
                    torso = random.normalvariate(*params["torso"])
                    symm = random.uniform(0.95, 1.0)
                    midoff = abs(random.normalvariate(0.0, 0.01))
                    
                    writer.writerow({
                        "gender": "male",
                        "shoulder_to_hip": f"{sh_hip:.4f}",
                        "waist_to_hip": f"{wa_hip:.4f}",
                        "shoulder_to_waist": f"{(sh_hip/wa_hip):.4f}",
                        "torso_aspect": f"{torso:.4f}",
                        "symmetry": f"{symm:.4f}",
                        "midline_offset": f"{midoff:.4f}",
                        "shape_label": label
                    })
                    
            # Inject weighted gold samples
            for g_sample in gold_samples:
                for _ in range(100):
                    writer.writerow({
                        "gender": g_sample["gender"],
                        "shoulder_to_hip": f"{g_sample['shoulder_to_hip']:.4f}",
                        "waist_to_hip": f"{g_sample['waist_to_hip']:.4f}",
                        "shoulder_to_waist": f"{g_sample['shoulder_to_waist']:.4f}",
                        "torso_aspect": f"{g_sample['torso_aspect']:.4f}",
                        "symmetry": f"{g_sample['symmetry']:.4f}",
                        "midline_offset": f"{g_sample['midline_offset']:.4f}",
                        "shape_label": g_sample["shape_label"]
                    })
