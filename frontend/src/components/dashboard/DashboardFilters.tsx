import { cn } from '@/lib/utils';

const PERIODOS = [
  { value: 'POR_FECHA', label: 'Por Fecha' },
  { value: 'HOY', label: 'Hoy' },
  { value: 'ESTA_SEMANA', label: 'Esta Semana' },
  { value: 'ESTE_MES', label: 'Este Mes' },
  { value: 'ESTE_AÑO', label: 'Este Año' },
] as const;

interface DashboardFiltersProps {
  establecimiento?: string;
  periodo?: string;
  fechaDel?: string;
  onFiltrosChange?: (filtros: { establecimiento: string; periodo: string; fechaDel: string }) => void;
  className?: string;
}

export function DashboardFilters({
  establecimiento = '1',
  periodo = 'ESTE_AÑO',
  fechaDel = '',
  onFiltrosChange,
  className,
}: DashboardFiltersProps) {
  const establecimientoNombre = establecimiento === '1' ? 'OFICINA PRINCIPAL' : `Establecimiento ${establecimiento}`;
  
  const handleEstablecimientoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltrosChange?.({ establecimiento: e.target.value, periodo, fechaDel });
  };

  const handlePeriodoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltrosChange?.({ establecimiento, periodo: e.target.value, fechaDel });
  };

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltrosChange?.({ establecimiento, periodo, fechaDel: e.target.value });
  };
  return (
    <div className={cn('bg-[hsl(var(--nubofact-primary))] rounded-[10px] p-4', className)}>
      <div className="flex items-center justify-between">
        {/* Left: Title + Filters */}
        <div className="flex items-center gap-8">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <h1 className="text-white text-xl font-bold leading-7">
              Dashboard General
            </h1>
            <p className="text-white/80 text-xs">
              Resumen de operaciones y rendimiento
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            {/* Establecimiento */}
            <div className="flex flex-col gap-1">
              <label className="text-white text-xs uppercase">
                ESTABLECIMIENTO
              </label>
              <input
                type="text"
                value={establecimientoNombre}
                onChange={handleEstablecimientoChange}
                placeholder="OFICINA PRINCIPAL"
                className="bg-white rounded px-3 py-1.5 text-xs text-black w-48 h-7"
                readOnly
              />
            </div>

            {/* Periodo */}
            <div className="flex flex-col gap-1">
              <label className="text-white text-xs uppercase">
                PERIODO
              </label>
              <select
                value={periodo}
                onChange={handlePeriodoChange}
                className="bg-white rounded px-3 py-1.5 text-xs text-black w-32 h-7"
              >
                {PERIODOS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Fecha Del */}
            <div className="flex flex-col gap-1">
              <label className="text-white text-xs uppercase">
                FECHA DEL
              </label>
              <input
                type="date"
                value={fechaDel}
                onChange={handleFechaChange}
                className="bg-white rounded px-3 py-1.5 text-xs text-black w-32 h-7"
              />
            </div>
          </div>
        </div>

        {/* Right: Help Icon */}
        <div className="opacity-40">
          <span className="text-white text-2xl">?</span>
        </div>
      </div>
    </div>
  );
}
