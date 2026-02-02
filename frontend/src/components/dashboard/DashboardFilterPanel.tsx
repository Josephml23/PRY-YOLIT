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
    <Card className="border bg-[hsl(var(--dashboard-dark))] text-[hsl(var(--dashboard-dark-foreground))] shadow-lg dark:border-none">
      <CardContent className="p-4 sm:p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="shrink-0">
            <h2 className="text-xl sm:text-2xl font-bold">Dashboard General</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
            {/* Establecimiento */}
            <div className="flex-1 min-w-[180px]">
              <Label htmlFor="establecimiento" className="text-xs font-medium mb-1.5 opacity-80">
                Establecimiento
              </Label>
              <select
                id="establecimiento"
                className="w-full h-9 rounded-md border bg-background/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring dark:border-white/20 dark:bg-white/10"
                value={establecimiento}
                onChange={(e) => handleEstablecimientoChange(e.target.value)}
              >
                <option value="1" className="bg-background dark:bg-[hsl(var(--dashboard-dark))]">
                  OFICINA PRINCIPAL
                </option>
              </select>
            </div>

            {/* Período */}
            <div className="flex-1 min-w-[180px]">
              <Label htmlFor="periodo" className="text-xs font-medium mb-1.5 opacity-80">
                Período
              </Label>
              <select
                id="periodo"
                className="w-full h-9 rounded-md border bg-background/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring dark:border-white/20 dark:bg-white/10"
                value={periodo}
                onChange={(e) => handlePeriodoChange(e.target.value as DashboardFilterPanelProps['periodo'])}
              >
                {PERIODOS.map((p) => (
                  <option key={p.value} value={p.value} className="bg-background dark:bg-[hsl(var(--dashboard-dark))]">
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha del (solo si período = POR_FECHA) */}
            {periodo === 'POR_FECHA' && (
              <div className="flex-1 min-w-[180px]">
                <Label htmlFor="fecha-del" className="text-xs font-medium mb-1.5 opacity-80">
                  Fecha del
                </Label>
                <Input
                  id="fecha-del"
                  type="date"
                  className="h-9 bg-background/50 dark:border-white/20 dark:bg-white/10 focus:ring-2 focus:ring-ring"
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
