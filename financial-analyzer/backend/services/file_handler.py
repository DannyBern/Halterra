import whisper
import cv2
import base64
import pytesseract
from typing import List
import os
import subprocess

class FileHandler:
    def __init__(self):
        self.whisper_model = None

    def extract_audio_transcription(self, file_path: str) -> str:
        """
        Extrait la transcription audio d'un fichier audio ou vidéo
        Utilise Whisper d'OpenAI
        """
        try:
            # Load model lazily
            if self.whisper_model is None:
                print("Loading Whisper model...")
                self.whisper_model = whisper.load_model("base")

            print(f"Transcribing audio from: {file_path}")
            result = self.whisper_model.transcribe(file_path)
            return result["text"]
        except Exception as e:
            raise Exception(f"Error transcribing audio: {str(e)}")

    def extract_video_frames(self, file_path: str, fps: int = 1) -> List[str]:
        """
        Extrait des frames d'une vidéo
        fps: nombre de frames par seconde à extraire (défaut: 1)
        Retourne une liste d'images en base64 (max 20 frames)
        """
        try:
            frames_base64 = []
            cap = cv2.VideoCapture(file_path)

            if not cap.isOpened():
                raise Exception("Cannot open video file")

            # Get video properties
            video_fps = cap.get(cv2.CAP_PROP_FPS)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            duration = total_frames / video_fps if video_fps > 0 else 0

            # Calculate frame interval
            frame_interval = int(video_fps / fps) if video_fps > 0 else 1

            print(f"Video: {duration:.2f}s, FPS: {video_fps}, extracting every {frame_interval} frames")

            frame_count = 0
            extracted_count = 0
            max_frames = 20

            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                # Extract frame at interval
                if frame_count % frame_interval == 0 and extracted_count < max_frames:
                    # Convert frame to base64
                    _, buffer = cv2.imencode('.jpg', frame)
                    frame_base64 = base64.b64encode(buffer).decode('utf-8')
                    frames_base64.append(frame_base64)
                    extracted_count += 1

                frame_count += 1

            cap.release()
            print(f"Extracted {extracted_count} frames from video")
            return frames_base64

        except Exception as e:
            raise Exception(f"Error extracting video frames: {str(e)}")

    def extract_text_from_image(self, file_path: str) -> str:
        """
        Extrait le texte d'une image via OCR (Tesseract)
        """
        try:
            # Read image
            image = cv2.imread(file_path)
            if image is None:
                raise Exception("Cannot read image file")

            # Convert to grayscale for better OCR
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

            # Extract text
            text = pytesseract.image_to_string(gray)
            return text.strip()

        except Exception as e:
            raise Exception(f"Error extracting text from image: {str(e)}")

    def image_to_base64(self, file_path: str) -> str:
        """
        Convertit une image en base64 pour envoi à Claude
        """
        try:
            with open(file_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            raise Exception(f"Error converting image to base64: {str(e)}")

file_handler = FileHandler()
