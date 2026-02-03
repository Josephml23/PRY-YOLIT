import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { UnidadMedida, UnidadMedidaFormData } from '@/types';
import { NubofactHeader } from '@/components/layout/NubofactHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Download, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function UnidadesMedida() {
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUnidad, setEditingUnidad] = useState<UnidadMedida | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Filtros
  const [tipoFiltro, setTipoFiltro] = useState('descripcion');
  const [valorFiltro, setValorFiltro] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form data
  const [formData, setFormData] = useState<UnidadMedidaFormData>({
    codigo: '',
    descripcion: '',
    simbolo: '',
    activo: true,
  });

  useEffect(() => {
    const fetchUnidades = async () => {
      try {
        setLoading(true);
        const response = await api.unidadesMedida.listar();
        setUnidades(response.data);
      } catch (error) {
        toast.error('Error al cargar las unidades de medida');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnidades();
  }, []);

  const unidadesFiltradas = unidades.filter((unidad) => {
    const valorBusqueda = valorFiltro.toLowerCase();
    if (tipoFiltro === 'descripcion') {
      return unidad.descripcion.toLowerCase().includes(valorBusqueda);
    } else if (tipoFiltro === 'codigo') {
      return unidad.codigo.toLowerCase().includes(valorBusqueda);
    } else if (tipoFiltro === 'simbolo') {
      return unidad.simbolo.toLowerCase().includes(valorBusqueda);
    }
    return true;
  });

  const totalItems = unidadesFiltradas.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const unidadesPaginadas = unidadesFiltradas.slice(startIndex, endIndex);

  const handleNew = () => {
    setEditingUnidad(null);
    setFormData({
      codigo: '',
      descripcion: '',
      simbolo: '',
      activo: true,
    });
    setShowModal(true);
  };

  const handleEdit = (unidad: UnidadMedida) => {
    setEditingUnidad(unidad);
    setFormData({
      codigo: unidad.codigo,
      descripcion: unidad.descripcion,
      simbolo: unidad.simbolo,
      activo: unidad.activo,
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      await api.unidadesMedida.eliminar(deletingId);
      setUnidades(unidades.filter((u) => u.id !== deletingId));
      toast.success('Unidad de medida eliminada correctamente');
      setShowDeleteModal(false);
      setDeletingId(null);
    } catch (error) {
      toast.error('Error al eliminar la unidad de medida');
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.codigo.trim() || !formData.descripcion.trim() || !formData.simbolo.trim()) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      if (editingUnidad) {
        await api.unidadesMedida.actualizar(editingUnidad.id, formData);
        toast.success('Unidad de medida actualizada correctamente');
      } else {
        await api.unidadesMedida.crear(formData);
        toast.success('Unidad de medida creada correctamente');
      }
      setShowModal(false);
      // Recargar datos
      const response = await api.unidadesMedida.listar();
      setUnidades(response.data);
    } catch (error) {
      toast.error('Error al guardar la unidad de medida');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NubofactHeader />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-primary text-primary-foreground rounded-t-lg px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Listado de Unidad de Medida</h1>
          <Button
            onClick={handleNew}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nuevo
          </Button>
        </div>

      {/* Filtros */}
      <div className="bg-muted/50 px-4 py-4 border-x border-border space-y-3">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => toast.info('Funcionalidad de exportación en desarrollo')}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Filtrar por</Label>
            <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="descripcion">Descripción</SelectItem>
                <SelectItem value="codigo">Código</SelectItem>
                <SelectItem value="simbolo">Símbolo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Buscar</Label>
            <Input
              type="text"
              value={valorFiltro}
              onChange={(e) => setValorFiltro(e.target.value)}
              placeholder="Ingrese valor..."
              className="bg-background"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-card border border-border rounded-b-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary">
              <TableHead className="text-primary-foreground font-semibold">#</TableHead>
              <TableHead className="text-primary-foreground font-semibold">Fecha de Creación</TableHead>
              <TableHead className="text-primary-foreground font-semibold">Código</TableHead>
              <TableHead className="text-primary-foreground font-semibold">Descripción</TableHead>
              <TableHead className="text-primary-foreground font-semibold">Símbolo</TableHead>
              <TableHead className="text-primary-foreground font-semibold">Activo</TableHead>
              <TableHead className="text-primary-foreground font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : unidadesPaginadas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No se encontraron unidades de medida
                </TableCell>
              </TableRow>
            ) : (
              unidadesPaginadas.map((unidad, index) => (
                <TableRow key={unidad.id}>
                  <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                  <TableCell>
                    {unidad.created_at
                      ? new Date(unidad.created_at).toLocaleString('es-PE', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </TableCell>
                  <TableCell>{unidad.codigo}</TableCell>
                  <TableCell>{unidad.descripcion}</TableCell>
                  <TableCell>{unidad.simbolo}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      unidad.activo
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}>
                      {unidad.activo ? 'SI' : 'NO'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0" size="sm">
                          Acciones
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEdit(unidad)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(unidad.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Paginación */}
        <div className="bg-muted/30 px-4 py-3 flex items-center justify-between border-t">
          <div className="flex items-center gap-2">
            <Label>Registros por página:</Label>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-border rounded bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm border border-border rounded transition-colors ${
                    currentPage === page
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-muted'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 text-sm border border-border rounded bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Crear/Editar */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUnidad ? 'Editar Unidad de Medida' : 'Nueva Unidad de Medida'}
            </DialogTitle>
            <DialogDescription>
              {editingUnidad
                ? 'Modifique los datos de la unidad de medida y guarde los cambios.'
                : 'Complete los datos de la nueva unidad de medida.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="Ej: ZZ, KGM"
                maxLength={50}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Input
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Ej: KILOGRAMO"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="simbolo">Símbolo *</Label>
              <Input
                id="simbolo"
                value={formData.simbolo}
                onChange={(e) => setFormData({ ...formData, simbolo: e.target.value })}
                placeholder="Ej: KG"
                maxLength={20}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, activo: checked as boolean })
                }
              />
              <Label htmlFor="activo" className="cursor-pointer">
                Activo
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                {editingUnidad ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Eliminar */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar esta unidad de medida? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
