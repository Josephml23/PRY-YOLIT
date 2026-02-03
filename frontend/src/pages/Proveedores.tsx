import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Pencil, Trash2, Plus, MapPin, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { NubofactHeader } from '@/components/layout/NubofactHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Proveedor, ProveedorFormData } from '@/types';

const initialFormData: ProveedorFormData = {
  tipo_doc: '6',
  num_doc: '',
  denominacion: '',
  razon_comercial: '',
  direccion: '',
  email: '',
  telefono: '',
};

export default function Proveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoFiltro, setTipoFiltro] = useState<'nombre' | 'ruc' | 'fecha' | 'zona'>('nombre');
  const [valorFiltro, setValorFiltro] = useState('');
  const [filtroACuenta, setFiltroACuenta] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);
  const [formData, setFormData] = useState<ProveedorFormData>(initialFormData);
  const itemsPerPage = 10;

  const fetchProveedores = useCallback(async () => {
    try {
      const response = await api.proveedores.listar();

      const proveedoresMapped: Proveedor[] = response.data.map((entidad: { 
        id: number; 
        tipo_doc?: string; 
        num_doc?: string; 
        denominacion?: string; 
        razon_comercial?: string | null; 
        direccion?: string | null; 
        email?: string | null; 
        telefono?: string | null;
        created_by?: string;
        created_at?: string;
      }) => ({
        id: entidad.id,
        tipo_doc: entidad.tipo_doc || '',
        num_doc: entidad.num_doc || '',
        denominacion: entidad.denominacion || '',
        razon_comercial: entidad.razon_comercial ?? '',
        direccion: entidad.direccion ?? '',
        email: entidad.email ?? '',
        telefono: entidad.telefono ?? '',
        created_by: entidad.created_by || 'ADMINISTRADOR - CAJA',
        created_at: entidad.created_at || new Date().toISOString(),
      }));
      setProveedores(proveedoresMapped);
    } catch (error) {
      console.error(error);
      toast.error('Error', {
        description: 'No se pudo cargar la lista de proveedores',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProveedores();
  }, [fetchProveedores]);

  // Filtrar proveedores
  const proveedoresFiltrados = proveedores.filter((proveedor) => {
    if (!valorFiltro) return true;

    const valor = valorFiltro.toLowerCase();
    
    switch (tipoFiltro) {
      case 'nombre':
        return proveedor.denominacion.toLowerCase().includes(valor);
      case 'ruc':
        return (proveedor.num_doc || '').toLowerCase().includes(valor);
      case 'fecha': {
        if (!proveedor.created_at) return false;
        const fechaProveedor = new Date(proveedor.created_at).toISOString().split('T')[0];
        return fechaProveedor === valorFiltro;
      }
      case 'zona':
        return (proveedor.direccion || '').toLowerCase().includes(valor);
      default:
        return true;
    }
  });

  // Paginación
  const totalPages = Math.ceil(proveedoresFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const proveedoresPaginados = proveedoresFiltrados.slice(startIndex, startIndex + itemsPerPage);

  const handleEdit = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor);
    setFormData({
      tipo_doc: proveedor.tipo_doc,
      num_doc: proveedor.num_doc || '',
      denominacion: proveedor.denominacion,
      razon_comercial: proveedor.razon_comercial || '',
      direccion: proveedor.direccion || '',
      email: proveedor.email || '',
      telefono: proveedor.telefono || '',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProveedor) return;

    try {
      await api.proveedores.eliminar(selectedProveedor.id);
      toast.success('Éxito', {
        description: 'Proveedor eliminado correctamente',
      });
      setIsDeleteModalOpen(false);
      setSelectedProveedor(null);
      fetchProveedores();
    } catch (error) {
      console.error(error);
      toast.error('Error', {
        description: 'No se pudo eliminar el proveedor',
      });
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProveedor) return;

    try {
      await api.proveedores.actualizar(selectedProveedor.id, formData);
      toast.success('Éxito', {
        description: 'Proveedor actualizado correctamente',
      });
      setIsEditModalOpen(false);
      setSelectedProveedor(null);
      setFormData(initialFormData);
      fetchProveedores();
    } catch (error) {
      console.error(error);
      toast.error('Error', {
        description: 'No se pudo actualizar el proveedor',
      });
    }
  };

  const handleNewProveedor = () => {
    setSelectedProveedor(null);
    setFormData(initialFormData);
    setIsEditModalOpen(true);
  };

  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.proveedores.crear(formData);
      toast.success('Éxito', {
        description: 'Proveedor creado correctamente',
      });
      setIsEditModalOpen(false);
      setFormData(initialFormData);
      fetchProveedores();
    } catch (error) {
      console.error(error);
      toast.error('Error', {
        description: 'No se pudo crear el proveedor',
      });
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const fecha = date.toISOString().split('T')[0];
    const hora = date.toTimeString().split(' ')[0];
    return { fecha, hora };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NubofactHeader />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-8 text-muted-foreground">Cargando proveedores...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NubofactHeader />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header del módulo */}
        <div className="bg-primary text-primary-foreground rounded-t-lg px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Módulo de Proveedores</h1>
          <div className="flex gap-2">
            <Button
              onClick={handleNewProveedor}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nuevo
            </Button>
            <Button
              onClick={() => toast.info('Funcionalidad de Zona en desarrollo')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <MapPin className="h-4 w-4 mr-1" />
              Zona
            </Button>
            <Button
              onClick={() => toast.info('Funcionalidad de Importar en desarrollo')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="sm"
            >
              <Upload className="h-4 w-4 mr-1" />
              Importar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-muted/50 px-4 py-4 border-x border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Filtrar por
              </label>
              <select
                value={tipoFiltro}
                onChange={(e) => {
                  setTipoFiltro(e.target.value as 'nombre' | 'ruc' | 'fecha' | 'zona');
                  setValorFiltro('');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="nombre">Nombre</option>
                <option value="ruc">RUC</option>
                <option value="fecha">Fecha</option>
                <option value="zona">Zona</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Buscar
              </label>
              {tipoFiltro === 'fecha' ? (
                <input
                  type="date"
                  value={valorFiltro}
                  onChange={(e) => {
                    setValorFiltro(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <input
                  type="text"
                  value={valorFiltro}
                  onChange={(e) => {
                    setValorFiltro(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={
                    tipoFiltro === 'nombre' ? 'Filtrar por nombre...' :
                    tipoFiltro === 'ruc' ? 'Filtrar por RUC...' :
                    'Filtrar por zona...'
                  }
                />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2 h-full pt-6">
                <input
                  type="checkbox"
                  id="filtro-a-cuenta"
                  checked={filtroACuenta}
                  onChange={(e) => {
                    setFiltroACuenta(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                />
                <label htmlFor="filtro-a-cuenta" className="text-sm font-medium text-foreground cursor-pointer">
                  A cuenta
                </label>
              </div>
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
                  <th className="px-4 py-3 text-left text-sm font-semibold">Creado por Usuario</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Proveedores</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Zona</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Datos</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedoresPaginados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      {valorFiltro
                        ? 'No se encontraron proveedores con los filtros aplicados' 
                        : 'No hay proveedores registrados'}
                    </td>
                  </tr>
                ) : (
                  proveedoresPaginados.map((proveedor, index) => {
                    const { fecha, hora } = formatDateTime(proveedor.created_at || new Date().toISOString());
                    return (
                      <tr 
                        key={proveedor.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-foreground">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="text-foreground font-medium">{proveedor.created_by || 'ADMINISTRADOR - CAJA'}</div>
                          <div className="text-xs text-muted-foreground">
                            FECHA: {fecha}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            HORA: {hora}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="text-foreground font-semibold">{proveedor.num_doc || 'S/D'}</div>
                          <div className="text-foreground">{proveedor.denominacion}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {proveedor.direccion || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {proveedor.email || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(proveedor)}
                              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(proveedor)}
                              className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {proveedoresFiltrados.length > 0 && (
            <div className="px-4 py-3 border-t border-border bg-muted/30">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, proveedoresFiltrados.length)} de {proveedoresFiltrados.length} proveedores
                </div>
                {totalPages > 1 && (
                  <div className="flex gap-1 flex-wrap">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-border rounded bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
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
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-border rounded bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edición/Nuevo Proveedor */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
          <DialogHeader>
            <DialogTitle>{selectedProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle>
            <DialogDescription>
              {selectedProveedor ? 'Modifica los datos del proveedor' : 'Completa los datos del nuevo proveedor'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={selectedProveedor ? handleSaveEdit : handleSaveNew} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo_doc">Tipo Doc *</Label>
                <Input
                  id="tipo_doc"
                  value={formData.tipo_doc}
                  onChange={(e) => setFormData({ ...formData, tipo_doc: e.target.value })}
                  placeholder="6 (RUC), 1 (DNI), etc."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="num_doc">N° Doc *</Label>
                <Input
                  id="num_doc"
                  value={formData.num_doc}
                  onChange={(e) => setFormData({ ...formData, num_doc: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="denominacion">Razón Social / Nombre *</Label>
                <Input
                  id="denominacion"
                  value={formData.denominacion}
                  onChange={(e) => setFormData({ ...formData, denominacion: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="razon_comercial">Nombre Comercial</Label>
                <Input
                  id="razon_comercial"
                  value={formData.razon_comercial}
                  onChange={(e) => setFormData({ ...formData, razon_comercial: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedProveedor(null);
                  setFormData(initialFormData);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {selectedProveedor ? 'Actualizar' : 'Crear'} Proveedor
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación de Eliminación */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar el proveedor <strong>{selectedProveedor?.denominacion}</strong>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedProveedor(null);
              }}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={confirmDelete}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
