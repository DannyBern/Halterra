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
        Utilise Whisper d'OpenAI avec timestamps pour vérification croisée
        Modèle 'medium' pour meilleure précision
        """
        try:
            # Load model lazily - using 'medium' for better accuracy
            if self.whisper_model is None:
                print("Loading Whisper model (medium for accuracy)...")
                self.whisper_model = whisper.load_model("medium")

            print(f"Transcribing audio with timestamps from: {file_path}")
            # word_timestamps=True for precise verification
            result = self.whisper_model.transcribe(
                file_path,
                word_timestamps=True,
                language="fr",  # French for better Quebec French accuracy
                temperature=0.0  # Deterministic for consistency
            )

            # Format with timestamps for cross-reference
            transcription = result["text"]

            # Add segment timestamps for verification
            if "segments" in result:
                timestamped_text = "\n\n=== TRANSCRIPTION AVEC TIMESTAMPS (pour vérification) ===\n"
                for segment in result["segments"]:
                    start = segment["start"]
                    end = segment["end"]
                    text = segment["text"]
                    timestamped_text += f"[{start:.1f}s - {end:.1f}s]: {text}\n"
                transcription += timestamped_text

            return transcription
        except Exception as e:
            raise Exception(f"Error transcribing audio: {str(e)}")

    def extract_video_frames(self, file_path: str, fps: int = 2) -> List[str]:
        """
        Extrait des frames d'une vidéo avec timestamps pour synchronisation avec audio
        fps: nombre de frames par seconde à extraire (défaut: 2 pour plus de détails)
        Retourne une liste d'images en base64 avec timestamps pour vérification croisée
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

            # Calculate frame interval - extract evenly distributed frames
            frame_interval = int(video_fps / fps) if video_fps > 0 else 1

            print(f"Video: {duration:.2f}s, FPS: {video_fps}, extracting every {frame_interval} frames ({fps} fps)")

            frame_count = 0
            extracted_count = 0
            max_frames = 50  # Increased to 50 for better coverage (25 seconds at 2fps)

            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                # Extract frame at interval
                if frame_count % frame_interval == 0 and extracted_count < max_frames:
                    # Calculate timestamp for this frame
                    timestamp = frame_count / video_fps if video_fps > 0 else 0

                    # Enhance frame quality before encoding
                    # Convert to RGB for better quality
                    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

                    # Encode with high quality (95% JPEG quality)
                    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 95]
                    _, buffer = cv2.imencode('.jpg', frame_rgb, encode_param)
                    frame_base64 = base64.b64encode(buffer).decode('utf-8')

                    # Store with timestamp metadata
                    frames_base64.append({
                        'data': frame_base64,
                        'timestamp': round(timestamp, 2),
                        'frame_number': frame_count
                    })
                    extracted_count += 1

                    print(f"  Frame {extracted_count}/{max_frames} extracted at {timestamp:.2f}s")

                frame_count += 1

            cap.release()
            print(f"✓ Extracted {extracted_count} high-quality frames with timestamps")
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
