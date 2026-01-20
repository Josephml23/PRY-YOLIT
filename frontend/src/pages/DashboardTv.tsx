import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '@/services/api';

interface FacturacionStats {
  total_mes: number;
  total_aceptados: number;
  total_rechazados: number;
  total_pendientes: number;
}

interface OportunidadesStats {
  total: number;
  activas: number;
  ganadas: number;
  perdidas: number;
}

interface SlaResumen {
  total: number;
  en_plazo: number;
  proximo_vencer: number;
  vencidos: number;
}

interface TvComprobante {
  id: number;
  empresa_id: number;
  tipo_doc: string;
  serie: string;
  correlativo: string | number;
  cliente_razon_social: string;
  mto_imp_venta: number;
  estado_sunat: string;
  created_at: string;
}

interface TvOportunidad {
  id: number;
  titulo: string;
  estado: string;
  fecha_vencimiento: string;
  monto_estimado: number;
}

interface DashboardTvResponse {
  facturacion: FacturacionStats;
  oportunidades: OportunidadesStats;
  sla: SlaResumen;
  ultimas_facturas: TvComprobante[];
  proximas_vencer: TvOportunidad[];
}

export default function DashboardTv() {
  const [data, setData] = useState<DashboardTvResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const res = await api.get('/v1/dashboard/tv');
        const payload = res.data?.data || res.data;
        setData(payload as DashboardTvResponse);
        setLoading(false);
      } catch (e) {
        console.error('Error cargando dashboard TV', e);
        setError('No se pudo cargar la información');
        setLoading(false);
      }
    };

    fetchData();
    // Auto-refresh cada 60 segundos para modo TV
    const id = window.setInterval(fetchData, 60_000);

    return () => {
      window.clearInterval(id);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-red-500 text-xl">
        {error || 'No hay datos para mostrar'}
      </div>
    );
  }

  const { facturacion, oportunidades, sla, ultimas_facturas, proximas_vencer } = data;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-8 lg:p-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Dashboard TV</h1>
          <p className="text-lg text-muted-foreground">Vista para monitoreo en tiempo real</p>
        </div>
        <div className="flex flex-col items-end gap-2 text-right text-sm md:text-base text-muted-foreground">
          <div>Actualizado: {new Date().toLocaleString('es-PE')}</div>
          <div className="text-xs md:text-sm">Se actualiza automáticamente cada 60 segundos</div>
          <Link to="/">
            <Button size="sm" variant="outline" className="mt-1">
              Volver al modo normal
            </Button>
          </Link>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid gap-4 lg:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-primary/5 border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base md:text-lg font-semibold">Facturación mes</CardTitle>
            <Receipt className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold">S/ {facturacion.total_mes?.toFixed(2) ?? '0.00'}</div>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Aceptados: {facturacion.total_aceptados} · Pendientes: {facturacion.total_pendientes}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base md:text-lg font-semibold">Oportunidades</CardTitle>
            <TrendingUp className="h-6 w-6 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold">{oportunidades.total}</div>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Activas: {oportunidades.activas} · Ganadas: {oportunidades.ganadas} · Perdidas: {oportunidades.perdidas}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-sky-500/5 border-sky-500/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base md:text-lg font-semibold">SLA en plazo</CardTitle>
            <CheckCircle className="h-6 w-6 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold">{sla.en_plazo}</div>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Próximos a vencer: {sla.proximo_vencer}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-red-500/5 border-red-500/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              SLA vencidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold text-red-500">{sla.vencidos}</div>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Total con SLA: {sla.total}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Listas: últimas facturas y oportunidades próximas a vencer */}
      <div className="grid gap-4 lg:gap-6 grid-cols-1 xl:grid-cols-2">
        <Card className="bg-background/80">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl font-semibold flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Últimas facturas emitidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ultimas_facturas.length === 0 ? (
              <p className="text-muted-foreground text-sm md:text-base">
                No hay facturas recientes.
              </p>
            ) : (
              <div className="space-y-2 max-h-90 overflow-hidden">
                {ultimas_facturas.map((f) => (
                  <div
                    key={f.id}
                    className="grid grid-cols-12 gap-2 text-xs md:text-sm items-center border-b border-border/40 py-2 last:border-b-0"
                  >
                    <div className="col-span-3 font-medium truncate">
                      {f.serie}-{String(f.correlativo).padStart(8, '0')}
                    </div>
                    <div className="col-span-4 truncate">
                      {f.cliente_razon_social}
                    </div>
                    <div className="col-span-2 text-right font-semibold">
                      S/ {f.mto_imp_venta.toFixed(2)}
                    </div>
                    <div className="col-span-2 text-center">
                      <span
                        className={
                          'px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold ' +
                          (f.estado_sunat?.toLowerCase() === 'aceptado'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/40'
                            : f.estado_sunat?.toLowerCase() === 'rechazado'
                            ? 'bg-red-500/10 text-red-500 border border-red-500/40'
                            : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/40')
                        }
                      >
                        {f.estado_sunat?.toUpperCase() || 'PENDIENTE'}
                      </span>
                    </div>
                    <div className="col-span-1 text-right text-muted-foreground">
                      {new Date(f.created_at).toLocaleTimeString('es-PE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-background/80">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Oportunidades próximas a vencer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {proximas_vencer.length === 0 ? (
              <p className="text-muted-foreground text-sm md:text-base">
                No hay oportunidades próximas a vencer en los próximos 7 días.
              </p>
            ) : (
              <div className="space-y-2 max-h-90 overflow-hidden">
                {proximas_vencer.map((o) => (
                  <div
                    key={o.id}
                    className="grid grid-cols-12 gap-2 text-xs md:text-sm items-center border-b border-border/40 py-2 last:border-b-0"
                  >
                    <div className="col-span-4 font-medium truncate">
                      {o.titulo}
                    </div>
                    <div className="col-span-3 text-muted-foreground">
                      Vence: {new Date(o.fecha_vencimiento).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </div>
                    <div className="col-span-2 text-right font-semibold">
                      S/ {o.monto_estimado.toFixed(2)}
                    </div>
                    <div className="col-span-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold bg-sky-500/10 text-sky-500 border border-sky-500/40">
                        {o.estado.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
