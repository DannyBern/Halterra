import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ROIData {
  annee: number
  valeur_portfolio: number
  cf_cumule: number
  roi_pct: number
}

interface ROITimelineChartProps {
  data: ROIData[]
}

export function ROITimelineChart({ data }: ROITimelineChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">📊 Évolution du ROI dans le temps</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis
            dataKey="annee"
            label={{ value: 'Année', position: 'insideBottom', offset: -5 }}
            stroke="var(--chart-text)"
          />
          <YAxis
            yAxisId="left"
            tickFormatter={formatCurrency}
            stroke="var(--chart-text)"
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={formatPercent}
            stroke="var(--chart-roi)"
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'ROI (%)') return formatPercent(value)
              return formatCurrency(value)
            }}
            contentStyle={{
              backgroundColor: 'var(--chart-tooltip-bg)',
              border: '1px solid var(--chart-tooltip-border)',
              borderRadius: '8px',
              color: 'var(--chart-text)'
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="valeur_portfolio"
            stroke="var(--chart-value)"
            strokeWidth={2}
            name="Valeur Portfolio"
            dot={{ fill: 'var(--chart-value)', r: 4 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="cf_cumule"
            stroke="var(--chart-cumulative)"
            strokeWidth={2}
            name="Cash-Flow Cumulé"
            dot={{ fill: 'var(--chart-cumulative)', r: 4 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="roi_pct"
            stroke="var(--chart-roi)"
            strokeWidth={3}
            name="ROI (%)"
            dot={{ fill: 'var(--chart-roi)', r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
