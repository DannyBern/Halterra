import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'

interface ValueComparisonProps {
  scenarios: {
    pessimiste: number
    realiste: number
    optimiste: number
  }
  prixDemande: number
}

export function ValueComparisonChart({ scenarios, prixDemande }: ValueComparisonProps) {
  const data = [
    { name: 'Prix Demandé', value: prixDemande, type: 'prix' },
    { name: 'Pessimiste', value: scenarios.pessimiste, type: 'scenario' },
    { name: 'Réaliste', value: scenarios.realiste, type: 'scenario' },
    { name: 'Optimiste', value: scenarios.optimiste, type: 'scenario' },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getBarColor = (type: string, value: number) => {
    if (type === 'prix') return 'var(--chart-price)'
    if (value < prixDemande) return 'var(--chart-danger)'
    if (value < prixDemande * 1.3) return 'var(--chart-warning)'
    return 'var(--chart-success)'
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">💰 Valeur Intrinsèque vs Prix Demandé</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="name" stroke="var(--chart-text)" />
          <YAxis tickFormatter={formatCurrency} stroke="var(--chart-text)" />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: 'var(--chart-tooltip-bg)',
              border: '1px solid var(--chart-tooltip-border)',
              borderRadius: '8px',
              color: 'var(--chart-text)'
            }}
          />
          <Legend />
          <ReferenceLine
            y={prixDemande * 1.3}
            stroke="var(--chart-safety)"
            strokeDasharray="5 5"
            label={{
              value: 'Margin of Safety 30%',
              position: 'right',
              fill: 'var(--chart-text)',
              fontSize: 12
            }}
          />
          <Bar dataKey="value" name="Valeur" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.type, entry.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
