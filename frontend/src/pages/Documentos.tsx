import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, type Documento } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/table-skeleton';

const TIPOS_DOCUMENTO = [
  { value: 'all', label: 'Todos los tipos' },
  { value: 'tdr', label: 'TDR - Términos de Referencia' },
  { value: 'oc', label: 'OC - Orden de Compra' },
  { value: 'siaf', label: 'SIAF - Comprobante SIAF' },
  { value: 'conformidad', label: 'Conformidad' },
  { value: 'entregable', label: 'Entregable' },
  { value: 'pago', label: 'Comprobante de Pago' },
  { value: 'contrato', label: 'Contrato' },
  { value: 'acta', label: 'Acta de Reunión' },
  { value: 'otro', label: 'Otro' },
];

interface FiltrosDocumentos {
  tipo: string;
  search: string;
}

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [ultimaPagina, setUltimaPagina] = useState(1);
  const [filtros, setFiltros] = useState<FiltrosDocumentos>({ tipo: 'all', search: '' });

  const cargarDocumentos = async (page = 1) => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = {
        page,
        per_page: 15,
      };

      if (filtros.tipo !== 'all' && filtros.tipo) {
        params.tipo = filtros.tipo;
      }

      const res = await api.documentos.listar(params);
      setDocumentos(res.data.data);
      setPagina(res.data.current_page);
      setUltimaPagina(res.data.last_page);
    } catch {
      toast.error('No se pudieron cargar los documentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDocumentos(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.tipo]);

  const handleSearchChange = (value: string) => {
    setFiltros((prev) => ({ ...prev, search: value }));
  };

  const documentosFiltrados = documentos.filter((doc) => {
    if (!filtros.search) return true;
    const term = filtros.search.toLowerCase();
    return (
      doc.nombre_archivo.toLowerCase().includes(term) ||
      (doc.descripcion ?? '').toLowerCase().includes(term) ||
      (doc.oportunidad?.cliente_nombre ?? '').toLowerCase().includes(term)
    );
  });

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1048576) {
      return (bytes / 1048576).toFixed(2) + ' MB';
    } else if (bytes >= 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    }
    return bytes + ' bytes';
  };

  const handleDescargar = async (doc: Documento) => {
    try {
      const response = await api.documentos.descargar(doc.id);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.nombre_archivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Documento descargado');
    } catch {
      toast.error('Error al descargar el documento');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este documento?')) return;

    try {
      await api.documentos.eliminar(id);
      toast.success('Documento eliminado');
      cargarDocumentos(pagina);
    } catch {
      toast.error('Error al eliminar el documento');
    }
  };

  const handlePaginaAnterior = () => {
    if (pagina > 1) {
      const nueva = pagina - 1;
      setPagina(nueva);
      cargarDocumentos(nueva);
    }
  };

  const handlePaginaSiguiente = () => {
    if (pagina < ultimaPagina) {
      const nueva = pagina + 1;
      setPagina(nueva);
      cargarDocumentos(nueva);
    }
  };

  const columnCount = 6;

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      <PageHeader
        title="Documentos"
        description="Vista global de todos los documentos adjuntos a las oportunidades."
      />

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Refine la lista de documentos por tipo y búsqueda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Tipo de documento</Label>
              <Select
                value={filtros.tipo}
                onValueChange={(value) => setFiltros((prev) => ({ ...prev, tipo: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_DOCUMENTO.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Búsqueda</Label>
              <Input
                placeholder="Buscar por nombre de archivo, descripción o cliente"
                value={filtros.search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="overflow-x-auto">
              <TableSkeleton columns={columnCount} rows={6} />
            </div>
          ) : documentosFiltrados.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No se encontraron documentos"
              description="No hay documentos con los filtros actuales o aún no se han subido documentos."
              className="py-12"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 border-b-2">
                  <TableHead>Archivo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Oportunidad</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentosFiltrados.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <div className="flex flex-col">
                            <span className="font-medium truncate max-w-65">
                              {doc.nombre_archivo}
                            </span>
                            {doc.descripcion && (
                              <span className="text-xs text-muted-foreground truncate max-w-65">
                                {doc.descripcion}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="uppercase text-xs">{doc.tipo}</TableCell>
                      <TableCell className="max-w-65 truncate text-xs">
                        {doc.oportunidad?.cliente_nombre ?? '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(doc.created_at).toLocaleDateString('es-PE')}
                      </TableCell>
                      <TableCell>{formatFileSize(doc.size)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDescargar(doc)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEliminar(doc.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          Página {pagina} de {ultimaPagina}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePaginaAnterior}
            disabled={pagina <= 1 || loading}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePaginaSiguiente}
            disabled={pagina >= ultimaPagina || loading}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
