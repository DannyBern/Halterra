interface SimpleAnalysisDisplayProps {
  analysis: string
  processingTime?: number
}

export function SimpleAnalysisDisplay({ analysis, processingTime }: SimpleAnalysisDisplayProps) {
  return (
    <div style={{
      maxWidth: '900px',
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
          ⏱️ Analyse complétée en {processingTime.toFixed(1)}s
        </div>
      )}

      {/* Analysis Content */}
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--gray-800)',
        borderRadius: 'var(--radius-lg)',
        padding: '3rem',
        fontSize: '1rem',
        lineHeight: '1.9',
        color: 'var(--text-secondary)'
      }}>
        {formatContent(analysis)}
      </div>

      {/* Back to Top Button */}
      <div style={{
        marginTop: '3rem',
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

function formatContent(content: string) {
  const lines = content.split('\n')

  return lines.map((line, index) => {
    const trimmedLine = line.trim()

    // Empty lines
    if (trimmedLine === '') {
      return <div key={index} style={{ height: '1rem' }} />
    }

    // Skip JSON data sections
    if (trimmedLine === '```json' || trimmedLine === '```') {
      return null
    }
    if (trimmedLine.startsWith('{') || trimmedLine.startsWith('}') || trimmedLine.includes('"summary"') || trimmedLine.includes('"cashflow')) {
      return null
    }

    // Section headers (ÉTAPE X)
    if (trimmedLine.match(/^ÉTAPE\s+\d+|^={10,}/)) {
      return (
        <div
          key={index}
          style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'var(--gold)',
            marginTop: index === 0 ? '0' : '3rem',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '3px solid var(--gold)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {trimmedLine.replace(/^={10,}/, '')}
        </div>
      )
    }

    // Sub-headers (###)
    if (trimmedLine.match(/^#{1,4}\s/)) {
      const level = trimmedLine.match(/^(#{1,4})/)?.[1].length || 1
      const text = trimmedLine.replace(/^#{1,4}\s/, '')
      return (
        <h3
          key={index}
          style={{
            fontSize: level === 1 ? '1.5rem' : level === 2 ? '1.25rem' : '1.125rem',
            fontWeight: '700',
            color: level === 1 ? 'var(--gold)' : 'var(--text-primary)',
            marginTop: level === 1 ? '2.5rem' : '2rem',
            marginBottom: '1rem',
            paddingBottom: level === 1 ? '0.5rem' : '0',
            borderBottom: level === 1 ? '2px solid var(--gray-800)' : 'none',
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
            lineHeight: '1.6',
            minWidth: '1.5rem'
          }}>
            •
          </span>
          <span
            style={{ flex: 1, lineHeight: '1.9' }}
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
            lineHeight: '1.9'
          }}>
            {number}.
          </span>
          <span
            style={{ flex: 1, lineHeight: '1.9' }}
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
            marginTop: '1.5rem',
            marginBottom: '1.5rem',
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
    if (trimmedLine.match(/^\*\*(ACHETER|NÉGOCIER|PASSER)/i)) {
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
            fontSize: '1.75rem',
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
            marginTop: '1rem',
            marginBottom: '1rem',
            background: 'var(--bg-card)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--gray-800)',
            fontSize: '0.9375rem',
            fontFamily: 'monospace',
            whiteSpace: 'pre'
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
          marginBottom: '1.25rem',
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
    '<code style="background: var(--bg-card); padding: 0.25rem 0.6rem; border-radius: 0.25rem; font-family: monospace; color: var(--gold); font-size: 0.9375rem; border: 1px solid var(--gray-800);">$1</code>'
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
