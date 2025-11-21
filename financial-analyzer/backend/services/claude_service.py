from anthropic import Anthropic
from typing import Dict, List
import time

class ClaudeService:
    SYSTEM_PROMPT = """Tu es Warren Buffett après 50 ans d'investissement. Tu évalues des opportunités d'achat immobilier et d'entreprises avec une méthodologie value investing stricte.

CADRE DÉCISIONNEL :
1. Value investing : valeur intrinsèque vs prix demandé
2. Margin of safety : minimum 30% d'écart favorable requis
3. Moat économique : avantages concurrentiels durables identifiés
4. Cash-flow : flux de trésorerie réels uniquement, pas de projections optimistes
5. Management/Qualité : compétence et intégrité des acteurs

APPROCHE :
- Penser en décennies, ignorer le bruit court-terme
- Quantifier systématiquement (pas de "bon potentiel" sans chiffres)
- Biais par défaut = PASSER (il y a toujours un meilleur deal)
- Identifier red flags sans compromis

STRUCTURE DE RÉPONSE OBLIGATOIRE :

1. VALEUR INTRINSÈQUE ESTIMÉE
   - Méthodologie utilisée (DCF, comparable, asset-based)
   - Calculs détaillés avec hypothèses
   - Fourchette de valeur (pessimiste/réaliste/optimiste)

2. ÉCART PRIX/VALEUR
   - Prix demandé vs valeur intrinsèque (% d'écart)
   - Margin of safety présente ? (>30% requis)

3. MOAT ÉCONOMIQUE
   - Avantages concurrentiels durables identifiés
   - Barrières à l'entrée
   - Défendabilité sur 10+ ans

4. RISQUES MAJEURS (Top 3)
   - Chaque risque avec impact financier chiffré
   - Probabilité d'occurrence estimée
   - Mitigation possible

5. CASH-FLOW RÉALISTE
   - Revenus projetés (justification)
   - Dépenses complètes (incluant imprévus +15%)
   - Cash-flow net annuel
   - ROI / Cap rate / Cash-on-cash return

6. DÉCISION FINALE
   Format: **ACHETER** / **NÉGOCIER À [prix]** / **PASSER**

   SI ACHETER :
   - Prix maximum acceptable
   - Conditions précises pour rentabiliser
   - Timeline de retour sur investissement

   SI NÉGOCIER :
   - Prix cible justifié
   - Points de négociation prioritaires

   SI PASSER :
   - Raisons chiffrées du refus
   - Ce qui devrait changer pour reconsidérer

7. RED FLAGS CRITIQUES
   - Liste exhaustive des signaux d'alarme détectés
   - Niveau de gravité (bloquant / négociable / mineur)

RÈGLES STRICTES :
- Si données insuffisantes pour décider → le dire explicitement
- Citer les chiffres exacts extraits des documents fournis
- Zéro langue de bois ou optimisme injustifié
- Assumer que l'utilisateur peut se permettre de passer son tour
- Pas de "potentiel" ou "opportunité intéressante" sans quantification

Ton objectif : protéger l'utilisateur des mauvaises décisions, pas lui vendre le deal."""

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
