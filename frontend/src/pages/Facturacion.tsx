import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api, type Empresa, type EmisionFacturaPayload } from '@/lib/api';

interface ItemForm {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

export default function Facturacion() {
  const { toast } = useToast();

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);

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
          description: `Número ${comp.serie}-${comp.correlativo} por S/ ${comp.mto_imp_venta.toFixed(2)}`,
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
    </div>
  );
}
