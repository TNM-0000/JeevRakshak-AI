"""
api/main.py
FastAPI REST API application for JeevRakshak AI (SIH26128).
Exposes the validated standalone Phase 2 evidence-fusion and assessment engine.
"""

import os
import sys
import logging
import tempfile
import shutil
from typing import Optional

from fastapi import FastAPI, Request, Form, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Ensure repository root is on sys.path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from src.common.schema import JeevRakshakAssessment
from src.assessment.engine import run_full_assessment
from src.vision.inference import ALLOWED_EXTENSIONS
from api.schemas import HealthResponse, AssessmentRequest, ErrorDetail

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("jeevrakshak.api")

# Initialize FastAPI application
app = FastAPI(
    title="JeevRakshak AI — Livestock Disease Decision-Support API",
    description=(
        "FastAPI decision-support REST service wrapping the validated Phase 2 "
        "evidence-fusion and clinical assessment engine for Smart India Hackathon (SIH26128).\n\n"
        "Integrates farmer clinical narratives, local EfficientNet-B3 vision inferences, "
        "ICAR-NIVEDI epidemiological forewarnings, and Open-Meteo environmental weather data "
        "into a canonical, auditable veterinary assessment."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# ---------------------------------------------------------------------------
# Development CORS Configuration
# (Allows local Next.js frontend to communicate with FastAPI during local dev)
# ---------------------------------------------------------------------------
DEVELOPMENT_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=DEVELOPMENT_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check endpoint",
    tags=["System"]
)
async def health_check():
    """
    Lightweight health verification endpoint.
    Confirms the API server is operational without running expensive model inferences.
    """
    return HealthResponse(
        status="ok",
        service="jeevrakshak-ai-api",
        version="1.0.0"
    )


@app.post(
    "/api/ai/assess",
    response_model=JeevRakshakAssessment,
    responses={
        200: {"description": "Canonical JeevRakshak assessment completed successfully."},
        400: {"model": ErrorDetail, "description": "Invalid input data or empty clinical submission."},
        415: {"model": ErrorDetail, "description": "Unsupported media/image file type."},
        500: {"model": ErrorDetail, "description": "Internal assessment engine error."}
    },
    summary="Generate clinical disease assessment from narrative and optional image",
    tags=["Assessment"]
)
async def create_assessment(
    request: Request,
    text: Optional[str] = Form(None, description="Free-form clinical narrative describing symptoms and case history"),
    state: Optional[str] = Form(None, description="Administrative State or Union Territory in India"),
    district: Optional[str] = Form(None, description="Administrative district name"),
    species: Optional[str] = Form(None, description="Host animal species override (e.g. cattle, buffalo)"),
    affected_count: Optional[int] = Form(None, description="Explicit count of symptomatic animals"),
    total_herd_size: Optional[int] = Form(None, description="Total animals in herd if known"),
    duration_days: Optional[float] = Form(None, description="Duration of symptoms in days"),
    vaccination_status: Optional[str] = Form(None, description="Vaccination history (e.g. 'vaccinated', 'unvaccinated', 'unknown')"),
    image: Optional[UploadFile] = File(None, description="Optional photographic image file (JPEG, PNG, WEBP)")
):
    """
    Primary decision-support endpoint for JeevRakshak AI.
    
    Accepts:
    - **Multipart/Form-Data**: For submissions containing photographic images (`image` field) and form parameters.
    - **Application/JSON**: For text-only submissions (`text`, `state`, `district`, etc.).
    
    Returns the canonical **JeevRakshakAssessment** contract.
    """
    # Check if request was submitted as application/json
    content_type = request.headers.get("content-type", "").lower()
    if content_type.startswith("application/json"):
        try:
            json_body = await request.json()
            json_req = AssessmentRequest.model_validate(json_body)
            text = json_req.text
            state = json_req.state
            district = json_req.district
            species = json_req.species
            affected_count = json_req.affected_count
            total_herd_size = json_req.total_herd_size
            duration_days = json_req.duration_days
            vaccination_status = json_req.vaccination_status
            image = None
        except Exception as e:
            logger.warning(f"JSON validation error: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid JSON request body: {str(e)}"
            )

    # Validate that at least text narrative or an image is supplied
    has_text = bool(text and text.strip())
    has_image = bool(image is not None and getattr(image, "filename", None))

    if not has_text and not has_image:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one clinical evidence stream ('text' clinical narrative or 'image' file) must be provided."
        )

    temp_image_path: Optional[str] = None

    try:
        # Handle image upload if present
        if has_image and image is not None:
            filename = image.filename or ""
            file_ext = os.path.splitext(filename)[1].lower()
            mime_type = (image.content_type or "").lower()

            allowed_mimes = {
                "image/jpeg", "image/jpg", "image/png", "image/webp",
                "application/octet-stream"  # Some clients submit octet-stream with valid extension
            }

            # Reject obviously unsupported non-image types
            if file_ext and file_ext not in ALLOWED_EXTENSIONS:
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail=f"Unsupported image file extension '{file_ext}'. Supported extensions: {sorted(ALLOWED_EXTENSIONS)}"
                )

            if mime_type and mime_type not in allowed_mimes and not file_ext:
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail=f"Unsupported image MIME type '{mime_type}'. Supported: JPEG, PNG, WEBP."
                )

            # Secure temporary storage for vision model inference
            suffix = file_ext if file_ext in ALLOWED_EXTENSIONS else ".jpg"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
                shutil.copyfileobj(image.file, tmp_file)
                temp_image_path = tmp_file.name

        # Call existing standalone Phase 2 assessment engine
        assessment = run_full_assessment(
            text=text or "",
            image_path=temp_image_path,
            state=state,
            district=district,
            species_override=species,
            affected_count_override=affected_count
        )

        # Apply non-conflicting optional context metadata if explicitly provided
        if total_herd_size is not None and assessment.animal_context.total_herd_size is None:
            assessment.animal_context.total_herd_size = total_herd_size

        if duration_days is not None and assessment.animal_context.duration_days is None:
            assessment.animal_context.duration_days = duration_days

        if vaccination_status and vaccination_status.lower() != "unknown":
            assessment.animal_context.vaccination_status = vaccination_status

        return assessment

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected assessment engine exception: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal assessment failure: {type(e).__name__} ({str(e)})"
        )
    finally:
        # Guarantee immediate temporary file cleanup
        if temp_image_path and os.path.exists(temp_image_path):
            try:
                os.remove(temp_image_path)
            except Exception as cleanup_err:
                logger.warning(f"Failed to remove temporary image file '{temp_image_path}': {cleanup_err}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="127.0.0.1", port=8000, reload=True)
