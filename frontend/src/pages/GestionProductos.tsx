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
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, Plus, Star, StarOff, Trash2, Loader2, MoreVertical, Eye, Package } from 'lucide-react';
import api, { type Producto } from '@/lib/api';

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
  const [selectedProductos, setSelectedProductos] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      const response = await api.productos.listar({
        empresa_id: empresaId,
        buscar: busqueda || undefined,
        sort_by: 'codigo',
        sort_order: 'asc',
      });
      setProductos(response.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos al montar el componente
  useEffect(() => {
    void cargarProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Búsqueda dinámica con debounce
  useEffect(() => {
    if (busqueda === '') {
      // Si está vacío, cargar inmediatamente
      void cargarProductos();
      return;
    }

    const timer = setTimeout(() => {
      void cargarProductos();
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        await api.productos.actualizar(productoEditando.id, data);
        toast.success('Producto actualizado exitosamente');
      } else {
        await api.productos.crear(data);
        toast.success('Producto creado exitosamente');
      }

      cerrarModal();
      void cargarProductos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al guardar producto');
    }
  };

  const toggleDestacado = async (id: number) => {
    try {
      await api.productos.toggleDestacado(id);
      void cargarProductos();
      toast.success('Estado de destacado actualizado');
    } catch {
      toast.error('Error al actualizar destacado');
    }
  };

  const eliminarProducto = async (id: number) => {
    if (!confirm('¿Estás seguro de desactivar este producto?')) return;

    try {
      await api.productos.eliminar(id);
      toast.success('Producto desactivado');
      void cargarProductos();
    } catch {
      toast.error('Error al desactivar producto');
    }
  };

  const toggleSelectProducto = (id: number) => {
    setSelectedProductos(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProductos.length === productosFiltrados.length) {
      setSelectedProductos([]);
    } else {
      setSelectedProductos(productosFiltrados.map(p => p.id));
    }
  };

  const productosFiltrados = productos;

  // Paginación
  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const productosPaginados = productosFiltrados.slice(startIndex, endIndex);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl">Gestión de Productos</CardTitle>
            </div>
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

                  <div className="md:col-span-2 flex items-center gap-3">
                    <Switch
                      checked={formData.destacado}
                      onCheckedChange={(checked) => setFormData({ ...formData, destacado: checked })}
                    />
                    <Label className="cursor-pointer">Producto destacado</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setModalAbierto(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={guardarProducto}>
                    {productoEditando ? 'Actualizar' : 'Crear'} Producto
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de búsqueda y filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Buscar por código, descripción o categoría..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full"
              />
            </div>
            {selectedProductos.length > 0 && (
              <Badge variant="secondary" className="px-3 py-2">
                {selectedProductos.length} seleccionado{selectedProductos.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Paginación superior */}
          {!loading && productosFiltrados.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} - {Math.min(endIndex, productosFiltrados.length)} de {productosFiltrados.length} productos
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                    className="hidden sm:inline-flex"
                  >
                    {i + 1}
                  </Button>
                ))}
                <span className="sm:hidden text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Cargando productos...</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-100 dark:bg-slate-800 border-b-2">
                      <TableHead className="w-10 py-2 bg-slate-100 dark:bg-slate-800">
                        <Checkbox
                          checked={selectedProductos.length === productosFiltrados.length && productosFiltrados.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="min-w-20 py-2 bg-slate-100 dark:bg-slate-800">
                        <div className="font-bold text-[10px] uppercase leading-tight">Código</div>
                      </TableHead>
                      <TableHead className="min-w-40 py-2 bg-slate-100 dark:bg-slate-800">
                        <div className="font-bold text-[10px] uppercase leading-tight">Descripción</div>
                      </TableHead>
                      <TableHead className="min-w-16 py-2 bg-slate-100 dark:bg-slate-800">
                        <div className="font-bold text-[10px] uppercase leading-tight">Unidad</div>
                      </TableHead>
                      <TableHead className="min-w-24 text-right py-2 bg-slate-100 dark:bg-slate-800">
                        <div className="font-bold text-[10px] uppercase leading-tight">Costo Compra</div>
                        <div className="text-[9px] font-normal text-muted-foreground">(sin IGV)</div>
                      </TableHead>
                      <TableHead className="min-w-24 text-right py-2 bg-slate-100 dark:bg-slate-800">
                        <div className="font-bold text-[10px] uppercase leading-tight">Valor Venta</div>
                        <div className="text-[9px] font-normal text-muted-foreground">(sin IGV)</div>
                      </TableHead>
                      <TableHead className="min-w-24 text-right py-2 bg-slate-100 dark:bg-slate-800">
                        <div className="font-bold text-[10px] uppercase leading-tight">Precio Compra</div>
                        <div className="text-[9px] font-normal text-muted-foreground">(con IGV)</div>
                      </TableHead>
                      <TableHead className="min-w-24 text-right py-2 bg-slate-100 dark:bg-slate-800">
                        <div className="font-bold text-[10px] uppercase leading-tight">Precio Venta</div>
                        <div className="text-[9px] font-normal text-muted-foreground">(con IGV)</div>
                      </TableHead>
                      <TableHead className="w-16 text-center py-2 bg-slate-100 dark:bg-slate-800">
                        <div className="font-bold text-[10px] uppercase leading-tight">★</div>
                      </TableHead>
                      <TableHead className="min-w-24 py-2 bg-slate-100 dark:bg-slate-800">
                        <div className="font-bold text-[10px] uppercase leading-tight">Tipo IGV</div>
                      </TableHead>
                      <TableHead className="min-w-20 py-2 bg-slate-100 dark:bg-slate-800">
                        <div className="font-bold text-[10px] uppercase leading-tight">Categoría</div>
                      </TableHead>
                      <TableHead className="min-w-20 py-2 bg-slate-100 dark:bg-slate-800">
                        <div className="font-bold text-[10px] uppercase leading-tight">Cód. SUNAT</div>
                      </TableHead>
                      <TableHead className="min-w-20 text-right py-2 bg-slate-100 dark:bg-slate-800">
                        <div className="font-bold text-[10px] uppercase leading-tight">Stock</div>
                      </TableHead>
                      <TableHead className="w-14 text-center py-2 bg-slate-100 dark:bg-slate-800">
                        <div className="font-bold text-[10px] uppercase leading-tight">...</div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productosPaginados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={14} className="text-center py-12">
                          <div className="flex flex-col items-center gap-3">
                            <Package className="w-16 h-16 text-muted-foreground/30" />
                            {busqueda ? (
                              <>
                                <p className="text-lg font-medium text-muted-foreground">
                                  No se encontraron productos con "{busqueda}"
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Intenta con otro término de búsqueda o verifica la ortografía
                                </p>
                                <Button variant="outline" size="sm" onClick={() => setBusqueda('')}>
                                  Ver todos los productos
                                </Button>
                              </>
                            ) : (
                              <>
                                <p className="text-lg font-medium text-muted-foreground">
                                  No hay productos registrados
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Comienza agregando productos a tu catálogo
                                </p>
                                <Button variant="default" size="sm" onClick={() => abrirModal()}>
                                  <Plus className="w-4 h-4 mr-2" />
                                  Crear primer producto
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      productosPaginados.map((producto) => (
                        <TableRow 
                          key={producto.id}
                          className={`hover:bg-muted/50 transition-colors ${
                            selectedProductos.includes(producto.id) ? 'bg-amber-50 dark:bg-amber-950/20' : ''
                          }`}
                        >
                          <TableCell className="py-2">
                            <Checkbox
                              checked={selectedProductos.includes(producto.id)}
                              onCheckedChange={() => toggleSelectProducto(producto.id)}
                            />
                          </TableCell>
                          <TableCell className="font-mono font-medium text-xs py-2">
                            {producto.codigo || '-'}
                          </TableCell>
                          <TableCell className="max-w-xs py-2">
                            <div className="truncate text-xs" title={producto.descripcion}>
                              {producto.descripcion}
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-2">
                            <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
                              {producto.unidad_medida}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs py-2">
                            {producto.costo_compra_unitario ? 
                              <span className="text-muted-foreground">{Number(producto.costo_compra_unitario).toFixed(2)}</span> : 
                              <span className="text-muted-foreground">-</span>
                            }
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs py-2">
                            {producto.valor_venta_unitario ? 
                              <span className="text-muted-foreground">{Number(producto.valor_venta_unitario).toFixed(2)}</span> : 
                              <span className="text-muted-foreground">-</span>
                            }
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs py-2">
                            {producto.precio_compra_unitario ? 
                              <span className="text-muted-foreground">{Number(producto.precio_compra_unitario).toFixed(2)}</span> : 
                              <span className="text-muted-foreground">-</span>
                            }
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs font-semibold py-2">
                            {producto.precio_venta_unitario ? 
                              <span className="text-green-700 dark:text-green-400">{Number(producto.precio_venta_unitario).toFixed(2)}</span> : 
                              <span className="text-muted-foreground">-</span>
                            }
                          </TableCell>
                          <TableCell className="text-center py-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleDestacado(producto.id)}
                              className="h-6 w-6 p-0"
                            >
                              {producto.destacado ? (
                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                              ) : (
                                <StarOff className="w-3.5 h-3.5 text-muted-foreground" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge 
                              variant={producto.tipo_afectacion_igv === '10' ? 'default' : 'secondary'}
                              className="text-[10px] whitespace-nowrap px-1.5 py-0"
                            >
                              {TIPOS_IGV.find((t) => t.value === producto.tipo_afectacion_igv)?.label.split('[')[0].trim() || producto.tipo_afectacion_igv}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center py-2">
                            {producto.categoria ? (
                              <span className="font-mono text-[10px]">
                                {producto.categoria}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-[10px]">-</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-[10px] text-center py-2">
                            {producto.codigo_producto_sunat || <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs py-2">
                            <span className={`font-semibold ${
                              Number(producto.stock_actual || 0) < 0 
                                ? 'text-red-600 dark:text-red-400' 
                                : Number(producto.stock_actual || 0) === 0
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-green-700 dark:text-green-400'
                            }`}>
                              {Number(producto.stock_actual || 0).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="py-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => console.log('Ver movimientos', producto.id)} className="text-xs">
                                  <Eye className="w-3.5 h-3.5 mr-2" />
                                  Ver movimientos
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => abrirModal(producto)} className="text-xs">
                                  <Edit className="w-3.5 h-3.5 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => eliminarProducto(producto.id)}
                                  className="text-red-600 text-xs"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                                  Borrar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Paginación inferior */}
          {!loading && productosFiltrados.length > itemsPerPage && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Total: {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                {[...Array(totalPages)].map((_, i) => {
                  // Mostrar solo páginas cercanas a la actual
                  if (
                    i === 0 || 
                    i === totalPages - 1 || 
                    (i >= currentPage - 2 && i <= currentPage)
                  ) {
                    return (
                      <Button
                        key={`page-${i + 1}`}
                        variant={currentPage === i + 1 ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(i + 1)}
                        className="hidden sm:inline-flex"
                      >
                        {i + 1}
                      </Button>
                    );
                  } else if (i === currentPage - 3 || i === currentPage + 1) {
                    return <span key={`ellipsis-${i}`} className="px-2 hidden sm:inline">...</span>;
                  }
                  return null;
                })}
                <span className="sm:hidden text-sm px-2">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
