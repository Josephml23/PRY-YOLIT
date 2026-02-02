import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, DollarSign, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import GestionDocumentos from '@/components/GestionDocumentos';
import GestionPagos from '@/components/GestionPagos';
import api from '@/services/api';

interface Oportunidad {
  id: number;
  empresa_id: number;
  area: string;
  tipo_operacion: string;
  estado: string;
  cliente_nombre: string;
  cliente_ruc?: string;
  descripcion?: string;
  monto_estimado?: number;
  fecha_inicio: string;
  fecha_vencimiento?: string;
  probabilidad?: number;
  created_at: string;
  updated_at: string;
  empresa?: {
    id: number;
    ruc: string;
    razon_social: string;
  };
}

interface Documento {
  id: number;
  nombre_archivo: string;
  tipo: string;
  size: number;
  mime_type: string;
  storage_path: string;
  descripcion?: string;
  created_at: string;
  usuario?: {
    name: string;
  };
}

interface Pago {
  id: number;
  fecha_pago: string;
  monto: number;
  medio_pago: string;
  numero_operacion?: string;
  comprobante_id?: number;
  created_at: string;
  comprobante?: {
    tipo_doc: string;
    serie: string;
    numero: string;
  };
}

export default function DetalleOportunidad() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [oportunidad, setOportunidad] = useState<Oportunidad | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      // Cargar oportunidad
      const oportunidadRes = await api.get(`/v1/oportunidades/${id}`);
      setOportunidad(oportunidadRes.data.data);

      // Cargar documentos de la oportunidad
      const documentosRes = await api.get(`/v1/documentos/oportunidad/${id}`);
      setDocumentos(Array.isArray(documentosRes.data) ? documentosRes.data : documentosRes.data.data || []);

      // Cargar pagos de la oportunidad
      const pagosRes = await api.get(`/v1/pagos/oportunidad/${id}`);
      setPagos(Array.isArray(pagosRes.data) ? pagosRes.data : pagosRes.data.data || []);

    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los datos de la oportunidad');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDocumentosChange = () => {
    if (!id) return;
    api.get(`/v1/documentos/oportunidad/${id}`)
      .then((res) => {
        setDocumentos(Array.isArray(res.data) ? res.data : res.data.data || []);
      })
      .catch((error) => {
        console.error('Error al recargar documentos:', error);
      });
  };

  const handlePagosChange = () => {
    if (!id) return;
    api.get(`/v1/pagos/oportunidad/${id}`)
      .then((res) => {
        setPagos(Array.isArray(res.data) ? res.data : res.data.data || []);
      })
      .catch((error) => {
        console.error('Error al recargar pagos:', error);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando oportunidad...</div>
      </div>
    );
  }

  if (!oportunidad) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-muted-foreground">Oportunidad no encontrada</div>
        <Button onClick={() => navigate('/app/oportunidades')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al listado
        </Button>
      </div>
    );
  }

  const diasVencimiento = oportunidad.fecha_vencimiento
    ? Math.ceil((new Date(oportunidad.fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/oportunidades')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Oportunidad #{oportunidad.id}
            </h1>
            <p className="text-muted-foreground">{oportunidad.cliente_nombre}</p>
          </div>
        </div>
      </div>

      {/* Resumen en cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{oportunidad.estado.replace('_', ' ')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Monto Estimado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {oportunidad.monto_estimado
                ? `S/ ${Number(oportunidad.monto_estimado).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
                : 'No especificado'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Vencimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {diasVencimiento !== null ? (
              <div className={`text-2xl font-bold ${diasVencimiento < 0 ? 'text-red-500' : diasVencimiento < 7 ? 'text-yellow-500' : ''}`}>
                {diasVencimiento < 0 ? `${Math.abs(diasVencimiento)} días atrasado` : `${diasVencimiento} días`}
              </div>
            ) : (
              <div className="text-2xl font-bold text-muted-foreground">Sin fecha</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Información general */}
      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Empresa</div>
              <div className="font-medium">
                {oportunidad.empresa?.razon_social || 'Sin empresa'}
              </div>
              {oportunidad.empresa?.ruc && (
                <div className="text-sm text-muted-foreground font-mono">RUC: {oportunidad.empresa.ruc}</div>
              )}
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Cliente</div>
              <div className="font-medium">{oportunidad.cliente_nombre}</div>
              {oportunidad.cliente_ruc && (
                <div className="text-sm text-muted-foreground font-mono">RUC: {oportunidad.cliente_ruc}</div>
              )}
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Área</div>
              <div className="font-medium">{oportunidad.area}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Tipo de Operación</div>
              <div className="font-medium">{oportunidad.tipo_operacion}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha de Inicio
              </div>
              <div className="font-medium">
                {new Date(oportunidad.fecha_inicio).toLocaleDateString('es-PE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>

            {oportunidad.fecha_vencimiento && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha de Vencimiento
                </div>
                <div className="font-medium">
                  {new Date(oportunidad.fecha_vencimiento).toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            )}

            {oportunidad.probabilidad !== undefined && oportunidad.probabilidad !== null && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Probabilidad</div>
                <div className="font-medium">{oportunidad.probabilidad}%</div>
              </div>
            )}
          </div>

          {oportunidad.descripcion && (
            <div className="mt-4">
              <div className="text-sm font-medium text-muted-foreground mb-1">Descripción</div>
              <div className="text-sm">{oportunidad.descripcion}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs: Documentos, Pagos, Historial */}
      <Tabs defaultValue="documentos" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="documentos">
            <FileText className="h-4 w-4 mr-2" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="pagos">
            <DollarSign className="h-4 w-4 mr-2" />
            Pagos
          </TabsTrigger>
          <TabsTrigger value="historial">
            <Clock className="h-4 w-4 mr-2" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documentos">
          <GestionDocumentos
            oportunidadId={oportunidad.id}
            documentos={documentos}
            onDocumentosChange={handleDocumentosChange}
          />
        </TabsContent>

        <TabsContent value="pagos">
          <GestionPagos
            oportunidadId={oportunidad.id}
            pagos={pagos}
            onPagosChange={handlePagosChange}
          />
        </TabsContent>

        <TabsContent value="historial">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3 pb-3 border-b">
                  <div className="h-2 w-2 rounded-full bg-success mt-2 shrink-0" aria-hidden></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Oportunidad creada</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(oportunidad.created_at).toLocaleString('es-PE')}
                    </div>
                  </div>
                </div>
                
                {oportunidad.updated_at !== oportunidad.created_at && (
                  <div className="flex items-start gap-3 pb-3 border-b">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" aria-hidden></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Última actualización</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(oportunidad.updated_at).toLocaleString('es-PE')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
