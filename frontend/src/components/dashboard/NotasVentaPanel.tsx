import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  chartData = [20, 30, 50, 70, 40],
  className 
}: NotasVentaPanelProps) {
  const [consultarGrafos, setConsultarGrafos] = useState(false);
  const [filtrarProducto, setFiltrarProducto] = useState(false);

  // Normalizar datos para el gráfico (máximo 100%)
  const maxValue = Math.max(...chartData);
  const normalizedData = chartData.map(val => (val / maxValue) * 100);

  return (
    <Card className={`overflow-hidden shadow-md ${className}`}>
      <CardHeader className="bg-[#0c5078] text-white px-4 py-3">
        <CardTitle className="text-sm font-semibold">Notas de Venta</CardTitle>
      </CardHeader>
      <CardContent className="bg-[#b8b8b8] p-4 min-h-[280px]">
        {/* Métricas */}
        <div className="flex justify-around mb-4">
          <div className="text-center">
            <div className="text-xs text-gray-700 mb-1">Ingresos</div>
            <div className="text-blue-400 text-lg font-semibold">{ingresos}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-700 mb-1">Egresos</div>
            <div className="text-red-400 text-lg font-semibold">{egresos.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-700 mb-1">M Flujo</div>
            <div className="text-green-400 text-lg font-semibold">{flujo.toFixed(2)}</div>
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
            <label htmlFor="consultar" className="text-xs text-gray-700 cursor-pointer">
              Consultar gráfos:
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 accent-[#0c5078]"
              id="filtrar"
              checked={filtrarProducto}
              onChange={(e) => setFiltrarProducto(e.target.checked)}
            />
            <label htmlFor="filtrar" className="text-xs text-gray-700 cursor-pointer">
              Filtrar por producto
            </label>
          </div>
        </div>

        {/* Gráfico de barras vertical */}
        <div className="h-32 flex items-end justify-center gap-1 bg-[#a8a8a8] rounded p-2">
          {normalizedData.map((height, index) => (
            <div
              key={index}
              className="w-6 bg-white rounded-t transition-all duration-300 hover:bg-[#0c5078]"
              style={{ height: `${height}%` }}
              title={`${chartData[index]}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
