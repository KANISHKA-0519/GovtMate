"""Cloudinary file storage service."""
import cloudinary
import cloudinary.uploader
from config.settings import get_settings
import logging

logger = logging.getLogger(__name__)
_configured = False


def _configure():
    global _configured
    if not _configured:
        settings = get_settings()
        if settings.cloudinary_cloud_name and settings.cloudinary_cloud_name != "your_cloud_name":
            cloudinary.config(
                cloud_name=settings.cloudinary_cloud_name,
                api_key=settings.cloudinary_api_key,
                api_secret=settings.cloudinary_api_secret,
            )
            _configured = True


async def upload_file(file_data: bytes, filename: str, folder: str = "govassist") -> dict:
    """Upload file to Cloudinary."""
    _configure()
    if not _configured:
        return _mock_upload(filename)
    try:
        result = cloudinary.uploader.upload(
            file_data,
            folder=folder,
            public_id=f"{folder}/{filename}",
            resource_type="auto",
        )
        return {
            "url": result["secure_url"],
            "publicId": result["public_id"],
            "format": result.get("format", ""),
            "size": result.get("bytes", 0),
        }
    except Exception as e:
        logger.warning(f"Cloudinary upload failed: {e}. Using mock.")
        return _mock_upload(filename)


async def delete_file(public_id: str) -> bool:
    """Delete file from Cloudinary."""
    _configure()
    if not _configured:
        return True
    try:
        cloudinary.uploader.destroy(public_id)
        return True
    except Exception as e:
        logger.warning(f"Cloudinary delete failed: {e}")
        return False


def _mock_upload(filename: str) -> dict:
    return {
        "url": f"https://res.cloudinary.com/demo/image/upload/govassist/{filename}",
        "publicId": f"govassist/{filename}",
        "format": filename.split(".")[-1] if "." in filename else "jpg",
        "size": 0,
    }
