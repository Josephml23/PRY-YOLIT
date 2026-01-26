import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Building2, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface Empresa {
  id: number;
  ruc: string;
  razon_social: string;
  nombre_comercial: string;
  ubigeo?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  direccion: string;
  telefono?: string;
  email?: string;
  sol_user: string;
  client_id?: string;
  modo?: 'beta' | 'prod';
  activo?: boolean;
  created_at: string;
}

export default function Empresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    ruc: '',
    razon_social: '',
    nombre_comercial: '',
    ubigeo: '',
    departamento: '',
    provincia: '',
    distrito: '',
    direccion: '',
    telefono: '',
    email: '',
    sol_user: '',
    sol_password: '',
    client_id: '',
    client_secret: '',
    modo: 'beta' as 'beta' | 'prod',
    activo: true,
  });

  const fetchEmpresas = async () => {
    try {
      const response = await api.empresas.listar();
      setEmpresas(response.data.data);
    } catch {
      toast({
        title: "Error",
        description: "No se pudo cargar la lista de empresas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingEmpresa) {
        await api.empresas.actualizar(editingEmpresa.id, formData);
        toast({
          title: "Éxito",
          description: "Empresa actualizada correctamente",
        });
      } else {
        await api.empresas.crear(formData);
        toast({
          title: "Éxito",
          description: "Empresa creada correctamente",
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchEmpresas();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast({
        title: "Error",
        description: errorMessage || "No se pudo guardar la empresa",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    setFormData({
      ruc: empresa.ruc,
      razon_social: empresa.razon_social,
      nombre_comercial: empresa.nombre_comercial || '',
      ubigeo: empresa.ubigeo || '',
      departamento: empresa.departamento || '',
      provincia: empresa.provincia || '',
      distrito: empresa.distrito || '',
      direccion: empresa.direccion,
      telefono: empresa.telefono || '',
      email: empresa.email || '',
      sol_user: empresa.sol_user,
      sol_password: '',
      client_id: empresa.client_id || '',
      client_secret: '',
      modo: empresa.modo || 'beta',
      activo: empresa.activo !== false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta empresa?')) return;
    
    try {
      await api.empresas.eliminar(id);
      toast({
        title: "Éxito",
        description: "Empresa eliminada correctamente",
      });
      fetchEmpresas();
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar la empresa",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      ruc: '',
      razon_social: '',
      nombre_comercial: '',
      ubigeo: '',
      departamento: '',
      provincia: '',
      distrito: '',
      direccion: '',
      telefono: '',
      email: '',
      sol_user: '',
      sol_password: '',
      client_id: '',
      client_secret: '',
      modo: 'beta',
      activo: true,
    });
    setEditingEmpresa(null);
  };

  const filteredEmpresas = empresas.filter(empresa =>
    empresa.ruc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.nombre_comercial?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground">
            Gestiona las empresas emisoras de comprobantes electrónicos
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEmpresa ? 'Editar Empresa' : 'Nueva Empresa'}
              </DialogTitle>
              <DialogDescription>
                Complete los datos de la empresa emisora
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ruc">RUC *</Label>
                  <Input
                    id="ruc"
                    value={formData.ruc}
                    onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                    placeholder="20123456789"
                    maxLength={11}
                    required
                    disabled={!!editingEmpresa}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="razon_social">Razón Social *</Label>
                  <Input
                    id="razon_social"
                    value={formData.razon_social}
                    onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nombre_comercial">Nombre Comercial</Label>
                  <Input
                    id="nombre_comercial"
                    value={formData.nombre_comercial}
                    onChange={(e) => setFormData({ ...formData, nombre_comercial: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Ubicación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ubigeo">Ubigeo *</Label>
                    <Input
                      id="ubigeo"
                      value={formData.ubigeo}
                      onChange={(e) => setFormData({ ...formData, ubigeo: e.target.value })}
                      placeholder="150101"
                      maxLength={6}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="departamento">Departamento *</Label>
                    <Input
                      id="departamento"
                      value={formData.departamento}
                      onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                      placeholder="Lima"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="provincia">Provincia *</Label>
                    <Input
                      id="provincia"
                      value={formData.provincia}
                      onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                      placeholder="Lima"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="distrito">Distrito *</Label>
                    <Input
                      id="distrito"
                      value={formData.distrito}
                      onChange={(e) => setFormData({ ...formData, distrito: e.target.value })}
                      placeholder="Miraflores"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="direccion">Dirección Fiscal *</Label>
                    <Input
                      id="direccion"
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="+51 1 234 5678"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contacto@empresa.com"
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Credenciales SUNAT (SOL)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sol_user">Usuario SOL *</Label>
                    <Input
                      id="sol_user"
                      value={formData.sol_user}
                      onChange={(e) => setFormData({ ...formData, sol_user: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sol_password">
                      Contraseña SOL {editingEmpresa && '(dejar vacío para mantener)'}
                    </Label>
                    <Input
                      id="sol_password"
                      type="password"
                      value={formData.sol_password}
                      onChange={(e) => setFormData({ ...formData, sol_password: e.target.value })}
                      required={!editingEmpresa}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client_id">Client ID (API)</Label>
                    <Input
                      id="client_id"
                      value={formData.client_id}
                      onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client_secret">
                      Client Secret {editingEmpresa && '(dejar vacío para mantener)'}
                    </Label>
                    <Input
                      id="client_secret"
                      type="password"
                      value={formData.client_secret}
                      onChange={(e) => setFormData({ ...formData, client_secret: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Configuración</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modo">Modo de Operación *</Label>
                    <Select
                      value={formData.modo}
                      onValueChange={(value: 'beta' | 'prod') => setFormData({ ...formData, modo: value })}
                    >
                      <SelectTrigger id="modo">
                        <SelectValue placeholder="Seleccionar modo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beta">Beta / Pruebas</SelectItem>
                        <SelectItem value="prod">Producción</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Beta usa servidores de prueba de SUNAT
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2 pt-6">
                    <Label htmlFor="activo" className="cursor-pointer">
                      Empresa Activa
                    </Label>
                    <Switch
                      id="activo"
                      checked={formData.activo}
                      onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingEmpresa ? 'Actualizar' : 'Crear'} Empresa
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Lista de Empresas</CardTitle>
              <CardDescription>
                {empresas.length} empresa{empresas.length !== 1 ? 's' : ''} registrada{empresas.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando empresas...
            </div>
          ) : filteredEmpresas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No se encontraron empresas</p>
              {searchTerm && (
                <Button 
                  variant="link" 
                  onClick={() => setSearchTerm('')}
                  className="mt-2"
                >
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100 dark:bg-slate-800 border-b-2">
                    <TableHead className="min-w-32 py-2 px-2 bg-slate-100 dark:bg-slate-800">
                      <div className="font-bold text-xs uppercase">RUC</div>
                    </TableHead>
                    <TableHead className="min-w-48 py-2 px-2 bg-slate-100 dark:bg-slate-800">
                      <div className="font-bold text-xs uppercase">Razón Social</div>
                    </TableHead>
                    <TableHead className="min-w-40 py-2 px-2 bg-slate-100 dark:bg-slate-800 hidden md:table-cell">
                      <div className="font-bold text-xs uppercase">Nombre Comercial</div>
                    </TableHead>
                    <TableHead className="min-w-32 py-2 px-2 bg-slate-100 dark:bg-slate-800 hidden lg:table-cell">
                      <div className="font-bold text-xs uppercase">Usuario SOL</div>
                    </TableHead>
                    <TableHead className="w-24 text-center py-2 px-2 bg-slate-100 dark:bg-slate-800">
                      <div className="font-bold text-xs uppercase">Acciones</div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmpresas.map((empresa) => (
                    <TableRow key={empresa.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="py-2 px-2 font-mono text-[14px]">{empresa.ruc}</TableCell>
                      <TableCell className="py-2 px-2 text-[14px]">{empresa.razon_social}</TableCell>
                      <TableCell className="py-2 px-2 hidden md:table-cell text-[14px] text-muted-foreground">
                        {empresa.nombre_comercial || '-'}
                      </TableCell>
                      <TableCell className="py-2 px-2 hidden lg:table-cell font-mono text-[14px]">
                        {empresa.sol_user}
                      </TableCell>
                      <TableCell className="py-2 px-2">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(empresa)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(empresa.id)}
                          >
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
