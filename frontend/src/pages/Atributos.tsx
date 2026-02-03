import { useState, useEffect } from 'react';
import { NubofactHeader } from '@/components/layout/NubofactHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Pencil, Trash2, ChevronDown, ChevronLeft, ChevronRight, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { Atributo, AtributoFormData } from '@/types';

const initialFormData: AtributoFormData = {
  codigo: '',
  descripcion: '',
  activo: true,
};

export default function Atributos() {
  const [atributos, setAtributos] = useState<Atributo[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoFiltro, setTipoFiltro] = useState<'descripcion'>('descripcion');
  const [valorFiltro, setValorFiltro] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingAtributo, setEditingAtributo] = useState<Atributo | null>(null);
  const [formData, setFormData] = useState<AtributoFormData>(initialFormData);
  const [atributoToDelete, setAtributoToDelete] = useState<Atributo | null>(null);

  useEffect(() => {
    const fetchAtributos = async () => {
      try {
        setLoading(true);
        const response = await api.atributos.listar();
        setAtributos(response.data);
      } catch (error) {
        console.error('Error al cargar atributos:', error);
        toast.error('Error al cargar los atributos');
      } finally {
        setLoading(false);
      }
    };

    fetchAtributos();
  }, []);

  const atributosFiltrados = atributos.filter((atributo) => {
    return atributo.descripcion.toLowerCase().includes(valorFiltro.toLowerCase());
  });

  const totalItems = atributosFiltrados.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const atributosPaginados = atributosFiltrados.slice(startIndex, endIndex);

  const handleEdit = (atributo: Atributo) => {
    setEditingAtributo(atributo);
    setFormData({
      codigo: atributo.codigo || '',
      descripcion: atributo.descripcion,
      activo: atributo.activo,
    });
    setShowModal(true);
  };

  const handleDelete = (atributo: Atributo) => {
    setAtributoToDelete(atributo);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!atributoToDelete) return;

    try {
      await api.atributos.eliminar(atributoToDelete.id);
      setAtributos(atributos.filter((a) => a.id !== atributoToDelete.id));
      toast.success('Atributo eliminado exitosamente');
      setShowDeleteModal(false);
      setAtributoToDelete(null);
    } catch {
      toast.error('Error al eliminar el atributo');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAtributo) {
        const response = await api.atributos.actualizar(editingAtributo.id, formData);
        setAtributos(atributos.map((a) => (a.id === editingAtributo.id ? response.data.data : a)));
        toast.success('Atributo actualizado exitosamente');
      } else {
        const response = await api.atributos.crear(formData);
        setAtributos([response.data.data, ...atributos]);
        toast.success('Atributo creado exitosamente');
      }

      setShowModal(false);
      setFormData(initialFormData);
      setEditingAtributo(null);
    } catch {
      toast.error(editingAtributo ? 'Error al actualizar el atributo' : 'Error al crear el atributo');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData(initialFormData);
    setEditingAtributo(null);
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
          <h1 className="text-xl font-semibold">Listado de Atributos</h1>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nuevo
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-muted/50 px-4 py-4 border-x border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Filtrar por:
              </label>
              <select
                id="tipo-filtro"
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value as 'descripcion')}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="descripcion">Descripción</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Ubicar:
              </label>
              <Input
                id="valor-filtro"
                placeholder="Ubicar"
                value={valorFiltro}
                onChange={(e) => setValorFiltro(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => toast.info('Funcionalidad de exportación en desarrollo')}
                className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
                size="sm"
              >
                <FileDown className="h-4 w-4 mr-1" />
                Exportar
              </Button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-card border border-border rounded-b-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Código</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Descripción</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Activo</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {atributosPaginados.map((atributo, index) => (
                  <tr key={atributo.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {atributo.codigo || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {atributo.descripcion}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {atributo.activo ? 'Si' : 'No'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                            >
                              Acciones
                              <ChevronDown className="h-4 w-4 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(atributo)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(atributo)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="bg-muted/30 px-4 py-3 border-t border-border">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">Mostrar:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-background border border-border rounded text-sm text-foreground"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <span className="text-sm text-foreground">
                  | Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems}
                </span>
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
        </div>
      </div>

      {/* Modal Crear/Editar */}
      <Dialog open={showModal} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAtributo ? 'Editar Atributo' : 'Nuevo Atributo'}</DialogTitle>
            <DialogDescription>
              {editingAtributo 
                ? 'Modifica los datos del atributo existente.' 
                : 'Completa los datos para crear un nuevo atributo.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  placeholder="Ingrese el código del atributo"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Input
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  required
                  placeholder="Ingrese la descripción del atributo"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="activo" className="cursor-pointer">Activo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingAtributo ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Eliminar */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el atributo "{atributoToDelete?.descripcion}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
