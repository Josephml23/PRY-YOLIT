import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Home, 
  Building2, 
  FileText, 
  Receipt, 
  FolderOpen, 
  CreditCard,
  Users,
  Settings,
  LogOut
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';

const menuItems = [
  { title: 'Dashboard', icon: Home, url: '/' },
  { title: 'Empresas', icon: Building2, url: '/empresas' },
  { title: 'Clientes', icon: Users, url: '/clientes' },
  { title: 'Oportunidades', icon: FileText, url: '/oportunidades' },
  { title: 'Facturación', icon: Receipt, url: '/facturacion' },
  { title: 'Documentos', icon: FolderOpen, url: '/documentos' },
  { title: 'Pagos', icon: CreditCard, url: '/pagos' },
];

export function AppLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <SidebarContent>
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Facturación SUNAT
              </h2>
              <p className="text-sm text-muted-foreground">Sistema de Facturación Electrónica</p>
            </div>
            
            <SidebarGroup>
              <SidebarGroupLabel>Navegación</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild
                        isActive={location.pathname === item.url}
                      >
                        <Link to={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/configuracion">
                        <Settings className="w-4 h-4" />
                        <span>Configuración</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4 md:px-6 lg:px-8">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-lg md:text-xl lg:text-2xl font-semibold truncate">
                {menuItems.find(item => item.url === location.pathname)?.title || 'Plataforma de Facturación'}
              </h1>
            </div>
            <ThemeToggle />
          </header>
          
          <div className="p-0 max-w-500 mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
