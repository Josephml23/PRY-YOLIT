import { useEffect, useMemo, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { DollarSign, Trash2, Download, CreditCard } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { toast } from 'sonner';
import { api, type Pago } from '@/lib/api';

interface FiltrosPagos {
  medio_pago: string;
  fecha_desde: string;
  fecha_hasta: string;
}

const MEDIOS_PAGO = [
  { value: 'all', label: 'Todos los medios' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia bancaria' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'deposito', label: 'Depósito bancario' },
  { value: 'tarjeta', label: 'Tarjeta de crédito/débito' },
  { value: 'otro', label: 'Otro' },
];

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [ultimaPagina, setUltimaPagina] = useState(1);
  const [filtros, setFiltros] = useState<FiltrosPagos>({
    medio_pago: 'all',
    fecha_desde: '',
    fecha_hasta: '',
  });

  const [stats, setStats] = useState<{
    total_pagos: number;
    monto_total: number;
    por_medio_pago: Record<string, { cantidad: number; total: number }>;
  } | null>(null);

  // Vercel Critical: Load data and stats in parallel to eliminate waterfall
  const cargarDatos = async (page = 1) => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = {
        page,
        per_page: 15,
      };

      if (filtros.medio_pago !== 'all' && filtros.medio_pago) {
        params.medio_pago = filtros.medio_pago;
      }
      if (filtros.fecha_desde) {
        params.fecha_desde = filtros.fecha_desde;
      }
      if (filtros.fecha_hasta) {
        params.fecha_hasta = filtros.fecha_hasta;
      }

      const statsParams: Record<string, unknown> = {};
      if (filtros.fecha_desde) {
        statsParams.fecha_desde = filtros.fecha_desde;
      }
      if (filtros.fecha_hasta) {
        statsParams.fecha_hasta = filtros.fecha_hasta;
      }

      // Parallel fetch: pagos + stats
      const [pagosRes, statsRes] = await Promise.all([
        api.pagos.listar(params),
        api.pagos.estadisticas(statsParams).catch(() => null) // Don't block on stats error
      ]);

      setPagos(pagosRes.data.data);
      setPagina(pagosRes.data.current_page);
      setUltimaPagina(pagosRes.data.last_page);
      
      if (statsRes) {
        setStats(statsRes.data.data);
      }
    } catch {
      toast.error('No se pudieron cargar los pagos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.medio_pago, filtros.fecha_desde, filtros.fecha_hasta]);

  const totalPagina = useMemo(
    () => pagos.reduce((sum, p) => sum + Number(p.monto ?? 0), 0),
    [pagos],
  );

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este pago?')) return;

    try {
      await api.pagos.eliminar(id);
      toast.success('Pago eliminado');
      cargarDatos(pagina);
    } catch {
      toast.error('Error al eliminar el pago');
    }
  };

  const handleDescargarComprobante = async (pago: Pago) => {
    try {
      const response = await api.pagos.descargarComprobante(pago.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `comprobante_pago_${pago.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('No se pudo descargar el comprobante de pago');
    }
  };

  const handlePaginaAnterior = () => {
    if (pagina > 1) {
      const nueva = pagina - 1;
      setPagina(nueva);
      cargarDatos(nueva);
    }
  };

  const handlePaginaSiguiente = () => {
    if (pagina < ultimaPagina) {
      const nueva = pagina + 1;
      setPagina(nueva);
      cargarDatos(nueva);
    }
  };

  const formatMonto = (monto: number | null | undefined) => {
    const val = Number(monto ?? 0);
    return val.toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const labelMedio = (value: string) => {
    return (
      MEDIOS_PAGO.find((m) => m.value.toLowerCase() === value.toLowerCase())?.label || value
    );
  };

  const columnCount = 6;

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      <PageHeader
        title="Pagos"
        description="Vista global de los pagos registrados en las oportunidades y comprobantes."
      />

      {/* Resumen */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de pagos</CardTitle>
          <CardDescription>
            Totales en el rango de fechas seleccionado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total de pagos</p>
              <p className="text-2xl font-bold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-success" />
                {stats ? stats.total_pagos : '-'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Monto total (S/)</p>
              <p className="text-2xl font-bold text-foreground">
                {stats ? `S/ ${formatMonto(stats.monto_total)}` : '-'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total en página actual</p>
              <p className="text-2xl font-bold text-foreground">
                S/ {formatMonto(totalPagina)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Refine la lista por medio de pago y rango de fechas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Medio de pago</Label>
              <Select
                value={filtros.medio_pago}
                onValueChange={(value) => setFiltros((prev) => ({ ...prev, medio_pago: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un medio" />
                </SelectTrigger>
                <SelectContent>
                  {MEDIOS_PAGO.map((medio) => (
                    <SelectItem key={medio.value} value={medio.value}>
                      {medio.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Desde</Label>
              <Input
                type="date"
                value={filtros.fecha_desde}
                onChange={(e) => setFiltros((prev) => ({ ...prev, fecha_desde: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Hasta</Label>
              <Input
                type="date"
                value={filtros.fecha_hasta}
                onChange={(e) => setFiltros((prev) => ({ ...prev, fecha_hasta: e.target.value }))}
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() =>
                  setFiltros({ medio_pago: 'all', fecha_desde: '', fecha_hasta: '' })
                }
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="overflow-x-auto">
              <TableSkeleton columns={columnCount} rows={6} />
            </div>
          ) : pagos.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No se encontraron pagos"
              description="No hay pagos con los filtros actuales o aún no se han registrado pagos."
              className="py-12"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 border-b-2">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Medio</TableHead>
                  <TableHead>Oportunidad / Comprobante</TableHead>
                  <TableHead>Banco / Operación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagos.map((pago) => (
                    <TableRow key={pago.id}>
                      <TableCell>
                        {new Date(pago.fecha_pago).toLocaleDateString('es-PE', {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-foreground">
                          S/ {formatMonto(pago.monto)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {labelMedio(pago.medio_pago)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs max-w-65 truncate">
                        {pago.oportunidad?.cliente_nombre
                          ? pago.oportunidad.cliente_nombre
                          : pago.comprobante
                          ? `${pago.comprobante.tipo_doc} ${pago.comprobante.serie}-${pago.comprobante.numero}`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-xs max-w-50 truncate">
                        {pago.banco ? `${pago.banco} ` : ''}
                        {pago.nro_operacion ? `Op. ${pago.nro_operacion}` : ''}
                        {!pago.banco && !pago.nro_operacion && '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {pago.comprobante_path && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDescargarComprobante(pago)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEliminar(pago.id)}
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
