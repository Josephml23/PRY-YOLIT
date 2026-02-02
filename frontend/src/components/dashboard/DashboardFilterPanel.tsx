import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { type DashboardFilterPanelProps } from '@/types';

const PERIODOS = [
  { value: 'POR_FECHA', label: 'Por Fecha' },
  { value: 'HOY', label: 'Hoy' },
  { value: 'ESTA_SEMANA', label: 'Esta Semana' },
  { value: 'ESTE_MES', label: 'Este Mes' },
  { value: 'ESTE_AÑO', label: 'Este Año' },
] as const;

export function DashboardFilterPanel({
  establecimiento,
  periodo,
  fechaDel,
  onFiltrosChange,
}: DashboardFilterPanelProps) {
  const handleEstablecimientoChange = (value: string) => {
    onFiltrosChange({ establecimiento: value, periodo, fechaDel });
  };

  const handlePeriodoChange = (value: DashboardFilterPanelProps['periodo']) => {
    onFiltrosChange({ establecimiento, periodo: value, fechaDel });
  };

  const handleFechaChange = (value: string) => {
    onFiltrosChange({ establecimiento, periodo, fechaDel: value });
  };

  return (
    <Card className="border-none bg-[hsl(var(--dashboard-navy))] text-white shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="shrink-0">
            <h2 className="text-2xl font-bold text-white">Dashboard General</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Establecimiento */}
            <div className="flex-1">
              <Label htmlFor="establecimiento" className="text-white/80 text-xs mb-1.5">
                Establecimiento
              </Label>
              <select
                id="establecimiento"
                className="w-full h-9 rounded-md border border-white/20 bg-white/10 text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                value={establecimiento}
                onChange={(e) => handleEstablecimientoChange(e.target.value)}
              >
                <option value="1" className="bg-[hsl(var(--dashboard-navy))] text-white">
                  OFICINA PRINCIPAL
                </option>
              </select>
            </div>

            {/* Período */}
            <div className="flex-1">
              <Label htmlFor="periodo" className="text-white/80 text-xs mb-1.5">
                Período
              </Label>
              <select
                id="periodo"
                className="w-full h-9 rounded-md border border-white/20 bg-white/10 text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                value={periodo}
                onChange={(e) => handlePeriodoChange(e.target.value as DashboardFilterPanelProps['periodo'])}
              >
                {PERIODOS.map((p) => (
                  <option key={p.value} value={p.value} className="bg-[hsl(var(--dashboard-navy))] text-white">
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha del (solo si período = POR_FECHA) */}
            {periodo === 'POR_FECHA' && (
              <div className="flex-1">
                <Label htmlFor="fecha-del" className="text-white/80 text-xs mb-1.5">
                  Fecha del
                </Label>
                <Input
                  id="fecha-del"
                  type="date"
                  className="h-9 border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/30"
                  value={fechaDel}
                  onChange={(e) => handleFechaChange(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
