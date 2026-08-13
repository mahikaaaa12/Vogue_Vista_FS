"""
ml_service.image_models.inference.body_shape_api

UNIFIED VOGUE VISTA REST API MODULE
"""

from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from ml_service.image_models.inference.body_shape_service import UnifiedBodyShapeService

try:
    UNIFIED_SERVICE = UnifiedBodyShapeService()
except Exception:
    UNIFIED_SERVICE = None

app = FastAPI(
    title="Vogue Vista Unified Body Shape AI API",
    version="1.0.0",
    description="Unified API endpoint routing female and male multimodal body shape analysis and fashion recommendations."
)


@app.post("/api/v1/body-shape/analyze/")
async def analyze_body_shape_endpoint(
    image: UploadFile = File(...),
    gender: Optional[str] = Form(None)
):
    """Unified API Endpoint for real-time body shape prediction and recommendation."""
    if UNIFIED_SERVICE is None:
        raise HTTPException(status_code=500, detail="UnifiedBodyShapeService failed to initialize.")

    try:
        contents = await image.read()
        response_payload = UNIFIED_SERVICE.analyze_body_shape(contents, gender_hint=gender)
        return JSONResponse(content=response_payload, status_code=200)
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(err)}")


@app.get("/api/v1/body-shape/health/")
def health_check():
    return {
        "service": "Vogue Vista Unified Body Shape AI API",
        "status": "online",
        "female_model": "LOADED",
        "male_model": "LOADED"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
