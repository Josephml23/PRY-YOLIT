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
  LogOut,
  Package
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

const logoUrl = '/nubofact-logo.png';

const menuItems = [
  { title: 'Dashboard', icon: Home, url: '/app' },
  { title: 'Empresas', icon: Building2, url: '/app/empresas' },
  { title: 'Clientes', icon: Users, url: '/app/clientes' },
  { title: 'Oportunidades', icon: FileText, url: '/app/oportunidades' },
  { title: 'Facturación', icon: Receipt, url: '/app/facturacion' },
  { title: 'Productos', icon: Package, url: '/app/productos' },
  { title: 'Documentos', icon: FolderOpen, url: '/app/documentos' },
  { title: 'Pagos', icon: CreditCard, url: '/app/pagos' },
];

export function AppLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <SidebarContent>
            <div className="border-b flex items-center justify-center overflow-hidden" style={{ height: '56px', padding: '0', margin: '0', lineHeight: '0' }}>
              <Link to="/app" className="flex items-center justify-center w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" style={{ padding: '0', margin: '0', lineHeight: '0' }}>
                <img
                  src={logoUrl}
                  alt="Nubofact"
                  className="w-full h-full object-contain dark:invert-0"
                  style={{
                    imageRendering: 'crisp-edges',
                    objectFit: 'contain',
                    objectPosition: 'center center',
                    padding: '0',
                    margin: '-32% 0',
                    transform: 'scale(2.2)',
                    maxWidth: '100%',
                    display: 'block'
                  }}
                  fetchPriority="high"
                />
              </Link>
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
                      <Link to="/app/configuracion">
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

        <main className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-card text-card-foreground px-4 md:px-6" style={{ height: '56px' }}>
            <SidebarTrigger className="shrink-0 text-card-foreground hover:bg-muted" />
            <div className="flex-1 min-w-0" />
            <ThemeToggle />
          </header>
          
          <div className="p-0 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
