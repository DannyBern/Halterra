import { SimpleAnalysisDisplay } from './SimpleAnalysisDisplay'

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
    <div className="analysis-result">
      <div className="analysis-header">
        <h2 className="analysis-title">
          📊 Analyse Financière Détaillée
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {onSaveToHistory && (
            <button onClick={onSaveToHistory} className="btn btn-secondary">
              💾 Sauvegarder
            </button>
          )}
          {onExportPDF && (
            <button onClick={onExportPDF} className="btn btn-secondary">
              📄 Export PDF
            </button>
          )}
        </div>
      </div>

      {/* Simple Analysis Display */}
      <SimpleAnalysisDisplay
        analysis={analysis}
        processingTime={processingTime}
      />

      {/* Professional Footer */}
      <div style={{
        marginTop: '2rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--gray-800)',
        fontSize: '0.875rem',
        color: 'var(--text-tertiary)',
        textAlign: 'center'
      }}>
        Analyse générée par Claude AI (Sonnet 4.5) avec méthodologie Warren Buffett Value Investing • 7 étapes institutionnelles
      </div>
    </div>
  )
}
