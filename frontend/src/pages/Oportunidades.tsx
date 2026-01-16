import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { api, type Empresa, type Oportunidad, type EstadoOportunidad } from '@/lib/api';

interface Filtros {
  empresa_id: string;
  estado: string;
  search: string;
}

interface FormState {
  empresa_id: string;
  area: string;
  tipo_operacion: string;
  estado: EstadoOportunidad;
  responsable_id: string;
  cliente_nombre: string;
  cliente_ruc: string;
  descripcion: string;
  monto_estimado: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  probabilidad: string;
  notas: string;
}

const ESTADOS: { value: EstadoOportunidad; label: string }[] = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'enviado', label: 'Enviado a cliente' },
  { value: 'observado', label: 'Observado' },
  { value: 'ganado', label: 'Ganado' },
  { value: 'perdido', label: 'Perdido' },
  { value: 'cancelado', label: 'Cancelado' },
];

export default function Oportunidades() {
  const { toast } = useToast();

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);

  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [ultimaPagina, setUltimaPagina] = useState(1);

  const [filtros, setFiltros] = useState<Filtros>({ empresa_id: 'all', estado: 'all', search: '' });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Oportunidad | null>(null);
  const [form, setForm] = useState<FormState>({
    empresa_id: '',
    area: '',
    tipo_operacion: '',
    estado: 'nuevo',
    responsable_id: '',
    cliente_nombre: '',
    cliente_ruc: '',
    descripcion: '',
    monto_estimado: '',
    fecha_inicio: new Date().toISOString().slice(0, 10),
    fecha_vencimiento: '',
    probabilidad: '',
    notas: '',
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

  const cargarOportunidades = async (page = 1) => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = {
        page,
        per_page: 10,
      };

      if (filtros.empresa_id !== 'all' && filtros.empresa_id) {
        params.empresa_id = filtros.empresa_id;
      }
      if (filtros.estado !== 'all' && filtros.estado) {
        params.estado = filtros.estado;
      }
      if (filtros.search) {
        params.cliente_nombre = filtros.search;
      }

      const res = await api.oportunidades.listar(params);
      setOportunidades(res.data.data);
      setPagina(res.data.current_page);
      setUltimaPagina(res.data.last_page);
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las oportunidades',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEmpresas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    cargarOportunidades(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.empresa_id, filtros.estado]);

  const resetForm = () => {
    setForm({
      empresa_id: '',
      area: '',
      tipo_operacion: '',
      estado: 'nuevo',
      responsable_id: '',
      cliente_nombre: '',
      cliente_ruc: '',
      descripcion: '',
      monto_estimado: '',
      fecha_inicio: new Date().toISOString().slice(0, 10),
      fecha_vencimiento: '',
      probabilidad: '',
      notas: '',
    });
    setEditando(null);
  };

  const abrirCrear = () => {
    resetForm();
    setDialogOpen(true);
  };

  const abrirEditar = (o: Oportunidad) => {
    setEditando(o);
    setForm({
      empresa_id: String(o.empresa_id),
      area: o.area ?? '',
      tipo_operacion: o.tipo_operacion ?? '',
      estado: o.estado,
      responsable_id: o.responsable_id ? String(o.responsable_id) : '',
      cliente_nombre: o.cliente_nombre ?? '',
      cliente_ruc: o.cliente_ruc ?? '',
      descripcion: o.descripcion ?? '',
      monto_estimado: o.monto_estimado != null ? String(o.monto_estimado) : '',
      fecha_inicio: o.fecha_inicio?.slice(0, 10) ?? '',
      fecha_vencimiento: o.fecha_vencimiento?.slice(0, 10) ?? '',
      probabilidad: o.probabilidad != null ? String(o.probabilidad) : '',
      notas: o.notas ?? '',
    });
    setDialogOpen(true);
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.empresa_id || !form.area || !form.tipo_operacion || !form.cliente_nombre) {
      toast({
        title: 'Datos incompletos',
        description: 'Empresa, área, tipo de operación y cliente son obligatorios',
        variant: 'destructive',
      });
      return;
    }

    const payload: Partial<Oportunidad> = {
      empresa_id: Number(form.empresa_id),
      area: form.area,
      tipo_operacion: form.tipo_operacion,
      estado: form.estado,
      responsable_id: form.responsable_id ? Number(form.responsable_id) : null,
      cliente_nombre: form.cliente_nombre,
      cliente_ruc: form.cliente_ruc || null,
      descripcion: form.descripcion || null,
      monto_estimado: form.monto_estimado ? Number(form.monto_estimado) : null,
      fecha_inicio: form.fecha_inicio,
      fecha_vencimiento: form.fecha_vencimiento || null,
      probabilidad: form.probabilidad ? Number(form.probabilidad) : null,
      notas: form.notas || null,
    };

    try {
      if (editando) {
        await api.oportunidades.actualizar(editando.id, payload);
        toast({ title: 'Oportunidad actualizada' });
      } else {
        await api.oportunidades.crear(payload);
        toast({ title: 'Oportunidad creada' });
      }

      setDialogOpen(false);
      resetForm();
      cargarOportunidades(pagina);
    } catch (error) {
      let description = 'No se pudo guardar la oportunidad';

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

  const handleDelete = async (o: Oportunidad) => {
    if (!window.confirm('¿Eliminar esta oportunidad?')) return;

    try {
      await api.oportunidades.eliminar(o.id);
      toast({ title: 'Oportunidad eliminada' });
      cargarOportunidades(pagina);
    } catch (error) {
      let description = 'No se pudo eliminar la oportunidad';

      if (error && typeof error === 'object' && 'response' in error) {
        type ErrorResponseData = {
          message?: string;
          errors?: Record<string, string[] | string>;
        };

        const err = error as { response?: { data?: ErrorResponseData } };
        const data = err.response?.data;

        if (data?.message) {
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

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Oportunidades</h1>
        <p className="text-muted-foreground">
          Gestiona oportunidades comerciales asociadas a las empresas emisoras.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Listado</CardTitle>
            <CardDescription>
              Filtra, crea y actualiza oportunidades.
            </CardDescription>
          </div>
          <Button onClick={abrirCrear}>Nueva oportunidad</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
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
              <Label>Estado</Label>
              <Select
                value={filtros.estado}
                onValueChange={(v) => setFiltros((prev) => ({ ...prev, estado: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {ESTADOS.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label>Buscar</Label>
              <Input
                placeholder="Buscar por cliente o descripción"
                value={filtros.search}
                onChange={(e) => setFiltros((prev) => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>

          {loading ? (
            <div className="py-6 text-center text-muted-foreground">Cargando oportunidades...</div>
          ) : oportunidades.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              No se encontraron oportunidades con los filtros seleccionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-4">Fecha inicio</th>
                    <th className="py-2 pr-4">Empresa</th>
                    <th className="py-2 pr-4">Cliente</th>
                    <th className="py-2 pr-4">Área</th>
                    <th className="py-2 pr-4">Estado</th>
                    <th className="py-2 pr-4 text-right">Monto estimado</th>
                    <th className="py-2 pr-0 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {oportunidades.map((o) => (
                    <tr key={o.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {new Date(o.fecha_inicio).toLocaleDateString()}
                      </td>
                      <td className="py-2 pr-4 max-w-55">
                        <div className="truncate" title={o.empresa?.razon_social}>
                          {o.empresa?.razon_social ?? 'Sin empresa'}
                        </div>
                      </td>
                      <td className="py-2 pr-4 max-w-55">
                        <div className="truncate" title={o.cliente_nombre}>
                          {o.cliente_nombre}
                        </div>
                        {o.cliente_ruc && (
                          <div className="text-xs text-muted-foreground font-mono">{o.cliente_ruc}</div>
                        )}
                      </td>
                      <td className="py-2 pr-4 whitespace-nowrap">{o.area}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-500/10 text-slate-700 dark:text-slate-200">
                          {o.estado}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-right font-mono">
                        {o.monto_estimado != null ? `S/ ${Number(o.monto_estimado).toFixed(2)}` : '-'}
                      </td>
                      <td className="py-2 pr-0 text-right">
                        <div className="inline-flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => abrirEditar(o)}>
                            Editar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(o)}>
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground">
            <div>
              Página {pagina} de {ultimaPagina}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pagina <= 1 || loading}
                onClick={() => cargarOportunidades(pagina - 1)}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pagina >= ultimaPagina || loading}
                onClick={() => cargarOportunidades(pagina + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar oportunidad' : 'Nueva oportunidad'}</DialogTitle>
            <DialogDescription>
              Completa los datos básicos de la oportunidad.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Empresa *</Label>
                <Select
                  value={form.empresa_id}
                  onValueChange={(v) => handleChange('empresa_id', v)}
                  disabled={loadingEmpresas}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingEmpresas ? 'Cargando empresas...' : 'Seleccione empresa'} />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((e) => (
                      <SelectItem key={e.id} value={String(e.id)}>
                        {e.razon_social}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Estado *</Label>
                <Select value={form.estado} onValueChange={(v: EstadoOportunidad) => handleChange('estado', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Área *</Label>
                <Input
                  value={form.area}
                  onChange={(e) => handleChange('area', e.target.value)}
                  placeholder="Ventas, Soporte, etc."
                />
              </div>
              <div className="space-y-1">
                <Label>Tipo de operación *</Label>
                <Input
                  value={form.tipo_operacion}
                  onChange={(e) => handleChange('tipo_operacion', e.target.value)}
                  placeholder="Implementación, mantenimiento, etc."
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Cliente *</Label>
                <Input
                  value={form.cliente_nombre}
                  onChange={(e) => handleChange('cliente_nombre', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>RUC cliente</Label>
                <Input
                  value={form.cliente_ruc}
                  onChange={(e) => handleChange('cliente_ruc', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <Label>Monto estimado</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.monto_estimado}
                  onChange={(e) => handleChange('monto_estimado', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Fecha inicio *</Label>
                <Input
                  type="date"
                  value={form.fecha_inicio}
                  onChange={(e) => handleChange('fecha_inicio', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Fecha vencimiento</Label>
                <Input
                  type="date"
                  value={form.fecha_vencimiento}
                  onChange={(e) => handleChange('fecha_vencimiento', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <Label>Probabilidad (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.probabilidad}
                  onChange={(e) => handleChange('probabilidad', e.target.value)}
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Notas</Label>
                <Input
                  value={form.notas}
                  onChange={(e) => handleChange('notas', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Descripción</Label>
              <Input
                value={form.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
