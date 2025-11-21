interface CollapsibleSectionProps {
  title: string
  content: string
  icon?: string
  isOpen: boolean
  onToggle: () => void
  id?: string
}

export function CollapsibleSection({
  title,
  content,
  icon = '📄',
  isOpen,
  onToggle,
  id
}: CollapsibleSectionProps) {
  return (
    <div
      id={`section-${id}`}
      style={{
        background: 'var(--bg-elevated)',
        border: isOpen ? '2px solid var(--gold)' : '1px solid var(--gray-800)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '1.5rem',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        boxShadow: isOpen
          ? '0 8px 24px rgba(212, 175, 55, 0.15)'
          : '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '1.25rem 1.5rem',
          background: isOpen
            ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.03) 100%)'
            : 'transparent',
          border: 'none',
          borderBottom: isOpen ? '1px solid var(--gray-800)' : 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          color: 'var(--text-primary)',
          fontSize: '1.125rem',
          fontWeight: '700',
          textAlign: 'left'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = 'rgba(212, 175, 55, 0.05)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = 'transparent'
          }
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          flex: 1
        }}>
          <span style={{
            fontSize: '1.5rem',
            filter: isOpen ? 'brightness(1.2)' : 'brightness(1)',
            transition: 'filter 0.2s'
          }}>
            {icon}
          </span>
          <span style={{
            color: isOpen ? 'var(--gold)' : 'var(--text-primary)',
            transition: 'color 0.2s'
          }}>
            {title}
          </span>
        </div>
        <span style={{
          fontSize: '1.25rem',
          color: 'var(--gold)',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease',
          display: 'inline-block',
          width: '24px',
          textAlign: 'center'
        }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div style={{
          padding: '2rem',
          whiteSpace: 'pre-wrap',
          fontSize: '0.9375rem',
          lineHeight: '1.8',
          color: 'var(--text-secondary)',
          animation: 'slideDown 0.3s ease-out',
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--gray-800)'
        }}>
          <style>
            {`
              @keyframes slideDown {
                from {
                  opacity: 0;
                  transform: translateY(-10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}
          </style>
          {content.split('\n').map((line, index) => {
            // Enhanced formatting for better readability
            if (line.trim().match(/^#{1,6}\s/)) {
              // Headers
              const level = line.match(/^(#{1,6})/)?.[1].length || 1
              const text = line.replace(/^#{1,6}\s/, '')
              return (
                <h4
                  key={index}
                  style={{
                    fontSize: level === 1 ? '1.25rem' : '1.1rem',
                    fontWeight: '700',
                    color: 'var(--gold)',
                    marginTop: index === 0 ? '0' : '1.5rem',
                    marginBottom: '0.75rem',
                    paddingBottom: '0.5rem',
                    borderBottom: level === 1 ? '2px solid var(--gray-800)' : 'none'
                  }}
                >
                  {text}
                </h4>
              )
            } else if (line.trim().match(/^[-*]\s/)) {
              // Bullet points
              const text = line.replace(/^[-*]\s/, '')
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
                  <span style={{ color: 'var(--gold)', fontWeight: '700' }}>•</span>
                  <span style={{ flex: 1 }}>{text}</span>
                </div>
              )
            } else if (line.trim().match(/^\d+\.\s/)) {
              // Numbered lists
              const text = line.replace(/^\d+\.\s/, '')
              const number = line.match(/^(\d+)\./)?.[1]
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
                    minWidth: '1.5rem'
                  }}>
                    {number}.
                  </span>
                  <span style={{ flex: 1 }}>{text}</span>
                </div>
              )
            } else if (line.trim() === '') {
              // Empty lines for spacing
              return <div key={index} style={{ height: '0.75rem' }} />
            } else {
              // Regular text with bold/italic support
              let formattedText = line
              // Bold: **text** or __text__
              formattedText = formattedText.replace(
                /\*\*(.+?)\*\*|__(.+?)__/g,
                '<strong style="color: var(--text-primary); font-weight: 700;">$1$2</strong>'
              )
              // Italic: *text* or _text_
              formattedText = formattedText.replace(
                /\*(.+?)\*|_(.+?)_/g,
                '<em style="color: var(--gold);">$1$2</em>'
              )

              return (
                <p
                  key={index}
                  style={{
                    marginBottom: '0.75rem',
                    lineHeight: '1.8'
                  }}
                  dangerouslySetInnerHTML={{ __html: formattedText }}
                />
              )
            }
          })}
        </div>
      )}
    </div>
  )
}
