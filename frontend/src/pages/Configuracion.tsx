import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { api, type Empresa, type Serie } from '@/lib/api';
import { Settings2, Plus, Edit2, Trash2 } from 'lucide-react';

const TIPOS_COMPROBANTE = [
  { value: '01', label: 'Factura (01)' },
  { value: '03', label: 'Boleta (03)' },
  { value: '07', label: 'Nota de crédito (07)' },
  { value: '08', label: 'Nota de débito (08)' },
  { value: '09', label: 'Guía de remisión (09)' },
];

interface FiltrosSeries {
  empresa_id: string;
  tipo_comprobante: string;
}

interface FormSerieState {
  empresa_id: string;
  tipo_comprobante: string;
  serie: string;
  correlativo_actual: string;
  activo: boolean;
  por_defecto: boolean;
}

export default function Configuracion() {
  const { toast } = useToast();

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);

  const [series, setSeries] = useState<Serie[]>([]);
  const [loadingSeries, setLoadingSeries] = useState(true);

  const [filtros, setFiltros] = useState<FiltrosSeries>({ empresa_id: 'all', tipo_comprobante: 'all' });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Serie | null>(null);
  const [form, setForm] = useState<FormSerieState>({
    empresa_id: '',
    tipo_comprobante: '',
    serie: '',
    correlativo_actual: '0',
    activo: true,
    por_defecto: false,
  });

  const cargarEmpresas = async () => {
    try {
      const res = await api.empresas.listar({ per_page: 100 });
      setEmpresas(res.data.data);
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las empresas',
        variant: 'destructive',
      });
    } finally {
      setLoadingEmpresas(false);
    }
  };

  const cargarSeries = async () => {
    try {
      setLoadingSeries(true);
      const params: Record<string, unknown> = {};
      if (filtros.empresa_id !== 'all' && filtros.empresa_id) {
        params.empresa_id = filtros.empresa_id;
      }
      if (filtros.tipo_comprobante !== 'all' && filtros.tipo_comprobante) {
        params.tipo_comprobante = filtros.tipo_comprobante;
      }

      const res = await api.series.listar(params);
      setSeries(res.data.data);
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las series',
        variant: 'destructive',
      });
    } finally {
      setLoadingSeries(false);
    }
  };

  useEffect(() => {
    cargarEmpresas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    cargarSeries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.empresa_id, filtros.tipo_comprobante]);

  const resetForm = () => {
    setForm({
      empresa_id: '',
      tipo_comprobante: '',
      serie: '',
      correlativo_actual: '0',
      activo: true,
      por_defecto: false,
    });
    setEditando(null);
  };

  const abrirEditar = (s: Serie) => {
    setEditando(s);
    setForm({
      empresa_id: String(s.empresa_id),
      tipo_comprobante: s.tipo_comprobante,
      serie: s.serie,
      correlativo_actual: String(s.correlativo_actual ?? 0),
      activo: s.activo,
      por_defecto: s.por_defecto,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.empresa_id || !form.tipo_comprobante || !form.serie) {
      toast({
        title: 'Datos incompletos',
        description: 'Empresa, tipo de comprobante y serie son obligatorios',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      empresa_id: Number(form.empresa_id),
      tipo_comprobante: form.tipo_comprobante,
      serie: form.serie.trim(),
      correlativo_actual: Number(form.correlativo_actual) || 0,
      activo: form.activo,
      por_defecto: form.por_defecto,
    };

    try {
      if (editando) {
        await api.series.actualizar(editando.id, payload);
        toast({ title: 'Serie actualizada' });
      } else {
        await api.series.crear(payload);
        toast({ title: 'Serie creada' });
      }

      setDialogOpen(false);
      resetForm();
      cargarSeries();
    } catch (error) {
      let description = 'No se pudo guardar la serie';

      if (error && typeof error === 'object' && 'response' in error) {
        type ErrorResponseData = {
          message?: string;
          errors?: Record<string, string[] | string>;
        };

        const err = error as { response?: { data?: ErrorResponseData } };
        const data = err.response?.data;

        if (data?.errors) {
          description = 'Revise los datos, hay errores de validación';
        } else if (data?.message) {
          description = data.message;
        }
      }

      toast({
        title: 'Error',
        description,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (s: Serie) => {
    if (!window.confirm('¿Eliminar esta serie?')) return;

    try {
      await api.series.eliminar(s.id);
      toast({ title: 'Serie eliminada' });
      cargarSeries();
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la serie',
        variant: 'destructive',
      });
    }
  };

  const seriesFiltradas = useMemo(() => {
    return series;
  }, [series]);

  const nombreEmpresa = (id: number) => {
    const emp = empresas.find((e) => e.id === id);
    return emp ? `${emp.razon_social} (${emp.ruc})` : `Empresa #${id}`;
  };

  const etiquetaTipo = (codigo: string) => {
    return TIPOS_COMPROBANTE.find((t) => t.value === codigo)?.label ?? codigo;
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings2 className="w-6 h-6" />
          Configuración de facturación
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Administra las series y numeración de comprobantes por empresa, alineado con la configuración de SUNAT.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Series de comprobantes</CardTitle>
            <CardDescription>
              Define las series por empresa y tipo de comprobante, marcando la serie por defecto para cada caso.
            </CardDescription>
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva serie
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editando ? 'Editar serie' : 'Nueva serie'}</DialogTitle>
                <DialogDescription>
                  Configure la serie y numeración inicial para los comprobantes.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Empresa *</Label>
                    <Select
                      value={form.empresa_id}
                      onValueChange={(v) => setForm((prev) => ({ ...prev, empresa_id: v }))}
                      disabled={!!editando || loadingEmpresas}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingEmpresas ? 'Cargando...' : 'Seleccione empresa'} />
                      </SelectTrigger>
                      <SelectContent>
                        {empresas.map((e) => (
                          <SelectItem key={e.id} value={String(e.id)}>
                            {e.razon_social} ({e.ruc})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de comprobante *</Label>
                    <Select
                      value={form.tipo_comprobante}
                      onValueChange={(v) => setForm((prev) => ({ ...prev, tipo_comprobante: v }))}
                      disabled={!!editando}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_COMPROBANTE.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Serie *</Label>
                    <Input
                      value={form.serie}
                      onChange={(e) => setForm((prev) => ({ ...prev, serie: e.target.value.toUpperCase() }))}
                      maxLength={10}
                      placeholder="F001, B001, T001..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Correlativo actual</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.correlativo_actual}
                      onChange={(e) => setForm((prev) => ({ ...prev, correlativo_actual: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2 flex items-center justify-between md:justify-start gap-4">
                    <div className="space-y-1">
                      <Label>Activa</Label>
                      <p className="text-xs text-muted-foreground">La serie se podrá usar en emisión.</p>
                    </div>
                    <Switch
                      checked={form.activo}
                      onCheckedChange={(checked) => setForm((prev) => ({ ...prev, activo: checked }))}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.por_defecto}
                      onCheckedChange={(checked) => setForm((prev) => ({ ...prev, por_defecto: checked }))}
                    />
                    <div>
                      <Label>Serie por defecto</Label>
                      <p className="text-xs text-muted-foreground">
                        Se usará como serie principal para esta empresa y tipo.
                      </p>
                    </div>
                  </div>
                  <Button type="submit">{editando ? 'Guardar cambios' : 'Crear serie'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label>Empresa</Label>
              <Select
                value={filtros.empresa_id}
                onValueChange={(v) => setFiltros((prev) => ({ ...prev, empresa_id: v }))}
                disabled={loadingEmpresas}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingEmpresas ? 'Cargando empresas...' : 'Todas'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {empresas.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.razon_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Tipo de comprobante</Label>
              <Select
                value={filtros.tipo_comprobante}
                onValueChange={(v) => setFiltros((prev) => ({ ...prev, tipo_comprobante: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {TIPOS_COMPROBANTE.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Serie</TableHead>
                  <TableHead className="text-right">Correlativo</TableHead>
                  <TableHead>Por defecto</TableHead>
                  <TableHead>Activa</TableHead>
                  <TableHead className="w-[120px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingSeries ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      Cargando series...
                    </TableCell>
                  </TableRow>
                ) : seriesFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No hay series configuradas con los filtros actuales.
                    </TableCell>
                  </TableRow>
                ) : (
                  seriesFiltradas.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{nombreEmpresa(s.empresa_id)}</TableCell>
                      <TableCell>{etiquetaTipo(s.tipo_comprobante)}</TableCell>
                      <TableCell>{s.serie}</TableCell>
                      <TableCell className="text-right">{s.correlativo_actual}</TableCell>
                      <TableCell>{s.por_defecto ? 'Sí' : 'No'}</TableCell>
                      <TableCell>{s.activo ? 'Sí' : 'No'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => abrirEditar(s)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(s)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableCaption>
                Recuerde definir al menos una serie por defecto por empresa y tipo de comprobante.
              </TableCaption>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
