import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, Star, StarOff, Trash2, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface Producto {
  id: number;
  empresa_id: number;
  codigo: string;
  descripcion: string;
  categoria: string | null;
  unidad_medida: string;
  codigo_producto_sunat: string | null;
  moneda: string;
  valor_venta_unitario: number | null;
  precio_venta_unitario: number | null;
  costo_compra_unitario: number | null;
  precio_compra_unitario: number | null;
  tipo_afectacion_igv: string;
  destacado: boolean;
  activo: boolean;
  stock_actual: number;
}

const UNIDADES_MEDIDA = [
  { value: 'NIU', label: 'NIU - UNIDADES' },
  { value: 'ZZ', label: 'ZZ - OTROS' },
  { value: 'KGM', label: 'KGM - KILOGRAMO' },
  { value: 'BX', label: 'BX - CAJA' },
  { value: 'BG', label: 'BG - BOLSA' },
  { value: 'DZN', label: 'DZN - DOCENA' },
  { value: 'GLI', label: 'GLI - GALÓN' },
  { value: 'LTR', label: 'LTR - LITRO' },
  { value: 'MTR', label: 'MTR - METRO' },
  { value: 'WG', label: 'WG - PESO' },
];

const TIPOS_IGV = [
  { value: '10', label: 'Gravado - Operación Onerosa [10]' },
  { value: '11', label: '[Gratuita] Gravado - Retiro por premio [11]' },
  { value: '12', label: '[Gratuita] Gravado - Retiro por donación [12]' },
  { value: '13', label: '[Gratuita] Gravado - Retiro [13]' },
  { value: '14', label: '[Gratuita] Gravado - Retiro por publicidad [14]' },
  { value: '15', label: '[Gratuita] Gravado - Bonificaciones [15]' },
  { value: '16', label: '[Gratuita] Gravado - Retiro por entrega a trabajadores [16]' },
  { value: '20', label: 'Exonerado - Operación Onerosa [20]' },
  { value: '21', label: '[Gratuita] Exonerada - Transferencia Gratuita [21]' },
  { value: '30', label: 'Inafecto - Operación Onerosa [30]' },
  { value: '31', label: '[Gratuita] Inafecto - Retiro por Bonificación [31]' },
  { value: '32', label: '[Gratuita] Inafecto [32]' },
  { value: '33', label: '[Gratuita] Inafecto - Retiro por Muestras Médicas [33]' },
  { value: '34', label: '[Gratuita] Inafecto - Retiro por Convenio Colectivo [34]' },
  { value: '35', label: '[Gratuita] Inafecto - Retiro por premio [35]' },
  { value: '36', label: '[Gratuita] Inafecto - Retiro por publicidad [36]' },
  { value: '37', label: '[Gratuita] Inafecto - Transferencia gratuita [37]' },
  { value: '40', label: 'Exportación [40]' },
  { value: '17', label: 'Gravado - IVAP [17]' },
];

export default function GestionProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [empresaId] = useState(1); // TODO: Obtener de contexto

  const [formData, setFormData] = useState({
    codigo: '',
    descripcion: '',
    categoria: '',
    unidad_medida: 'NIU',
    codigo_producto_sunat: '',
    moneda: 'PEN',
    valor_venta_unitario: '',
    precio_venta_unitario: '',
    costo_compra_unitario: '',
    precio_compra_unitario: '',
    tipo_afectacion_igv: '10',
    destacado: false,
  });

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/v1/productos', {
        params: {
          empresa_id: empresaId,
          buscar: busqueda || undefined,
        },
      });
      setProductos(response.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, [busqueda]);

  const abrirModal = (producto?: Producto) => {
    if (producto) {
      setProductoEditando(producto);
      setFormData({
        codigo: producto.codigo || '',
        descripcion: producto.descripcion,
        categoria: producto.categoria || '',
        unidad_medida: producto.unidad_medida,
        codigo_producto_sunat: producto.codigo_producto_sunat || '',
        moneda: producto.moneda,
        valor_venta_unitario: producto.valor_venta_unitario?.toString() || '',
        precio_venta_unitario: producto.precio_venta_unitario?.toString() || '',
        costo_compra_unitario: producto.costo_compra_unitario?.toString() || '',
        precio_compra_unitario: producto.precio_compra_unitario?.toString() || '',
        tipo_afectacion_igv: producto.tipo_afectacion_igv,
        destacado: producto.destacado,
      });
    } else {
      setProductoEditando(null);
      setFormData({
        codigo: '',
        descripcion: '',
        categoria: '',
        unidad_medida: 'NIU',
        codigo_producto_sunat: '',
        moneda: 'PEN',
        valor_venta_unitario: '',
        precio_venta_unitario: '',
        costo_compra_unitario: '',
        precio_compra_unitario: '',
        tipo_afectacion_igv: '10',
        destacado: false,
      });
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProductoEditando(null);
  };

  const guardarProducto = async () => {
    try {
      const data = {
        empresa_id: empresaId,
        ...formData,
      };

      if (productoEditando) {
        await api.put(`/v1/productos/${productoEditando.id}`, data);
        toast.success('Producto actualizado exitosamente');
      } else {
        await api.post('/v1/productos', data);
        toast.success('Producto creado exitosamente');
      }

      cerrarModal();
      cargarProductos();
    } catch (error: any) {
      console.error('Error al guardar producto:', error);
      toast.error(error.response?.data?.message || 'Error al guardar producto');
    }
  };

  const toggleDestacado = async (id: number) => {
    try {
      await api.patch(`/v1/productos/${id}/toggle-destacado`);
      cargarProductos();
      toast.success('Estado de destacado actualizado');
    } catch (error) {
      toast.error('Error al actualizar destacado');
    }
  };

  const eliminarProducto = async (id: number) => {
    if (!confirm('¿Estás seguro de desactivar este producto?')) return;

    try {
      await api.delete(`/v1/productos/${id}`);
      toast.success('Producto desactivado');
      cargarProductos();
    } catch (error) {
      toast.error('Error al desactivar producto');
    }
  };

  const productosFiltrados = productos;

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestión de Productos</CardTitle>
            <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
              <DialogTrigger asChild>
                <Button onClick={() => abrirModal()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{productoEditando ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Código interno</Label>
                    <Input
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                      placeholder="Código del producto"
                    />
                  </div>

                  <div>
                    <Label>Categoría</Label>
                    <Input
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      placeholder="Ej: S-001 Servicios"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Nombre del producto o servicio *</Label>
                    <Textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      placeholder="Descripción completa"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Unidad de medida SUNAT *</Label>
                    <Select value={formData.unidad_medida} onValueChange={(value) => setFormData({ ...formData, unidad_medida: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIDADES_MEDIDA.map((u) => (
                          <SelectItem key={u.value} value={u.value}>
                            {u.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Código Producto SUNAT</Label>
                    <Input
                      value={formData.codigo_producto_sunat}
                      onChange={(e) => setFormData({ ...formData, codigo_producto_sunat: e.target.value })}
                      placeholder="Catálogo 25 SUNAT"
                    />
                  </div>

                  <div className="md:col-span-2 border-t pt-4">
                    <h3 className="font-semibold mb-3">Para la VENTA (Opcional)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>VALOR VENTA unitario SIN IGV</Label>
                        <Input
                          type="number"
                          step="0.000001"
                          value={formData.valor_venta_unitario}
                          onChange={(e) => setFormData({ ...formData, valor_venta_unitario: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>Precio VENTA unitario CON IGV</Label>
                        <Input
                          type="number"
                          step="0.000001"
                          value={formData.precio_venta_unitario}
                          onChange={(e) => setFormData({ ...formData, precio_venta_unitario: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 border-t pt-4">
                    <h3 className="font-semibold mb-3">Para la COMPRA (Opcional)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>COSTO unitario SIN IGV</Label>
                        <Input
                          type="number"
                          step="0.000001"
                          value={formData.costo_compra_unitario}
                          onChange={(e) => setFormData({ ...formData, costo_compra_unitario: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>Precio COMPRA unitario CON IGV</Label>
                        <Input
                          type="number"
                          step="0.000001"
                          value={formData.precio_compra_unitario}
                          onChange={(e) => setFormData({ ...formData, precio_compra_unitario: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Tipo de afectación (Opcional)</Label>
                    <Select value={formData.tipo_afectacion_igv} onValueChange={(value) => setFormData({ ...formData, tipo_afectacion_igv: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {TIPOS_IGV.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.destacado}
                      onCheckedChange={(checked) => setFormData({ ...formData, destacado: checked })}
                    />
                    <Label>¿Destacado?</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={cerrarModal}>
                    Cancelar
                  </Button>
                  <Button onClick={guardarProducto} disabled={!formData.descripcion}>
                    {productoEditando ? 'Actualizar' : 'Crear Producto'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Buscar por código o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Precio Venta</TableHead>
                    <TableHead>Tipo IGV</TableHead>
                    <TableHead>Destacado</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No se encontraron productos
                      </TableCell>
                    </TableRow>
                  ) : (
                    productosFiltrados.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell className="font-medium">{producto.codigo || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">{producto.descripcion}</TableCell>
                        <TableCell>{producto.unidad_medida}</TableCell>
                        <TableCell>
                          {producto.precio_venta_unitario ? `S/ ${Number(producto.precio_venta_unitario).toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {TIPOS_IGV.find((t) => t.value === producto.tipo_afectacion_igv)?.label.split('[')[0] || producto.tipo_afectacion_igv}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDestacado(producto.id)}
                          >
                            {producto.destacado ? (
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ) : (
                              <StarOff className="w-4 h-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>{Number(producto.stock_actual || 0).toFixed(0)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => abrirModal(producto)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => eliminarProducto(producto.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
