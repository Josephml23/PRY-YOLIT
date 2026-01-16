import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, TrendingUp, Clock, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

// Data para gráficos
const facturacionMensual = [
  { mes: 'Ene', monto: 12000 },
  { mes: 'Feb', monto: 19000 },
  { mes: 'Mar', monto: 15000 },
  { mes: 'Abr', monto: 25000 },
  { mes: 'May', monto: 22000 },
  { mes: 'Jun', monto: 30000 },
];

const tiposComprobantes = [
  { tipo: 'Facturas', cantidad: 450 },
  { tipo: 'Boletas', cantidad: 320 },
  { tipo: 'NC', cantidad: 80 },
  { tipo: 'ND', cantidad: 50 },
];

const estadosSunat = [
  { estado: 'Aceptado', cantidad: 850 },
  { estado: 'Observado', cantidad: 30 },
  { estado: 'Rechazado', cantidad: 20 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturado (Mes)</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/ 45,231.89</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+20.1%</span> desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comprobantes Emitidos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">900</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+12.5%</span> desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oportunidades Activas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+8</span> desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Aceptación</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.4%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3 text-red-500" />
              <span className="text-red-500">-1.2%</span> desde el mes pasado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid gap-4 lg:grid-cols-2 xl:gap-6">
        <Card className="hover:shadow-lg transition-shadow">
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
              className="h-75 sm:h-87.5 lg:h-100 xl:h-112.5 w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={facturacionMensual}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
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
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
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
              className="h-75 sm:h-87.5 lg:h-100 xl:h-112.5 w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={tiposComprobantes}
                    dataKey="cantidad"
                    nameKey="tipo"
                    cx="50%"
                    cy="50%"
                    outerRadius="65%"
                    label={{
                      fill: 'hsl(var(--foreground))',
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                    labelLine={false}
                  >
                    {tiposComprobantes.map((entry) => (
                      <Cell key={entry.tipo} fill={`var(--color-${entry.tipo})`} />
                    ))}
                  </Pie>
                  <Legend 
                    verticalAlign="bottom" 
                    height={40}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '14px', fontWeight: 500 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Segunda fila de gráficos */}
      <div className="grid gap-4 lg:grid-cols-2 xl:gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Estados SUNAT</CardTitle>
            <CardDescription>
              Respuestas de validación SUNAT
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-0">
            <ChartContainer
              config={{
                Aceptado: {
                  label: "Aceptado",
                  color: "hsl(var(--chart-2))",
                },
                Observado: {
                  label: "Observado",
                  color: "hsl(var(--chart-4))",
                },
                Rechazado: {
                  label: "Rechazado",
                  color: "hsl(var(--chart-5))",
                },
              }}
              className="h-75 sm:h-87.5 lg:h-100 xl:h-112.5 w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
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
                    verticalAlign="bottom" 
                    height={40}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '14px', fontWeight: 500 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimos comprobantes emitidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-100 overflow-y-auto pr-2">
              {[
                { numero: 'F001-00123', cliente: 'EMPRESA CLIENTE SAC', monto: 118.00, estado: 'Aceptado' },
                { numero: 'B001-00456', cliente: 'Juan Pérez', monto: 85.00, estado: 'Aceptado' },
                { numero: 'F001-00124', cliente: 'INVERSIONES XYZ SAC', monto: 2500.00, estado: 'Aceptado' },
                { numero: 'NC01-00012', cliente: 'ABC CORP', monto: 150.00, estado: 'Observado' },
              ].map((doc, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors gap-2">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">{doc.numero}</p>
                    <p className="text-sm text-muted-foreground truncate">{doc.cliente}</p>
                  </div>
                  <div className="text-left sm:text-right space-y-1 shrink-0">
                    <p className="text-sm font-medium">S/ {doc.monto.toFixed(2)}</p>
                    <p className={`text-xs font-medium ${
                      doc.estado === 'Aceptado' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {doc.estado}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
