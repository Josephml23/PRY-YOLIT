import { useState, useEffect, useMemo, useCallback } from 'react';
import { FileText, CreditCard, BarChart3, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import { dashboardApi } from '@/services/api';
import { NubofactHeader } from '@/components/layout/NubofactHeader';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { DesgloseSummaryPanel } from '@/components/dashboard/DesgloseSummaryPanel';
import { CPERankingPanel } from '@/components/dashboard/CPERankingPanel';
import { NotasVentaPanel } from '@/components/dashboard/NotasVentaPanel';
import { TotalComprasPanel } from '@/components/dashboard/TotalComprasPanel';
import { ProductosTopTable } from '@/components/dashboard/ProductosTopTable';
import { ClientesTopTable } from '@/components/dashboard/ClientesTopTable';
import { StockMinimoTable } from '@/components/dashboard/StockMinimoTable';
import { MonthlyComparisonChart } from '@/components/dashboard/MonthlyComparisonChart';
import { MonthlyTable } from '@/components/dashboard/MonthlyTable';
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
  const handleFiltrosChange = useCallback((nuevosFiltros: { establecimiento: string; periodo: string; fechaDel: string }) => {
    setFiltros(nuevosFiltros as DashboardFiltros);
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

  // TODO: Reemplazar con datos reales del backend
  // Datos mock para componentes nuevos del diseño Figma
  const cpeRankingData = useMemo(() => [
    { name: 'Machala', value: 9, percentage: 90 },
    { name: 'Balanza', value: 9, percentage: 90 },
    { name: 'Pesca venta', value: '', percentage: 0 },
    { name: 'Pesca Grullas', value: 9, percentage: 90 },
    { name: 'Pesca Orillas', value: 9, percentage: 90 },
  ], []);

  const totalComprasData = useMemo(() => ({
    totalCompras: 7543374.65,
    saldo: 7543374.65,
    monthlyData: [
      { month: 'Ene', value: 4200 },
      { month: 'Feb', value: 3800 },
      { month: 'Mar', value: 5400 },
      { month: 'Abr', value: 5800 },
      { month: 'May', value: 6200 },
      { month: 'Jun', value: 7000 },
      { month: 'Jul', value: 6400 },
      { month: 'Ago', value: 6800 },
      { month: 'Sep', value: 5900 },
      { month: 'Oct', value: 7200 },
      { month: 'Nov', value: 7600 },
      { month: 'Dic', value: 6500 },
    ]
  }), []);

  const stockMinimoData = useMemo(() => [
    { id: 1, producto: 'POLIPROPLENO LIENSTER SHS-PL-DC', stock: '0.00', estado: 'AGOTADO' as const, almacen: 'Oficina Principal' },
    { id: 2, producto: 'EXTENSIN SELLA BESLIME SMPSIX-SAMIL', stock: '0.00', estado: 'AGOTADO' as const, almacen: 'Oficina Principal' },
    { id: 3, producto: 'AGUIA MOVILIZE EL II USIAMOS', stock: '0.00', estado: 'AGOTADO' as const, almacen: 'Oficina Principal' },
    { id: 4, producto: 'LIPISCAL SOLUCIÓN ANTIBISPARATER SODERACIN DIML', stock: '0.00', estado: 'AGOTADO' as const, almacen: 'Oficina Principal' },
    { id: 5, producto: 'GEL-JABONY TOPIALOSE II.', stock: '0.00', estado: 'AGOTADO' as const, almacen: 'Oficina Principal' },
  ], []);

  const monthlyComparisonData = useMemo(() => [
    { month: 'Enero', facturas: 0, boletas: 0, notasVenta: 0, compras: 0 },
    { month: 'Febrero', facturas: 0, boletas: 0, notasVenta: 0, compras: 0 },
    { month: 'Marzo', facturas: 11000, boletas: 11000, notasVenta: 0, compras: 0 },
    { month: 'Abril', facturas: 0, boletas: 0, notasVenta: 0, compras: 0 },
    { month: 'Mayo', facturas: 700, boletas: 105556, notasVenta: 57548, compras: 57306 },
    { month: 'Junio', facturas: 4373, boletas: 93788, notasVenta: 127273, compras: 95692 },
    { month: 'Julio', facturas: 2338, boletas: 95787, notasVenta: 102626, compras: 104596 },
    { month: 'Agosto', facturas: 2092, boletas: 197212, notasVenta: 25648, compras: 95397 },
    { month: 'Septiembre', facturas: 10006, boletas: 193039, notasVenta: 24107, compras: 71079 },
    { month: 'Octubre', facturas: 6137, boletas: 194259, notasVenta: 43107, compras: 69260 },
    { month: 'Noviembre', facturas: 7372, boletas: 176532, notasVenta: 120506, compras: 80537 },
    { month: 'Diciembre', facturas: 3549, boletas: 157618, notasVenta: 118917, compras: 69042 },
  ], []);

  const monthlyTableData = useMemo(() => [
    { mes: 'Enero', facturas: 'S/0.00', boletas: 'S/0.00', notasVenta: 'S/7,741.50', compras: 'S/0.00' },
    { mes: 'Febrero', facturas: '0.00', boletas: '0.00', notasVenta: '0.00', compras: '0.00' },
    { mes: 'Marzo', facturas: '0.00', boletas: '0.00', notasVenta: '0.00', compras: '0.00' },
    { mes: 'Abril', facturas: '0.00', boletas: '0.00', notasVenta: '0.00', compras: '0.00' },
    { mes: 'Mayo', facturas: '760.00', boletas: '105,556.44', notasVenta: '57,548.10', compras: '57,306.75' },
    { mes: 'Junio', facturas: '4,373.00', boletas: '93,788.09', notasVenta: '127,273.00', compras: '95,692.25' },
    { mes: 'Julio', facturas: '2,338.44', boletas: '95,787.74', notasVenta: '102,626.00', compras: '104,596.01' },
    { mes: 'Agosto', facturas: '2,092.00', boletas: '197,212.05', notasVenta: '25,648.00', compras: '95,397.34' },
    { mes: 'Septiembre', facturas: '10,006.00', boletas: '193,039.69', notasVenta: '24,107.00', compras: '71,079.68' },
    { mes: 'Octubre', facturas: '6,137.04', boletas: '194,259.74', notasVenta: '43,107.00', compras: '69,260.05' },
    { mes: 'Noviembre', facturas: '7,372.00', boletas: '176,532.00', notasVenta: '120,506.00', compras: '80,537.30' },
    { mes: 'Diciembre', facturas: '3,549.00', boletas: '157,618.00', notasVenta: '118,917.00', compras: '69,042.62' },
    { mes: 'Totales', facturas: '36,289.30', boletas: '1,181,806.06', notasVenta: '707,104.60', compras: '540,914.65', isTotal: true },
  ], []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Header Nubofact */}
      <NubofactHeader />

      {/* Dashboard General Section with Filters - fondo beige */}
      <div className="bg-[#cbbfae] py-3">
        <div className="max-w-350 mx-auto px-16">
          <DashboardFilters
            establecimiento={filtros.establecimiento}
            periodo={filtros.periodo}
            fechaDel={filtros.fechaDel}
            onFiltrosChange={handleFiltrosChange}
          />
        </div>
      </div>

      {/* Metrics Cards - fondo beige */}
      <div className="bg-[#cbbfac] pb-4">
        <div className="max-w-350 mx-auto px-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
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
        </div>
      </div>

      {/* Main Dashboard Content - fondo gray-200 */}
      <div className="p-4">
        <div className="max-w-350 mx-auto space-y-4">
          {/* FILA 1: Paneles originales de Desglose (3 columnas) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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

          {/* FILA 2: Nuevos paneles del diseño Figma (3 columnas) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* CPE Ranking */}
            <CPERankingPanel data={cpeRankingData} />

            {/* Notas de Venta Panel */}
            <NotasVentaPanel 
              ingresos={234}
              egresos={219.63}
              flujo={23.32}
            />

            {/* Total Compras */}
            <TotalComprasPanel 
              totalCompras={totalComprasData.totalCompras}
              saldo={totalComprasData.saldo}
              monthlyData={totalComprasData.monthlyData}
            />
          </div>

          {/* FILA 3: Tablas (3 columnas) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Productos Top */}
            <ProductosTopTable data={[]} />

            {/* Clientes Top */}
            <ClientesTopTable data={[]} />

            {/* Stock Mínimo */}
            <StockMinimoTable 
              data={stockMinimoData}
              totalPages={52}
              onPedido={(id) => console.log('Pedido producto:', id)}
            />
          </div>

          {/* FILA 4: Gráfico grande y Tabla resumen (2 columnas) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico de barras agrupadas */}
            <MonthlyComparisonChart data={monthlyComparisonData} />

            {/* Tabla resumen mensual */}
            <MonthlyTable data={monthlyTableData} />
          </div>
        </div>
      </div>
    </div>
  );
}
