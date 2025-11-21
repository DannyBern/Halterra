import { AnalysisHistory } from '../types'

interface HistoryPanelProps {
  history: AnalysisHistory[]
  onSelect: (item: AnalysisHistory) => void
  onDelete: (id: string) => void
  onClear: () => void
}

export function HistoryPanel({ history, onSelect, onDelete, onClear }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div className="card">
        <h3 style={{ marginBottom: '1rem', color: 'var(--gray-700)' }}>📜 Analysis History</h3>
        <div className="alert alert-info">
          No analysis history yet. Your analyses will appear here.
        </div>
      </div>
    )
  }

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (type: string): string => {
    switch (type) {
      case 'video':
        return '🎬'
      case 'audio':
        return '🎵'
      case 'image':
        return '🖼️'
      default:
        return '📄'
    }
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, color: 'var(--gray-700)' }}>📜 Analysis History ({history.length})</h3>
        <button onClick={onClear} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          🗑️ Clear All
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {history.map((item) => (
          <div
            key={item.id}
            style={{
              padding: '1rem',
              border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--gray-50)',
              cursor: 'pointer',
              transition: 'all var(--transition-base)',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'white'
              e.currentTarget.style.borderColor = 'var(--primary)'
              e.currentTarget.style.transform = 'translateX(4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--gray-50)'
              e.currentTarget.style.borderColor = 'var(--gray-200)'
              e.currentTarget.style.transform = 'translateX(0)'
            }}
            onClick={() => onSelect(item)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{getFileIcon(item.fileType)}</span>
                  <span style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: '0.9375rem' }}>
                    {item.filename}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                  {item.query.length > 100 ? item.query.substring(0, 100) + '...' : item.query}
                </p>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                  <span>⏱️ {item.processingTime.toFixed(1)}s</span>
                  <span>📅 {formatDate(item.timestamp)}</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(item.id)
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  fontSize: '1.125rem',
                  opacity: 0.6,
                  transition: 'opacity var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.6'
                }}
                title="Delete this analysis"
              >
                ❌
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
