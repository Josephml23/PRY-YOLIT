import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { formatCurrency } from '@/lib/format';

interface MonthlyComparisonData {
  month: string;
  facturas: number;
  boletas: number;
  notasVenta: number;
  compras: number;
}

interface MonthlyComparisonChartProps {
  data: MonthlyComparisonData[];
  className?: string;
}

/**
 * MonthlyComparisonChart Component
 * Gráfico de barras agrupadas comparando Facturas, Boletas, Notas de Venta y Compras por mes
 * (diseño Nubofact)
 */
// Vercel Best Practice: Extract color config outside component
const CHART_CONFIG = {
  facturas: { label: 'Facturas', color: '#ef4444' },
  boletas: { label: 'Boletas', color: '#fb923c' },
  notasVenta: { label: 'Notas de Venta', color: '#22c55e' },
  compras: { label: 'Compras', color: '#60a5fa' },
} as const;

const LEGEND_ITEMS = [
  { label: 'FACTURAS', color: 'bg-red-500' },
  { label: 'BOLETAS', color: 'bg-orange-400' },
  { label: 'NOTAS DE VENTA', color: 'bg-green-500' },
  { label: 'COMPRAS', color: 'bg-blue-400' },
] as const;

export function MonthlyComparisonChart({ data, className }: MonthlyComparisonChartProps) {
  return (
    <div className={`bg-muted rounded-lg shadow-md p-4 min-h-70 ${className}`}>
      {/* Leyenda */}
      <div className="bg-card border border-border rounded p-2 mb-2">
        <div className="flex gap-4 text-xs flex-wrap">
          {LEGEND_ITEMS.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1">
              <div className={`w-3 h-3 ${color} rounded`}></div>
              <span className="text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-[400px] w-full">
        <ChartContainer
          config={CHART_CONFIG}
          className="h-full w-full"
        >
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                interval={0}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                tickFormatter={(value) => `S/ ${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                }
              />
              <Bar dataKey="facturas" fill="#ef4444" />
              <Bar dataKey="boletas" fill="#fb923c" />
              <Bar dataKey="notasVenta" fill="#22c55e" />
              <Bar dataKey="compras" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
