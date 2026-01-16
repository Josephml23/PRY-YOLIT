import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, TrendingUp, Clock, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

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
  { tipo: 'Facturas', cantidad: 450, fill: 'hsl(var(--chart-1))' },
  { tipo: 'Boletas', cantidad: 320, fill: 'hsl(var(--chart-2))' },
  { tipo: 'NC', cantidad: 80, fill: 'hsl(var(--chart-3))' },
  { tipo: 'ND', cantidad: 50, fill: 'hsl(var(--chart-4))' },
];

const estadosSunat = [
  { estado: 'Aceptado', cantidad: 850, fill: 'hsl(var(--chart-1))' },
  { estado: 'Observado', cantidad: 30, fill: 'hsl(var(--chart-3))' },
  { estado: 'Rechazado', cantidad: 20, fill: 'hsl(var(--chart-5))' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Facturación Mensual</CardTitle>
            <CardDescription>
              Ingresos de los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                monto: {
                  label: "Monto",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={facturacionMensual}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="mes" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="monto" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
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
          <CardContent>
            <ChartContainer
              config={{
                cantidad: {
                  label: "Cantidad",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={tiposComprobantes}
                    dataKey="cantidad"
                    nameKey="tipo"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {tiposComprobantes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Segunda fila de gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Estados SUNAT</CardTitle>
            <CardDescription>
              Respuestas de validación SUNAT
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                cantidad: {
                  label: "Cantidad",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={estadosSunat}
                    dataKey="cantidad"
                    nameKey="estado"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    label
                  >
                    {estadosSunat.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
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
            <div className="space-y-4">
              {[
                { numero: 'F001-00123', cliente: 'EMPRESA CLIENTE SAC', monto: 118.00, estado: 'Aceptado' },
                { numero: 'B001-00456', cliente: 'Juan Pérez', monto: 85.00, estado: 'Aceptado' },
                { numero: 'F001-00124', cliente: 'INVERSIONES XYZ SAC', monto: 2500.00, estado: 'Aceptado' },
                { numero: 'NC01-00012', cliente: 'ABC CORP', monto: 150.00, estado: 'Observado' },
              ].map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{doc.numero}</p>
                    <p className="text-sm text-muted-foreground">{doc.cliente}</p>
                  </div>
                  <div className="text-right space-y-1">
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
