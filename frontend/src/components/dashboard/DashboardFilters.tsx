import { cn } from '@/lib/utils';

const PERIODOS = [
  { value: 'COMPLETO', label: 'Completo (Todo el tiempo)' },
  { value: 'HOY', label: 'Hoy' },
  { value: 'ESTA_SEMANA', label: 'Esta Semana' },
  { value: 'ESTE_MES', label: 'Este Mes' },
  { value: 'ESTE_AÑO', label: 'Este Año' },
  { value: 'POR_FECHA', label: 'Rango Personalizado' },
] as const;

interface DashboardFiltersProps {
  establecimiento?: string;
  periodo?: string;
  fechaDel?: string;
  fechaHasta?: string;
  onFiltrosChange?: (filtros: { establecimiento: string; periodo: string; fechaDel: string; fechaHasta?: string }) => void;
  className?: string;
}

export function DashboardFilters({
  establecimiento = '1',
  periodo = 'COMPLETO',
  fechaDel = '',
  fechaHasta = '',
  onFiltrosChange,
  className,
}: DashboardFiltersProps) {
  const establecimientoNombre = establecimiento === '1' ? 'OFICINA PRINCIPAL' : `Establecimiento ${establecimiento}`;
  const mostrarInputsFecha = periodo === 'POR_FECHA';
  
  const handleEstablecimientoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltrosChange?.({ establecimiento: e.target.value, periodo, fechaDel, fechaHasta });
  };

  const calcularFechasAutomaticas = (nuevoPeriodo: string) => {
    const hoy = new Date();
    const formatoFecha = (date: Date) => date.toISOString().split('T')[0];
    
    switch (nuevoPeriodo) {
      case 'HOY':
        return { fechaDel: formatoFecha(hoy), fechaHasta: undefined };
      case 'ESTA_SEMANA': {
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        return { fechaDel: formatoFecha(inicioSemana), fechaHasta: undefined };
      }
      case 'ESTE_MES': {
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        return { fechaDel: formatoFecha(inicioMes), fechaHasta: undefined };
      }
      case 'ESTE_AÑO': {
        const inicioAño = new Date(hoy.getFullYear(), 0, 1);
        return { fechaDel: formatoFecha(inicioAño), fechaHasta: undefined };
      }
      case 'COMPLETO':
        return { fechaDel: '2000-01-01', fechaHasta: undefined };
      case 'POR_FECHA': {
        const nuevaFechaHasta = !fechaHasta && fechaDel
          ? new Date(new Date(fechaDel).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : fechaHasta;
        return { fechaDel, fechaHasta: nuevaFechaHasta };
      }
      default:
        return { fechaDel, fechaHasta };
    }
  };

  const handlePeriodoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoPeriodo = e.target.value;
    const { fechaDel: nuevaFechaDel, fechaHasta: nuevaFechaHasta } = calcularFechasAutomaticas(nuevoPeriodo);
    onFiltrosChange?.({
      establecimiento,
      periodo: nuevoPeriodo,
      fechaDel: nuevaFechaDel,
      fechaHasta: nuevaFechaHasta
    });
  };

  const handleFechaDelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltrosChange?.({ establecimiento, periodo, fechaDel: e.target.value, fechaHasta });
  };

  const handleFechaHastaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltrosChange?.({ establecimiento, periodo, fechaDel, fechaHasta: e.target.value });
  };

  // Calcular texto descriptivo para mostrar cuando no hay inputs
  const obtenerTextoFecha = () => {
    const hoy = new Date();
    switch (periodo) {
      case 'HOY':
        return hoy.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      case 'ESTA_SEMANA':
        return `Semana del ${hoy.getDate() - hoy.getDay()} al ${hoy.getDate() + (6 - hoy.getDay())}`;
      case 'ESTE_MES':
        return hoy.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
      case 'ESTE_AÑO':
        return hoy.getFullYear().toString();
      case 'COMPLETO':
        return 'Todo el historial';
      default:
        return '';
    }
  };
  return (
    <div className={cn('bg-primary rounded-[10px] p-4', className)}>
      <div className="flex items-center justify-between">
        {/* Left: Title + Filters */}
        <div className="flex items-center gap-8">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <h1 className="text-primary-foreground text-xl font-bold leading-7">
              Dashboard General
            </h1>
            <p className="text-primary-foreground/80 text-xs">
              Resumen de operaciones y rendimiento
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            {/* Establecimiento */}
            <div className="flex flex-col gap-1">
              <label className="text-primary-foreground text-xs uppercase">
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
              <label className="text-primary-foreground text-xs uppercase">
                PERIODO
              </label>
              <select
                value={periodo}
                onChange={handlePeriodoChange}
                className="bg-white rounded px-3 py-1.5 text-xs text-black w-56 h-7"
              >
                {PERIODOS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Mostrar inputs de fecha solo para POR_FECHA */}
            {mostrarInputsFecha ? (
              <>
                {/* Fecha Del */}
                <div className="flex flex-col gap-1">
                  <label className="text-primary-foreground text-xs uppercase">
                    FECHA DESDE
                  </label>
                  <input
                    type="date"
                    value={fechaDel}
                    onChange={handleFechaDelChange}
                    className="bg-white rounded px-3 py-1.5 text-xs text-black w-32 h-7"
                  />
                </div>

                {/* Fecha Hasta */}
                <div className="flex flex-col gap-1">
                  <label className="text-primary-foreground text-xs uppercase">
                    FECHA HASTA
                  </label>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={handleFechaHastaChange}
                    className="bg-white rounded px-3 py-1.5 text-xs text-black w-32 h-7"
                  />
                </div>
              </>
            ) : (
              /* Mostrar texto descriptivo para periodos predefinidos */
              <div className="flex flex-col gap-1">
                <label className="text-primary-foreground text-xs uppercase">
                  PERÍODO ACTUAL
                </label>
                <div className="bg-white/90 rounded px-3 py-1.5 text-xs text-black w-48 h-7 flex items-center font-medium">
                  {obtenerTextoFecha()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Help Icon */}
        <div className="opacity-40">
          <span className="text-primary-foreground text-2xl">?</span>
        </div>
      </div>
    </div>
  );
}
