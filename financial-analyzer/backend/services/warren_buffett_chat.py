"""
Warren Buffett AI Chat Service
Service de chat interactif avec persona Warren Buffett
pour discuter de l'analyse financière
"""

from anthropic import Anthropic
from typing import Dict, List, Optional
import json


class WarrenBuffettChat:
    """
    Service de chat avec persona Warren Buffett
    Permet de discuter de l'analyse et poser des questions
    """

    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY is required")
        self.client = Anthropic(api_key=api_key)
        self.model = "claude-sonnet-4-5-20250929"  # Sonnet 4.5

    def chat(
        self,
        question: str,
        analysis: str,
        file_context: Optional[Dict] = None,
        chat_history: Optional[List[Dict]] = None
    ) -> str:
        """
        Discute avec l'utilisateur sur l'analyse

        Args:
            question: Question de l'utilisateur
            analysis: Analyse complète générée
            file_context: Contexte du fichier (transcription, etc.) si disponible
            chat_history: Historique de conversation précédente

        Returns:
            Réponse de Warren Buffett
        """

        # Construire le system prompt avec persona Warren Buffett
        system_prompt = """Tu es Warren Buffett, l'investisseur légendaire avec plus de 60 ans d'expérience.

🎯 TA PERSONNALITÉ:
- Tu parles de manière simple et directe, sans jargon inutile
- Tu utilises des analogies concrètes et des exemples du quotidien
- Tu es patient et pédagogue - tu aimes expliquer clairement
- Tu es honnête: tu admets quand tu ne sais pas ou quand il y a de l'incertitude
- Tu focuses sur le long-terme (10-20 ans) et la valeur intrinsèque
- Tu es prudent mais pas pessimiste - tu cherches la margin of safety
- Tu utilises parfois l'humour et des références à ton expérience
- Tu tutoies l'utilisateur (contexte québécois)

🎯 TON STYLE:
- Réponses concises mais complètes (2-4 paragraphes max)
- Tu cites des chiffres précis de l'analyse quand pertinent
- Tu donnes des exemples concrets de tes propres investissements quand applicable
- Tu poses parfois des questions pour faire réfléchir l'utilisateur
- Tu utilises des émojis occasionnellement pour la chaleur humaine

🎯 TON EXPERTISE:
- Value investing (acheter $1 pour $0.50)
- Évaluation de la qualité du management
- Identification des moats économiques (avantages concurrentiels durables)
- Analyse des flux de trésorerie et valorisation DCF
- Psychologie des marchés et comportement d'investisseur
- Allocation de capital et patience stratégique

🎯 TA MISSION DANS CE CHAT:
Tu viens de terminer une analyse détaillée en 7 étapes pour l'utilisateur.
Maintenant, tu discutes avec lui pour:
- Clarifier des points qu'il n'a pas compris
- Approfondir certains aspects de l'analyse
- Répondre à ses questions sur les risques, opportunités, valorisation
- L'aider à prendre une décision éclairée
- Partager ta sagesse d'investisseur

🎯 RÈGLES IMPORTANTES:
- Base tes réponses sur L'ANALYSE FOURNIE (ne pas inventer des chiffres)
- Si une info n'est pas dans l'analyse, dis-le honnêtement
- Si l'utilisateur demande des calculs supplémentaires, fais-les
- Reste cohérent avec les conclusions de l'analyse
- Sois conversationnel, pas formel

Maintenant, discute avec l'utilisateur. Il vient de lire ton analyse et a des questions.
"""

        # Construire le contexte pour la conversation
        context_message = f"""=== CONTEXTE DE LA CONVERSATION ===

Voici l'ANALYSE COMPLÈTE que tu as réalisée pour l'utilisateur:

{analysis[:15000]}

{"... (analyse tronquée pour la conversation, mais tu t'en souviens complètement)" if len(analysis) > 15000 else ""}

---

L'utilisateur a lu cette analyse et veut maintenant te poser des questions pour mieux comprendre ou approfondir certains points.
"""

        # Construire l'historique de messages pour Claude
        messages = []

        # Ajouter le contexte initial
        messages.append({
            "role": "user",
            "content": context_message
        })

        messages.append({
            "role": "assistant",
            "content": "J'ai bien en tête toute l'analyse que je viens de faire. Je suis prêt à discuter et répondre à tes questions! 💼"
        })

        # Ajouter l'historique de chat si présent
        if chat_history:
            for msg in chat_history:
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

        # Ajouter la question actuelle
        messages.append({
            "role": "user",
            "content": question
        })

        try:
            # Appeler Claude avec le persona Warren Buffett
            response = self.client.messages.create(
                model=self.model,
                max_tokens=2048,
                system=system_prompt,
                messages=messages
            )

            return response.content[0].text

        except Exception as e:
            print(f"❌ Erreur chat Warren Buffett: {str(e)}")
            return "Désolé, j'ai rencontré un problème technique. Peux-tu reformuler ta question?"


def create_warren_buffett_chat(api_key: str) -> WarrenBuffettChat:
    """Factory function pour créer le service de chat"""
    return WarrenBuffettChat(api_key)
