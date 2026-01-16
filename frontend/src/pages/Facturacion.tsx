import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Send, FileText, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api, apiBaseUrl, type Empresa, type EmisionFacturaPayload, type ComprobanteEmitido } from '@/lib/api';

interface ItemForm {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

export default function Facturacion() {
  const { toast } = useToast();

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);

  const [comprobantes, setComprobantes] = useState<ComprobanteEmitido[]>([]);
  const [loadingComprobantes, setLoadingComprobantes] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [ultimaPagina, setUltimaPagina] = useState(1);
  const [filtroEmpresaListado, setFiltroEmpresaListado] = useState<string>('all');
  const [filtroEstado, setFiltroEstado] = useState<string>('all');
  const [filtroNumero, setFiltroNumero] = useState('');

  const [empresaId, setEmpresaId] = useState<string>('');
  const [tipoComprobante, setTipoComprobante] = useState<'factura' | 'boleta'>('factura');
  const [tipoDocCliente, setTipoDocCliente] = useState<'6' | '1'>('6');
  const [numDocCliente, setNumDocCliente] = useState('');
  const [razonSocialCliente, setRazonSocialCliente] = useState('');
  const [direccionCliente, setDireccionCliente] = useState('');
  const [emailCliente, setEmailCliente] = useState('');
  const [moneda, setMoneda] = useState<'PEN' | 'USD' | 'EUR'>('PEN');

  const [items, setItems] = useState<ItemForm[]>([{
    descripcion: '',
    cantidad: 1,
    precioUnitario: 0,
  }]);

  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const cargarEmpresas = async () => {
      try {
        const response = await api.empresas.listar({ per_page: 100 });
        setEmpresas(response.data.data);
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

    cargarEmpresas();
  }, [toast]);

  const cargarComprobantes = async (page = 1) => {
    try {
      setLoadingComprobantes(true);

      const response = await api.facturacion.listarComprobantes({
        page,
        per_page: 10,
        empresa_id: filtroEmpresaListado === 'all' ? undefined : filtroEmpresaListado,
        estado_sunat: filtroEstado === 'all' ? undefined : filtroEstado,
        numero: filtroNumero || undefined,
      });

      setComprobantes(response.data.data);
      setPagina(response.data.current_page);
      setUltimaPagina(response.data.last_page);
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los comprobantes',
        variant: 'destructive',
      });
    } finally {
      setLoadingComprobantes(false);
    }
  };

  useEffect(() => {
    cargarComprobantes(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Ajustar tipo de documento permitido según tipo de comprobante
    if (tipoComprobante === 'factura') {
      setTipoDocCliente('6');
    }
  }, [tipoComprobante]);

  const total = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.cantidad || 0) * (item.precioUnitario || 0), 0);
  }, [items]);

  const handleItemChange = (index: number, field: keyof ItemForm, value: string) => {
    setItems((prev) => {
      const next = [...prev];
      if (field === 'cantidad' || field === 'precioUnitario') {
        next[index][field] = Number(value) || 0;
      } else if (field === 'descripcion') {
        next[index].descripcion = value;
      }
      return next;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { descripcion: '', cantidad: 1, precioUnitario: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!empresaId) {
      toast({
        title: 'Empresa requerida',
        description: 'Seleccione la empresa emisora',
        variant: 'destructive',
      });
      return;
    }

    if (!numDocCliente || !razonSocialCliente) {
      toast({
        title: 'Datos del cliente incompletos',
        description: 'Ingrese al menos documento y razón social del cliente',
        variant: 'destructive',
      });
      return;
    }

    if (items.length === 0 || items.some((i) => !i.descripcion || i.cantidad <= 0 || i.precioUnitario < 0)) {
      toast({
        title: 'Detalle inválido',
        description: 'Agregue al menos un ítem con descripción, cantidad y precio válidos',
        variant: 'destructive',
      });
      return;
    }

    if (total <= 0) {
      toast({
        title: 'Total inválido',
        description: 'El total debe ser mayor a cero',
        variant: 'destructive',
      });
      return;
    }

    const payload: EmisionFacturaPayload = {
      empresa_id: Number(empresaId),
      tipoMoneda: moneda,
      client: {
        tipoDoc: tipoComprobante === 'factura' ? '6' : tipoDocCliente,
        numDoc: numDocCliente,
        rznSocial: razonSocialCliente,
        address: direccionCliente ? { direccion: direccionCliente } : undefined,
        email: emailCliente || undefined,
      },
      details: items.map((item) => ({
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        mtoValorUnitario: item.precioUnitario,
      })),
      mtoImpVenta: Number(total.toFixed(2)),
    };

    try {
      setEnviando(true);

      const fn = tipoComprobante === 'factura'
        ? api.facturacion.emitirFactura
        : api.facturacion.emitirBoleta;

      const response = await fn(payload);

      if (response.data.success) {
        const comp = response.data.comprobante;
        toast({
          title: 'Comprobante emitido',
          description: `Número ${comp.serie}-${comp.correlativo} por S/ ${Number(comp.mto_imp_venta ?? 0).toFixed(2)}`,
        });
      } else {
        toast({
          title: 'Error al emitir',
          description: 'La SUNAT devolvió un error al emitir el comprobante',
          variant: 'destructive',
        });
      }
    } catch (error: unknown) {
      let description = 'No se pudo emitir el comprobante';

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
    } finally {
      setEnviando(false);
    }
  };

  const abrirDescarga = (id: number, tipo: 'xml' | 'cdr' | 'pdf') => {
    if (!apiBaseUrl) return;
    const url = `${apiBaseUrl}/facturacion/descargar/${tipo}/${id}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Emisión de Comprobantes</h1>
        <p className="text-muted-foreground">
          Emite facturas y boletas electrónicas utilizando las empresas configuradas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del comprobante</CardTitle>
          <CardDescription>
            Complete la información mínima requerida por SUNAT para emitir el comprobante.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="empresa">Empresa emisora *</Label>
                <Select
                  value={empresaId}
                  onValueChange={setEmpresaId}
                  disabled={loadingEmpresas}
                >
                  <SelectTrigger id="empresa">
                    <SelectValue placeholder={loadingEmpresas ? 'Cargando empresas...' : 'Seleccione empresa'} />
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
                <Label htmlFor="tipo">Tipo de comprobante *</Label>
                <Select
                  value={tipoComprobante}
                  onValueChange={(v: 'factura' | 'boleta') => setTipoComprobante(v)}
                >
                  <SelectTrigger id="tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="factura">Factura (01)</SelectItem>
                    <SelectItem value="boleta">Boleta (03)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <h3 className="font-semibold">Datos del cliente</h3>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoDocCliente">Tipo Doc.</Label>
                  <Select
                    value={tipoDocCliente}
                    onValueChange={(v: '6' | '1') => setTipoDocCliente(v)}
                    disabled={tipoComprobante === 'factura'}
                  >
                    <SelectTrigger id="tipoDocCliente">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">RUC</SelectItem>
                      <SelectItem value="1">DNI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numDocCliente">N° Documento *</Label>
                  <Input
                    id="numDocCliente"
                    value={numDocCliente}
                    onChange={(e) => setNumDocCliente(e.target.value)}
                    placeholder={tipoDocCliente === '6' ? '20123456789' : '12345678'}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="razonSocialCliente">Razón social / Nombre *</Label>
                  <Input
                    id="razonSocialCliente"
                    value={razonSocialCliente}
                    onChange={(e) => setRazonSocialCliente(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="direccionCliente">Dirección</Label>
                  <Input
                    id="direccionCliente"
                    value={direccionCliente}
                    onChange={(e) => setDireccionCliente(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailCliente">Email</Label>
                  <Input
                    id="emailCliente"
                    type="email"
                    value={emailCliente}
                    onChange={(e) => setEmailCliente(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Detalle de ítems</h3>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" /> Agregar ítem
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="grid gap-2 md:grid-cols-6 items-start border rounded-lg p-3"
                  >
                    <div className="md:col-span-3 space-y-1">
                      <Label>Descripción</Label>
                      <Input
                        value={item.descripcion}
                        onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                        placeholder="Descripción del servicio o producto"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        value={item.cantidad}
                        onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Precio unitario</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.precioUnitario}
                        onChange={(e) => handleItemChange(index, 'precioUnitario', e.target.value)}
                      />
                    </div>

                    <div className="space-y-1 flex flex-col items-end justify-between">
                      <div>
                        <Label>Total línea</Label>
                        <div className="font-mono text-sm">
                          {((item.cantidad || 0) * (item.precioUnitario || 0)).toFixed(2)}
                        </div>
                      </div>

                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          className="mt-1"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <Label htmlFor="moneda">Moneda</Label>
                <Select value={moneda} onValueChange={(v: 'PEN' | 'USD' | 'EUR') => setMoneda(v)}>
                  <SelectTrigger id="moneda" className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PEN">Soles (PEN)</SelectItem>
                    <SelectItem value="USD">Dólares (USD)</SelectItem>
                    <SelectItem value="EUR">Euros (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Total a pagar</div>
                  <div className="text-2xl font-semibold font-mono">
                    {moneda === 'PEN' ? 'S/ ' : moneda === 'USD' ? '$ ' : '€ '}
                    {total.toFixed(2)}
                  </div>
                </div>

                <Button type="submit" className="sm:ml-4" disabled={enviando}>
                  <Send className="h-4 w-4 mr-2" />
                  {enviando ? 'Enviando...' : 'Emitir comprobante'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comprobantes emitidos</CardTitle>
          <CardDescription>
            Lista de comprobantes enviados a SUNAT con sus estados y accesos a XML, CDR y PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1">
              <Label>Empresa</Label>
              <Select
                value={filtroEmpresaListado}
                onValueChange={setFiltroEmpresaListado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
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
              <Label>Estado SUNAT</Label>
              <Select
                value={filtroEstado}
                onValueChange={setFiltroEstado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="aceptado">Aceptado</SelectItem>
                  <SelectItem value="rechazado">Rechazado</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label>Número o cliente</Label>
              <Input
                placeholder="Buscar por número (F001-000001) o cliente"
                value={filtroNumero}
                onChange={(e) => setFiltroNumero(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => cargarComprobantes(1)}
              disabled={loadingComprobantes}
            >
              Actualizar lista
            </Button>
          </div>

          {loadingComprobantes ? (
            <div className="py-6 text-center text-muted-foreground">
              Cargando comprobantes...
            </div>
          ) : comprobantes.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              No se encontraron comprobantes con los filtros seleccionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-4">Fecha</th>
                    <th className="py-2 pr-4">Comprobante</th>
                    <th className="py-2 pr-4">Cliente</th>
                    <th className="py-2 pr-4 text-right">Total</th>
                    <th className="py-2 pr-4">Estado SUNAT</th>
                    <th className="py-2 pr-0 text-right">Archivos</th>
                  </tr>
                </thead>
                <tbody>
                  {comprobantes.map((c) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {new Date(c.fecha_emision).toLocaleDateString()}
                      </td>
                      <td className="py-2 pr-4 whitespace-nowrap">
                        <div className="font-mono text-xs">
                          {c.serie}-{c.correlativo}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {c.tipo_doc === '01' ? 'Factura' : c.tipo_doc === '03' ? 'Boleta' : c.tipo_doc}
                        </div>
                      </td>
                      <td className="py-2 pr-4 max-w-55">
                        <div className="truncate" title={c.cliente_razon_social}>
                          {c.cliente_razon_social}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {c.cliente_num_doc}
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-right font-mono">
                        {c.moneda === 'PEN' ? 'S/ ' : c.moneda === 'USD' ? '$ ' : '€ '}
                        {Number(c.mto_imp_venta ?? 0).toFixed(2)}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            c.estado_sunat === 'aceptado'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                              : c.estado_sunat === 'rechazado'
                              ? 'bg-red-500/10 text-red-600 dark:text-red-300'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-300'
                          }`}
                        >
                          {c.estado_sunat}
                        </span>
                      </td>
                      <td className="py-2 pr-0 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            disabled={!c.xml_path}
                            onClick={() => abrirDescarga(c.id, 'xml')}
                            title="Descargar XML"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            disabled={!c.cdr_path}
                            onClick={() => abrirDescarga(c.id, 'cdr')}
                            title="Descargar CDR"
                          >
                            <FileDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            disabled={!c.pdf_path}
                            onClick={() => abrirDescarga(c.id, 'pdf')}
                            title="Descargar PDF"
                          >
                            <FileText className="h-4 w-4" />
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
                disabled={pagina <= 1 || loadingComprobantes}
                onClick={() => cargarComprobantes(pagina - 1)}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pagina >= ultimaPagina || loadingComprobantes}
                onClick={() => cargarComprobantes(pagina + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
