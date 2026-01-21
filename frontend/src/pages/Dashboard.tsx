import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, TrendingUp, CheckCircle, Building2, AlertTriangle, Bell } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import api from '@/services/api';

interface Comprobante {
  id: number;
  tipo_doc: string;
  serie: string;
  correlativo: number | string;
  cliente_razon_social: string;
  mto_imp_venta?: number | string;
  total?: number | string;
  estado_sunat: string;
  fecha_emision: string;
  pagado?: boolean;
  anulado?: boolean;
  enviado_cliente?: boolean;
}

interface Empresa {
  id: number;
  ruc: string;
  razon_social: string;
  nombre_comercial: string;
}

interface SlaResumen {
  total: number;
  en_plazo: number;
  proximo_vencer: number;
  vencidos: number;
}

interface AlertasResumen {
  total_no_leidas: number;
  por_prioridad: Record<string, number>;
}

interface ClienteResumen {
  cliente_tipo_doc: string;
  cliente_num_doc: string;
  cliente_razon_social: string;
  cantidad: number;
  total: number;
}

interface VentaMes {
  mes: string;
  total: number;
  cantidad: number;
}

interface VentaMesApi {
  mes: string;
  total: number | string;
  cantidad: number | string;
}

export default function Dashboard() {
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFacturado: 0,
    totalComprobantes: 0,
    tasaAceptacion: 0,
  });

  const [totalClientesRegistrados, setTotalClientesRegistrados] = useState(0);

  const [slaResumen, setSlaResumen] = useState<SlaResumen>({
    total: 0,
    en_plazo: 0,
    proximo_vencer: 0,
    vencidos: 0,
  });

  const [alertasResumen, setAlertasResumen] = useState<AlertasResumen>({
    total_no_leidas: 0,
    por_prioridad: {},
  });

  const [clientesTop, setClientesTop] = useState<ClienteResumen[]>([]);
  const [ventasMes, setVentasMes] = useState<VentaMes[]>([]);

  const parseMonto = (valor: unknown): number => {
    if (valor === null || valor === undefined) return 0;
    if (typeof valor === 'number') {
      return Number.isNaN(valor) ? 0 : valor;
    }
    if (typeof valor === 'string') {
      const cleaned = valor.replace(/[^0-9.-]/g, '');
      const num = Number(cleaned);
      return Number.isNaN(num) ? 0 : num;
    }
    return 0;
  };

  const cargarDatos = useCallback(async () => {
    try {
      const [comprobantesRes, empresasRes, dashboardRes, ventasMesRes] = await Promise.all([
        api.get('/facturacion/comprobantes', { params: { per_page: 5000 } }),
        api.get('/v1/empresas'),
        api.get('/v1/dashboard'),
        api.get('/v1/dashboard/ventas-mes'),
      ]);

      const comprobantesData = Array.isArray(comprobantesRes.data)
        ? comprobantesRes.data
        : (comprobantesRes.data.data || []);
      const empresasData = Array.isArray(empresasRes.data)
        ? empresasRes.data
        : (empresasRes.data.data || []);

      setComprobantes(comprobantesData);
      setEmpresas(empresasData);

      // Calcular estadísticas
      const totalFacturado = comprobantesData.reduce(
        (sum: number, c: Comprobante) => sum + parseMonto(c.mto_imp_venta ?? c.total ?? 0),
        0
      );
      const aceptados = comprobantesData.filter((c: Comprobante) => c.estado_sunat?.toLowerCase() === 'aceptado').length;
      const tasaAceptacion = comprobantesData.length > 0 ? (aceptados / comprobantesData.length) * 100 : 0;

      setStats({
        totalFacturado,
        totalComprobantes: comprobantesData.length,
        tasaAceptacion,
      });

      // SLA y alertas desde el endpoint de dashboard
      const dashboardData = dashboardRes.data?.data || dashboardRes.data || {};
      const sla = dashboardData.sla || {};
      const alertas = dashboardData.alertas || {};
      const clientes = dashboardData.clientes || {};

      setSlaResumen({
        total: sla.total ?? 0,
        en_plazo: sla.en_plazo ?? 0,
        proximo_vencer: sla.proximo_vencer ?? 0,
        vencidos: sla.vencidos ?? 0,
      });

      setAlertasResumen({
        total_no_leidas: alertas.total_no_leidas ?? 0,
        por_prioridad: alertas.por_prioridad ?? {},
      });

      const topClientes = Array.isArray(clientes.top_clientes) ? clientes.top_clientes : [];
      setClientesTop(topClientes);

      setTotalClientesRegistrados(clientes.total_clientes ?? 0);

      const ventasDataRaw = ventasMesRes.data?.data || ventasMesRes.data || [];
      const ventasNormalizadas: VentaMes[] = Array.isArray(ventasDataRaw)
        ? (ventasDataRaw as VentaMesApi[]).map((v) => ({
            mes: v.mes,
            total: Number(v.total) || 0,
            cantidad: Number(v.cantidad) || 0,
          }))
        : [];
      setVentasMes(ventasNormalizadas);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const datosFacturacionMensual = ventasMes.length > 0
    ? ventasMes.map((v) => ({ mes: v.mes, monto: v.total }))
    : [
        { mes: 'Ene', monto: 0 },
        { mes: 'Feb', monto: 0 },
        { mes: 'Mar', monto: 0 },
        { mes: 'Abr', monto: 0 },
        { mes: 'May', monto: 0 },
        { mes: 'Jun', monto: 0 },
      ];

  // Datos para gráficos basados en comprobantes reales
  const tiposComprobantes = [
    { tipo: 'Facturas', cantidad: comprobantes.filter(c => c.tipo_doc === '01').length },
    { tipo: 'Boletas', cantidad: comprobantes.filter(c => c.tipo_doc === '03').length },
    { tipo: 'NC', cantidad: comprobantes.filter(c => c.tipo_doc === '07').length },
    { tipo: 'ND', cantidad: comprobantes.filter(c => c.tipo_doc === '08').length },
  ].filter(t => t.cantidad > 0);

  const estadosSunat = [
    { estado: 'Anulado', cantidad: comprobantes.filter(c => c.anulado).length },
    { estado: 'Aceptado', cantidad: comprobantes.filter(c => !c.anulado).length },
  ].filter(e => e.cantidad > 0);

  const ultimosComprobantes = comprobantes
    .sort((a, b) => new Date(b.fecha_emision).getTime() - new Date(a.fecha_emision).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      {/* Header del Dashboard */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Resumen general de facturación electrónica
          </p>
        </div>
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
          <Link to="/dashboard-tv" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2">
              <span>Modo TV</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/ {stats.totalFacturado.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {comprobantes.length} comprobantes emitidos
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comprobantes Emitidos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComprobantes}</div>
            <p className="text-xs text-muted-foreground">
              Total en el sistema
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes y Proveedores registrados</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClientesRegistrados}</div>
            <p className="text-xs text-muted-foreground">
              Registros en el sistema
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Aceptación</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasaAceptacion.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Comprobantes aceptados por SUNAT
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SLA y Alertas */}
      <div className="grid gap-4 lg:grid-cols-2 xl:gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                SLA de Oportunidades
              </CardTitle>
              <CardDescription>
                Estado de las oportunidades con SLA configurado
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {slaResumen.total === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay oportunidades con SLA configurado aún.
              </p>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">En plazo</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {slaResumen.en_plazo}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Próximos a vencer</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    {slaResumen.proximo_vencer}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Vencidos</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {slaResumen.vencidos}
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Total con SLA: {slaResumen.total}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bell className="h-4 w-4 text-sky-500" />
                Alertas
              </CardTitle>
              <CardDescription>
                Alertas pendientes por prioridad
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {alertasResumen.total_no_leidas === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay alertas pendientes.
              </p>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total no leídas</span>
                  <span className="font-medium">
                    {alertasResumen.total_no_leidas}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-xs">
                  {Object.keys(alertasResumen.por_prioridad).map((prioridad) => (
                    <div key={prioridad} className="flex items-center justify-between">
                      <span className="capitalize text-muted-foreground">{prioridad}</span>
                      <span className="font-medium">
                        {alertasResumen.por_prioridad[prioridad]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid gap-4 lg:grid-cols-2 xl:gap-6">
        <Card className="hover:shadow-lg transition-shadow overflow-hidden">
          <CardHeader>
            <CardTitle>Facturación Mensual</CardTitle>
            <CardDescription>
              Ingresos de los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-0">
            <ChartContainer
              config={{
                monto: {
                  label: "Monto (S/)",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="aspect-4/3 w-full min-h-112.5 sm:min-h-125 lg:max-h-137.5"
            >
              <BarChart
                data={datosFacturacionMensual}
                margin={{ top: 5, right: 5, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="mes"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={14}
                  tickLine={false}
                  axisLine={false}
                  style={{ fontSize: '14px' }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={14}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value / 1000}k`}
                  style={{ fontSize: '14px' }}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                />
                <Bar
                  dataKey="monto"
                  fill="var(--color-monto)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {tiposComprobantes.length > 0 && (
          <Card className="hover:shadow-lg transition-shadow overflow-hidden">
            <CardHeader>
              <CardTitle>Tipos de Comprobantes</CardTitle>
              <CardDescription>
                Distribución por tipo de documento
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
              <ChartContainer
                config={{
                  Facturas: {
                    label: "Facturas",
                    color: "hsl(var(--chart-1))",
                  },
                  Boletas: {
                    label: "Boletas",
                    color: "hsl(var(--chart-2))",
                  },
                  NC: {
                    label: "Notas de Crédito",
                    color: "hsl(var(--chart-3))",
                  },
                  ND: {
                    label: "Notas de Débito",
                    color: "hsl(var(--chart-4))",
                  },
                }}
                className="aspect-square w-full min-h-112.5 sm:min-h-125 lg:max-h-137.5"
              >
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={tiposComprobantes}
                    dataKey="cantidad"
                    nameKey="tipo"
                    cx="50%"
                    cy="50%"
                    outerRadius="65%"
                  >
                    {tiposComprobantes.map((entry) => (
                      <Cell key={entry.tipo} fill={`var(--color-${entry.tipo})`} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="top"
                    height={40}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '14px', fontWeight: 500 }}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Segunda fila */}
      <div className="grid gap-4 lg:grid-cols-2 xl:gap-6">
        {estadosSunat.length > 0 && (
          <Card className="hover:shadow-lg transition-shadow overflow-hidden">
            <CardHeader>
              <CardTitle>Comprobantes Anulados</CardTitle>
              <CardDescription>
                Distribución de comprobantes anulados vs no anulados
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
              <ChartContainer
                config={{
                  Anulado: {
                    label: "Anulado",
                    color: "hsl(var(--chart-2))",
                  },
                  Aceptado: {
                    label: "Aceptado",
                    color: "hsl(var(--chart-4))",
                  },
                }}
                className="aspect-square w-full min-h-112.5 sm:min-h-125 lg:max-h-137.5"
              >
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={estadosSunat}
                    dataKey="cantidad"
                    nameKey="estado"
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="65%"
                    label={{
                      fill: 'hsl(var(--foreground))',
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                    labelLine={false}
                  >
                    {estadosSunat.map((entry) => (
                      <Cell key={entry.estado} fill={`var(--color-${entry.estado})`} />
                    ))}
                  </Pie>
                  <Legend 
                    verticalAlign="top" 
                    height={40}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '14px', fontWeight: 500 }}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimos comprobantes emitidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ultimosComprobantes.length > 0 ? (
              <div className="space-y-3 max-h-100 overflow-y-auto pr-2">
                {ultimosComprobantes.map((doc) => (
                  <div key={doc.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors gap-2">
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none">{doc.serie}-{doc.correlativo}</p>
                      <p className="text-sm text-muted-foreground truncate">{doc.cliente_razon_social}</p>
                    </div>
                    <div className="text-left sm:text-right space-y-1 shrink-0">
                      <p className="text-sm font-medium">S/ {Number(doc.mto_imp_venta ?? 0).toFixed(2)}</p>
                      <p className={`text-xs font-medium ${
                        doc.estado_sunat?.toLowerCase() === 'aceptado' 
                          ? 'text-green-600 dark:text-green-400' 
                          : doc.estado_sunat?.toLowerCase() === 'rechazado'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {doc.estado_sunat || 'Pendiente'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay comprobantes emitidos</p>
                <p className="text-sm">Comienza emitiendo tu primer comprobante</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Clientes principales */}
      {clientesTop.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2 xl:gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Top Clientes por Facturación</CardTitle>
              <CardDescription>
                Basado en comprobantes importados desde NubeFact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-100 overflow-y-auto pr-2">
                {clientesTop.map((cliente) => (
                  <div
                    key={`${cliente.cliente_tipo_doc}-${cliente.cliente_num_doc}`}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors gap-2"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {cliente.cliente_razon_social}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cliente.cliente_tipo_doc} {cliente.cliente_num_doc}
                      </p>
                    </div>
                    <div className="text-left sm:text-right space-y-1 shrink-0">
                      <p className="text-sm font-medium">
                        S/ {parseFloat(cliente.total?.toString() || '0').toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cliente.cantidad} comprobante(s)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tercera fila - Empresas */}
      {empresas.length > 0 && (
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Empresas Registradas</CardTitle>
            <CardDescription>
              Empresas emisoras de comprobantes electrónicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {empresas.slice(0, 4).map((empresa) => (
                <div key={empresa.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">{empresa.nombre_comercial || empresa.razon_social}</p>
                    <p className="text-sm text-muted-foreground">RUC: {empresa.ruc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
