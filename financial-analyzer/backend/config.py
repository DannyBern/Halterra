import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
    MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "500"))
    TEMP_UPLOAD_DIR = os.getenv("TEMP_UPLOAD_DIR", "/tmp/uploads")

    # Supported file types
    SUPPORTED_AUDIO = ["mp3", "wav", "m4a", "aac", "flac", "ogg", "wma", "aiff", "opus", "webm"]
    SUPPORTED_VIDEO = ["mp4", "avi", "mov", "mkv", "webm", "flv", "wmv", "m4v", "mpeg", "mpg"]
    SUPPORTED_IMAGE = ["jpg", "jpeg", "png", "gif", "bmp", "tiff", "webp", "svg", "heic", "ico"]

    @classmethod
    def get_max_file_size_bytes(cls):
        return cls.MAX_FILE_SIZE_MB * 1024 * 1024

    @classmethod
    def is_supported_file(cls, extension):
        ext = extension.lower().replace(".", "")
        return ext in cls.SUPPORTED_AUDIO + cls.SUPPORTED_VIDEO + cls.SUPPORTED_IMAGE

    @classmethod
    def get_file_type(cls, extension):
        ext = extension.lower().replace(".", "")
        if ext in cls.SUPPORTED_AUDIO:
            return "audio"
        elif ext in cls.SUPPORTED_VIDEO:
            return "video"
        elif ext in cls.SUPPORTED_IMAGE:
            return "image"
        return "unknown"

config = Config()
