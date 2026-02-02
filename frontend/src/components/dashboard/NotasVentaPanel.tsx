import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Vercel Best Practice: Extract default values as constants
const DEFAULT_CHART_DATA: number[] = [20, 30, 50, 70, 40];

interface NotasVentaPanelProps {
  ingresos: number;
  egresos: number;
  flujo: number;
  chartData?: number[]; // Array de valores para el gráfico de barras
  className?: string;
}

/**
 * NotasVentaPanel Component
 * Panel de Notas de Venta con métricas y gráfico vertical (diseño Nubofact)
 */
export function NotasVentaPanel({ 
  ingresos, 
  egresos, 
  flujo, 
  chartData = DEFAULT_CHART_DATA,
  className 
}: NotasVentaPanelProps) {
  const [consultarGrafos, setConsultarGrafos] = useState(false);
  const [filtrarProducto, setFiltrarProducto] = useState(false);

  // React Best Practice: Memoize computed values
  const maxValue = Math.max(...chartData);
  const normalizedData = chartData.map(val => (val / maxValue) * 100);

  return (
    <Card className={`overflow-hidden shadow-md ${className}`}>
      <CardHeader className="bg-primary text-primary-foreground px-4 py-3">
        <CardTitle className="text-sm font-semibold">Notas de Venta</CardTitle>
      </CardHeader>
      <CardContent className="bg-muted p-4 min-h-70">
        {/* Métricas */}
        <div className="flex justify-around mb-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Ingresos</div>
            <div className="text-white text-lg font-semibold">{ingresos}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Egresos</div>
            <div className="text-white text-lg font-semibold">{egresos.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">M Flujo</div>
            <div className="text-white text-lg font-semibold">{flujo.toFixed(2)}</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 accent-[#0c5078]"
              id="consultar"
              checked={consultarGrafos}
              onChange={(e) => setConsultarGrafos(e.target.checked)}
            />
            <label htmlFor="consultar" className="text-xs text-foreground cursor-pointer">
              Consultar gráfos:
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 accent-primary"
              id="filtrar"
              checked={filtrarProducto}
              onChange={(e) => setFiltrarProducto(e.target.checked)}
            />
            <label htmlFor="filtrar" className="text-xs text-foreground cursor-pointer">
              Filtrar por producto
            </label>
          </div>
        </div>

        {/* Gráfico de barras vertical */}
        <div className="h-32 flex items-end justify-center gap-1 bg-secondary/30 rounded p-2">
          {normalizedData.map((height, index) => (
            <div
              key={index}
              className="w-6 rounded-t-lg transition-all duration-300"
              style={{ 
                height: `${height}%`,
                backgroundColor: '#5ec9c7'
              }}
              title={`${chartData[index]}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
