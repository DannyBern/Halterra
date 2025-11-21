import { useMemo, useState } from 'react'
import { CollapsibleSection } from './CollapsibleSection'

interface EnhancedAnalysisDisplayProps {
  analysis: string
  processingTime?: number
}

interface AnalysisSection {
  id: string
  title: string
  icon: string
  content: string
  defaultOpen: boolean
}

export function EnhancedAnalysisDisplay({ analysis, processingTime }: EnhancedAnalysisDisplayProps) {
  const [showAllSections, setShowAllSections] = useState(false)

  const sections = useMemo(() => {
    const sectionsList: AnalysisSection[] = []

    // Parse the analysis text to extract sections
    const lines = analysis.split('\n')
    let currentSection: AnalysisSection | null = null
    let currentContent: string[] = []

    const sectionPatterns = [
      { regex: /ÉTAPE 0.*?CLASSIFICATION/i, id: 'classification', icon: '🔍', title: 'Classification du Type d\'Investissement' },
      { regex: /ÉTAPE 1.*?DONNÉES.*?EXTRAITES/i, id: 'extraction', icon: '📊', title: 'Données Extraites & Validées' },
      { regex: /ÉTAPE 2.*?ANALYSE QUANTITATIVE/i, id: 'quantitative', icon: '🔢', title: 'Due Diligence Quantitative (Calculs Financiers)' },
      { regex: /ÉTAPE 3.*?ANALYSE QUALITATIVE/i, id: 'qualitative', icon: '🎓', title: 'Due Diligence Qualitative (Moat & Stratégie)' },
      { regex: /ÉTAPE 4.*?ANALYSE.*?RISQUES/i, id: 'risks', icon: '⚠️', title: 'Analyse de Risques' },
      { regex: /ÉTAPE 5.*?ÉVALUATION COMPARATIVE/i, id: 'comparative', icon: '📊', title: 'Évaluation Comparative & Benchmarking' },
      { regex: /ÉTAPE 6.*?SYNTHÈSE.*?DÉCISION/i, id: 'decision', icon: '✅', title: 'Synthèse Finale & Décision' },
      { regex: /DONNÉES STRUCTURÉES.*?GRAPHIQUES/i, id: 'visualization', icon: '📈', title: 'Données de Visualisation' }
    ]

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check if this line starts a new section
      let foundSection = false
      for (const pattern of sectionPatterns) {
        if (pattern.regex.test(line)) {
          // Save previous section if exists
          if (currentSection && currentContent.length > 0) {
            currentSection.content = currentContent.join('\n').trim()
            sectionsList.push(currentSection)
          }

          // Start new section
          currentSection = {
            id: pattern.id,
            title: pattern.title,
            icon: pattern.icon,
            content: '',
            defaultOpen: pattern.id === 'decision' // Open decision by default
          }
          currentContent = []
          foundSection = true
          break
        }
      }

      if (!foundSection && currentSection) {
        // Skip separator lines
        if (!line.match(/^={10,}$/)) {
          currentContent.push(line)
        }
      }
    }

    // Add last section
    if (currentSection && currentContent.length > 0) {
      currentSection.content = currentContent.join('\n').trim()
      sectionsList.push(currentSection)
    }

    return sectionsList
  }, [analysis])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const decisionSection = sections.find(s => s.id === 'decision')

  return (
    <div>
      {/* Quick Navigation Summary */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%)',
        border: '2px solid var(--gold)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-gold)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: 'var(--gold)',
            margin: 0
          }}>
            📋 Navigation Rapide
          </h3>
          {processingTime && (
            <span style={{
              fontSize: '0.875rem',
              color: 'var(--text-tertiary)',
              background: 'var(--bg-elevated)',
              padding: '0.375rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--gray-800)'
            }}>
              ⚡ Analyse complétée en {processingTime.toFixed(1)}s
            </span>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              style={{
                padding: '0.75rem 1rem',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--gray-800)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--gold)'
                e.currentTarget.style.color = 'var(--gold)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--gray-800)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              <span>{section.icon}</span>
              <span style={{ fontSize: '0.8125rem' }}>{section.title.substring(0, 30)}{section.title.length > 30 ? '...' : ''}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => scrollToSection('decision')}
            style={{
              flex: 1,
              padding: '0.875rem 1.5rem',
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: 'var(--bg-primary)',
              fontSize: '0.9375rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-gold)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 0 30px rgba(212, 175, 55, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'var(--shadow-gold)'
            }}
          >
            ✅ Aller à la Décision Finale
          </button>

          <button
            onClick={() => setShowAllSections(!showAllSections)}
            style={{
              padding: '0.875rem 1.5rem',
              background: 'var(--bg-elevated)',
              border: '2px solid var(--gray-800)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              fontSize: '0.9375rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--gold)'
              e.currentTarget.style.color = 'var(--gold)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--gray-800)'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }}
          >
            {showAllSections ? '📕 Fermer Tout' : '📖 Ouvrir Tout'}
          </button>
        </div>
      </div>

      {/* Sections */}
      <div style={{ marginBottom: '2rem' }}>
        {sections.map((section) => (
          <CollapsibleSection
            key={section.id}
            id={section.id}
            title={section.title}
            content={section.content}
            icon={section.icon}
            defaultOpen={showAllSections || section.defaultOpen}
          />
        ))}
      </div>

      {/* Decision Highlight at Bottom */}
      {decisionSection && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
          border: '2px solid var(--gold)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginTop: '2rem'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: 'var(--gold)',
            marginBottom: '1rem'
          }}>
            💎 Décision Finale
          </h3>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9375rem',
            lineHeight: '1.6',
            margin: 0
          }}>
            Consultez la section <strong>"Synthèse Finale & Décision"</strong> ci-dessus pour la recommandation complète.
          </p>
          <button
            onClick={() => scrollToSection('decision')}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: 'var(--gold)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: 'var(--bg-primary)',
              fontSize: '0.9375rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-md)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'var(--shadow-md)'
            }}
          >
            📍 Voir la Décision
          </button>
        </div>
      )}
    </div>
  )
}
