import os
from django.core.management.base import BaseCommand, CommandError
from body_analysis.ml.training import dataset_preparation

class Command(BaseCommand):
    help = 'Batch process body images to extract features, validate datasets, and generate training templates.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--image-dir',
            type=str,
            help='Directory containing body images to process and extract features from',
        )
        parser.add_argument(
            '--gender',
            type=str,
            default='female',
            choices=['female', 'male'],
            help='Gender category to assign to processed images (default: female)',
        )
        parser.add_argument(
            '--output-csv',
            type=str,
            default='body_shapes_dataset.csv',
            help='Output CSV path where extracted features will be appended (default: body_shapes_dataset.csv)',
        )
        parser.add_argument(
            '--data-source',
            type=str,
            default='batch_import',
            help='Source value to tag the imported data (default: batch_import)',
        )
        parser.add_argument(
            '--validate-csv',
            type=str,
            help='Path to a CSV file to validate and print statistics for',
        )
        parser.add_argument(
            '--create-template',
            type=str,
            help='Path to generate an empty CSV schema template file',
        )

    def handle(self, *args, **options):
        image_dir = options['image_dir']
        gender = options['gender']
        output_csv = options['output_csv']
        data_source = options['data_source']
        validate_csv = options['validate_csv']
        create_template = options['create_template']

        if create_template:
            self.stdout.write(f"Generating empty CSV template schema at {create_template}...")
            dataset_preparation.generate_csv_template(create_template)
            self.stdout.write(self.style.SUCCESS(f"Template schema successfully written to {create_template}."))
            return

        if validate_csv:
            self.stdout.write(f"Validating dataset and calculating statistics for: {validate_csv}...")
            if not os.path.exists(validate_csv):
                raise CommandError(f"CSV file not found at: {validate_csv}")
            try:
                dataset_preparation.validate_csv_dataset(validate_csv)
                self.stdout.write(self.style.SUCCESS("Dataset validation completed successfully."))
            except Exception as e:
                raise CommandError(f"Validation failed: {e}")
            return

        if not image_dir:
            raise CommandError("Please specify --image-dir to extract features from images, --validate-csv to validate, or --create-template.")

        if not os.path.exists(image_dir):
            raise CommandError(f"Image directory not found at: {image_dir}")

        self.stdout.write(f"Batch processing images in: {image_dir}...")
        self.stdout.write(f"Gender configuration:       {gender}")
        self.stdout.write(f"Output CSV path:            {output_csv}")
        self.stdout.write(f"Data source tag:            {data_source}")

        try:
            records = dataset_preparation.batch_extract_features(
                image_dir, gender, output_csv, data_source=data_source
            )
            self.stdout.write(self.style.SUCCESS(
                f"Successfully processed {len(records)} images in batch. Results written to {output_csv}."
            ))
        except Exception as e:
            raise CommandError(f"Batch processing failed: {e}")
