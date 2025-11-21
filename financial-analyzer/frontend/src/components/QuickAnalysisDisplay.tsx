interface QuickAnalysisDisplayProps {
  analysis: string
  processingTime?: number
}

export function QuickAnalysisDisplay({ analysis, processingTime }: QuickAnalysisDisplayProps) {
  // Parse analysis into sections
  const sections = parseQuickAnalysis(analysis)

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--gray-800)',
      borderRadius: 'var(--radius-lg)',
      padding: '2rem',
      marginBottom: '2rem'
    }}>
      {processingTime && (
        <div style={{
          display: 'inline-block',
          fontSize: '0.875rem',
          color: 'var(--text-tertiary)',
          background: 'var(--bg-card)',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--gray-800)',
          marginBottom: '2rem'
        }}>
          ⚡ Analyse complétée en {processingTime.toFixed(1)}s
        </div>
      )}

      {sections.map((section, index) => (
        <Section key={index} title={section.title} content={section.content} isDecision={section.isDecision} />
      ))}
    </div>
  )
}

interface AnalysisSection {
  title: string
  content: string
  isDecision: boolean
}

function parseQuickAnalysis(analysis: string): AnalysisSection[] {
  const sections: AnalysisSection[] = []
  const lines = analysis.split('\n')

  let currentSection: AnalysisSection | null = null
  let currentContent: string[] = []

  // Section patterns to identify
  const sectionPatterns = [
    { regex: /^(\*\*)?DONNÉES BRUTES EXTRAITES/i, title: '📊 Données Brutes Extraites', isDecision: false },
    { regex: /^(\*\*)?1\.?\s*VALEUR INTRINSÈQUE/i, title: '💰 Valeur Intrinsèque Estimée', isDecision: false },
    { regex: /^(\*\*)?2\.?\s*ÉCART PRIX/i, title: '📈 Écart Prix / Valeur', isDecision: false },
    { regex: /^(\*\*)?3\.?\s*MOAT ÉCONOMIQUE/i, title: '🏰 Moat Économique', isDecision: false },
    { regex: /^(\*\*)?4\.?\s*RISQUES MAJEURS/i, title: '⚠️ Risques Majeurs', isDecision: false },
    { regex: /^(\*\*)?5\.?\s*CASH-?FLOW/i, title: '💵 Cash-Flow Réaliste', isDecision: false },
    { regex: /^(\*\*)?6\.?\s*DÉCISION FINALE/i, title: '✅ Décision Finale', isDecision: true },
    { regex: /^(\*\*)?7\.?\s*RED FLAGS/i, title: '🚩 Red Flags Critiques', isDecision: false }
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Check if line starts a new section
    let foundSection = false
    for (const pattern of sectionPatterns) {
      if (pattern.regex.test(line)) {
        // Save previous section
        if (currentSection && currentContent.length > 0) {
          currentSection.content = currentContent.join('\n').trim()
          sections.push(currentSection)
        }

        // Start new section
        currentSection = {
          title: pattern.title,
          content: '',
          isDecision: pattern.isDecision
        }
        currentContent = []
        foundSection = true
        break
      }
    }

    if (!foundSection && currentSection) {
      // Skip the original title line
      if (!line.match(/^(\*\*)?[0-9]\.?\s*[A-Z]/)) {
        currentContent.push(line)
      }
    }
  }

  // Add last section
  if (currentSection && currentContent.length > 0) {
    currentSection.content = currentContent.join('\n').trim()
    sections.push(currentSection)
  }

  return sections
}

interface SectionProps {
  title: string
  content: string
  isDecision: boolean
}

function Section({ title, content, isDecision }: SectionProps) {
  return (
    <div style={{
      marginBottom: '2rem',
      paddingBottom: '2rem',
      borderBottom: '1px solid var(--gray-800)'
    }}>
      <h3 style={{
        fontSize: isDecision ? '1.5rem' : '1.25rem',
        fontWeight: '700',
        color: isDecision ? 'var(--gold)' : 'var(--text-primary)',
        marginBottom: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: isDecision ? '2px solid var(--gold)' : '2px solid var(--gray-800)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        {title}
      </h3>

      <div style={{
        fontSize: '0.9375rem',
        lineHeight: '1.8',
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

    // Skip empty lines
    if (trimmedLine === '') {
      return <div key={index} style={{ height: '0.5rem' }} />
    }

    // Headers (markdown style)
    if (trimmedLine.match(/^#{1,6}\s/)) {
      const level = trimmedLine.match(/^(#{1,6})/)?.[1].length || 1
      const text = trimmedLine.replace(/^#{1,6}\s/, '')
      return (
        <h4
          key={index}
          style={{
            fontSize: level === 1 ? '1.125rem' : '1rem',
            fontWeight: '700',
            color: 'var(--gold)',
            marginTop: '1.25rem',
            marginBottom: '0.75rem'
          }}
        >
          {text}
        </h4>
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
            gap: '0.75rem',
            marginBottom: '0.5rem',
            paddingLeft: '1rem'
          }}
        >
          <span style={{ color: 'var(--gold)', fontWeight: '700', minWidth: '1rem' }}>•</span>
          <span style={{ flex: 1 }} dangerouslySetInnerHTML={{ __html: formatInlineStyles(text) }} />
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
            gap: '0.75rem',
            marginBottom: '0.5rem',
            paddingLeft: '1rem'
          }}
        >
          <span style={{
            color: 'var(--gold)',
            fontWeight: '700',
            minWidth: '2rem'
          }}>
            {number}.
          </span>
          <span style={{ flex: 1 }} dangerouslySetInnerHTML={{ __html: formatInlineStyles(text) }} />
        </div>
      )
    }

    // Warning/Alert lines
    if (trimmedLine.match(/^⚠️|^🚨|^⛔/)) {
      return (
        <div
          key={index}
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '0.75rem',
            color: 'var(--error)',
            fontWeight: '600'
          }}
        >
          {trimmedLine}
        </div>
      )
    }

    // Decision lines (ACHETER, NÉGOCIER, PASSER)
    if (isDecision && trimmedLine.match(/^\*\*(ACHETER|NÉGOCIER|PASSER)/i)) {
      const decision = trimmedLine.match(/(ACHETER|NÉGOCIER|PASSER)/i)?.[1]
      const color = decision === 'ACHETER' ? 'var(--success)' :
                    decision === 'NÉGOCIER' ? 'var(--warning)' : 'var(--error)'

      return (
        <div
          key={index}
          style={{
            background: decision === 'ACHETER' ? 'rgba(34, 197, 94, 0.1)' :
                        decision === 'NÉGOCIER' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `2px solid ${color}`,
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1rem',
            fontSize: '1.125rem',
            fontWeight: '700',
            color: color,
            textAlign: 'center'
          }}
          dangerouslySetInnerHTML={{ __html: formatInlineStyles(trimmedLine) }}
        />
      )
    }

    // Regular paragraphs
    return (
      <p
        key={index}
        style={{
          marginBottom: '0.75rem',
          lineHeight: '1.8'
        }}
        dangerouslySetInnerHTML={{ __html: formatInlineStyles(trimmedLine) }}
      />
    )
  })
}

function formatInlineStyles(text: string): string {
  // Bold: **text** or __text__
  let formatted = text.replace(
    /\*\*(.+?)\*\*|__(.+?)__/g,
    '<strong style="color: var(--text-primary); font-weight: 700;">$1$2</strong>'
  )

  // Italic: *text* or _text_ (but not ** or __)
  formatted = formatted.replace(
    /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)|(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g,
    '<em style="color: var(--gold); font-style: italic;">$1$2</em>'
  )

  // Highlight formulas (text with = sign)
  formatted = formatted.replace(
    /`([^`]+)`/g,
    '<code style="background: var(--bg-card); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-family: monospace; color: var(--gold);">$1</code>'
  )

  // Highlight numbers with $ or %
  formatted = formatted.replace(
    /(\$[\d,]+(?:\.\d{1,2})?)/g,
    '<span style="color: var(--success); font-weight: 600;">$1</span>'
  )
  formatted = formatted.replace(
    /([\d,]+(?:\.\d{1,2})?%)/g,
    '<span style="color: var(--info); font-weight: 600;">$1</span>'
  )

  return formatted
}
