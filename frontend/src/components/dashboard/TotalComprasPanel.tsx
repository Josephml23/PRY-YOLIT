import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { formatCurrency } from '@/lib/format';

interface MonthlyData {
  month: string;
  value: number;
}

interface TotalComprasPanelProps {
  totalCompras: number;
  saldo: number;
  monthlyData: MonthlyData[];
  className?: string;
}

/**
 * TotalComprasPanel Component
 * Panel de Total Compras con gráfico mensual de barras (diseño Nubofact)
 */
export function TotalComprasPanel({ 
  totalCompras, 
  saldo, 
  monthlyData,
  className 
}: TotalComprasPanelProps) {
  return (
    <Card className={`overflow-hidden shadow-md ${className}`}>
      <CardHeader className="bg-[#0c5078] text-white px-4 py-3">
        <CardTitle className="text-sm font-semibold">Total Compras</CardTitle>
      </CardHeader>
      <CardContent className="bg-[#b8b8b8] p-4 min-h-70">
        {/* Resumen boxes */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-xs text-gray-600 mb-1">Total Compras</div>
            <div className="text-cyan-500 text-lg font-semibold">
              {formatCurrency(totalCompras)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-xs text-gray-600 mb-1">Saldo</div>
            <div className="text-lg font-semibold">
              {formatCurrency(saldo)}
            </div>
          </div>
        </div>

        {/* Gráfico mensual */}
        <div className="h-40 w-full">
          <ChartContainer
            config={{
              value: { label: 'Compras', color: '#3b9dd6' },
            }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#999" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#333', fontSize: 10 }}
                  axisLine={{ stroke: '#666' }}
                />
                <YAxis
                  tick={{ fill: '#333', fontSize: 10 }}
                  axisLine={{ stroke: '#666' }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  }
                />
                <Bar dataKey="value" fill="#3b9dd6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
