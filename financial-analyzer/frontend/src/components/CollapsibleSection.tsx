import { useState } from 'react'

interface CollapsibleSectionProps {
  title: string
  content: string
  icon?: string
  defaultOpen?: boolean
  id?: string
}

export function CollapsibleSection({
  title,
  content,
  icon = '📄',
  defaultOpen = false,
  id
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div
      id={id}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--gray-800)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '1rem',
        overflow: 'hidden',
        transition: 'all 0.2s'
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '1rem 1.5rem',
          background: isOpen ? 'var(--bg-card)' : 'transparent',
          border: 'none',
          borderBottom: isOpen ? '1px solid var(--gray-800)' : 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          color: 'var(--text-primary)',
          fontSize: '1.125rem',
          fontWeight: '700',
          textAlign: 'left'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.background = 'var(--bg-card)'
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.background = 'transparent'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>{icon}</span>
          <span>{title}</span>
        </div>
        <span style={{
          fontSize: '1.5rem',
          color: 'var(--gold)',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          display: 'inline-block'
        }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div style={{
          padding: '1.5rem',
          whiteSpace: 'pre-wrap',
          fontSize: '0.9375rem',
          lineHeight: '1.8',
          color: 'var(--text-secondary)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {content}
        </div>
      )}
    </div>
  )
}
