#!/usr/bin/env python3
"""
extract_body_measurements.py

Root entrypoint for running the modern MediaPipe Pose & Segmentation anthropometric measurement extraction pipeline.
"""

from ml_models.image_body_shape.preprocessing.extract_body_measurements import main

if __name__ == "__main__":
    main()
