import { useState, useEffect, useMemo, useCallback } from "react";
import { FileText, CreditCard, BarChart3, Wallet } from "lucide-react";
import { dashboardApi } from "@/services/api";
import { NubofactHeader } from "@/components/layout/NubofactHeader";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { CPERankingPanel } from "@/components/dashboard/CPERankingPanel";
import { NotasVentaPanel } from "@/components/dashboard/NotasVentaPanel";
import { TotalComprasPanel } from "@/components/dashboard/TotalComprasPanel";
import { CPEDesglosePanelCompacto } from "@/components/dashboard/CPEDesglosePanelCompacto";
import { NotasVentaDesglosePanelCompacto } from "@/components/dashboard/NotasVentaDesglosePanelCompacto";
import { TotalesGeneralesPanel } from "@/components/dashboard/TotalesGeneralesPanel";
import { ProductosTopTable } from "@/components/dashboard/ProductosTopTable";
import { ClientesTopTable } from "@/components/dashboard/ClientesTopTable";
import { StockMinimoTable } from "@/components/dashboard/StockMinimoTable";
import { MonthlyComparisonChart } from "@/components/dashboard/MonthlyComparisonChart";
import { MonthlyTable } from "@/components/dashboard/MonthlyTable";
import type { 
  DashboardFiltros, 
  DashboardStats, 
  CPERankingItem,
  ProductoTopItem,
  ClienteTopItem,
  StockMinimoProduct,
  MonthlyComparisonData,
  MonthlyTableRow
} from "@/types";
import { formatCurrencyKpi } from "@/lib/format";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  // const [loadingCPE, setLoadingCPE] = useState(true); // TODO: Usar para loading spinner
  const [cpeRanking, setCpeRanking] = useState<CPERankingItem[]>([]);
  const [productosTop, setProductosTop] = useState<ProductoTopItem[]>([]);
  const [clientesTop, setClientesTop] = useState<ClienteTopItem[]>([]);
  const [stockMinimo, setStockMinimo] = useState<StockMinimoProduct[]>([]);
  const [stockMinimoTotal, setStockMinimoTotal] = useState(0);
  const [stockMinimoPage, setStockMinimoPage] = useState(1);
  const [monthlyComparisonData, setMonthlyComparisonData] = useState<MonthlyComparisonData[]>([]);
  const [monthlyTableData, setMonthlyTableData] = useState<MonthlyTableRow[]>([]);
  const [filtros, setFiltros] = useState<DashboardFiltros>({
    establecimiento: "1",
    periodo: "COMPLETO",
    fechaDel: "2000-01-01", // Desde el inicio
    fechaHasta: undefined,
  });

  const [stats, setStats] = useState<DashboardStats>({
    cpeEmitidos: 0,
    totalCPE: 0,
    cpePagado: 0,
    cpePorPagar: 0,
    cpeTotal: 0,
    totalBoletas: 0,
    boletasPagado: 0,
    boletasPorPagar: 0,
    boletasTotal: 0,
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
        console.error("Error al cargar stats del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarStats();
  }, [filtros]);

  useEffect(() => {
    const cargarCPERanking = async () => {
      try {
        // setLoadingCPE(true); // TODO: Activar cuando se añada loading spinner
        const data = await dashboardApi.getCPERanking(filtros);
        setCpeRanking(data);
      } catch (error) {
        console.error("Error al cargar ranking de CPE:", error);
        setCpeRanking([]);
      } finally {
        // setLoadingCPE(false); // TODO: Activar cuando se añada loading spinner
      }
    };

    cargarCPERanking();
  }, [filtros]);

  useEffect(() => {
    const cargarProductosTop = async () => {
      try {
        const data = await dashboardApi.getProductosTop(filtros);
        setProductosTop(data);
      } catch (error) {
        console.error("Error al cargar productos top:", error);
        setProductosTop([]);
      }
    };

    cargarProductosTop();
  }, [filtros]);

  useEffect(() => {
    const cargarClientesTop = async () => {
      try {
        const data = await dashboardApi.getClientesTop(filtros);
        setClientesTop(data);
      } catch (error) {
        console.error("Error al cargar clientes top:", error);
        setClientesTop([]);
      }
    };

    cargarClientesTop();
  }, [filtros]);

  useEffect(() => {
    const cargarStockMinimo = async () => {
      try {
        const response = await dashboardApi.getStockMinimo(stockMinimoPage, 5);
        setStockMinimo(response.data);
        setStockMinimoTotal(response.total_pages);
      } catch (error) {
        console.error("Error al cargar stock mínimo:", error);
        setStockMinimo([]);
        setStockMinimoTotal(0);
      }
    };

    cargarStockMinimo();
  }, [stockMinimoPage]);

  useEffect(() => {
    const cargarMonthlyComparison = async () => {
      try {
        const data = await dashboardApi.getMonthlyComparison(filtros);
        setMonthlyComparisonData(data.chart);
        setMonthlyTableData(data.table);
      } catch (error) {
        console.error("Error al cargar comparación mensual:", error);
        setMonthlyComparisonData([]);
        setMonthlyTableData([]);
      }
    };

    cargarMonthlyComparison();
  }, [filtros]);

  // React Best Practice: Memoize callbacks to prevent child re-renders
  const handleFiltrosChange = useCallback(
    (nuevosFiltros: {
      establecimiento: string;
      periodo: string;
      fechaDel: string;
      fechaHasta?: string;
    }) => {
      setFiltros(nuevosFiltros as DashboardFiltros);
    },
    [],
  );

  const handleStockMinimoPageChange = useCallback((page: number) => {
    setStockMinimoPage(page);
  }, []);

  // Datos mock para componentes de Figma
  const totalComprasData = useMemo(
    () => ({
      totalCompras: 7543374.65,
      saldo: 7543374.65,
      monthlyData: [
        { month: "Ene", value: 4200 },
        { month: "Feb", value: 3800 },
        { month: "Mar", value: 5400 },
        { month: "Abr", value: 5800 },
        { month: "May", value: 6200 },
        { month: "Jun", value: 7000 },
        { month: "Jul", value: 6400 },
        { month: "Ago", value: 6800 },
        { month: "Sep", value: 5900 },
        { month: "Oct", value: 7200 },
        { month: "Nov", value: 7600 },
        { month: "Dic", value: 6500 },
      ],
    }),
    [],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#cbbfac]">
        <NubofactHeader />
        <div className="bg-[#cbbfae] py-3">
          <div className="max-w-350 mx-auto px-16">
            <div className="bg-primary rounded-[10px] p-4 h-24 animate-pulse"></div>
          </div>
        </div>
        <div className="bg-[#cbbfac] pb-4">
          <div className="max-w-350 mx-auto px-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-primary rounded-lg h-24 animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="pb-4">
          <div className="max-w-350 mx-auto px-16">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground text-sm">Cargando datos del dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#cbbfac] transition-opacity duration-200">
      {/* Header Nubofact */}
      <NubofactHeader />

      {/* Dashboard General Section with Filters - fondo beige */}
      <div className="bg-[#cbbfae] py-3">
        <div className="max-w-350 mx-auto px-16">
          <DashboardFilters
            establecimiento={filtros.establecimiento}
            periodo={filtros.periodo}
            fechaDel={filtros.fechaDel}
            fechaHasta={filtros.fechaHasta}
            onFiltrosChange={handleFiltrosChange}
          />
        </div>
      </div>

      {/* Metrics Cards - fondo beige más claro con fade-in */}
      <div className="bg-[#cbbfac] pb-4 animate-in fade-in duration-300">
        <div className="max-w-350 mx-auto px-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-10 gap-3">
            <MetricCard
              variant="nubofact"
              icon={FileText}
              title="CPE Emitidos"
              value={stats.cpeEmitidos.toString()}
              className="lg:col-span-2"
            />
            <MetricCard
              variant="nubofact"
              icon={CreditCard}
              title="Total CPE"
              value={formatCurrencyKpi(stats.cpeTotal)}
              className="lg:col-span-2"
            />
            <MetricCard
              variant="nubofact"
              icon={BarChart3}
              title="Notas de Venta"
              value={formatCurrencyKpi(stats.boletasTotal)}
              className="lg:col-span-2"
            />
            <MetricCard
              variant="nubofact"
              icon={Wallet}
              title="Total General"
              value={formatCurrencyKpi(stats.montoTotalGeneral)}
              className="lg:col-span-2"
            />
            <MetricCard
              variant="nubofact"
              icon={Wallet}
              title="Utilidad Neta"
              value={formatCurrencyKpi(stats.utilidadNeta)}
              className="lg:col-span-2"
            />
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="pb-4">
        <div className="max-w-350 mx-auto px-16 space-y-4">
          {/* FILA 0: Nuevos paneles de desglose compactos */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
            <CPEDesglosePanelCompacto 
              totalPagado={stats.cpePagado}
              totalPorPagar={stats.cpePorPagar}
              total={stats.cpeTotal}
              className="lg:col-span-3"
            />
            <NotasVentaDesglosePanelCompacto 
              totalPagado={stats.boletasPagado}
              totalPorPagar={stats.boletasPorPagar}
              total={stats.boletasTotal}
              className="lg:col-span-3"
            />
            <TotalesGeneralesPanel 
              totalNotaVenta={stats.boletasTotal}
              totalComprobantes={stats.cpeTotal}
              totalGeneral={stats.montoTotalGeneral}
              hourlyData={stats.ventasPorHora}
              className="lg:col-span-4"
            />
          </div>

          {/* FILA 1: Paneles alineados con las métricas */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
            <CPERankingPanel data={cpeRanking} className="lg:col-span-3" />
            <NotasVentaPanel ingresos={234} egresos={219.63} flujo={23.32} className="lg:col-span-3" />
            <TotalComprasPanel
              totalCompras={totalComprasData.totalCompras}
              saldo={totalComprasData.saldo}
              monthlyData={totalComprasData.monthlyData}
              className="lg:col-span-4"
            />
          </div>

          {/* FILA 2: Tablas (3 columnas con StockMinimoTable más ancha) */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
            <ProductosTopTable data={productosTop} className="lg:col-span-3" />
            <ClientesTopTable data={clientesTop} className="lg:col-span-3" />
            <StockMinimoTable
              data={stockMinimo}
              totalPages={stockMinimoTotal}
              currentPage={stockMinimoPage}
              onPageChange={handleStockMinimoPageChange}
              onPedido={(id) => console.log("Pedido producto:", id)}
              className="lg:col-span-4"
            />
          </div>

          {/* FILA 3: Gráfico grande y Tabla resumen (2 columnas) */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
            <MonthlyComparisonChart data={monthlyComparisonData} className="lg:col-span-5" />
            <MonthlyTable data={monthlyTableData} className="lg:col-span-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
