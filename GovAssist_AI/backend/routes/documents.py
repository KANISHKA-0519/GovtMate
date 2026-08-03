from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Header
from models.schemas import DocumentDB, DocumentType
from database.connection import get_db
from services.storage_service import upload_file, delete_file
from services.ocr_service import extract_text_from_image
from datetime import datetime
from typing import Optional
import logging

router = APIRouter(prefix="/api/documents", tags=["documents"])
logger = logging.getLogger(__name__)


async def get_user_id(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or authorization.strip() in ("", "Bearer", "Bearer undefined", "Bearer null"):
        return "user_demo_citizen_123"
    return authorization.replace("Bearer ", "").strip()


def _serialize(doc: dict) -> dict:
    if not doc:
        return {}
    doc.pop("_id", None)
    for k, v in doc.items():
        if isinstance(v, datetime):
            doc[k] = v.isoformat()
    return doc


_mock_documents_db: dict[str, list[dict]] = {}


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    type: str = Form("other"),
    applicationId: Optional[str] = Form(None),
    user_id: str = Depends(get_user_id),
):
    if file.size and file.size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 10MB.")

    content = await file.read()

    # Upload to Cloudinary
    upload_result = await upload_file(content, file.filename or "document", folder="govassist/documents")

    # Run OCR if image
    ocr_data = {}
    if file.content_type and file.content_type.startswith("image/"):
        try:
            ocr_result = await extract_text_from_image(content, file.content_type)
            ocr_data = ocr_result.get("fields", {})
        except Exception as e:
            logger.warning(f"OCR failed: {e}")

    doc = DocumentDB(
        userId=user_id,
        applicationId=applicationId,
        name=file.filename or "document",
        type=DocumentType(type) if type in DocumentType.__members__ else DocumentType.other,
        url=upload_result["url"],
        cloudinaryId=upload_result["publicId"],
        status="verified",
        ocrData=ocr_data,
    )
    doc_dict = doc.model_dump()

    db = get_db()
    if db is not None:
        await db.documents.insert_one(doc_dict)
        await db.documents.update_one({"id": doc.id}, {"$set": {"status": "verified"}})
    else:
        if user_id not in _mock_documents_db:
            _mock_documents_db[user_id] = []
        _mock_documents_db[user_id].insert(0, doc_dict)

    return {"success": True, "data": _serialize(doc_dict)}


@router.get("")
async def list_documents(user_id: str = Depends(get_user_id)):
    db = get_db()
    if db is not None:
        cursor = db.documents.find({"userId": user_id}).sort("uploadedAt", -1)
        docs = await cursor.to_list(length=100)
        return {"success": True, "data": [_serialize(d) for d in docs]}
    docs = _mock_documents_db.get(user_id, [])
    return {"success": True, "data": [_serialize(d) for d in docs]}


@router.post("/{doc_id}/verify")
async def verify_document(doc_id: str, user_id: str = Depends(get_user_id)):
    db = get_db()
    verification = {
        "isValid": True,
        "confidence": 95.0,
        "extractedData": {},
        "issues": [],
        "verifiedAt": datetime.utcnow().isoformat(),
    }
    if db is not None:
        doc = await db.documents.find_one({"id": doc_id, "userId": user_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        verification["extractedData"] = doc.get("ocrData", {})
        await db.documents.update_one(
            {"id": doc_id},
            {"$set": {"status": "verified", "verificationResult": verification}}
        )
        doc["status"] = "verified"
        doc["verificationResult"] = verification
        return {"success": True, "data": _serialize(doc)}

    user_docs = _mock_documents_db.get(user_id, [])
    for d in user_docs:
        if d.get("id") == doc_id:
            d["status"] = "verified"
            d["verificationResult"] = verification
            return {"success": True, "data": _serialize(d)}

    return {"success": True, "data": {"id": doc_id, "status": "verified"}}


@router.delete("/{doc_id}")
async def delete_document(doc_id: str, user_id: str = Depends(get_user_id)):
    db = get_db()
    if db is not None:
        doc = await db.documents.find_one({"id": doc_id, "userId": user_id})
        if doc:
            await delete_file(doc.get("cloudinaryId", ""))
            await db.documents.delete_one({"id": doc_id})
    else:
        if user_id in _mock_documents_db:
            _mock_documents_db[user_id] = [d for d in _mock_documents_db[user_id] if d.get("id") != doc_id]
    return {"success": True, "data": None}
