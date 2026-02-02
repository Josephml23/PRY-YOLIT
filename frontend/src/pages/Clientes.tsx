import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Search, Users, Edit, Trash2, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/data/DataTable';
import type { Cliente, ClienteFormData } from '@/types';

const initialFormData: ClienteFormData = {
  tipo_doc: '6',
  num_doc: '',
  denominacion: '',
  razon_comercial: '',
  direccion: '',
  email: '',
  telefono: '',
};

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<ClienteFormData>(initialFormData);

  const { toast } = useToast();

  const fetchClientes = useCallback(async () => {
    try {
      const response = await api.clientes.listar(searchTerm ? { search: searchTerm } : undefined);

      const clientesMapped: Cliente[] = response.data.map((entidad: { id: number; tipo_doc?: string; num_doc?: string; denominacion?: string; razon_comercial?: string | null; direccion?: string | null; email?: string | null; telefono?: string | null }) => ({
        id: entidad.id,
        tipo_doc: entidad.tipo_doc || '',
        num_doc: entidad.num_doc || '',
        denominacion: entidad.denominacion || '',
        razon_comercial: entidad.razon_comercial ?? '',
        direccion: entidad.direccion ?? '',
        email: entidad.email ?? '',
        telefono: entidad.telefono ?? '',
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
  }, [searchTerm, toast]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCliente) {
        await api.clientes.actualizar(editingCliente.id, formData);
        toast({ title: 'Éxito', description: 'Cliente actualizado correctamente' });
      } else {
        await api.clientes.crear(formData);
        toast({ title: 'Éxito', description: 'Cliente creado correctamente' });
      }
      setIsDialogOpen(false);
      setEditingCliente(null);
      setFormData(initialFormData);
      fetchClientes();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el cliente',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      tipo_doc: cliente.tipo_doc,
      num_doc: cliente.num_doc || '',
      denominacion: cliente.denominacion,
      razon_comercial: cliente.razon_comercial || '',
      direccion: cliente.direccion || '',
      email: cliente.email || '',
      telefono: cliente.telefono || '',
    });
    setIsDialogOpen(true);
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

  const filteredClientes = clientes.filter((cliente) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      cliente.denominacion.toLowerCase().includes(term) ||
      (cliente.num_doc || '').toLowerCase().includes(term) ||
      (cliente.razon_comercial || '').toLowerCase().includes(term)
    );
  });

  const columns: DataTableColumn<Cliente>[] = [
    { id: 'tipo_doc', header: 'Tipo Doc', className: 'w-20 font-mono text-sm', cell: (r) => r.tipo_doc },
    { id: 'num_doc', header: 'N° Doc', className: 'w-32 font-mono text-sm', cell: (r) => r.num_doc || '' },
    {
      id: 'denominacion',
      header: 'Razón Social / Nombre',
      className: 'min-w-40 max-w-60 text-sm',
      cell: (r) => <div className="truncate" title={r.denominacion}>{r.denominacion}</div>,
    },
    {
      id: 'razon_comercial',
      header: 'Nombre Comercial',
      className: 'min-w-32 max-w-48 hidden md:table-cell text-sm text-muted-foreground',
      cell: (r) => <div className="truncate" title={r.razon_comercial || '-'}>{r.razon_comercial || '-'}</div>,
    },
    {
      id: 'direccion',
      header: 'Dirección',
      className: 'min-w-32 max-w-56 hidden lg:table-cell text-sm text-muted-foreground',
      cell: (r) => <div className="truncate" title={r.direccion || '-'}>{r.direccion || '-'}</div>,
    },
    {
      id: 'email',
      header: 'Email',
      className: 'min-w-28 max-w-40 hidden lg:table-cell text-sm text-muted-foreground',
      cell: (r) => <div className="truncate" title={r.email || '-'}>{r.email || '-'}</div>,
    },
    {
      id: 'telefono',
      header: 'Teléfono',
      className: 'w-24 hidden xl:table-cell text-sm text-muted-foreground',
      cell: (r) => r.telefono || '-',
    },
    {
      id: 'acciones',
      header: 'Acciones',
      className: 'w-28 text-center',
      cell: (r) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleEdit(r)} aria-label="Editar cliente">
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)} aria-label="Eliminar cliente">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      <PageHeader
        title="Clientes"
        description="Gestiona tus clientes (entidades) importados desde NubeFact y creados manualmente"
        actions={
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setEditingCliente(null);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
                <DialogDescription>Completa los datos del cliente</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingCliente ? 'Actualizar' : 'Crear'} Cliente</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>
                {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} encontrado{clientes.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onBlur={fetchClientes}
                className="pl-8"
                aria-label="Buscar cliente por nombre, documento o razón comercial"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable<Cliente>
            columns={columns}
            data={filteredClientes}
            loading={loading}
            emptyState={{
              icon: Users,
              title: 'No se encontraron clientes',
              description: searchTerm ? 'Prueba con otro criterio de búsqueda.' : 'Crea tu primer cliente con el botón Nuevo Cliente.',
            }}
            getRowId={(row) => row.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
