"""
Multi-Stage Financial Analysis Pipeline - Institutional Grade
Analyse financière en 7 étapes pour une précision et profondeur maximales
"""

from anthropic import Anthropic
from typing import Dict, List, Optional
import time
import json


class InvestmentType:
    """Types d'investissements supportés"""
    REAL_ESTATE = "immobilier"
    COMPANY_ACQUISITION = "acquisition_entreprise"
    STARTUP = "startup"
    PUBLIC_EQUITY = "actions_publiques"
    BONDS = "obligations"
    PRIVATE_EQUITY = "private_equity"
    PORTFOLIO = "portefeuille"
    OTHER = "autre"


class MultiStageAnalyzer:
    """
    Analyseur financier multi-étapes de niveau institutionnel
    7 étapes spécialisées pour qualité maximale
    """

    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY is required")
        self.client = Anthropic(api_key=api_key)
        self.model = "claude-sonnet-4-5-20250929"  # Sonnet 4.5 (latest)
        self.analysis_log = []

    # ========== ÉTAPE 0: CLASSIFICATION ==========

    def _classify_investment_type(self, context: Dict) -> str:
        """
        Détermine automatiquement le type d'investissement
        Adapte le pipeline en conséquence
        """
        prompt = """Tu es un expert en classification d'opportunités d'investissement.

Analyse le contenu fourni et détermine le TYPE EXACT d'investissement présenté.

TYPES POSSIBLES:
1. immobilier - Achat/développement immobilier (résidentiel, commercial, terrain)
2. acquisition_entreprise - Achat d'une entreprise existante (PME, grande entreprise)
3. startup - Investissement dans une startup/jeune entreprise
4. actions_publiques - Investissement en bourse (actions cotées)
5. obligations - Investissement en obligations/dette
6. private_equity - Fonds de private equity, LBO
7. portefeuille - Portfolio diversifié, fonds
8. autre - Autres types d'investissement

DÉTERMINE AUSSI:
- Secteur d'activité principal
- Stade de maturité (early-stage, croissance, mature, déclin)
- Géographie (ville/région si mentionné)
- Taille approximative de l'investissement

RÉPONDS AU FORMAT JSON:
```json
{
  "type": "immobilier|acquisition_entreprise|startup|...",
  "secteur": "description du secteur",
  "maturite": "early-stage|croissance|mature|déclin",
  "geographie": "ville, région ou pays",
  "taille_investissement_estimee": nombre_ou_null,
  "confiance": 0.0-1.0,
  "raison": "pourquoi ce type?"
}
```
"""

        try:
            content_parts = [{"type": "text", "text": prompt}]

            # Add context
            if context.get("transcription"):
                content_parts.append({
                    "type": "text",
                    "text": f"\n\nTRANSCRIPTION:\n{context['transcription'][:2000]}"
                })

            if context.get("ocr_text"):
                content_parts.append({
                    "type": "text",
                    "text": f"\n\nTEXTE EXTRAIT:\n{context['ocr_text'][:1000]}"
                })

            # Add first few frames
            if context.get("frames"):
                for frame_base64 in context["frames"][:5]:
                    content_parts.append({
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": frame_base64
                        }
                    })

            print("🔍 ÉTAPE 0/7: Classification du type d'investissement...")
            response = self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                messages=[{"role": "user", "content": content_parts}]
            )

            result = response.content[0].text

            # Extract JSON
            json_match = result.find("```json")
            if json_match != -1:
                json_end = result.find("```", json_match + 7)
                json_str = result[json_match + 7:json_end].strip()
                classification = json.loads(json_str)
            else:
                classification = {"type": "autre", "confiance": 0.5}

            self.analysis_log.append({
                "stage": 0,
                "name": "Classification",
                "result": classification
            })

            print(f"   ✓ Type détecté: {classification.get('type')} (confiance: {classification.get('confiance', 0):.0%})")
            print(f"   ✓ Secteur: {classification.get('secteur', 'N/A')}")

            return classification

        except Exception as e:
            print(f"   ⚠️  Erreur classification (mode par défaut): {str(e)}")
            return {"type": "autre", "confiance": 0.0}

    # ========== ÉTAPE 1: EXTRACTION DONNÉES ==========

    def _extract_raw_data(self, context: Dict, investment_type: str) -> Dict:
        """
        Extraction des données brutes avec validation croisée
        Adapté selon le type d'investissement
        """

        # Prompts adaptés par type
        extraction_prompts = {
            "immobilier": """EXTRACTION DONNÉES IMMOBILIER:
- Nombre exact d'unités/logements
- Prix d'achat total et unitaire
- Revenus locatifs (mensuels/annuels)
- Taux d'occupation
- Taxes foncières
- Frais de gestion
- Localisation précise
- État du bâtiment
- Année de construction
- Financement requis""",

            "acquisition_entreprise": """EXTRACTION DONNÉES ENTREPRISE:
- Revenus annuels (3 dernières années)
- EBITDA/Bénéfice net
- Prix d'acquisition demandé
- Multiple appliqué (EV/EBITDA, P/E)
- Nombre d'employés
- Actifs clés
- Dette existante
- Working capital requis
- Synergies potentielles
- Raison de la vente""",

            "startup": """EXTRACTION DONNÉES STARTUP:
- Stade (seed, série A/B/C)
- Montant levé précédemment
- Valorisation pre-money
- Montant demandé
- Dilution offerte (%)
- Revenus actuels (MRR/ARR)
- Croissance (%)
- Burn rate mensuel
- Runway
- Taille de marché (TAM/SAM/SOM)
- Équipe fondatrice
- Traction (clients, revenus)""",
        }

        base_prompt = extraction_prompts.get(investment_type, """EXTRACTION DONNÉES GÉNÉRALES:
- Montant d'investissement requis
- Retour attendu (ROI, IRR)
- Horizon temporel
- Structure de l'investissement
- Garanties/Collatéral
- Risques mentionnés""")

        full_prompt = f"""Tu es un analyste financier expert en extraction de données.

EXTRAIS UNIQUEMENT LES FAITS ET CHIFFRES (pas d'analyse):

{base_prompt}

Pour CHAQUE donnée:
1. Valeur exacte extraite
2. Source précise (audio à XX:XX ou frame #X ou document page Y)
3. Si ambiguïté: signaler avec ⚠️

Si une donnée MANQUE: indiquer "⚠️ DONNÉE MANQUANTE: [quelle donnée]"
Si INCOHÉRENCE entre sources: "⚠️ INCOHÉRENCE: audio dit X mais visuel montre Y"

FORMAT JSON:
```json
{{
  "donnees": {{
    "nom_donnee": {{
      "valeur": valeur,
      "source": "description source",
      "confiance": 0.0-1.0
    }}
  }},
  "donnees_manquantes": ["liste"],
  "incoherences": ["liste"]
}}
```
"""

        try:
            content_parts = [{"type": "text", "text": full_prompt}]

            if context.get("transcription"):
                content_parts.append({
                    "type": "text",
                    "text": f"\n\nTRANSCRIPTION COMPLÈTE:\n{context['transcription']}"
                })

            if context.get("ocr_text"):
                content_parts.append({
                    "type": "text",
                    "text": f"\n\nTEXTE EXTRAIT:\n{context['ocr_text']}"
                })

            # All frames for maximum accuracy
            if context.get("frames"):
                for frame_base64 in context["frames"]:
                    content_parts.append({
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": frame_base64
                        }
                    })

            print("📊 ÉTAPE 1/7: Extraction et validation des données...")
            response = self.client.messages.create(
                model=self.model,
                max_tokens=2048,
                messages=[{"role": "user", "content": content_parts}]
            )

            result = response.content[0].text

            # Parse JSON
            json_match = result.find("```json")
            if json_match != -1:
                json_end = result.find("```", json_match + 7)
                json_str = result[json_match + 7:json_end].strip()
                data = json.loads(json_str)
            else:
                data = {"donnees": {}, "donnees_manquantes": [], "incoherences": []}

            self.analysis_log.append({
                "stage": 1,
                "name": "Extraction Données",
                "result": data
            })

            print(f"   ✓ {len(data.get('donnees', {}))} données extraites")
            if data.get('donnees_manquantes'):
                print(f"   ⚠️  {len(data['donnees_manquantes'])} données manquantes")
            if data.get('incoherences'):
                print(f"   ⚠️  {len(data['incoherences'])} incohérences détectées")

            return data

        except Exception as e:
            print(f"   ❌ Erreur extraction: {str(e)}")
            return {"donnees": {}, "donnees_manquantes": [], "incoherences": []}

    # ========== ÉTAPE 2: DUE DILIGENCE QUANTITATIVE ==========

    def _quantitative_analysis(self, context: Dict, extracted_data: Dict, investment_type: str) -> str:
        """
        Analyse quantitative pure: calculs financiers détaillés
        Aucune analyse qualitative, que des maths
        """

        quant_prompts = {
            "immobilier": """Tu es un analyste quantitatif spécialisé en immobilier.

CALCULS REQUIS (avec TOUTES les formules):

1. **DCF (Discounted Cash Flow)** sur 20 ans:
   - Flux de trésorerie annuels
   - Taux d'actualisation (WACC ou taux opportunité)
   - Valeur terminale
   - VAN = Σ(CF / (1+r)^n) + VT/(1+r)^n

2. **Cap Rate**: NOI / Prix × 100

3. **Cash-on-Cash Return**: CF annuel / Mise de fonds × 100

4. **Debt Service Coverage Ratio**: NOI / Service dette

5. **ROI Total**: ((Valeur finale + CF cumulés - Investissement) / Investissement) × 100

6. **Payback Period**: Années pour récupérer investissement

7. **IRR (Internal Rate of Return)** sur 20 ans

SCÉNARIOS OBLIGATOIRES:
- Pessimiste (occupation 80%, croissance 1%, dépenses +20%)
- Réaliste (occupation 93%, croissance 2.5%, dépenses normales)
- Optimiste (occupation 98%, croissance 4%, dépenses -10%)

TABLEAU: Année par année pendant 20 ans (revenus, dépenses, CF net, CF cumulé)""",

            "acquisition_entreprise": """Tu es un analyste quantitatif M&A.

CALCULS REQUIS (formules complètes):

1. **Valorisation DCF**:
   - Free Cash Flow to Firm (FCFF) projeté 10 ans
   - WACC calculé
   - Valeur terminale (EV/EBITDA ou growth perpetuity)
   - Enterprise Value = Σ(FCFF/(1+WACC)^n) + TV/(1+WACC)^10

2. **Multiples de marché**:
   - EV/EBITDA actuel vs comparables
   - P/E ratio vs secteur
   - EV/Revenus

3. **Analyse rendement**:
   - ROI = (EBITDA × Multiple exit - Prix - Investissements) / Prix × 100
   - IRR sur 5-7 ans
   - Cash-on-Cash si LBO

4. **Synergies**:
   - Revenus (cross-sell estimé)
   - Coûts (réduction overhead)
   - VAN des synergies

5. **Solvabilité**:
   - Dette/EBITDA
   - Interest coverage ratio
   - Working capital needs

SCÉNARIOS: Pessimiste (-10% EBITDA), Base, Optimiste (+15% EBITDA)""",

            "startup": """Tu es un analyste quantitatif en venture capital.

CALCULS REQUIS:

1. **Valorisation**:
   - Post-money valuation = Pre-money + Montant levé
   - Dilution = Montant / Post-money × 100
   - Ownership = Actions acquises / Total actions × 100

2. **Unit Economics**:
   - CAC (Customer Acquisition Cost)
   - LTV (Lifetime Value)
   - LTV/CAC ratio
   - Payback period CAC

3. **Burn & Runway**:
   - Burn rate mensuel
   - Runway = Cash / Burn rate
   - Months to breakeven

4. **Projection financière** (5 ans):
   - MRR/ARR projeté
   - Croissance YoY (%)
   - Path to profitability

5. **Rendement attendu**:
   - Exit valuation scenarios (M&A, IPO)
   - Multiple on money (MoM) = Exit value / Investissement
   - IRR si exit à 5-7 ans

6. **Dilution future**:
   - Rondes futures estimées
   - Dilution totale à l'exit

SCÉNARIOS: Fail (perte totale), Base (exit à 5x), Success (exit à 20x)"""
        }

        base_prompt = quant_prompts.get(investment_type, """ANALYSE QUANTITATIVE GÉNÉRALE:

1. Valeur actuelle nette (VAN)
2. Taux de rendement interne (TRI/IRR)
3. Retour sur investissement (ROI)
4. Payback period
5. Ratios de solvabilité
6. Projections financières 5-10 ans

SCÉNARIOS: Pessimiste, Réaliste, Optimiste""")

        full_prompt = f"""Tu es un analyste quantitatif de niveau CFA/MBA.

{base_prompt}

DONNÉES EXTRAITES:
{json.dumps(extracted_data, indent=2, ensure_ascii=False)}

RÈGLES IMPÉRATIVES:
- AFFICHER TOUTES LES FORMULES: `Nom = (formule détaillée) = résultat`
- Montrer CHAQUE ÉTAPE de calcul
- Justifier CHAQUE hypothèse avec logique
- Si donnée manque: indiquer et faire hypothèse raisonnable (conservative)
- Tableaux année par année
- Tous les chiffres en format clair

FORMAT:
Texte libre avec formules explicites + Tableau de flux + Scénarios comparés
"""

        try:
            print("🔢 ÉTAPE 2/7: Due diligence quantitative (calculs purs)...")

            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                messages=[{"role": "user", "content": full_prompt}]
            )

            result = response.content[0].text

            self.analysis_log.append({
                "stage": 2,
                "name": "Due Diligence Quantitative",
                "result": result[:500] + "..."  # Truncate for log
            })

            print(f"   ✓ Analyse quantitative complétée ({len(result)} caractères)")

            return result

        except Exception as e:
            print(f"   ❌ Erreur analyse quantitative: {str(e)}")
            return f"Erreur: {str(e)}"

    # ========== ÉTAPE 3: DUE DILIGENCE QUALITATIVE ==========

    def _qualitative_analysis(self, context: Dict, extracted_data: Dict, investment_type: str) -> str:
        """
        Analyse qualitative pure: moat, management, stratégie
        Aucun calcul, que du qualitatif
        """

        qual_prompts = {
            "immobilier": """Tu es Warren Buffett analysant un actif immobilier.

ANALYSE QUALITATIVE OBLIGATOIRE:

1. **MOAT ÉCONOMIQUE**:
   - Localisation (irremplaçable?)
   - Barrières à l'entrée dans ce marché
   - Avantages durables vs autres propriétés
   - Défendabilité sur 20+ ans

2. **QUALITÉ DU BIEN**:
   - État de construction/rénovation
   - Obsolescence technique
   - Attractivité long-terme
   - Potentiel d'amélioration

3. **MARCHÉ LOCAL**:
   - Dynamique démographique
   - Développement économique de la zone
   - Infrastructure (transport, écoles, commerces)
   - Tendances long-terme (gentrification, déclin?)

4. **GESTION**:
   - Qualité du property manager
   - Historique de gestion
   - Complexité opérationnelle

5. **POSITIONNEMENT CONCURRENTIEL**:
   - Comparaison vs autres propriétés similaires
   - Avantages/Désavantages
   - Pricing power

Pas de chiffres, que du qualitatif.""",

            "acquisition_entreprise": """Tu es Warren Buffett analysant une acquisition.

ANALYSE QUALITATIVE:

1. **MOAT ÉCONOMIQUE**:
   - Avantage concurrentiel durable (brand, tech, network effects, coûts, switching costs)
   - Barrières à l'entrée secteur
   - Défendabilité sur 10+ ans
   - Pricing power

2. **QUALITÉ DU MANAGEMENT**:
   - Compétence (track record)
   - Intégrité (culture d'entreprise)
   - Capital allocation (historique décisions)
   - Alignement d'intérêts
   - Reste-t-il après acquisition?

3. **INDUSTRIE & MARCHÉ**:
   - Croissance structurelle du secteur
   - Disruption potentielle (tech, réglementaire)
   - Pouvoir de négociation (clients, fournisseurs)
   - Intensité concurrentielle

4. **MODÈLE D'AFFAIRES**:
   - Récurrence des revenus
   - Scalabilité
   - Capital intensity
   - Cycles économiques

5. **STRATÉGIE**:
   - Clarté de la stratégie
   - Exécution historique
   - Opportunités de croissance
   - Risques stratégiques

6. **RAISON DE LA VENTE**:
   - Pourquoi le vendeur vend?
   - Red flag ou opportunité?

Analyse profonde, zéro chiffre.""",

            "startup": """Tu es un Partner de a16z/Sequoia analysant une startup.

ANALYSE QUALITATIVE:

1. **ÉQUIPE FONDATRICE**:
   - Expérience pertinente
   - Track record antérieur
   - Complémentarité des skills
   - Passion/Obsession pour le problème
   - Capacité d'exécution démontrée
   - Recrutement (attirent-ils des talents?)

2. **PRODUIT & TECHNOLOGIE**:
   - Innovation réelle ou incrémenta le?
   - Propriété intellectuelle (brevets, secret)
   - Defensibility technique
   - Product-market fit (qualité, pas quantité)
   - Vitesse d'itération

3. **MARCHÉ**:
   - Timing (pourquoi maintenant?)
   - Taille et croissance marché
   - Adoption early adopters
   - Comportement changeant (tailwinds)

4. **MOAT POTENTIEL**:
   - Network effects possibles?
   - Switching costs futurs?
   - Data moat?
   - Brand/Community?

5. **COMPÉTITION**:
   - Qui sont les concurrents?
   - Pourquoi cette startup gagnera?
   - Différenciation claire?

6. **VISION**:
   - Ambition (pensent-ils en décennies?)
   - Séquençage (étapes logiques)
   - Potentiel long-terme

Analyse qualitative profonde."""
        }

        base_prompt = qual_prompts.get(investment_type, """ANALYSE QUALITATIVE GÉNÉRALE:

1. Qualité des actifs/produits
2. Positionnement concurrentiel
3. Tendances de marché
4. Risques stratégiques
5. Opportunités de croissance

Zéro chiffre, analyse purement qualitative.""")

        full_prompt = f"""Tu es un expert en analyse qualitative d'investissements.

{base_prompt}

CONTEXTE DISPONIBLE:
{json.dumps(extracted_data, indent=2, ensure_ascii=False)[:2000]}

RÈGLES:
- AUCUN CALCUL (fait à l'étape précédente)
- Focus 100% sur aspects non-quantifiables
- Profondeur maximale
- Identifier forces ET faiblesses
- Penser long-terme (10-20 ans)
- Pas d'optimisme injustifié

Format libre, analyse détaillée.
"""

        try:
            # Add transcription/images for qualitative insights
            content_parts = [{"type": "text", "text": full_prompt}]

            if context.get("transcription"):
                content_parts.append({
                    "type": "text",
                    "text": f"\n\nTRANSCRIPTION (pour contexte qualitatif):\n{context['transcription']}"
                })

            # Sample of frames for visual context
            if context.get("frames"):
                for frame_base64 in context["frames"][::5]:  # Every 5th frame
                    content_parts.append({
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": frame_base64
                        }
                    })

            print("🎓 ÉTAPE 3/7: Due diligence qualitative (moat, management, stratégie)...")

            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                messages=[{"role": "user", "content": content_parts}]
            )

            result = response.content[0].text

            self.analysis_log.append({
                "stage": 3,
                "name": "Due Diligence Qualitative",
                "result": result[:500] + "..."
            })

            print(f"   ✓ Analyse qualitative complétée ({len(result)} caractères)")

            return result

        except Exception as e:
            print(f"   ❌ Erreur analyse qualitative: {str(e)}")
            return f"Erreur: {str(e)}"

    # ========== ÉTAPE 4: ANALYSE DE RISQUES ==========

    def _risk_analysis(self, context: Dict, quant_analysis: str, qual_analysis: str, investment_type: str) -> str:
        """
        Analyse exhaustive des risques avec quantification
        """

        prompt = f"""Tu es un Chief Risk Officer analysant cette opportunité.

TYPE D'INVESTISSEMENT: {investment_type}

ANALYSES PRÉCÉDENTES:
--- QUANTITATIVE ---
{quant_analysis[:1500]}

--- QUALITATIVE ---
{qual_analysis[:1500]}

MISSION: Identifier TOUS les risques et les QUANTIFIER.

CATÉGORIES DE RISQUES:

1. **RISQUES DE MARCHÉ**:
   - Cycles économiques
   - Taux d'intérêt
   - Inflation
   - Changes (si applicable)
   Impact: $X, Probabilité: Y%, Espérance perte: $Z

2. **RISQUES OPÉRATIONNELS**:
   - Exécution
   - Management
   - Systèmes
   - Fraude
   Impact et probabilité

3. **RISQUES STRATÉGIQUES**:
   - Concurrence
   - Disruption technologique
   - Changements réglementaires
   - Obsolescence
   Impact et probabilité

4. **RISQUES FINANCIERS**:
   - Liquidité
   - Solvabilité
   - Structure de capital
   - Covenants
   Impact et probabilité

5. **RISQUES SPÉCIFIQUES**:
   (Selon le type d'investissement)
   Impact et probabilité

POUR CHAQUE RISQUE:
- Description précise
- Impact financier: $X (scénario défavorable)
- Probabilité: Y% (basé sur historique/marché)
- Espérance de perte: Impact × Probabilité
- Mitigation possible: Coût de la mitigation
- Corrélation avec autres risques

SCÉNARIOS DE STRESS:
- Récession économique (-20% revenus)
- Hausse taux d'intérêt (+300 bps)
- Perte client majeur
- Concurrent agressif

FORMAT:
Tableau complet des risques + Stress tests + VaR (Value at Risk) global
"""

        try:
            print("⚠️  ÉTAPE 4/7: Analyse de risques exhaustive...")

            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                messages=[{"role": "user", "content": prompt}]
            )

            result = response.content[0].text

            self.analysis_log.append({
                "stage": 4,
                "name": "Analyse de Risques",
                "result": result[:500] + "..."
            })

            print(f"   ✓ Analyse de risques complétée ({len(result)} caractères)")

            return result

        except Exception as e:
            print(f"   ❌ Erreur analyse risques: {str(e)}")
            return f"Erreur: {str(e)}"

    # ========== ÉTAPE 5: ÉVALUATION COMPARATIVE ==========

    def _comparative_analysis(self, context: Dict, extracted_data: Dict, investment_type: str) -> str:
        """
        Benchmarking et analyse comparative
        """

        prompt = f"""Tu es un expert en évaluation comparative.

TYPE: {investment_type}

DONNÉES:
{json.dumps(extracted_data, indent=2, ensure_ascii=False)[:1500]}

MISSION: Comparer avec des deals/actifs similaires.

ANALYSES REQUISES:

1. **COMPARABLES DE MARCHÉ**:
   - Trouver 3-5 transactions similaires récentes
   - Comparer multiples (prix/valeur, EV/EBITDA, prix/sqft, etc.)
   - Analyse écarts (pourquoi plus cher/moins cher?)

2. **BENCHMARKING SECTORIEL**:
   - Moyennes du secteur/marché
   - Position relative (quartile?)
   - Tendances historiques

3. **DEALS RÉFÉRENCES**:
   - Cas similaires connus
   - Leçons apprises
   - Succès vs échecs

4. **VALIDATION HYPOTHÈSES**:
   - Nos hypothèses vs marché
   - Réalisme des projections
   - Conservatisme vs optimisme

FORMAT:
Tableau comparatif + Analyse des écarts + Validation
"""

        try:
            print("📊 ÉTAPE 5/7: Évaluation comparative et benchmarking...")

            response = self.client.messages.create(
                model=self.model,
                max_tokens=3072,
                messages=[{"role": "user", "content": prompt}]
            )

            result = response.content[0].text

            self.analysis_log.append({
                "stage": 5,
                "name": "Évaluation Comparative",
                "result": result[:500] + "..."
            })

            print(f"   ✓ Évaluation comparative complétée ({len(result)} caractères)")

            return result

        except Exception as e:
            print(f"   ❌ Erreur évaluation comparative: {str(e)}")
            return f"Erreur: {str(e)}"

    # ========== ÉTAPE 6: SYNTHÈSE & DÉCISION ==========

    def _final_synthesis(self, all_analyses: Dict, investment_type: str) -> str:
        """
        Synthèse finale intégrant toutes les étapes
        Décision ACHETER/NÉGOCIER/PASSER
        """

        prompt = f"""Tu es Warren Buffett après 50 ans d'investissement.

Tu as devant toi UNE ANALYSE COMPLÈTE en 5 étapes.

TYPE: {investment_type}

=== ÉTAPE 1: DONNÉES EXTRAITES ===
{json.dumps(all_analyses['extraction'], indent=2, ensure_ascii=False)[:1000]}

=== ÉTAPE 2: ANALYSE QUANTITATIVE ===
{all_analyses['quantitative'][:2000]}

=== ÉTAPE 3: ANALYSE QUALITATIVE ===
{all_analyses['qualitative'][:2000]}

=== ÉTAPE 4: ANALYSE DE RISQUES ===
{all_analyses['risks'][:2000]}

=== ÉTAPE 5: ÉVALUATION COMPARATIVE ===
{all_analyses['comparative'][:1500]}

MISSION: SYNTHÈSE FINALE ET DÉCISION

STRUCTURE OBLIGATOIRE:

1. **RÉSUMÉ EXÉCUTIF** (3 paragraphes max)
   - Opportunité en 1 phrase
   - Forces clés (top 3)
   - Faiblesses clés (top 3)

2. **VALEUR INTRINSÈQUE** (récap quantitatif)
   - Scénario pessimiste: $X
   - Scénario réaliste: $Y
   - Scénario optimiste: $Z
   - Prix demandé: $A
   - Margin of safety: (Y-A)/A × 100 = ?%

3. **FORCES DURABLES** (récap qualitatif)
   - Moat économique (note /10)
   - Qualité management/actifs (note /10)
   - Positionnement (note /10)

4. **RISQUES CRITIQUES**
   - Top 3 risques avec impact $
   - Mitigation possible
   - Risques bloquants?

5. **DÉCISION FINALE**

Format: **ACHETER** / **NÉGOCIER À [prix]** / **PASSER**

SI ACHETER:
- Prix maximum acceptable (formule)
- Conditions non-négociables
- Timeline de retour attendu

SI NÉGOCIER:
- Prix cible calculé (formule avec margin 30%)
- Arguments de négociation (top 3)
- Walk-away price

SI PASSER:
- Raisons chiffrées (manque X% de margin, risque Y trop élevé)
- Ce qui devrait changer pour reconsidérer (seuils précis)

6. **RED FLAGS BLOQUANTS**
   - Liste exhaustive
   - Gravité: 🔴 Bloquant / 🟡 Négociable / 🟢 Mineur

RÈGLES:
- Intégrer TOUTES les analyses précédentes
- Décision tranchée (pas de "peut-être")
- Protéger l'investisseur (biais = PASSER)
- Zéro langue de bois

Ton objectif: Synthèse claire, décision nette.
"""

        try:
            print("✅ ÉTAPE 6/7: Synthèse finale et décision d'investissement...")

            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                messages=[{"role": "user", "content": prompt}]
            )

            result = response.content[0].text

            self.analysis_log.append({
                "stage": 6,
                "name": "Synthèse & Décision",
                "result": result[:500] + "..."
            })

            print(f"   ✓ Synthèse finale complétée ({len(result)} caractères)")

            # Extract decision
            if "**ACHETER**" in result:
                print("   💰 DÉCISION: ACHETER")
            elif "**NÉGOCIER" in result:
                print("   🤝 DÉCISION: NÉGOCIER")
            elif "**PASSER**" in result:
                print("   ❌ DÉCISION: PASSER")

            return result

        except Exception as e:
            print(f"   ❌ Erreur synthèse finale: {str(e)}")
            return f"Erreur: {str(e)}"

    # ========== ÉTAPE 7: GÉNÉRATION JSON GRAPHIQUES ==========

    def _generate_visualization_data(self, all_analyses: Dict, synthesis: str) -> Dict:
        """
        Génère JSON structuré pour les graphiques
        """

        prompt = f"""Tu es un data engineer.

MISSION: Extraire les données numériques et générer JSON pour visualisations.

ANALYSE QUANTITATIVE:
{all_analyses['quantitative'][:2000]}

ANALYSE RISQUES:
{all_analyses['risks'][:1500]}

SYNTHÈSE:
{synthesis[:1500]}

GÉNÈRE LE JSON EXACT:

```json
{{
  "summary": {{
    "investissement": <montant investi>,
    "valeur_intrinseque": <valeur réaliste>,
    "prix_demande": <prix demandé>,
    "margin_of_safety_pct": <(valeur-prix)/prix×100>,
    "roi_annuel_pct": <ROI annualisé>,
    "cap_rate_pct": <cap rate si applicable, sinon 0>,
    "decision": "ACHETER|NÉGOCIER|PASSER"
  }},
  "cashflow_projection": [
    {{"annee": 1, "revenus": X, "depenses": Y, "cf_net": Z}},
    ... (10-20 années)
  ],
  "valeur_scenarios": {{
    "pessimiste": <valeur worst case>,
    "realiste": <valeur base case>,
    "optimiste": <valeur best case>
  }},
  "risques": [
    {{"nom": "Risque X", "impact_financier": X, "probabilite_pct": Y}},
    ... (top 3)
  ],
  "roi_timeline": [
    {{"annee": 1, "valeur_portfolio": X, "cf_cumule": Y, "roi_pct": Z}},
    ... (10-20 années)
  ]
}}
```

RÈGLES:
- Nombres UNIQUEMENT (pas de strings)
- Si donnée manque: mettre 0 ou estimer raisonnablement
- Cohérence avec analyses précédentes
- Arrays complets (pas de "...")
"""

        try:
            print("📊 ÉTAPE 7/7: Génération données pour visualisations...")

            response = self.client.messages.create(
                model=self.model,
                max_tokens=3072,
                messages=[{"role": "user", "content": prompt}]
            )

            result = response.content[0].text

            # Extract JSON
            json_match = result.find("```json")
            if json_match != -1:
                json_end = result.find("```", json_match + 7)
                json_str = result[json_match + 7:json_end].strip()
                viz_data = json.loads(json_str)
            else:
                viz_data = self._generate_fallback_viz_data()

            self.analysis_log.append({
                "stage": 7,
                "name": "Visualisation Data",
                "result": viz_data
            })

            print(f"   ✓ Données de visualisation générées")

            return viz_data

        except Exception as e:
            print(f"   ⚠️  Erreur génération viz (fallback): {str(e)}")
            return self._generate_fallback_viz_data()

    def _generate_fallback_viz_data(self) -> Dict:
        """Fallback si génération JSON échoue"""
        return {
            "summary": {
                "investissement": 0,
                "valeur_intrinseque": 0,
                "prix_demande": 0,
                "margin_of_safety_pct": 0,
                "roi_annuel_pct": 0,
                "cap_rate_pct": 0,
                "decision": "ANALYSE INCOMPLÈTE"
            },
            "cashflow_projection": [],
            "valeur_scenarios": {"pessimiste": 0, "realiste": 0, "optimiste": 0},
            "risques": [],
            "roi_timeline": []
        }

    # ========== ORCHESTRATION PRINCIPALE ==========

    def analyze(self, context: Dict) -> Dict:
        """
        Pipeline complet d'analyse en 7 étapes
        Retourne analyse complète + logs
        """
        start_time = time.time()

        print("\n" + "="*80)
        print("🏆 PIPELINE D'ANALYSE MULTI-ÉTAPES - NIVEAU INSTITUTIONNEL")
        print("="*80 + "\n")

        try:
            # ÉTAPE 0: Classification
            classification = self._classify_investment_type(context)
            investment_type = classification.get('type', 'autre')

            # ÉTAPE 1: Extraction données
            extracted_data = self._extract_raw_data(context, investment_type)

            # ÉTAPE 2: Quantitative
            quant_analysis = self._quantitative_analysis(context, extracted_data, investment_type)

            # ÉTAPE 3: Qualitative
            qual_analysis = self._qualitative_analysis(context, extracted_data, investment_type)

            # ÉTAPE 4: Risques
            risk_analysis = self._risk_analysis(context, quant_analysis, qual_analysis, investment_type)

            # ÉTAPE 5: Comparative
            comp_analysis = self._comparative_analysis(context, extracted_data, investment_type)

            # ÉTAPE 6: Synthèse
            all_analyses = {
                'extraction': extracted_data,
                'quantitative': quant_analysis,
                'qualitative': qual_analysis,
                'risks': risk_analysis,
                'comparative': comp_analysis
            }

            synthesis = self._final_synthesis(all_analyses, investment_type)

            # ÉTAPE 7: Visualisation
            viz_data = self._generate_visualization_data(all_analyses, synthesis)

            # Assembler le rapport final
            final_report = self._assemble_final_report(
                classification,
                extracted_data,
                quant_analysis,
                qual_analysis,
                risk_analysis,
                comp_analysis,
                synthesis,
                viz_data
            )

            processing_time = time.time() - start_time

            print(f"\n{'='*80}")
            print(f"✅ ANALYSE COMPLÈTE EN {processing_time:.1f}s")
            print(f"{'='*80}\n")

            return {
                "analysis": final_report,
                "processing_time": processing_time,
                "investment_type": investment_type,
                "log": self.analysis_log
            }

        except Exception as e:
            print(f"\n❌ ERREUR CRITIQUE: {str(e)}")
            return {
                "analysis": f"Erreur lors de l'analyse: {str(e)}",
                "processing_time": time.time() - start_time,
                "investment_type": "erreur",
                "log": self.analysis_log
            }

    def _assemble_final_report(self, classification, extracted_data, quant, qual, risks, comp, synthesis, viz_data) -> str:
        """Assemble le rapport final avec toutes les sections"""

        report = f"""
{'='*100}
ANALYSE FINANCIÈRE COMPLÈTE - NIVEAU INSTITUTIONNEL
{'='*100}

📋 TYPE D'INVESTISSEMENT: {classification.get('type', 'N/A').upper()}
   Secteur: {classification.get('secteur', 'N/A')}
   Maturité: {classification.get('maturite', 'N/A')}
   Géographie: {classification.get('geographie', 'N/A')}

{'='*100}
📊 ÉTAPE 1: DONNÉES EXTRAITES & VALIDÉES
{'='*100}

{json.dumps(extracted_data, indent=2, ensure_ascii=False)}

{'='*100}
🔢 ÉTAPE 2: ANALYSE QUANTITATIVE (DUE DILIGENCE FINANCIÈRE)
{'='*100}

{quant}

{'='*100}
🎓 ÉTAPE 3: ANALYSE QUALITATIVE (MOAT, MANAGEMENT, STRATÉGIE)
{'='*100}

{qual}

{'='*100}
⚠️  ÉTAPE 4: ANALYSE DE RISQUES
{'='*100}

{risks}

{'='*100}
📊 ÉTAPE 5: ÉVALUATION COMPARATIVE & BENCHMARKING
{'='*100}

{comp}

{'='*100}
✅ ÉTAPE 6: SYNTHÈSE & DÉCISION FINALE
{'='*100}

{synthesis}

{'='*100}
📊 DONNÉES STRUCTURÉES POUR GRAPHIQUES
{'='*100}

```json
{json.dumps(viz_data, indent=2, ensure_ascii=False)}
```

{'='*100}
"""

        return report


def create_multi_stage_analyzer(api_key: str) -> MultiStageAnalyzer:
    """Factory function"""
    return MultiStageAnalyzer(api_key)
