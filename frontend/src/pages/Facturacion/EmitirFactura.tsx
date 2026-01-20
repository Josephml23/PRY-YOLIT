import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { emitirComprobante, TIPOS_COMPROBANTE, TIPOS_DOCUMENTO, TIPOS_IGV, MONEDAS, UNIDADES_MEDIDA, type EmitirComprobanteRequest } from '@/services/nubefact';
import { Plus, Trash2, FileText, Loader2 } from 'lucide-react';

const itemSchema = z.object({
  unidad_de_medida: z.string().min(1, 'Requerido'),
  codigo: z.string().min(1, 'Requerido'),
  descripcion: z.string().min(1, 'Requerido'),
  cantidad: z.number().min(0.01, 'Debe ser mayor a 0'),
  valor_unitario: z.number().min(0, 'Debe ser mayor o igual a 0'),
  precio_unitario: z.number().min(0, 'Debe ser mayor o igual a 0'),
  descuento: z.number().optional(),
  tipo_de_igv: z.string().min(1, 'Requerido'),
});

const facturaSchema = z.object({
  empresa_id: z.number().min(1, 'Seleccione una empresa'),
  serie: z.string().min(4, 'Serie debe tener 4 caracteres').max(4),
  numero: z.number().min(1, 'Número debe ser mayor a 0'),
  cliente_tipo_de_documento: z.string().min(1, 'Requerido'),
  cliente_numero_de_documento: z.string().min(8, 'Documento inválido'),
  cliente_denominacion: z.string().min(1, 'Requerido'),
  cliente_direccion: z.string().optional(),
  cliente_email: z.string().email('Email inválido').optional().or(z.literal('')),
  fecha_de_emision: z.string().min(1, 'Requerido'),
  moneda: z.string().min(1, 'Requerido'),
  observaciones: z.string().optional(),
  items: z.array(itemSchema).min(1, 'Debe agregar al menos un item'),
});

type FacturaFormValues = z.infer<typeof facturaSchema>;

export default function EmitirFactura() {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const form = useForm<FacturaFormValues>({
    resolver: zodResolver(facturaSchema),
    defaultValues: {
      empresa_id: 1, // TODO: Obtener de selector de empresa
      serie: 'F001',
      numero: 1,
      cliente_tipo_de_documento: TIPOS_DOCUMENTO.RUC,
      cliente_numero_de_documento: '',
      cliente_denominacion: '',
      cliente_direccion: '',
      cliente_email: '',
      fecha_de_emision: new Date().toISOString().split('T')[0],
      moneda: MONEDAS.PEN,
      observaciones: '',
      items: [
        {
          unidad_de_medida: UNIDADES_MEDIDA.NIU,
          codigo: 'PROD001',
          descripcion: '',
          cantidad: 1,
          valor_unitario: 0,
          precio_unitario: 0,
          descuento: 0,
          tipo_de_igv: TIPOS_IGV.GRAVADO_OPERACION_ONEROSA,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const calcularItem = (index: number) => {
    const item = form.getValues(`items.${index}`);
    const { cantidad, valor_unitario, descuento = 0 } = item;
    
    const subtotal = cantidad * valor_unitario - descuento;
    const igv = subtotal * 0.18;
    const total = subtotal + igv;
    const precio_unitario = (subtotal + igv) / cantidad;

    form.setValue(`items.${index}.precio_unitario`, parseFloat(precio_unitario.toFixed(2)));
    
    return { subtotal, igv, total };
  };

  const calcularTotales = () => {
    const items = form.getValues('items');
    let total_gravada = 0;
    let total_igv = 0;
    let total = 0;

    items.forEach((_, index) => {
      const calc = calcularItem(index);
      total_gravada += calc.subtotal;
      total_igv += calc.igv;
      total += calc.total;
    });

    return {
      total_gravada: parseFloat(total_gravada.toFixed(2)),
      total_igv: parseFloat(total_igv.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  };

  const onSubmit = async (data: FacturaFormValues) => {
    try {
      setLoading(true);
      const totales = calcularTotales();

      const items = data.items.map((item, index) => {
        const calc = calcularItem(index);
        return {
          ...item,
          subtotal: calc.subtotal,
          igv: calc.igv,
          total: calc.total,
        };
      });

      const payload: EmitirComprobanteRequest = {
        ...data,
        operacion: 'generar_comprobante',
        tipo_de_comprobante: TIPOS_COMPROBANTE.FACTURA,
        sunat_transaction: 1,
        porcentaje_de_igv: 18.0,
        total_gravada: totales.total_gravada,
        total_igv: totales.total_igv,
        total: totales.total,
        enviar_automaticamente_a_la_sunat: true,
        enviar_automaticamente_al_cliente: !!data.cliente_email,
        items,
      };

      const response = await emitirComprobante(payload);

      if (response.errors) {
        toast.error('Error al emitir factura', {
          description: response.sunat_description || 'Error desconocido',
        });
        return;
      }

      if (response.aceptada_por_sunat) {
        toast.success('¡Factura emitida exitosamente!', {
          description: `Código de respuesta SUNAT: ${response.sunat_responsecode}`,
        });
        
        if (response.pdf_url) {
          setPdfUrl(response.pdf_url);
        }

        // Limpiar formulario
        form.reset();
      } else {
        toast.warning('Factura enviada pero no aceptada', {
          description: response.sunat_description || response.sunat_soap_error,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error('Error al procesar la factura', {
        description: err.response?.data?.message || err.message || 'Error desconocido',
      });
    } finally {
      setLoading(false);
    }
  };

  const totales = calcularTotales();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Emitir Factura</h1>
          <p className="text-muted-foreground">Complete los datos para generar una factura electrónica</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos del Comprobante */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Comprobante</CardTitle>
            <CardDescription>Información básica de la factura</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Serie</label>
                <Input
                  {...form.register('serie')}
                  placeholder="F001"
                  maxLength={4}
                />
                {form.formState.errors.serie && (
                  <p className="text-sm text-destructive">{form.formState.errors.serie.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Número</label>
                <Input
                  type="number"
                  {...form.register('numero', { valueAsNumber: true })}
                  placeholder="1"
                />
                {form.formState.errors.numero && (
                  <p className="text-sm text-destructive">{form.formState.errors.numero.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha de Emisión</label>
                <Input
                  type="date"
                  {...form.register('fecha_de_emision')}
                />
                {form.formState.errors.fecha_de_emision && (
                  <p className="text-sm text-destructive">{form.formState.errors.fecha_de_emision.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datos del Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Cliente</CardTitle>
            <CardDescription>Información del receptor del comprobante</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Documento</label>
                <Select
                  value={form.watch('cliente_tipo_de_documento')}
                  onValueChange={(value) => form.setValue('cliente_tipo_de_documento', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TIPOS_DOCUMENTO.DNI}>DNI</SelectItem>
                    <SelectItem value={TIPOS_DOCUMENTO.RUC}>RUC</SelectItem>
                    <SelectItem value={TIPOS_DOCUMENTO.CARNET_EXTRANJERIA}>Carnet Extranjería</SelectItem>
                    <SelectItem value={TIPOS_DOCUMENTO.PASAPORTE}>Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Número de Documento</label>
                <Input
                  {...form.register('cliente_numero_de_documento')}
                  placeholder="20123456789"
                />
                {form.formState.errors.cliente_numero_de_documento && (
                  <p className="text-sm text-destructive">{form.formState.errors.cliente_numero_de_documento.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Razón Social / Nombre</label>
              <Input
                {...form.register('cliente_denominacion')}
                placeholder="EMPRESA SAC"
              />
              {form.formState.errors.cliente_denominacion && (
                <p className="text-sm text-destructive">{form.formState.errors.cliente_denominacion.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dirección</label>
              <Input
                {...form.register('cliente_direccion')}
                placeholder="Av. Principal 123"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                {...form.register('cliente_email')}
                placeholder="cliente@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Items de la Factura</CardTitle>
                <CardDescription>Productos o servicios a facturar</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    unidad_de_medida: UNIDADES_MEDIDA.NIU,
                    codigo: `PROD${fields.length + 1}`,
                    descripcion: '',
                    cantidad: 1,
                    valor_unitario: 0,
                    precio_unitario: 0,
                    descuento: 0,
                    tipo_de_igv: TIPOS_IGV.GRAVADO_OPERACION_ONEROSA,
                  })
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Código</label>
                      <Input
                        {...form.register(`items.${index}.codigo`)}
                        placeholder="PROD001"
                      />
                    </div>
                    <div className="col-span-3 space-y-2">
                      <label className="text-sm font-medium">Descripción</label>
                      <Input
                        {...form.register(`items.${index}.descripcion`)}
                        placeholder="Descripción del producto/servicio"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Unidad</label>
                      <Select
                        value={form.watch(`items.${index}.unidad_de_medida`)}
                        onValueChange={(value) => form.setValue(`items.${index}.unidad_de_medida`, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UNIDADES_MEDIDA.NIU}>NIU - Unidad</SelectItem>
                          <SelectItem value={UNIDADES_MEDIDA.ZZ}>ZZ - Servicio</SelectItem>
                          <SelectItem value={UNIDADES_MEDIDA.KGM}>KGM - Kilogramo</SelectItem>
                          <SelectItem value={UNIDADES_MEDIDA.LTR}>LTR - Litro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cantidad</label>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`items.${index}.cantidad`, { 
                          valueAsNumber: true,
                          onChange: () => calcularItem(index),
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Valor Unitario</label>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`items.${index}.valor_unitario`, { 
                          valueAsNumber: true,
                          onChange: () => calcularItem(index),
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Descuento</label>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`items.${index}.descuento`, { 
                          valueAsNumber: true,
                          onChange: () => calcularItem(index),
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Precio Unit. (c/IGV)</label>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`items.${index}.precio_unitario`, { valueAsNumber: true })}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Totales */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2 max-w-sm ml-auto">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Subtotal:</span>
                <span>S/ {totales.total_gravada.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">IGV (18%):</span>
                <span>S/ {totales.total_igv.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>TOTAL:</span>
                <span>S/ {totales.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observaciones */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Observaciones</label>
              <Input
                {...form.register('observaciones')}
                placeholder="Notas adicionales (opcional)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Limpiar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Emitiendo...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Emitir Factura
              </>
            )}
          </Button>
        </div>
      </form>

      {/* PDF Preview */}
      {pdfUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Comprobante Generado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button asChild>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  Ver PDF
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
