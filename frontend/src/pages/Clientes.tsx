import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Pencil, Trash2 } from 'lucide-react';
import { NubofactHeader } from '@/components/layout/NubofactHeader';
import type { Cliente } from '@/types';

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroBuscar, setFiltroBuscar] = useState('');
  const [filtroCuenta, setFiltroCuenta] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { toast } = useToast();

  const fetchClientes = useCallback(async () => {
    try {
      const response = await api.clientes.listar();

      const clientesMapped: Cliente[] = response.data.map((entidad: { 
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
        created_by: entidad.created_by || 'US-UNORD-CAAA',
        created_at: entidad.created_at || new Date().toISOString(),
      }));
      setClientes(clientesMapped);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la lista de clientes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  // Filtrar clientes
  const clientesFiltrados = clientes.filter((cliente) => {
    const matchNombre = cliente.denominacion.toLowerCase().includes(filtroNombre.toLowerCase());
    const matchBuscar = 
      (cliente.num_doc || '').toLowerCase().includes(filtroBuscar.toLowerCase()) ||
      cliente.denominacion.toLowerCase().includes(filtroBuscar.toLowerCase()) ||
      (cliente.created_by || '').toLowerCase().includes(filtroBuscar.toLowerCase());
    
    return matchNombre && matchBuscar;
  });

  // Paginación
  const totalPages = Math.ceil(clientesFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const clientesPaginados = clientesFiltrados.slice(startIndex, startIndex + itemsPerPage);

  const handleEdit = (id: number) => {
    console.log('Editar cliente:', id);
    toast({ title: 'Info', description: 'Funcionalidad de edición en desarrollo' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return;

    try {
      await api.clientes.eliminar(id);
      toast({ title: 'Éxito', description: 'Cliente eliminado correctamente' });
      fetchClientes();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el cliente',
        variant: 'destructive',
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
          <div className="text-center py-8 text-muted-foreground">Cargando clientes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NubofactHeader />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header del módulo */}
        <div className="bg-primary text-primary-foreground rounded-t-lg px-4 py-3">
          <h1 className="text-xl font-semibold">Módulo de Clientes</h1>
        </div>

        {/* Filtros */}
        <div className="bg-muted/50 px-4 py-4 border-x border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Nombre
              </label>
              <input
                type="text"
                value={filtroNombre}
                onChange={(e) => {
                  setFiltroNombre(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Filtrar por nombre..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Buscar
              </label>
              <input
                type="text"
                value={filtroBuscar}
                onChange={(e) => {
                  setFiltroBuscar(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Código o nombre..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                A cuenta
              </label>
              <input
                type="text"
                value={filtroCuenta}
                onChange={(e) => setFiltroCuenta(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Cuenta..."
              />
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
                  <th className="px-4 py-3 text-left text-sm font-semibold">Clientes</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Zona</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Datos</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesPaginados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      {filtroNombre || filtroBuscar 
                        ? 'No se encontraron clientes con los filtros aplicados' 
                        : 'No hay clientes registrados'}
                    </td>
                  </tr>
                ) : (
                  clientesPaginados.map((cliente, index) => {
                    const { fecha, hora } = formatDateTime(cliente.created_at || new Date().toISOString());
                    return (
                      <tr 
                        key={cliente.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-foreground">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="text-foreground font-medium">{cliente.created_by || 'US-UNORD-CAAA'}</div>
                          <div className="text-xs text-muted-foreground">
                            FECHA: {fecha}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            HORA: {hora}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="text-foreground font-semibold">{cliente.num_doc || 'S/D'}</div>
                          <div className="text-foreground">{cliente.denominacion}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {cliente.direccion || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {cliente.email || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(cliente.id)}
                              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(cliente.id)}
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
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-border bg-muted/30">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, clientesFiltrados.length)} de {clientesFiltrados.length} clientes
                </div>
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-border rounded bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
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
                    className="px-3 py-1 text-sm border border-border rounded bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
