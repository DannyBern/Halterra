import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface RiskData {
  nom: string
  impact_financier: number
  probabilite_pct: number
}

interface RiskBreakdownChartProps {
  risks: RiskData[]
}

export function RiskBreakdownChart({ risks }: RiskBreakdownChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getRiskColor = (probabilite: number) => {
    if (probabilite >= 50) return 'var(--chart-danger)'
    if (probabilite >= 25) return 'var(--chart-warning)'
    return 'var(--chart-caution)'
  }

  const data = risks.map(risk => ({
    ...risk,
    esperance_perte: risk.impact_financier * (risk.probabilite_pct / 100)
  }))

  return (
    <div className="chart-container">
      <h3 className="chart-title">⚠️ Analyse des Risques Majeurs</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          layout="horizontal"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis
            dataKey="nom"
            stroke="var(--chart-text)"
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
          />
          <YAxis
            tickFormatter={formatCurrency}
            stroke="var(--chart-text)"
            label={{ value: 'Espérance de perte', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'Espérance de perte') return formatCurrency(value)
              if (name === 'Impact financier') return formatCurrency(value)
              if (name === 'Probabilité (%)') return `${value}%`
              return value
            }}
            contentStyle={{
              backgroundColor: 'var(--chart-tooltip-bg)',
              border: '1px solid var(--chart-tooltip-border)',
              borderRadius: '8px',
              color: 'var(--chart-text)'
            }}
            labelStyle={{ color: 'var(--chart-text)', fontWeight: 'bold' }}
          />
          <Legend />
          <Bar
            dataKey="esperance_perte"
            name="Espérance de perte"
            radius={[8, 8, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getRiskColor(entry.probabilite_pct)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--gray-400)' }}>
        <p>
          <strong>Espérance de perte</strong> = Impact financier × Probabilité
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          🔴 Rouge: Probabilité élevée (≥50%) | 🟡 Jaune: Probabilité moyenne (25-50%) | 🟠 Orange: Probabilité faible (&lt;25%)
        </p>
      </div>
    </div>
  )
}
