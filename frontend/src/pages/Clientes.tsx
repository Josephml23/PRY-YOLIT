import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Search, Users, Edit, Trash2, Plus } from 'lucide-react';

interface Cliente {
  id: number;
  tipo_doc: string;
  num_doc: string;
  denominacion: string;
  razon_comercial?: string | null;
  direccion?: string | null;
  email?: string | null;
  telefono?: string | null;
}

interface ClienteFormData {
  tipo_doc: string;
  num_doc: string;
  denominacion: string;
  razon_comercial: string;
  direccion: string;
  email: string;
  telefono: string;
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<ClienteFormData>({
    tipo_doc: '6',
    num_doc: '',
    denominacion: '',
    razon_comercial: '',
    direccion: '',
    email: '',
    telefono: '',
  });

  const { toast } = useToast();

  const fetchClientes = async () => {
    try {
      const response = await api.clientes.listar(searchTerm ? { search: searchTerm } : undefined);
      setClientes(response.data);
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
  };

  useEffect(() => {
    fetchClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      setFormData({
        tipo_doc: '6',
        num_doc: '',
        denominacion: '',
        razon_comercial: '',
        direccion: '',
        email: '',
        telefono: '',
      });
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
      num_doc: cliente.num_doc,
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
      cliente.num_doc.toLowerCase().includes(term) ||
      (cliente.razon_comercial || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona tus clientes (entidades) importados desde NubeFact y creados manualmente
          </p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingCliente(null);
            }
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
      </div>

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
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onBlur={fetchClientes}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando clientes...</div>
          ) : filteredClientes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No se encontraron clientes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100 dark:bg-slate-800 border-b-2">
                    <TableHead className="w-20 py-2 px-2 bg-slate-100 dark:bg-slate-800">
                      <div className="font-bold text-xs uppercase">Tipo Doc</div>
                    </TableHead>
                    <TableHead className="w-32 py-2 px-2 bg-slate-100 dark:bg-slate-800">
                      <div className="font-bold text-xs uppercase">N° Doc</div>
                    </TableHead>
                    <TableHead className="min-w-40 max-w-60 py-2 px-2 bg-slate-100 dark:bg-slate-800">
                      <div className="font-bold text-xs uppercase">Razón Social / Nombre</div>
                    </TableHead>
                    <TableHead className="min-w-32 max-w-48 py-2 px-2 bg-slate-100 dark:bg-slate-800 hidden md:table-cell">
                      <div className="font-bold text-xs uppercase">Nombre Comercial</div>
                    </TableHead>
                    <TableHead className="min-w-32 max-w-56 py-2 px-2 bg-slate-100 dark:bg-slate-800 hidden lg:table-cell">
                      <div className="font-bold text-xs uppercase">Dirección</div>
                    </TableHead>
                    <TableHead className="min-w-28 max-w-40 py-2 px-2 bg-slate-100 dark:bg-slate-800 hidden lg:table-cell">
                      <div className="font-bold text-xs uppercase">Email</div>
                    </TableHead>
                    <TableHead className="w-24 py-2 px-2 bg-slate-100 dark:bg-slate-800 hidden xl:table-cell">
                      <div className="font-bold text-xs uppercase">Teléfono</div>
                    </TableHead>
                    <TableHead className="w-28 py-2 px-2 bg-slate-100 dark:bg-slate-800">
                      <div className="font-bold text-xs uppercase text-center">Acciones</div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.map((cliente) => (
                    <TableRow key={cliente.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="py-2 px-2 font-mono text-[14px]">{cliente.tipo_doc}</TableCell>
                      <TableCell className="py-2 px-2 font-mono text-[14px]">{cliente.num_doc}</TableCell>
                      <TableCell className="py-2 px-2 text-[14px] max-w-60">
                        <div className="truncate" title={cliente.denominacion}>{cliente.denominacion}</div>
                      </TableCell>
                      <TableCell className="py-2 px-2 hidden md:table-cell text-[14px] text-muted-foreground max-w-48">
                        <div className="truncate" title={cliente.razon_comercial || '-'}>{cliente.razon_comercial || '-'}</div>
                      </TableCell>
                      <TableCell className="py-2 px-2 hidden lg:table-cell text-[14px] text-muted-foreground max-w-56">
                        <div className="truncate" title={cliente.direccion || '-'}>{cliente.direccion || '-'}</div>
                      </TableCell>
                      <TableCell className="py-2 px-2 hidden lg:table-cell text-[14px] text-muted-foreground max-w-40">
                        <div className="truncate" title={cliente.email || '-'}>{cliente.email || '-'}</div>
                      </TableCell>
                      <TableCell className="py-2 px-2 hidden xl:table-cell text-[14px] text-muted-foreground">
                        {cliente.telefono || '-'}
                      </TableCell>
                      <TableCell className="py-2 px-2">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(cliente)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(cliente.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
