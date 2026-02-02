import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CreditCard, BarChart3, Wallet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardApi } from '@/services/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { DashboardFilterPanel } from '@/components/dashboard/DashboardFilterPanel';
import { DesgloseSummaryPanel } from '@/components/dashboard/DesgloseSummaryPanel';
import { Button } from '@/components/ui/button';
import type { DashboardFiltros, DashboardStats } from '@/types';

const formatCurrency = (value: number): string => {
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<DashboardFiltros>({
    establecimiento: '1',
    periodo: 'ESTE_MES',
    fechaDel: new Date().toISOString().split('T')[0],
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

  const handleFiltrosChange = (nuevosFiltros: DashboardFiltros) => {
    setFiltros(nuevosFiltros);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      <PageHeader
        title="Dashboard"
        description="Resumen general de facturación electrónica"
        actions={
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
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
                <span>Modo TV</span>
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

      {/* 2. KPIs (5 tarjetas navy) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          variant="navy"
          icon={FileText}
          title="CPE Emitidos"
          value={stats.cpeEmitidos}
          description="Total documentos"
        />
        <MetricCard
          variant="navy"
          icon={CreditCard}
          title="Total CPE"
          value={formatCurrency(stats.totalCPE)}
        />
        <MetricCard
          variant="navy"
          icon={FileText}
          title="Total Notas Venta"
          value={formatCurrency(stats.totalNotasVenta)}
        />
        <MetricCard
          variant="navy"
          icon={BarChart3}
          title="Monto Total General"
          value={formatCurrency(stats.montoTotalGeneral)}
        />
        <MetricCard
          variant="navy"
          icon={Wallet}
          title="Utilidad Neta"
          value={formatCurrency(stats.utilidadNeta)}
        />
      </div>

      {/* 3. Paneles de Desglose (3 columnas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CPE */}
        <DesgloseSummaryPanel
          title="CPE"
          items={[
            { label: 'Total Pagado', value: formatCurrency(stats.cpePagado), highlight: true },
            { label: 'Total por Pagar', value: formatCurrency(stats.cpePorPagar), highlight: true },
            { label: 'Total', value: formatCurrency(stats.cpeTotal), highlight: true },
          ]}
        />

        {/* Notas de Venta (Boletas) */}
        <DesgloseSummaryPanel
          title="Notas de Venta"
          items={[
            { label: 'Total Pagado', value: formatCurrency(stats.notasVentaPagado), highlight: true },
            { label: 'Total por Pagar', value: formatCurrency(stats.notasVentaPorPagar), highlight: true },
            { label: 'Total', value: formatCurrency(stats.notasVentaTotal), highlight: true },
          ]}
        />

        {/* Totales Generales + Gráfico */}
        <div className="border-none bg-[hsl(var(--dashboard-navy))] text-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Totales Generales</h3>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center">
              <p className="text-xs text-white/70">Total Nota Venta</p>
              <p className="text-lg font-bold text-red-300">{formatCurrency(stats.totalNotasVenta)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/70">Total Comprobantes</p>
              <p className="text-lg font-bold text-blue-300">{formatCurrency(stats.totalCPE)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/70">Total General</p>
              <p className="text-lg font-bold text-blue-300">{formatCurrency(stats.montoTotalGeneral)}</p>
            </div>
          </div>
          {/* Gráfico de líneas por hora */}
          {stats.ventasPorHora.length > 0 && (
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={stats.ventasPorHora}>
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={false}
                />
                <XAxis
                  dataKey="hora"
                  stroke="#fff"
                  fontSize={10}
                  interval="preserveStartEnd"
                />
                <YAxis stroke="#fff" fontSize={10} width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--dashboard-navy))',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => [`S/ ${value.toFixed(2)}`, 'Ventas']}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
