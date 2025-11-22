interface PremiumAnalysisDisplayProps {
  analysis: string
  processingTime?: number
}

export function PremiumAnalysisDisplay({ analysis, processingTime }: PremiumAnalysisDisplayProps) {
  // Parse analysis into sections
  const sections = parsePremiumAnalysis(analysis)

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Processing Time Badge */}
      {processingTime && (
        <div style={{
          display: 'inline-block',
          fontSize: '0.875rem',
          color: 'var(--text-tertiary)',
          background: 'var(--bg-card)',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '2px solid var(--gold)',
          marginBottom: '2rem',
          fontWeight: '600'
        }}>
          ⚡ Analyse institutionnelle complétée en {processingTime.toFixed(1)}s
        </div>
      )}

      {/* Table of Contents */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%)',
        border: '2px solid var(--gold)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        marginBottom: '3rem',
        boxShadow: '0 8px 32px rgba(212, 175, 55, 0.2)'
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: 'var(--gold)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span style={{ fontSize: '2rem' }}>📋</span>
          Table des Matières
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          {sections.map((section, index) => (
            <a
              key={index}
              href={`#section-${index}`}
              style={{
                padding: '1rem',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--gray-800)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s',
                fontSize: '0.9375rem',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--gold)'
                e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'
                e.currentTarget.style.transform = 'translateX(4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--gray-800)'
                e.currentTarget.style.background = 'var(--bg-elevated)'
                e.currentTarget.style.transform = 'translateX(0)'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{section.icon}</span>
              <span>{section.title}</span>
            </a>
          ))}
        </div>
      </div>

      {/* All Sections Displayed */}
      {sections.map((section, index) => (
        <Section
          key={index}
          id={`section-${index}`}
          title={section.title}
          icon={section.icon}
          content={section.content}
          isDecision={section.isDecision}
          index={index}
          total={sections.length}
        />
      ))}

      {/* Bottom Navigation */}
      <div style={{
        marginTop: '3rem',
        padding: '2rem',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--gray-800)',
        borderRadius: 'var(--radius-lg)',
        textAlign: 'center'
      }}>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            padding: '1rem 2rem',
            background: 'linear-gradient(135deg, var(--gold) 0%, #b8941f 100%)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: 'var(--bg-primary)',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
            transition: 'all 0.2s'
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
          ⬆️ Retour en Haut
        </button>
      </div>
    </div>
  )
}

interface AnalysisSection {
  title: string
  icon: string
  content: string
  isDecision: boolean
}

function parsePremiumAnalysis(analysis: string): AnalysisSection[] {
  const sections: AnalysisSection[] = []
  const lines = analysis.split('\n')

  let currentSection: AnalysisSection | null = null
  let currentContent: string[] = []

  const sectionPatterns = [
    { regex: /ÉTAPE 0.*?CLASSIFICATION/i, icon: '🔍', title: 'Classification du Type d\'Investissement', isDecision: false },
    { regex: /ÉTAPE 1.*?DONNÉES.*?EXTRAITES/i, icon: '📊', title: 'Données Extraites & Validées', isDecision: false },
    { regex: /ÉTAPE 2.*?ANALYSE QUANTITATIVE/i, icon: '🔢', title: 'Due Diligence Quantitative', isDecision: false },
    { regex: /ÉTAPE 3.*?ANALYSE QUALITATIVE/i, icon: '🎓', title: 'Due Diligence Qualitative', isDecision: false },
    { regex: /ÉTAPE 4.*?ANALYSE.*?RISQUES/i, icon: '⚠️', title: 'Analyse de Risques', isDecision: false },
    { regex: /ÉTAPE 5.*?ÉVALUATION COMPARATIVE/i, icon: '📈', title: 'Évaluation Comparative & Benchmarking', isDecision: false },
    { regex: /ÉTAPE 6.*?SYNTHÈSE.*?DÉCISION/i, icon: '✅', title: 'Synthèse Finale & Décision', isDecision: true },
    { regex: /DONNÉES STRUCTURÉES.*?GRAPHIQUES/i, icon: '📉', title: 'Données de Visualisation', isDecision: false }
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    let foundSection = false
    for (const pattern of sectionPatterns) {
      if (pattern.regex.test(line)) {
        if (currentSection && currentContent.length > 0) {
          currentSection.content = currentContent.join('\n').trim()
          sections.push(currentSection)
        }

        currentSection = {
          title: pattern.title,
          icon: pattern.icon,
          content: '',
          isDecision: pattern.isDecision
        }
        currentContent = []
        foundSection = true
        break
      }
    }

    if (!foundSection && currentSection) {
      if (!line.match(/^={10,}$/)) {
        currentContent.push(line)
      }
    }
  }

  if (currentSection && currentContent.length > 0) {
    currentSection.content = currentContent.join('\n').trim()
    sections.push(currentSection)
  }

  return sections
}

interface SectionProps {
  id: string
  title: string
  icon: string
  content: string
  isDecision: boolean
  index: number
  total: number
}

function Section({ id, title, icon, content, isDecision, index }: SectionProps) {
  return (
    <div
      id={id}
      style={{
        marginBottom: '3rem',
        scrollMarginTop: '2rem'
      }}
    >
      {/* Section Header */}
      <div style={{
        background: isDecision
          ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.05) 100%)'
          : 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%)',
        border: isDecision ? '3px solid var(--gold)' : '2px solid var(--gray-800)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        marginBottom: '1.5rem',
        boxShadow: isDecision
          ? '0 8px 32px rgba(212, 175, 55, 0.3)'
          : '0 4px 16px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '0.5rem'
        }}>
          <span style={{
            fontSize: '3rem',
            lineHeight: '1'
          }}>
            {icon}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '0.875rem',
              color: 'var(--text-tertiary)',
              fontWeight: '600',
              marginBottom: '0.25rem'
            }}>
              ÉTAPE {index}
            </div>
            <h2 style={{
              fontSize: isDecision ? '2rem' : '1.75rem',
              fontWeight: '700',
              color: isDecision ? 'var(--gold)' : 'var(--text-primary)',
              margin: 0,
              lineHeight: '1.2'
            }}>
              {title}
            </h2>
          </div>
        </div>
      </div>

      {/* Section Content */}
      <div style={{
        background: 'var(--bg-elevated)',
        border: isDecision ? '2px solid var(--gold)' : '1px solid var(--gray-800)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem',
        fontSize: '1rem',
        lineHeight: '1.9',
        color: 'var(--text-secondary)'
      }}>
        {formatContent(content, isDecision)}
      </div>
    </div>
  )
}

function formatContent(content: string, isDecision: boolean) {
  const lines = content.split('\n')

  return lines.map((line, index) => {
    const trimmedLine = line.trim()

    if (trimmedLine === '') {
      return <div key={index} style={{ height: '1rem' }} />
    }

    // Main headers (###)
    if (trimmedLine.match(/^#{1,3}\s/)) {
      const level = trimmedLine.match(/^(#{1,3})/)?.[1].length || 1
      const text = trimmedLine.replace(/^#{1,3}\s/, '')
      return (
        <h3
          key={index}
          style={{
            fontSize: level === 1 ? '1.5rem' : level === 2 ? '1.25rem' : '1.125rem',
            fontWeight: '700',
            color: 'var(--gold)',
            marginTop: index === 0 ? '0' : '2rem',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: level === 1 ? '2px solid var(--gold)' : level === 2 ? '1px solid var(--gray-800)' : 'none',
            lineHeight: '1.3'
          }}
        >
          {text}
        </h3>
      )
    }

    // Bullet points
    if (trimmedLine.match(/^[-*•]\s/)) {
      const text = trimmedLine.replace(/^[-*•]\s/, '')
      return (
        <div
          key={index}
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '0.75rem',
            paddingLeft: '0.5rem'
          }}
        >
          <span style={{
            color: 'var(--gold)',
            fontWeight: '700',
            fontSize: '1.25rem',
            lineHeight: '1.5',
            minWidth: '1.5rem'
          }}>
            •
          </span>
          <span
            style={{ flex: 1, lineHeight: '1.8' }}
            dangerouslySetInnerHTML={{ __html: formatInlineStyles(text) }}
          />
        </div>
      )
    }

    // Numbered lists
    if (trimmedLine.match(/^\d+\.\s/)) {
      const number = trimmedLine.match(/^(\d+)\./)?.[1]
      const text = trimmedLine.replace(/^\d+\.\s/, '')
      return (
        <div
          key={index}
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '0.75rem',
            paddingLeft: '0.5rem'
          }}
        >
          <span style={{
            color: 'var(--gold)',
            fontWeight: '700',
            fontSize: '1.125rem',
            minWidth: '2.5rem',
            lineHeight: '1.8'
          }}>
            {number}.
          </span>
          <span
            style={{ flex: 1, lineHeight: '1.8' }}
            dangerouslySetInnerHTML={{ __html: formatInlineStyles(text) }}
          />
        </div>
      )
    }

    // Warning/Alert boxes
    if (trimmedLine.match(/^⚠️|^🚨|^⛔|^DONNÉES MANQUANTES/i)) {
      return (
        <div
          key={index}
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            marginTop: '1.5rem',
            color: 'var(--error)',
            fontWeight: '600',
            fontSize: '1.0625rem'
          }}
        >
          {trimmedLine}
        </div>
      )
    }

    // Decision statements (ACHETER, NÉGOCIER, PASSER)
    if (isDecision && trimmedLine.match(/^\*\*(ACHETER|NÉGOCIER|PASSER)/i)) {
      const decision = trimmedLine.match(/(ACHETER|NÉGOCIER|PASSER)/i)?.[1]
      const color = decision === 'ACHETER' ? 'var(--success)' :
                    decision === 'NÉGOCIER' ? 'var(--warning)' : 'var(--error)'

      return (
        <div
          key={index}
          style={{
            background: decision === 'ACHETER' ? 'rgba(34, 197, 94, 0.15)' :
                        decision === 'NÉGOCIER' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `3px solid ${color}`,
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            marginTop: '2rem',
            marginBottom: '2rem',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: color,
            textAlign: 'center',
            boxShadow: `0 8px 24px ${decision === 'ACHETER' ? 'rgba(34, 197, 94, 0.2)' :
                        decision === 'NÉGOCIER' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
          }}
          dangerouslySetInnerHTML={{ __html: formatInlineStyles(trimmedLine) }}
        />
      )
    }

    // Tables (simple detection)
    if (trimmedLine.match(/\|.*\|/)) {
      return (
        <div
          key={index}
          style={{
            overflowX: 'auto',
            marginBottom: '1rem',
            background: 'var(--bg-card)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--gray-800)',
            fontSize: '0.9375rem',
            fontFamily: 'monospace'
          }}
        >
          {trimmedLine}
        </div>
      )
    }

    // Regular paragraphs
    return (
      <p
        key={index}
        style={{
          marginBottom: '1rem',
          lineHeight: '1.9',
          fontSize: '1rem'
        }}
        dangerouslySetInnerHTML={{ __html: formatInlineStyles(trimmedLine) }}
      />
    )
  })
}

function formatInlineStyles(text: string): string {
  // Bold: **text**
  let formatted = text.replace(
    /\*\*(.+?)\*\*/g,
    '<strong style="color: var(--text-primary); font-weight: 700; font-size: 1.0625rem;">$1</strong>'
  )

  // Italic: *text*
  formatted = formatted.replace(
    /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g,
    '<em style="color: var(--gold); font-style: italic;">$1</em>'
  )

  // Code/Formulas: `text`
  formatted = formatted.replace(
    /`([^`]+)`/g,
    '<code style="background: var(--bg-card); padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-family: monospace; color: var(--gold); font-size: 0.9375rem; border: 1px solid var(--gray-800);">$1</code>'
  )

  // Highlight $ amounts
  formatted = formatted.replace(
    /(\$[\d,]+(?:\.\d{1,2})?)/g,
    '<span style="color: var(--success); font-weight: 700; font-size: 1.0625rem;">$1</span>'
  )

  // Highlight percentages
  formatted = formatted.replace(
    /([\d,]+(?:\.\d{1,2})?%)/g,
    '<span style="color: var(--info); font-weight: 700; font-size: 1.0625rem;">$1</span>'
  )

  return formatted
}
