import { useMemo, useState, useEffect } from 'react'
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
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())
  const [allOpen, setAllOpen] = useState(false)

  const sections = useMemo(() => {
    const sectionsList: AnalysisSection[] = []

    // Parse the analysis text to extract sections
    const lines = analysis.split('\n')
    let currentSection: AnalysisSection | null = null
    let currentContent: string[] = []

    const sectionPatterns = [
      { regex: /ÉTAPE 0.*?CLASSIFICATION/i, id: 'classification', icon: '🔍', title: 'Classification du Type d\'Investissement' },
      { regex: /ÉTAPE 1.*?DONNÉES.*?EXTRAITES/i, id: 'extraction', icon: '📊', title: 'Données Extraites & Validées' },
      { regex: /ÉTAPE 2.*?ANALYSE QUANTITATIVE/i, id: 'quantitative', icon: '🔢', title: 'Due Diligence Quantitative' },
      { regex: /ÉTAPE 3.*?ANALYSE QUALITATIVE/i, id: 'qualitative', icon: '🎓', title: 'Due Diligence Qualitative' },
      { regex: /ÉTAPE 4.*?ANALYSE.*?RISQUES/i, id: 'risks', icon: '⚠️', title: 'Analyse de Risques' },
      { regex: /ÉTAPE 5.*?ÉVALUATION COMPARATIVE/i, id: 'comparative', icon: '📈', title: 'Évaluation Comparative' },
      { regex: /ÉTAPE 6.*?SYNTHÈSE.*?DÉCISION/i, id: 'decision', icon: '✅', title: 'Synthèse Finale & Décision' },
      { regex: /DONNÉES STRUCTURÉES.*?GRAPHIQUES/i, id: 'visualization', icon: '📉', title: 'Données de Visualisation' }
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

  // Initialize open sections with decision section
  useEffect(() => {
    const initialOpen = new Set(sections.filter(s => s.defaultOpen).map(s => s.id))
    setOpenSections(initialOpen)
  }, [sections])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const toggleAllSections = () => {
    if (allOpen) {
      // Close all
      setOpenSections(new Set())
      setAllOpen(false)
    } else {
      // Open all
      setOpenSections(new Set(sections.map(s => s.id)))
      setAllOpen(true)
    }
  }

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections)
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId)
    } else {
      newOpenSections.add(sectionId)
    }
    setOpenSections(newOpenSections)

    // Update allOpen state
    setAllOpen(newOpenSections.size === sections.length)
  }

  return (
    <div style={{
      display: 'flex',
      gap: '2rem',
      position: 'relative',
      minHeight: '600px'
    }}>
      {/* Fixed Sidebar Navigation */}
      <aside style={{
        position: 'sticky',
        top: '2rem',
        alignSelf: 'flex-start',
        width: '280px',
        flexShrink: 0,
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%)',
        border: '2px solid var(--gold)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        maxHeight: 'calc(100vh - 4rem)',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
          paddingBottom: '1rem',
          borderBottom: '2px solid var(--gold)'
        }}>
          <span style={{ fontSize: '1.5rem' }}>📋</span>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '700',
            color: 'var(--gold)',
            margin: 0
          }}>
            Navigation
          </h3>
        </div>

        {processingTime && (
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
            background: 'var(--bg-elevated)',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--gray-800)',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            ⚡ {processingTime.toFixed(1)}s
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              style={{
                padding: '0.75rem',
                background: openSections.has(section.id)
                  ? 'rgba(212, 175, 55, 0.1)'
                  : 'var(--bg-elevated)',
                border: openSections.has(section.id)
                  ? '1px solid var(--gold)'
                  : '1px solid var(--gray-800)',
                borderRadius: 'var(--radius-md)',
                color: openSections.has(section.id)
                  ? 'var(--gold)'
                  : 'var(--text-secondary)',
                fontSize: '0.8125rem',
                fontWeight: openSections.has(section.id) ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--gold)'
                e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'
              }}
              onMouseLeave={(e) => {
                if (!openSections.has(section.id)) {
                  e.currentTarget.style.borderColor = 'var(--gray-800)'
                  e.currentTarget.style.background = 'var(--bg-elevated)'
                }
              }}
            >
              <span style={{ fontSize: '1rem' }}>{section.icon}</span>
              <span style={{ flex: 1, lineHeight: '1.3' }}>
                {section.title}
              </span>
            </button>
          ))}
        </div>

        {/* Control Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--gray-800)'
        }}>
          <button
            onClick={() => scrollToSection('decision')}
            style={{
              padding: '0.875rem',
              background: 'linear-gradient(135deg, var(--gold) 0%, #b8941f 100%)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: 'var(--bg-primary)',
              fontSize: '0.875rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.3)'
            }}
          >
            <span>✅</span>
            <span>Décision Finale</span>
          </button>

          <button
            onClick={toggleAllSections}
            style={{
              padding: '0.75rem',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--gray-800)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
            <span>{allOpen ? '📕' : '📖'}</span>
            <span>{allOpen ? 'Fermer Tout' : 'Ouvrir Tout'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        minWidth: 0 // Allows flex item to shrink below content size
      }}>
        {sections.map((section) => (
          <CollapsibleSection
            key={section.id}
            id={section.id}
            title={section.title}
            content={section.content}
            icon={section.icon}
            isOpen={openSections.has(section.id)}
            onToggle={() => toggleSection(section.id)}
          />
        ))}
      </main>
    </div>
  )
}
