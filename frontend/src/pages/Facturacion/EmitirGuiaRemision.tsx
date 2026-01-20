import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Truck, Plus, Trash2, Send, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';
import { api as apiV1, type Serie } from '@/lib/api';

interface Empresa {
  id: number;
  razon_social: string;
  ruc: string;
}

// Catálogos SUNAT
const MOTIVOS_TRASLADO = [
  { value: '01', label: '01 - Venta' },
  { value: '02', label: '02 - Compra' },
  { value: '04', label: '04 - Traslado entre establecimientos de la misma empresa' },
  { value: '08', label: '08 - Importación' },
  { value: '09', label: '09 - Exportación' },
  { value: '13', label: '13 - Otros' },
  { value: '14', label: '14 - Venta sujeta a confirmación del comprador' },
  { value: '18', label: '18 - Traslado emisor itinerante CP' },
  { value: '19', label: '19 - Traslado a zona primaria' },
];

const TIPOS_TRANSPORTE = [
  { value: '01', label: '01 - Transporte público' },
  { value: '02', label: '02 - Transporte privado' },
];

const UNIDADES_MEDIDA_PESO = [
  { value: 'KGM', label: 'KGM - Kilogramos' },
  { value: 'TNE', label: 'TNE - Toneladas' },
  { value: 'GRM', label: 'GRM - Gramos' },
];

const UNIDADES_MEDIDA = [
  { value: 'NIU', label: 'NIU - Unidad' },
  { value: 'ZZ', label: 'ZZ - Servicio' },
  { value: 'KGM', label: 'KGM - Kilogramo' },
  { value: 'TNE', label: 'TNE - Tonelada' },
  { value: 'MTR', label: 'MTR - Metro' },
  { value: 'LTR', label: 'LTR - Litro' },
];

const guiaItemSchema = z.object({
  unidad_de_medida: z.string().min(1, 'Requerido'),
  codigo: z.string().min(1, 'Requerido'),
  descripcion: z.string().min(1, 'Requerido'),
  cantidad: z.string().min(1, 'Requerido'),
});

const guiaSchema = z.object({
  empresa_id: z.number().min(1, 'Seleccione una empresa'),
  serie: z.string().min(1, 'Serie requerida').max(4),
  numero: z.number().min(1, 'Número requerido'),
  
  // Cliente/Destinatario
  cliente_tipo_de_documento: z.string().min(1, 'Requerido'),
  cliente_numero_de_documento: z.string().min(1, 'Requerido'),
  cliente_denominacion: z.string().min(1, 'Requerido'),
  cliente_direccion: z.string().min(1, 'Requerido'),
  cliente_email: z.string().email('Email inválido').optional().or(z.literal('')),
  
  // Datos de la guía
  fecha_de_emision: z.string().min(1, 'Requerido'),
  fecha_de_inicio_de_traslado: z.string().min(1, 'Requerido'),
  motivo_de_traslado: z.string().min(1, 'Requerido'),
  observaciones: z.string().optional(),
  
  // Peso y bultos
  peso_bruto_total: z.string().min(1, 'Requerido'),
  peso_bruto_unidad_de_medida: z.string().min(1, 'Requerido'),
  numero_de_bultos: z.string().min(1, 'Requerido'),
  
  // Transporte
  tipo_de_transporte: z.string().min(1, 'Requerido'),
  
  // Transportista (si es público)
  transportista_documento_tipo: z.string().optional(),
  transportista_documento_numero: z.string().optional(),
  transportista_denominacion: z.string().optional(),
  transportista_placa_numero: z.string().optional(),
  
  // Conductor (si es privado)
  conductor_documento_tipo: z.string().optional(),
  conductor_documento_numero: z.string().optional(),
  conductor_nombre: z.string().optional(),
  conductor_apellidos: z.string().optional(),
  conductor_numero_licencia: z.string().optional(),
  
  // Punto de partida
  punto_de_partida_ubigeo: z.string().min(6, 'Ubigeo debe tener 6 dígitos'),
  punto_de_partida_direccion: z.string().min(1, 'Requerido'),
  
  // Punto de llegada
  punto_de_llegada_ubigeo: z.string().min(6, 'Ubigeo debe tener 6 dígitos'),
  punto_de_llegada_direccion: z.string().min(1, 'Requerido'),
  
  items: z.array(guiaItemSchema).min(1, 'Debe agregar al menos un ítem'),
});

type GuiaFormData = z.infer<typeof guiaSchema>;

export default function EmitirGuiaRemision() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [series, setSeries] = useState<Serie[]>([]);
  const [loadingSeries, setLoadingSeries] = useState(false);

  useEffect(() => {
    const cargarEmpresas = async () => {
      try {
        const response = await api.get('/v1/empresas');
        const empresasData = Array.isArray(response.data)
          ? response.data
          : (response.data.data || []);
        setEmpresas(empresasData);
      } catch (error) {
        console.error('Error al cargar empresas:', error);
        toast.error('Error al cargar empresas');
      }
    };
    cargarEmpresas();
  }, []);

  useEffect(() => {
    const cargarSeries = async () => {
      try {
        setLoadingSeries(true);
        const empresaId = form.getValues('empresa_id') || 1;
        const res = await apiV1.series.listar({ empresa_id: empresaId, tipo_comprobante: '09' });
        const lista = res.data.data;
        setSeries(lista);

        if (lista.length > 0) {
          const serieDefecto = lista.find((s) => s.por_defecto) ?? lista[0];
          form.setValue('serie', serieDefecto.serie);
          form.setValue('numero', (serieDefecto.correlativo_actual ?? 0) + 1);
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

  const form = useForm<GuiaFormData>({
    resolver: zodResolver(guiaSchema),
    defaultValues: {
      serie: 'T001',
      numero: 1,
      cliente_tipo_de_documento: '6',
      fecha_de_emision: new Date().toISOString().split('T')[0],
      fecha_de_inicio_de_traslado: new Date().toISOString().split('T')[0],
      motivo_de_traslado: '01',
      tipo_de_transporte: '01',
      peso_bruto_unidad_de_medida: 'KGM',
      numero_de_bultos: '1',
      punto_de_partida_ubigeo: '',
      punto_de_llegada_ubigeo: '',
      items: [
        {
          unidad_de_medida: 'NIU',
          codigo: '',
          descripcion: '',
          cantidad: '1',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const tipoTransporte = form.watch('tipo_de_transporte');

  const onSubmit = async (data: GuiaFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        operacion: 'generar_guia',
        tipo_de_comprobante: 9, // Código de GRE en NubeFact
        ...data,
        enviar_automaticamente_al_cliente: 'false',
      };

      const response = await api.post('/nubefact/guias', payload);

      if (response.data.success) {
        toast.success('Guía de Remisión emitida exitosamente', {
          description: `Serie: ${data.serie} - Número: ${data.numero}`,
        });
        form.reset();
      } else {
        toast.error('Error al emitir guía', {
          description: response.data.message,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error al emitir guía', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Truck className="h-8 w-8 text-primary" />
            Emitir Guía de Remisión Electrónica
          </h1>
          <p className="text-muted-foreground mt-2">
            Genere guías de remisión para el traslado de mercancías
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Empresa y Serie */}
          <Card>
            <CardHeader>
              <CardTitle>Datos del Emisor</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="empresa_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa</FormLabel>
                    <Select onValueChange={(val) => field.onChange(Number(val))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione empresa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {empresas.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id.toString()}>
                            {emp.razon_social}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serie</FormLabel>
                    <FormControl>
                      {series.length > 0 ? (
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            const encontrada = series.find((s) => s.serie === value);
                            if (encontrada) {
                              form.setValue('numero', (encontrada.correlativo_actual ?? 0) + 1);
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
                        <Input {...field} placeholder="T001" maxLength={4} />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Destinatario */}
          <Card>
            <CardHeader>
              <CardTitle>Destinatario</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="cliente_tipo_de_documento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo Doc.</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 - DNI</SelectItem>
                        <SelectItem value="6">6 - RUC</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cliente_numero_de_documento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Documento</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="20123456789" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cliente_denominacion"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Razón Social / Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="EMPRESA CLIENTE SAC" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cliente_direccion"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Av. Principal 123" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cliente_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="cliente@email.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Datos del Traslado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Datos del Traslado
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="fecha_de_emision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Emisión</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fecha_de_inicio_de_traslado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Inicio de Traslado</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motivo_de_traslado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo de Traslado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MOTIVOS_TRASLADO.map((motivo) => (
                          <SelectItem key={motivo.value} value={motivo.value}>
                            {motivo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo_de_transporte"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Transporte</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIPOS_TRANSPORTE.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="peso_bruto_total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso Bruto Total</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} placeholder="100.50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="peso_bruto_unidad_de_medida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad de Medida</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNIDADES_MEDIDA_PESO.map((unidad) => (
                          <SelectItem key={unidad.value} value={unidad.value}>
                            {unidad.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numero_de_bultos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Bultos</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} placeholder="1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Observaciones (opcional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} placeholder="Observaciones adicionales..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Transportista (Transporte Público) */}
          {tipoTransporte === '01' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Datos del Transportista (Público)
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="transportista_documento_tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo Doc.</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="6">6 - RUC</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transportista_documento_numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RUC Transportista</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="20123456789" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transportista_denominacion"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Razón Social</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="TRANSPORTES ABC SAC" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transportista_placa_numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa del Vehículo</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ABC-123" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Conductor (Transporte Privado) */}
          {tipoTransporte === '02' && (
            <Card>
              <CardHeader>
                <CardTitle>Datos del Conductor (Privado)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="conductor_documento_tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo Doc.</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 - DNI</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="conductor_documento_numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNI Conductor</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="12345678" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="conductor_nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombres</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Juan" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="conductor_apellidos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellidos</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Pérez García" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="conductor_numero_licencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº Licencia</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Q12345678" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Puntos de Partida y Llegada */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Punto de Partida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="punto_de_partida_ubigeo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubigeo (6 dígitos)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="150101" maxLength={6} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="punto_de_partida_direccion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Av. Partida 123, Lima" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Punto de Llegada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="punto_de_llegada_ubigeo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubigeo (6 dígitos)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="150101" maxLength={6} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="punto_de_llegada_direccion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Av. Llegada 456, Callao" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Mercancías</CardTitle>
              <CardDescription>Productos o bienes que se están trasladando</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4 bg-muted/50">
                  <div className="grid gap-4 md:grid-cols-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.unidad_de_medida`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unidad</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {UNIDADES_MEDIDA.map((unidad) => (
                                <SelectItem key={unidad.value} value={unidad.value}>
                                  {unidad.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.codigo`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="PROD001" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.descripcion`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Descripción del producto" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.cantidad`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cantidad</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} placeholder="1" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-end md:col-span-3">
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    unidad_de_medida: 'NIU',
                    codigo: '',
                    descripcion: '',
                    cantidad: '1',
                  })
                }
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Ítem
              </Button>
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Limpiar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Emitiendo...' : 'Emitir Guía'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
