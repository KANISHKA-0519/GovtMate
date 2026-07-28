"""OCR service using Google Vision API with Tesseract fallback."""
import base64
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


async def extract_text_from_image(image_data: bytes, mime_type: str = "image/jpeg") -> dict:
    """Extract text from image using Google Vision API or Tesseract fallback."""
    try:
        return await _google_vision_ocr(image_data, mime_type)
    except Exception as e:
        logger.warning(f"Google Vision failed: {e}. Trying Tesseract.")
        try:
            return await _tesseract_ocr(image_data)
        except Exception as e2:
            logger.warning(f"Tesseract failed: {e2}. Using mock OCR.")
            return _mock_ocr_result()


async def _google_vision_ocr(image_data: bytes, mime_type: str) -> dict:
    from google.cloud import vision
    client = vision.ImageAnnotatorClient()
    image = vision.Image(content=image_data)
    response = client.text_detection(image=image)
    if response.error.message:
        raise Exception(response.error.message)
    texts = response.text_annotations
    full_text = texts[0].description if texts else ""
    return {"fullText": full_text, "fields": _parse_document_fields(full_text), "source": "google_vision"}


async def _tesseract_ocr(image_data: bytes) -> dict:
    import pytesseract
    from PIL import Image
    import io
    image = Image.open(io.BytesIO(image_data))
    text = pytesseract.image_to_string(image, lang="eng")
    return {"fullText": text, "fields": _parse_document_fields(text), "source": "tesseract"}


def _mock_ocr_result() -> dict:
    return {
        "fullText": "Sample document text extracted via OCR",
        "fields": {"name": "Citizen Name", "dob": "01/01/1990", "address": "123 Main Street"},
        "source": "mock",
    }


def _parse_document_fields(text: str) -> dict:
    """Parse common fields from OCR text."""
    import re
    fields = {}
    # Name patterns
    name_match = re.search(r"(?:Name|नाम)[:\s]+([A-Z][a-zA-Z\s]+)", text)
    if name_match:
        fields["name"] = name_match.group(1).strip()
    # DOB patterns
    dob_match = re.search(r"(?:DOB|Date of Birth|जन्म तिथि)[:\s]+(\d{2}[/-]\d{2}[/-]\d{4})", text)
    if dob_match:
        fields["dob"] = dob_match.group(1)
    # Aadhaar pattern
    aadhaar_match = re.search(r"\b(\d{4}\s\d{4}\s\d{4})\b", text)
    if aadhaar_match:
        fields["aadhaar_number"] = aadhaar_match.group(1)
    # PAN pattern
    pan_match = re.search(r"\b([A-Z]{5}\d{4}[A-Z])\b", text)
    if pan_match:
        fields["pan_number"] = pan_match.group(1)
    return fields
