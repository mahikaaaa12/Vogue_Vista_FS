#!/usr/bin/env python3
"""
body_shape_api.py

Root entrypoint for unified REST API endpoints.
"""

from ml_service.image_models.inference.body_shape_api import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
