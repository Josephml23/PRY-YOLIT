import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Download, FileText, FileX, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

  const cargarComprobantes = async () => {
    try {
      setLoading(true);
      const data = await listarComprobantes({
        tipo_doc: filtroTipo !== 'all' ? filtroTipo : undefined,
        estado_sunat: filtroEstado !== 'all' ? filtroEstado : undefined,
      });
      setComprobantes(data.data || data);
    } catch (error: any) {
      console.error('Error al cargar comprobantes:', error);
      toast.error('Error al cargar comprobantes', {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarComprobantes();
  }, [filtroTipo, filtroEstado]);

  const handleConsultar = async (comprobante: Comprobante) => {
    try {
      setConsultando(comprobante.id);
      const tipo = parseInt(comprobante.tipo_doc);
      const response = await consultarComprobante(tipo, comprobante.serie, comprobante.correlativo);

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
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Error al consultar', {
        description: error.response?.data?.message || error.message,
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
      
      await anularComprobante(tipo, comprobanteAnular.serie, comprobanteAnular.correlativo, {
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
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Error al anular', {
        description: error.response?.data?.message || error.message,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Comprobantes Emitidos</h2>
          <p className="text-muted-foreground">Consulta y gestión de comprobantes electrónicos</p>
        </div>
        <Button onClick={cargarComprobantes} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <Input
                placeholder="Serie, número, cliente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Comprobante</label>
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
              <label className="text-sm font-medium">Estado SUNAT</label>
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
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Serie-Número</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>RUC/DNI</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comprobantesFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No se encontraron comprobantes
                    </TableCell>
                  </TableRow>
                ) : (
                  comprobantesFiltrados.map((comprobante) => (
                    <TableRow key={comprobante.id}>
                      <TableCell className="font-medium">
                        {TIPOS_DOC[comprobante.tipo_doc as keyof typeof TIPOS_DOC] || comprobante.tipo_doc}
                      </TableCell>
                      <TableCell>{`${comprobante.serie}-${comprobante.correlativo}`}</TableCell>
                      <TableCell>{new Date(comprobante.fecha_emision).toLocaleDateString()}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {comprobante.cliente_razon_social}
                      </TableCell>
                      <TableCell>{comprobante.cliente_num_doc}</TableCell>
                      <TableCell className="text-right">
                        {comprobante.moneda === 'PEN' ? 'S/ ' : '$ '}
                        {comprobante.mto_imp_venta?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {comprobante.anulado ? (
                          <Badge variant="secondary">Anulado</Badge>
                        ) : comprobante.nubefact_aceptada_por_sunat ? (
                          <Badge variant="default" className="bg-green-500">
                            Aceptado
                          </Badge>
                        ) : comprobante.estado_sunat === 'rechazado' ? (
                          <Badge variant="destructive">Rechazado</Badge>
                        ) : (
                          <Badge variant="outline">Pendiente</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {comprobante.nubefact_pdf_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a href={comprobante.nubefact_pdf_url} target="_blank" rel="noopener noreferrer">
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
                              <a href={comprobante.nubefact_xml_url} download>
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleConsultar(comprobante)}
                            disabled={consultando === comprobante.id}
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
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
