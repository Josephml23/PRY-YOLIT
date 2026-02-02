import { cn } from '@/lib/utils';

interface DashboardFiltersProps {
  establecimiento?: string;
  periodo?: string;
  fechaDel?: string;
  onEstablecimientoChange?: (value: string) => void;
  onPeriodoChange?: (value: string) => void;
  onFechaDelChange?: (value: string) => void;
  className?: string;
}

export function DashboardFilters({
  establecimiento = 'OFICINA PRINCIPAL',
  periodo = 'POR FECHA',
  fechaDel = '',
  onEstablecimientoChange,
  onPeriodoChange,
  onFechaDelChange,
  className,
}: DashboardFiltersProps) {
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
                value={establecimiento}
                onChange={(e) => onEstablecimientoChange?.(e.target.value)}
                placeholder="OFICINA PRINCIPAL"
                className="bg-white rounded px-3 py-1.5 text-xs text-black/50 w-48 h-7"
              />
            </div>

            {/* Periodo */}
            <div className="flex flex-col gap-1">
              <label className="text-white text-xs uppercase">
                PERIODO
              </label>
              <input
                type="text"
                value={periodo}
                onChange={(e) => onPeriodoChange?.(e.target.value)}
                placeholder="POR FECHA"
                className="bg-white rounded px-3 py-1.5 text-xs text-black/50 w-32 h-7"
              />
            </div>

            {/* Fecha Del */}
            <div className="flex flex-col gap-1">
              <label className="text-white text-xs uppercase">
                FECHA DEL
              </label>
              <input
                type="text"
                value={fechaDel}
                onChange={(e) => onFechaDelChange?.(e.target.value)}
                placeholder="dd/mm/aaaa"
                className="bg-white rounded px-3 py-1.5 text-xs text-black/50 w-32 h-7"
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
