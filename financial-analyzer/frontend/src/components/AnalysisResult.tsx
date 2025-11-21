interface AnalysisResultProps {
  analysis: string
  processingTime?: number
  onExportPDF?: () => void
  onSaveToHistory?: () => void
}

export function AnalysisResult({
  analysis,
  processingTime,
  onExportPDF,
  onSaveToHistory
}: AnalysisResultProps) {
  return (
    <div className="card">
      <div className="analysis-header">
        <h2 className="analysis-title">📊 Analysis Result</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {onSaveToHistory && (
            <button onClick={onSaveToHistory} className="btn btn-secondary">
              💾 Save to History
            </button>
          )}
          {onExportPDF && (
            <button onClick={onExportPDF} className="btn btn-secondary">
              📄 Export PDF
            </button>
          )}
        </div>
      </div>

      {processingTime && (
        <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
          ⚡ Analysis completed in <strong>{processingTime.toFixed(2)}s</strong>
        </div>
      )}

      <div className="analysis-content">{analysis}</div>
    </div>
  )
}
