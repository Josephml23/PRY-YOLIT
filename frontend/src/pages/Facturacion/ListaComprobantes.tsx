import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { listarComprobantes, consultarComprobante, anularComprobante } from '@/services/nubefact';
import { Download, FileText, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/table-skeleton';

interface Comprobante {
  id: number;
  empresa_id: number;
  tipo_doc: string;
  serie: string;
  correlativo: string;
  cliente_razon_social: string;
  cliente_num_doc: string;
  mto_imp_venta: number;
  moneda: string;
  fecha_emision: string;
  estado_sunat: string;
  nubefact_aceptada_por_sunat: boolean;
  nubefact_pdf_url?: string;
  nubefact_xml_url?: string;
  nubefact_cdr_url?: string;
  anulado: boolean;
}

const TIPOS_DOC = {
  '01': 'Factura',
  '03': 'Boleta',
  '07': 'Nota de Crédito',
  '08': 'Nota de Débito',
};

export default function ListaComprobantes() {
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('all');
  const [filtroEstado, setFiltroEstado] = useState<string>('all');
  const [busqueda, setBusqueda] = useState('');
  const [consultando, setConsultando] = useState<number | null>(null);
  const [anulando, setAnulando] = useState<number | null>(null);
  const [comprobanteAnular, setComprobanteAnular] = useState<Comprobante | null>(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');

  const cargarComprobantes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listarComprobantes({
        tipo_doc: filtroTipo !== 'all' ? filtroTipo : undefined,
        estado_sunat: filtroEstado !== 'all' ? filtroEstado : undefined,
      });
      setComprobantes(data.data || data);
    } catch (error) {
      console.error('Error al cargar comprobantes:', error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error('Error al cargar comprobantes', {
        description: err.response?.data?.message || err.message || 'Error desconocido',
      });
    } finally {
      setLoading(false);
    }
  }, [filtroTipo, filtroEstado]);

  useEffect(() => {
    cargarComprobantes();
  }, [cargarComprobantes]);

  const handleConsultar = async (comprobante: Comprobante) => {
    try {
      setConsultando(comprobante.id);
      const tipo = parseInt(comprobante.tipo_doc);
      const response = await consultarComprobante(tipo, comprobante.serie, parseInt(comprobante.correlativo));

      toast.success('Comprobante consultado', {
        description: `Estado: ${response.sunat_description || 'Aceptado'}`,
      });

      // Actualizar estado local
      setComprobantes((prev) =>
        prev.map((c) =>
          c.id === comprobante.id
            ? {
                ...c,
                nubefact_aceptada_por_sunat: response.aceptada_por_sunat || false,
                nubefact_pdf_url: response.pdf_url,
                nubefact_xml_url: response.xml_url,
                nubefact_cdr_url: response.cdr_url,
              }
            : c
        )
      );
    } catch (error) {
      console.error('Error:', error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error('Error al consultar', {
        description: err.response?.data?.message || err.message || 'Error desconocido',
      });
    } finally {
      setConsultando(null);
    }
  };

  const handleAnular = async () => {
    if (!comprobanteAnular || !motivoAnulacion) {
      toast.error('Complete todos los campos');
      return;
    }

    try {
      setAnulando(comprobanteAnular.id);
      const tipo = parseInt(comprobanteAnular.tipo_doc);
      
      await anularComprobante(tipo, comprobanteAnular.serie, parseInt(comprobanteAnular.correlativo), {
        empresa_id: comprobanteAnular.empresa_id,
        tipo_de_comprobante: tipo,
        serie: comprobanteAnular.serie,
        numero: parseInt(comprobanteAnular.correlativo),
        motivo: motivoAnulacion,
        fecha_de_baja: new Date().toISOString().split('T')[0],
      });

      toast.success('Comprobante anulado exitosamente');
      setComprobanteAnular(null);
      setMotivoAnulacion('');
      cargarComprobantes();
    } catch (error) {
      console.error('Error:', error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error('Error al anular', {
        description: err.response?.data?.message || err.message || 'Error desconocido',
      });
    } finally {
      setAnulando(null);
    }
  };

  const comprobantesFiltrados = comprobantes.filter((c) => {
    const matchBusqueda = busqueda
      ? c.serie.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.correlativo.includes(busqueda) ||
        c.cliente_razon_social.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.cliente_num_doc.includes(busqueda)
      : true;
    return matchBusqueda;
  });

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      <PageHeader
        title="Comprobantes Emitidos"
        description="Consulta y gestión de comprobantes electrónicos"
        actions={
          <Button onClick={cargarComprobantes} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        }
      />

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="busqueda-comprobantes">Buscar</Label>
              <Input
                id="busqueda-comprobantes"
                placeholder="Serie, número, cliente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Comprobante</Label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="01">Facturas</SelectItem>
                  <SelectItem value="03">Boletas</SelectItem>
                  <SelectItem value="07">Notas de Crédito</SelectItem>
                  <SelectItem value="08">Notas de Débito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado SUNAT</Label>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="aceptado">Aceptado</SelectItem>
                  <SelectItem value="rechazado">Rechazado</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="overflow-x-auto p-4">
              <TableSkeleton columns={8} rows={8} />
            </div>
          ) : comprobantesFiltrados.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No se encontraron comprobantes"
              description={busqueda || filtroTipo !== 'all' || filtroEstado !== 'all' ? 'Ajusta los filtros o el criterio de búsqueda.' : 'Los comprobantes emitidos aparecerán aquí.'}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 border-b-2">
                    <TableHead className="py-2 px-2">Tipo</TableHead>
                    <TableHead className="py-2 px-2">Serie-Número</TableHead>
                    <TableHead className="py-2 px-2">Fecha</TableHead>
                    <TableHead className="py-2 px-2">Cliente</TableHead>
                    <TableHead className="py-2 px-2">RUC/DNI</TableHead>
                    <TableHead className="py-2 px-2 text-right">Monto</TableHead>
                    <TableHead className="py-2 px-2">Estado</TableHead>
                    <TableHead className="py-2 px-2 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comprobantesFiltrados.map((comprobante) => (
                    <TableRow key={comprobante.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="py-2 px-2 font-medium">
                        {TIPOS_DOC[comprobante.tipo_doc as keyof typeof TIPOS_DOC] || comprobante.tipo_doc}
                      </TableCell>
                      <TableCell className="py-2 px-2">{`${comprobante.serie}-${comprobante.correlativo}`}</TableCell>
                      <TableCell className="py-2 px-2">{new Date(comprobante.fecha_emision).toLocaleDateString()}</TableCell>
                      <TableCell className="py-2 px-2 max-w-50 truncate">
                        {comprobante.cliente_razon_social}
                      </TableCell>
                      <TableCell className="py-2 px-2">{comprobante.cliente_num_doc}</TableCell>
                      <TableCell className="py-2 px-2 text-right">
                        {comprobante.moneda === 'PEN' ? 'S/ ' : '$ '}
                        {Number(comprobante.mto_imp_venta || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="py-2 px-2">
                        {comprobante.anulado ? (
                          <Badge variant="secondary">Anulado</Badge>
                        ) : comprobante.nubefact_aceptada_por_sunat ? (
                          <Badge className="bg-success text-success-foreground border-transparent">
                            Aceptado
                          </Badge>
                        ) : comprobante.estado_sunat === 'rechazado' ? (
                          <Badge variant="destructive">Rechazado</Badge>
                        ) : (
                          <Badge variant="outline">Pendiente</Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-2 px-2">
                        <div className="flex items-center justify-end gap-2">
                          {comprobante.nubefact_pdf_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a href={comprobante.nubefact_pdf_url} target="_blank" rel="noopener noreferrer" aria-label="Ver PDF">
                                <FileText className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          {comprobante.nubefact_xml_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a href={comprobante.nubefact_xml_url} download aria-label="Descargar XML">
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          {comprobante.nubefact_cdr_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a href={comprobante.nubefact_cdr_url} download aria-label="Descargar CDR">
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleConsultar(comprobante)}
                            disabled={consultando === comprobante.id}
                            aria-label="Consultar estado"
                          >
                            {consultando === comprobante.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                          </Button>
                          {!comprobante.anulado && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setComprobanteAnular(comprobante)}
                              aria-label="Anular comprobante"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Anular */}
      <Dialog open={!!comprobanteAnular} onOpenChange={() => setComprobanteAnular(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anular Comprobante</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea anular el comprobante{' '}
              <strong>
                {comprobanteAnular?.serie}-{comprobanteAnular?.correlativo}
              </strong>
              ?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo de Anulación</label>
              <Input
                value={motivoAnulacion}
                onChange={(e) => setMotivoAnulacion(e.target.value)}
                placeholder="Ingrese el motivo..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComprobanteAnular(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleAnular}
              disabled={!motivoAnulacion || !!anulando}
            >
              {anulando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Anulando...
                </>
              ) : (
                'Anular'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
