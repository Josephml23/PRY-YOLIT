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
export function MonthlyComparisonChart({ data, className }: MonthlyComparisonChartProps) {
  return (
    <div className={`bg-[#8b9aa3] rounded-lg shadow-md p-4 ${className}`}>
      {/* Leyenda */}
      <div className="bg-white rounded p-2 mb-2">
        <div className="flex gap-4 text-xs flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-700">FACTURAS</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-400 rounded"></div>
            <span className="text-gray-700">BOLETAS</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-700">NOTAS DE VENTA</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-400 rounded"></div>
            <span className="text-gray-700">COMPRAS</span>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-[400px] w-full bg-[#8b9aa3]">
        <ChartContainer
          config={{
            facturas: { label: 'Facturas', color: '#ef4444' },
            boletas: { label: 'Boletas', color: '#fb923c' },
            notasVenta: { label: 'Notas de Venta', color: '#22c55e' },
            compras: { label: 'Compras', color: '#60a5fa' },
          }}
          className="h-full w-full"
        >
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#666" />
              <XAxis
                dataKey="month"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fill: '#333', fontSize: 10 }}
                interval={0}
              />
              <YAxis 
                tick={{ fill: '#333', fontSize: 10 }}
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
