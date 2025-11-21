import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface CashFlowData {
  annee: number
  revenus: number
  depenses: number
  cf_net: number
}

interface CashFlowChartProps {
  data: CashFlowData[]
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">📈 Projection de Cash-Flow (10-20 ans)</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis
            dataKey="annee"
            label={{ value: 'Année', position: 'insideBottom', offset: -5 }}
            stroke="var(--chart-text)"
          />
          <YAxis
            tickFormatter={formatCurrency}
            stroke="var(--chart-text)"
          />
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
          <Line
            type="monotone"
            dataKey="revenus"
            stroke="var(--chart-revenue)"
            strokeWidth={2}
            name="Revenus"
            dot={{ fill: 'var(--chart-revenue)', r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="depenses"
            stroke="var(--chart-expense)"
            strokeWidth={2}
            name="Dépenses"
            dot={{ fill: 'var(--chart-expense)', r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="cf_net"
            stroke="var(--chart-net)"
            strokeWidth={3}
            name="Cash-Flow Net"
            dot={{ fill: 'var(--chart-net)', r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
