import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CreditCard, BarChart3, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { dashboardApi } from '@/services/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { DashboardFilterPanel } from '@/components/dashboard/DashboardFilterPanel';
import { DesgloseSummaryPanel } from '@/components/dashboard/DesgloseSummaryPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { DashboardFiltros, DashboardStats } from '@/types';
import { formatCurrency, formatCurrencyKpi } from '@/lib/format';

// Vercel Best Practice: Extract constants outside component to prevent recreation on each render
const CHART_COLORS = {
  pagado: '#10b981', // green
  porPagar: '#ef4444', // red
  primary: '#3b82f6', // blue
  secondary: '#8b5cf6', // purple
} as const;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<DashboardFiltros>({
    establecimiento: '1',
    periodo: 'ESTE_AÑO',
    fechaDel: '2025-01-01', // Año con datos reales
  });
  
  const [stats, setStats] = useState<DashboardStats>({
    cpeEmitidos: 0,
    totalCPE: 0,
    cpePagado: 0,
    cpePorPagar: 0,
    cpeTotal: 0,
    totalNotasVenta: 0,
    notasVentaPagado: 0,
    notasVentaPorPagar: 0,
    notasVentaTotal: 0,
    montoTotalGeneral: 0,
    utilidadNeta: 0,
    ventasPorHora: [],
  });

  useEffect(() => {
    const cargarStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getStats(filtros);
        setStats(data);
      } catch (error) {
        console.error('Error al cargar stats del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarStats();
  }, [filtros]);

  // React Best Practice: Memoize callbacks to prevent child re-renders
  const handleFiltrosChange = useCallback((nuevosFiltros: DashboardFiltros) => {
    setFiltros(nuevosFiltros);
  }, []);

  // React Best Practice: Memoize computed values to avoid recalculation on every render
  const dataCPEPie = useMemo(() => [
    { name: 'Pagado', value: stats.cpePagado, color: CHART_COLORS.pagado },
    { name: 'Por Pagar', value: stats.cpePorPagar, color: CHART_COLORS.porPagar },
  ].filter(item => item.value > 0), [stats.cpePagado, stats.cpePorPagar]);

  const dataNotasVentaPie = useMemo(() => [
    { name: 'Pagado', value: stats.notasVentaPagado, color: CHART_COLORS.pagado },
    { name: 'Por Pagar', value: stats.notasVentaPorPagar, color: CHART_COLORS.porPagar },
  ].filter(item => item.value > 0), [stats.notasVentaPagado, stats.notasVentaPorPagar]);

  const dataTotalesBar = useMemo(() => [
    { name: 'CPE', total: stats.totalCPE },
    { name: 'Notas Venta', total: stats.totalNotasVenta },
    { name: 'Total General', total: stats.montoTotalGeneral },
  ], [stats.totalCPE, stats.totalNotasVenta, stats.montoTotalGeneral]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      <PageHeader
        title="Dashboard"
        description="Resumen general de facturación electrónica"
        actions={
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              Actualizado: {new Date().toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <Link to="/app/dashboard-tv" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2">
                <span className="hidden sm:inline">Modo TV</span>
                <span className="sm:hidden">TV</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* 1. Barra de Filtros */}
      <DashboardFilterPanel
        establecimiento={filtros.establecimiento}
        periodo={filtros.periodo}
        fechaDel={filtros.fechaDel}
        onFiltrosChange={handleFiltrosChange}
      />

      {/* 2. KPIs (5 tarjetas estilo Nubofact) - Responsividad mejorada */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 sm:gap-4">
        <MetricCard
          variant="nubofact"
          icon={FileText}
          title="CPE Emitidos"
          value={stats.cpeEmitidos}
        />
        <MetricCard
          variant="nubofact"
          icon={CreditCard}
          title="Total CPE"
          value={formatCurrencyKpi(stats.totalCPE)}
        />
        <MetricCard
          variant="nubofact"
          icon={FileText}
          title="Total Notas Venta"
          value={formatCurrencyKpi(stats.totalNotasVenta)}
        />
        <MetricCard
          variant="nubofact"
          icon={BarChart3}
          title="Monto Total General"
          value={formatCurrencyKpi(stats.montoTotalGeneral)}
        />
        <MetricCard
          variant="nubofact"
          icon={Wallet}
          title="Utilidad Neta"
          value={formatCurrencyKpi(stats.utilidadNeta)}
        />
      </div>

      {/* 3. Paneles de Desglose (3 columnas) con gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* CPE con gráfico de pie */}
        <DesgloseSummaryPanel
          title="CPE"
          items={[
            { label: 'Total Pagado', value: formatCurrency(stats.cpePagado), highlight: true },
            { label: 'Total por Pagar', value: formatCurrency(stats.cpePorPagar), highlight: true },
            { label: 'Total', value: formatCurrency(stats.cpeTotal), highlight: true },
          ]}
        >
          {dataCPEPie.length > 0 && (
            <ChartContainer
              config={{
                pagado: { label: 'Pagado', color: CHART_COLORS.pagado },
                porPagar: { label: 'Por Pagar', color: CHART_COLORS.porPagar },
              }}
              className="h-45 w-full"
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  }
                />
                <Pie
                  data={dataCPEPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label={false}
                >
                  {dataCPEPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={24}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', color: '#fff' }}
                />
              </PieChart>
            </ChartContainer>
          )}
        </DesgloseSummaryPanel>

        {/* Notas de Venta (Boletas) con gráfico de pie */}
        <DesgloseSummaryPanel
          title="Notas de Venta"
          items={[
            { label: 'Total Pagado', value: formatCurrency(stats.notasVentaPagado), highlight: true },
            { label: 'Total por Pagar', value: formatCurrency(stats.notasVentaPorPagar), highlight: true },
            { label: 'Total', value: formatCurrency(stats.notasVentaTotal), highlight: true },
          ]}
        >
          {dataNotasVentaPie.length > 0 && (
            <ChartContainer
              config={{
                pagado: { label: 'Pagado', color: CHART_COLORS.pagado },
                porPagar: { label: 'Por Pagar', color: CHART_COLORS.porPagar },
              }}
              className="h-45 w-full"
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  }
                />
                <Pie
                  data={dataNotasVentaPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label={false}
                >
                  {dataNotasVentaPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={24}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', color: '#fff' }}
                />
              </PieChart>
            </ChartContainer>
          )}
        </DesgloseSummaryPanel>

        {/* Totales Generales con gráfico de barras */}
        <Card className="border bg-[hsl(var(--dashboard-dark))] text-[hsl(var(--dashboard-dark-foreground))] shadow-lg dark:border-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg font-semibold">Totales Generales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-xs opacity-70 mb-1">Total Nota Venta</p>
                <p className="text-sm sm:text-base font-bold text-red-600 dark:text-red-400 break-all tabular-nums">
                  {formatCurrency(stats.totalNotasVenta)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs opacity-70 mb-1">Total CPE</p>
                <p className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400 break-all tabular-nums">
                  {formatCurrency(stats.totalCPE)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs opacity-70 mb-1">Total General</p>
                <p className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400 break-all tabular-nums">
                  {formatCurrency(stats.montoTotalGeneral)}
                </p>
              </div>
            </div>
            {/* Gráfico de barras */}
            <ChartContainer
              config={{
                total: { label: 'Total (S/)', color: CHART_COLORS.primary },
              }}
              className="h-45 w-full"
            >
              <BarChart data={dataTotalesBar}>
                <XAxis
                  dataKey="name"
                  stroke="currentColor"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  className="opacity-70"
                />
                <YAxis
                  stroke="currentColor"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  className="opacity-70"
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  }
                  cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Bar
                  dataKey="total"
                  fill={CHART_COLORS.primary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
