import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { emitirComprobante, consultarComprobante, TIPOS_DOCUMENTO_SELECT, TIPOS_IGV_SELECT, MONEDAS_SELECT, UNIDADES_MEDIDA_SELECT } from '@/services/nubefact';
import { api, type Serie } from '@/lib/api';

// Catálogo 10 - Tipos de Nota de Débito
const TIPOS_NOTA_DEBITO = [
  { value: '01', label: '01 - Intereses por mora' },
  { value: '02', label: '02 - Aumento en el valor' },
  { value: '03', label: '03 - Penalidades/otros conceptos' },
  { value: '10', label: '10 - Ajustes de operaciones de exportación' },
  { value: '11', label: '11 - Ajustes afectos al IVAP' },
];

const itemSchema = z.object({
  codigo: z.string().min(1, 'Código requerido'),
  descripcion: z.string().min(1, 'Descripción requerida'),
  unidad_de_medida: z.string().min(1, 'Unidad requerida'),
  cantidad: z.string().min(1, 'Cantidad requerida'),
  valor_unitario: z.string().min(1, 'Valor unitario requerido'),
  precio_unitario: z.string().optional(),
  tipo_de_igv: z.string().min(1, 'Tipo IGV requerido'),
  igv: z.string().optional(),
  subtotal: z.string().optional(),
  total: z.string().optional(),
  codigo_producto_sunat: z.string().optional(),
});

const notaDebitoSchema = z.object({
  // Documento que se modifica
  documento_que_se_modifica_tipo: z.string().min(1, 'Tipo de documento requerido'),
  documento_que_se_modifica_serie: z.string().min(1, 'Serie requerida'),
  documento_que_se_modifica_numero: z.string().min(1, 'Número requerido'),
  tipo_de_nota_de_debito: z.string().min(1, 'Tipo de ND requerido'),
  
  // Serie y número de la ND
  serie: z.string().min(1, 'Serie requerida'),
  numero: z.string().min(1, 'Número requerido'),
  
  // Cliente
  cliente_tipo_de_documento: z.string().min(1, 'Tipo documento requerido'),
  cliente_numero_de_documento: z.string().min(1, 'Número documento requerido'),
  cliente_denominacion: z.string().min(1, 'Razón social requerida'),
  cliente_direccion: z.string().optional(),
  cliente_email: z.string().email('Email inválido').or(z.literal('')).optional(),
  
  // Otros campos
  fecha_de_emision: z.string().min(1, 'Fecha requerida'),
  moneda: z.string().min(1, 'Moneda requerida'),
  observaciones: z.string().optional(),
  
  // Items
  items: z.array(itemSchema).min(1, 'Debe agregar al menos un item'),
});

type NotaDebitoFormData = z.infer<typeof notaDebitoSchema>;

export default function EmitirNotaDebito() {
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [buscandoDocumento, setBuscandoDocumento] = useState(false);
  const [series, setSeries] = useState<Serie[]>([]);
  const [loadingSeries, setLoadingSeries] = useState(false);

  const { register, control, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<NotaDebitoFormData>({
    resolver: zodResolver(notaDebitoSchema),
    defaultValues: {
      documento_que_se_modifica_tipo: '1', // Factura por defecto
      tipo_de_nota_de_debito: '01',
      serie: 'FD01', // Serie para ND de factura
      numero: '1',
      cliente_tipo_de_documento: '6',
      fecha_de_emision: new Date().toISOString().split('T')[0],
      moneda: '1',
      items: [{
        codigo: 'PROD001',
        descripcion: '',
        unidad_de_medida: 'NIU',
        cantidad: '1',
        valor_unitario: '0',
        tipo_de_igv: '1',
        codigo_producto_sunat: '10000000',
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');
  const watchMoneda = watch('moneda');
  const watchTipoDocModifica = watch('documento_que_se_modifica_tipo');

  useEffect(() => {
    const cargarSeries = async () => {
      try {
        setLoadingSeries(true);
        const empresaId = 1; // TODO: obtener de contexto/selector
        const res = await api.series.listar({ empresa_id: empresaId, tipo_comprobante: '08' });
        const lista = res.data.data;
        setSeries(lista);

        if (lista.length > 0) {
          const serieDefecto = lista.find((s) => s.por_defecto) ?? lista[0];
          setValue('serie', serieDefecto.serie);
          setValue('numero', String((serieDefecto.correlativo_actual ?? 0) + 1));
        }
      } catch {
        // se mantiene modo manual
      } finally {
        setLoadingSeries(false);
      }
    };

    void cargarSeries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Buscar documento original
  const buscarDocumentoOriginal = async () => {
    const tipo = watch('documento_que_se_modifica_tipo');
    const serie = watch('documento_que_se_modifica_serie');
    const numero = watch('documento_que_se_modifica_numero');

    if (!tipo || !serie || !numero) {
      toast.error('Complete tipo, serie y número del documento');
      return;
    }

    setBuscandoDocumento(true);
    try {
      const response = await consultarComprobante(
        parseInt(tipo),
        serie,
        parseInt(numero)
      );

      if (response.errors) {
        toast.error('Documento no encontrado');
        return;
      }

      // Llenar datos del cliente
      setValue('cliente_tipo_de_documento', response.cliente_tipo_de_documento?.toString() || '6');
      setValue('cliente_numero_de_documento', response.cliente_numero_de_documento || '');
      setValue('cliente_denominacion', response.cliente_denominacion || '');
      setValue('cliente_direccion', response.cliente_direccion || '');
      setValue('cliente_email', response.cliente_email || '');

      // Llenar items del documento original
      if (response.items && response.items.length > 0) {
        setValue('items', response.items.map(item => ({
          codigo: item.codigo || 'PROD001',
          descripcion: item.descripcion || '',
          unidad_de_medida: item.unidad_de_medida || 'NIU',
          cantidad: item.cantidad?.toString() || '1',
          valor_unitario: item.valor_unitario?.toString() || '0',
          tipo_de_igv: item.tipo_de_igv?.toString() || '1',
          codigo_producto_sunat: item.codigo_producto_sunat || '10000000',
        })));
      }

      toast.success('Documento encontrado y datos cargados');
    } catch (error) {
      toast.error('Error al buscar documento');
      console.error(error);
    } finally {
      setBuscandoDocumento(false);
    }
  };

  // Actualizar serie según tipo de documento
  const handleTipoDocChange = (value: string) => {
    setValue('documento_que_se_modifica_tipo', value);
    if (value === '1') {
      setValue('serie', 'FD01'); // ND de Factura
    } else if (value === '2') {
      setValue('serie', 'BD01'); // ND de Boleta
    }
  };

  // Calcular totales de item
  const calcularItem = (index: number) => {
    const item = watchItems[index];
    if (!item) return;

    const cantidad = parseFloat(item.cantidad) || 0;
    const valorUnitario = parseFloat(item.valor_unitario) || 0;
    const tipoIgv = item.tipo_de_igv;

    const subtotal = cantidad * valorUnitario;
    let igv = 0;
    let total = 0;
    let precioUnitario = valorUnitario;

    if (tipoIgv === '1') { // Gravado
      igv = subtotal * 0.18;
      total = subtotal + igv;
      precioUnitario = valorUnitario * 1.18;
    } else if (tipoIgv === '2' || tipoIgv === '3') { // Exonerado o Inafecto
      total = subtotal;
    } else if (tipoIgv === '9' || tipoIgv === '10' || tipoIgv === '11') { // Gratuitos
      total = 0;
    }

    setValue(`items.${index}.subtotal`, subtotal.toFixed(2));
    setValue(`items.${index}.igv`, igv.toFixed(2));
    setValue(`items.${index}.total`, total.toFixed(2));
    setValue(`items.${index}.precio_unitario`, precioUnitario.toFixed(2));
  };

  // Calcular totales generales
  const calcularTotales = () => {
    let totalGravada = 0;
    let totalExonerada = 0;
    let totalInafecta = 0;
    let totalGratuita = 0;
    let totalIgv = 0;
    let total = 0;

    watchItems.forEach(item => {
      const subtotal = parseFloat(item.subtotal || '0');
      const igv = parseFloat(item.igv || '0');
      const itemTotal = parseFloat(item.total || '0');

      if (item.tipo_de_igv === '1') {
        totalGravada += subtotal;
        totalIgv += igv;
      } else if (item.tipo_de_igv === '2') {
        totalExonerada += subtotal;
      } else if (item.tipo_de_igv === '3') {
        totalInafecta += subtotal;
      } else if (['9', '10', '11'].includes(item.tipo_de_igv)) {
        totalGratuita += subtotal;
      }

      total += itemTotal;
    });

    return {
      total_gravada: totalGravada,
      total_exonerada: totalExonerada > 0 ? totalExonerada : undefined,
      total_inafecta: totalInafecta > 0 ? totalInafecta : undefined,
      total_gratuita: totalGratuita > 0 ? totalGratuita : undefined,
      total_igv: totalIgv,
      total: total,
    };
  };

  const onSubmit = async (data: NotaDebitoFormData) => {
    setIsLoading(true);
    setPdfUrl('');

    try {
      const totales = calcularTotales();

      const payload = {
        empresa_id: 1, // TODO: Obtener de contexto/estado global
        operacion: 'generar_comprobante' as const,
        tipo_de_comprobante: 4, // Nota de Débito
        serie: data.serie,
        numero: parseInt(data.numero),
        sunat_transaction: 1,
        cliente_tipo_de_documento: data.cliente_tipo_de_documento,
        cliente_numero_de_documento: data.cliente_numero_de_documento,
        cliente_denominacion: data.cliente_denominacion,
        cliente_direccion: data.cliente_direccion || '',
        cliente_email: data.cliente_email || '',
        fecha_de_emision: new Date(data.fecha_de_emision).toLocaleDateString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        moneda: data.moneda,
        porcentaje_de_igv: 18.00,
        total_gravada: totales.total_gravada,
        total_exonerada: totales.total_exonerada,
        total_inafecta: totales.total_inafecta,
        total_gratuita: totales.total_gratuita,
        total_igv: totales.total_igv,
        total: totales.total,
        documento_que_se_modifica_tipo: data.documento_que_se_modifica_tipo,
        documento_que_se_modifica_serie: data.documento_que_se_modifica_serie,
        documento_que_se_modifica_numero: data.documento_que_se_modifica_numero,
        tipo_de_nota_de_debito: data.tipo_de_nota_de_debito,
        observaciones: data.observaciones || '',
        enviar_automaticamente_a_la_sunat: true,
        items: data.items.map(item => ({
          unidad_de_medida: item.unidad_de_medida,
          codigo: item.codigo,
          descripcion: item.descripcion,
          cantidad: parseFloat(item.cantidad),
          valor_unitario: parseFloat(item.valor_unitario),
          precio_unitario: parseFloat(item.precio_unitario || '0'),
          descuento: 0,
          subtotal: parseFloat(item.subtotal || '0'),
          tipo_de_igv: item.tipo_de_igv,
          igv: parseFloat(item.igv || '0'),
          total: parseFloat(item.total || '0'),
        })),
      };

      const response = await emitirComprobante(payload);

      if (response.errors) {
        toast.error(typeof response.errors === 'string' ? response.errors : 'Error al emitir');
        return;
      }

      toast.success(`Nota de Débito ${data.serie}-${data.numero} emitida correctamente`);

      if (response.enlace_del_pdf) {
        setPdfUrl(response.enlace_del_pdf);
      }

      // Limpiar formulario
      reset();
    } catch (error) {
      toast.error('Error al emitir la nota de débito');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Emitir Nota de Débito Electrónica</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Documento que se modifica */}
            <div className="border p-4 rounded-lg space-y-4">
              <h3 className="font-semibold">Documento que se Modifica</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="documento_que_se_modifica_tipo">Tipo Documento</Label>
                  <Select
                    value={watchTipoDocModifica}
                    onValueChange={handleTipoDocChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">01 - Factura</SelectItem>
                      <SelectItem value="2">03 - Boleta</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.documento_que_se_modifica_tipo && (
                    <p className="text-sm text-red-500">{errors.documento_que_se_modifica_tipo.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="documento_que_se_modifica_serie">Serie</Label>
                  <Input
                    id="documento_que_se_modifica_serie"
                    {...register('documento_que_se_modifica_serie')}
                    placeholder="F001"
                  />
                  {errors.documento_que_se_modifica_serie && (
                    <p className="text-sm text-red-500">{errors.documento_que_se_modifica_serie.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="documento_que_se_modifica_numero">Número</Label>
                  <Input
                    id="documento_que_se_modifica_numero"
                    {...register('documento_que_se_modifica_numero')}
                    placeholder="1"
                  />
                  {errors.documento_que_se_modifica_numero && (
                    <p className="text-sm text-red-500">{errors.documento_que_se_modifica_numero.message}</p>
                  )}
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={buscarDocumentoOriginal}
                    disabled={buscandoDocumento}
                    className="w-full"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {buscandoDocumento ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="tipo_de_nota_de_debito">Motivo de Nota de Débito</Label>
                <Select
                  value={watch('tipo_de_nota_de_debito')}
                  onValueChange={(value) => setValue('tipo_de_nota_de_debito', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_NOTA_DEBITO.map(tipo => (
                      <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipo_de_nota_de_debito && (
                  <p className="text-sm text-red-500">{errors.tipo_de_nota_de_debito.message}</p>
                )}
              </div>
            </div>

            {/* Datos de la ND */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="serie">Serie ND</Label>
                {series.length > 0 ? (
                  <Select
                    value={watch('serie')}
                    onValueChange={(value) => {
                      setValue('serie', value);
                      const encontrada = series.find((s) => s.serie === value);
                      if (encontrada) {
                        setValue('numero', String((encontrada.correlativo_actual ?? 0) + 1));
                      }
                    }}
                    disabled={loadingSeries}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingSeries ? 'Cargando series...' : 'Seleccione serie'} />
                    </SelectTrigger>
                    <SelectContent>
                      {series.map((s) => (
                        <SelectItem key={s.id} value={s.serie}>
                          {s.serie}{s.por_defecto ? ' (por defecto)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="serie"
                    {...register('serie')}
                    placeholder="FD01"
                  />
                )}
                {errors.serie && <p className="text-sm text-red-500">{errors.serie.message}</p>}
              </div>

              <div>
                <Label htmlFor="numero">Número ND</Label>
                <Input
                  id="numero"
                  {...register('numero')}
                  placeholder="1"
                />
                {errors.numero && <p className="text-sm text-red-500">{errors.numero.message}</p>}
              </div>

              <div>
                <Label htmlFor="fecha_de_emision">Fecha de Emisión</Label>
                <Input
                  id="fecha_de_emision"
                  type="date"
                  {...register('fecha_de_emision')}
                />
                {errors.fecha_de_emision && <p className="text-sm text-red-500">{errors.fecha_de_emision.message}</p>}
              </div>
            </div>

            {/* Cliente */}
            <div className="border p-4 rounded-lg space-y-4">
              <h3 className="font-semibold">Datos del Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cliente_tipo_de_documento">Tipo Documento</Label>
                  <Select
                    value={watch('cliente_tipo_de_documento')}
                    onValueChange={(value) => setValue('cliente_tipo_de_documento', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_DOCUMENTO_SELECT.map(tipo => (
                        <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.cliente_tipo_de_documento && (
                    <p className="text-sm text-red-500">{errors.cliente_tipo_de_documento.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cliente_numero_de_documento">Número Documento</Label>
                  <Input
                    id="cliente_numero_de_documento"
                    {...register('cliente_numero_de_documento')}
                    placeholder="20123456789"
                  />
                  {errors.cliente_numero_de_documento && (
                    <p className="text-sm text-red-500">{errors.cliente_numero_de_documento.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cliente_denominacion">Razón Social / Nombre</Label>
                  <Input
                    id="cliente_denominacion"
                    {...register('cliente_denominacion')}
                    placeholder="EMPRESA SAC"
                  />
                  {errors.cliente_denominacion && (
                    <p className="text-sm text-red-500">{errors.cliente_denominacion.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="cliente_direccion">Dirección</Label>
                  <Input
                    id="cliente_direccion"
                    {...register('cliente_direccion')}
                    placeholder="Av. Principal 123"
                  />
                </div>

                <div>
                  <Label htmlFor="cliente_email">Email</Label>
                  <Input
                    id="cliente_email"
                    type="email"
                    {...register('cliente_email')}
                    placeholder="cliente@empresa.com"
                  />
                  {errors.cliente_email && <p className="text-sm text-red-500">{errors.cliente_email.message}</p>}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Items (Cargos Adicionales)</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({
                    codigo: 'CARGO001',
                    descripcion: '',
                    unidad_de_medida: 'NIU',
                    cantidad: '1',
                    valor_unitario: '0',
                    tipo_de_igv: '1',
                    codigo_producto_sunat: '10000000',
                  })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <Label>Descripción</Label>
                        <Input
                          {...register(`items.${index}.descripcion`)}
                          placeholder="Descripción del cargo"
                          onBlur={() => calcularItem(index)}
                        />
                        {errors.items?.[index]?.descripcion && (
                          <p className="text-sm text-red-500">{errors.items[index]?.descripcion?.message}</p>
                        )}
                      </div>

                      <div>
                        <Label>Unidad</Label>
                        <Select
                          value={watchItems[index]?.unidad_de_medida}
                          onValueChange={(value) => {
                            setValue(`items.${index}.unidad_de_medida`, value);
                            calcularItem(index);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {UNIDADES_MEDIDA_SELECT.map(u => (
                              <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Cantidad</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.cantidad`)}
                          onBlur={() => calcularItem(index)}
                        />
                      </div>

                      <div>
                        <Label>Valor Unit.</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.valor_unitario`)}
                          onBlur={() => calcularItem(index)}
                        />
                      </div>

                      <div>
                        <Label>Tipo IGV</Label>
                        <Select
                          value={watchItems[index]?.tipo_de_igv}
                          onValueChange={(value) => {
                            setValue(`items.${index}.tipo_de_igv`, value);
                            calcularItem(index);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIPOS_IGV_SELECT.map(tipo => (
                              <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2">
                        <Label>Código</Label>
                        <Input
                          {...register(`items.${index}.codigo`)}
                          placeholder="CARGO001"
                        />
                      </div>

                      <div>
                        <Label>Subtotal</Label>
                        <Input
                          value={watchItems[index]?.subtotal || '0.00'}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>

                      <div>
                        <Label>IGV</Label>
                        <Input
                          value={watchItems[index]?.igv || '0.00'}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>

                      <div>
                        <Label>Total</Label>
                        <Input
                          value={watchItems[index]?.total || '0.00'}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="w-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {errors.items && (
                <p className="text-sm text-red-500">{errors.items.message}</p>
              )}
            </div>

            {/* Totales y observaciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  {...register('observaciones')}
                  placeholder="Observaciones adicionales"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal:</span>
                  <span>{watchMoneda === '2' ? '$' : 'S/'} {calcularTotales().total_gravada.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">IGV (18%):</span>
                  <span>{watchMoneda === '2' ? '$' : 'S/'} {calcularTotales().total_igv.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>TOTAL:</span>
                  <span>{watchMoneda === '2' ? '$' : 'S/'} {calcularTotales().total.toFixed(2)}</span>
                </div>
                <div className="pt-2">
                  <Label htmlFor="moneda">Moneda</Label>
                  <Select
                    value={watchMoneda}
                    onValueChange={(value) => setValue('moneda', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONEDAS_SELECT.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Botón submit */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Emitiendo...' : 'Emitir Nota de Débito'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Vista previa PDF */}
      {pdfUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Nota de Débito Emitida</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={() => window.open(pdfUrl, '_blank')}
                variant="outline"
              >
                Ver PDF
              </Button>
              <a href={pdfUrl} download>
                <Button variant="outline">Descargar PDF</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
