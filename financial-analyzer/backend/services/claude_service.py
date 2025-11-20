from anthropic import Anthropic
from typing import Dict, List
import time

class ClaudeService:
    SYSTEM_PROMPT = """Tu es un analyste financier expert spécialisé en évaluation d'opportunités d'achat immobilier et d'entreprises.

Ta tâche: analyser les documents fournis (transcriptions audio/vidéo, images, données visuelles) et répondre à la question de l'utilisateur.

Structure obligatoire de réponse:
1. SYNTHÈSE DES DONNÉES
2. ANALYSE DES RISQUES
3. ANALYSE DES OPPORTUNITÉS
4. RECOMMANDATION (Acheter / Ne pas acheter / Négocier)
5. ACTIONS CONCRÈTES pour optimiser la transaction

Sois direct, chiffré quand possible, et identifie les red flags immédiatement."""

    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY is required")
        self.client = Anthropic(api_key=api_key)
        self.model = "claude-sonnet-4-20250514"

    def analyze_financial_opportunity(self, context: Dict) -> str:
        """
        Analyse une opportunité financière avec Claude

        context: {
            "transcription": str (optional),
            "frames": List[str] (base64 images, optional),
            "image_base64": str (optional),
            "ocr_text": str (optional),
            "user_query": str (required)
        }
        """
        try:
            start_time = time.time()

            # Build message content
            content_parts = []

            # Add user query
            user_query = context.get("user_query", "Analyse cette opportunité financière.")
            query_text = f"Question de l'utilisateur: {user_query}\n\n"

            # Add transcription if available
            if context.get("transcription"):
                query_text += f"TRANSCRIPTION AUDIO/VIDÉO:\n{context['transcription']}\n\n"

            # Add OCR text if available
            if context.get("ocr_text"):
                query_text += f"TEXTE EXTRAIT DE L'IMAGE:\n{context['ocr_text']}\n\n"

            content_parts.append({
                "type": "text",
                "text": query_text
            })

            # Add images (frames or single image)
            if context.get("frames"):
                # Add video frames
                for i, frame_base64 in enumerate(context["frames"]):
                    content_parts.append({
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": frame_base64
                        }
                    })
            elif context.get("image_base64"):
                # Add single image
                content_parts.append({
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/jpeg",
                        "data": context["image_base64"]
                    }
                })

            # Call Claude API
            print(f"Calling Claude API with {len(content_parts)} content parts...")
            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                system=self.SYSTEM_PROMPT,
                messages=[{
                    "role": "user",
                    "content": content_parts
                }]
            )

            # Extract response text
            analysis = response.content[0].text

            processing_time = time.time() - start_time
            print(f"Claude analysis completed in {processing_time:.2f}s")

            return analysis

        except Exception as e:
            raise Exception(f"Error calling Claude API: {str(e)}")

def create_claude_service(api_key: str) -> ClaudeService:
    return ClaudeService(api_key)
