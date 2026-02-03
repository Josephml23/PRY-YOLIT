import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NotasVentaPanelProps {
  ingresos: number;
  egresos: number;
  flujo: number;
  className?: string;
}

/**
 * NotasVentaPanel Component
 * Panel de Utilidades/Ganancias con métricas (diseño Nubofact)
 */
export function NotasVentaPanel({ 
  ingresos, 
  egresos, 
  flujo, 
  className 
}: NotasVentaPanelProps) {
  const [consultarGrafos, setConsultarGrafos] = useState(false);
  const [filtrarProducto, setFiltrarProducto] = useState(false);

  return (
    <Card className={`overflow-hidden shadow-md p-0 ${className}`}>
      <CardHeader className="bg-primary text-primary-foreground px-4 py-2 space-y-0">
        <CardTitle className="text-sm font-semibold">Utilidades/Ganancias</CardTitle>
      </CardHeader>
      <CardContent className="bg-muted px-4 py-3">
        {/* Métricas */}
        <div className="flex justify-around mb-4">
          <div className="text-center">
            <div className="text-xxs text-muted-foreground mb-1">Ingresos</div>
            <div className="text-foreground text-lg font-semibold">{ingresos}</div>
          </div>
          <div className="text-center">
            <div className="text-xxs text-muted-foreground mb-1">Egresos</div>
            <div className="text-foreground text-lg font-semibold">{egresos.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-xxs text-muted-foreground mb-1">Utilidad</div>
            <div className="text-foreground text-lg font-semibold">{flujo.toFixed(2)}</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 accent-[#0c5078]"
              id="consultar"
              checked={consultarGrafos}
              onChange={(e) => setConsultarGrafos(e.target.checked)}
            />
            <label htmlFor="consultar" className="text-xs text-foreground cursor-pointer">
              Consultar gastos
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
      </CardContent>
    </Card>
  );
}
