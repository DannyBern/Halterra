import { useMemo } from 'react'
import { CashFlowChart, ROITimelineChart, ValueComparisonChart, RiskBreakdownChart } from './charts'
import { EnhancedAnalysisDisplay } from './EnhancedAnalysisDisplay'

interface AnalysisResultProps {
  analysis: string
  processingTime?: number
  onExportPDF?: () => void
  onSaveToHistory?: () => void
}

interface FinancialData {
  summary: {
    investissement: number
    valeur_intrinseque: number
    prix_demande: number
    margin_of_safety_pct: number
    roi_annuel_pct: number
    cap_rate_pct: number
    decision: string
  }
  cashflow_projection: Array<{
    annee: number
    revenus: number
    depenses: number
    cf_net: number
  }>
  valeur_scenarios: {
    pessimiste: number
    realiste: number
    optimiste: number
  }
  risques: Array<{
    nom: string
    impact_financier: number
    probabilite_pct: number
  }>
  roi_timeline: Array<{
    annee: number
    valeur_portfolio: number
    cf_cumule: number
    roi_pct: number
  }>
}

export function AnalysisResult({
  analysis,
  processingTime,
  onExportPDF,
  onSaveToHistory
}: AnalysisResultProps) {
  const { textContent, financialData, isMultiStage } = useMemo(() => {
    // Check if this is a multi-stage analysis (7 stages)
    const isMultiStage = /ÉTAPE \d.*?(CLASSIFICATION|DONNÉES|QUANTITATIVE|QUALITATIVE|RISQUES|COMPARATIVE|SYNTHÈSE)/i.test(analysis)

    // Extract JSON block from analysis
    const jsonMatch = analysis.match(/```json\s*([\s\S]*?)\s*```/)

    if (!jsonMatch) {
      return {
        textContent: analysis,
        financialData: null,
        isMultiStage
      }
    }

    try {
      const jsonStr = jsonMatch[1]
      const data = JSON.parse(jsonStr) as FinancialData

      // Remove JSON block from text content
      const textContent = analysis.replace(/```json\s*[\s\S]*?\s*```/, '').trim()

      return {
        textContent,
        financialData: data,
        isMultiStage
      }
    } catch (error) {
      console.error('Failed to parse financial data JSON:', error)
      return {
        textContent: analysis,
        financialData: null,
        isMultiStage
      }
    }
  }, [analysis])

  const hasCharts = financialData && (
    financialData.cashflow_projection?.length > 0 ||
    financialData.roi_timeline?.length > 0 ||
    financialData.valeur_scenarios ||
    financialData.risques?.length > 0
  )

  return (
    <div className="analysis-result">
      <div className="analysis-header">
        <h2 className="analysis-title">
          {isMultiStage ? '🏆 Analyse Institutionnelle Multi-Étapes' : '📊 Analyse Financière Détaillée'}
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

      {/* Financial Summary Cards */}
      {financialData?.summary && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
          marginTop: '1.5rem'
        }}>
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--gray-800)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem'
          }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
              Margin of Safety
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: financialData.summary.margin_of_safety_pct >= 30 ? 'var(--success)' : 'var(--error)'
            }}>
              {financialData.summary.margin_of_safety_pct.toFixed(1)}%
            </div>
          </div>

          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--gray-800)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem'
          }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
              ROI Annuel
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--gold)' }}>
              {financialData.summary.roi_annuel_pct.toFixed(1)}%
            </div>
          </div>

          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--gray-800)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem'
          }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
              Cap Rate
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--info)' }}>
              {financialData.summary.cap_rate_pct.toFixed(1)}%
            </div>
          </div>

          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--gray-800)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem'
          }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
              Décision
            </div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: financialData.summary.decision === 'ACHETER' ? 'var(--success)' :
                     financialData.summary.decision === 'NÉGOCIER' ? 'var(--warning)' : 'var(--error)'
            }}>
              {financialData.summary.decision}
            </div>
          </div>
        </div>
      )}

      {/* Use Enhanced Display for Multi-Stage Analysis, Regular for Quick */}
      {isMultiStage ? (
        <EnhancedAnalysisDisplay
          analysis={textContent}
          processingTime={processingTime}
        />
      ) : (
        <div className="analysis-content" style={{ marginBottom: '2rem' }}>
          {textContent}
        </div>
      )}

      {/* Interactive Charts */}
      {hasCharts && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'var(--gold)',
            marginBottom: '1.5rem',
            paddingBottom: '0.75rem',
            borderBottom: '2px solid var(--gray-800)'
          }}>
            📊 Visualisations Financières Interactives
          </h3>

          {/* Value Comparison */}
          {financialData.valeur_scenarios && financialData.summary && (
            <ValueComparisonChart
              scenarios={financialData.valeur_scenarios}
              prixDemande={financialData.summary.prix_demande}
            />
          )}

          {/* Cash Flow Projection */}
          {financialData.cashflow_projection && financialData.cashflow_projection.length > 0 && (
            <CashFlowChart data={financialData.cashflow_projection} />
          )}

          {/* ROI Timeline */}
          {financialData.roi_timeline && financialData.roi_timeline.length > 0 && (
            <ROITimelineChart data={financialData.roi_timeline} />
          )}

          {/* Risk Breakdown */}
          {financialData.risques && financialData.risques.length > 0 && (
            <RiskBreakdownChart risks={financialData.risques} />
          )}
        </div>
      )}

      {/* Professional Footer */}
      <div style={{
        marginTop: '2rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--gray-800)',
        fontSize: '0.875rem',
        color: 'var(--text-tertiary)',
        textAlign: 'center'
      }}>
        Analyse générée par Claude AI avec méthodologie Warren Buffett Value Investing
        {isMultiStage && ' • Analyse institutionnelle 7 étapes'}
        {financialData && ' • Données structurées et visualisations professionnelles'}
      </div>
    </div>
  )
}
