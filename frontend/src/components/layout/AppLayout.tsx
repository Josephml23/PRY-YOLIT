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

// Constants moved outside component to prevent recreation on each render
const LOGO_URL = '/nubofact-logo.png';

const LOGO_STYLES = {
  imageRendering: 'crisp-edges' as const,
  objectFit: 'contain' as const,
  objectPosition: 'center center',
  padding: '0',
  margin: '-32% 0',
  transform: 'scale(2.2)',
  maxWidth: '100%',
  display: 'block'
};

const MENU_ITEMS = [
  { title: 'Dashboard', icon: Home, url: '/app' },
  { title: 'Empresas', icon: Building2, url: '/app/empresas' },
  { title: 'Clientes', icon: Users, url: '/app/clientes' },
  { title: 'Oportunidades', icon: FileText, url: '/app/oportunidades' },
  { title: 'Facturación', icon: Receipt, url: '/app/facturacion' },
  { title: 'Productos', icon: Package, url: '/app/productos' },
  { title: 'Documentos', icon: FolderOpen, url: '/app/documentos' },
  { title: 'Pagos', icon: CreditCard, url: '/app/pagos' },
] as const;

/**
 * AppLayout Component
 * 
 * Main application layout with sidebar navigation and header.
 * Provides consistent layout structure across all app pages.
 */
export function AppLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[hsl(var(--nubofact-background))]">
        <Sidebar className="border-r bg-[#234662]">
          <SidebarContent className="bg-[#234662]">
            <div className="border-b border-[#1a3548] flex items-center justify-center overflow-hidden" style={{ height: '56px', padding: '0', margin: '0', lineHeight: '0' }}>
              <Link to="/app" className="flex items-center justify-center w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" style={{ padding: '0', margin: '0', lineHeight: '0' }}>
                <img
                  src={LOGO_URL}
                  alt="Nubofact - Sistema de Facturacion Electronica"
                  className="w-full h-full object-contain"
                  style={LOGO_STYLES}
                  fetchPriority="high"
                />
              </Link>
            </div>
            
            <SidebarGroup>
              <SidebarGroupLabel className="text-white/70">Navegación</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {MENU_ITEMS.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild
                        isActive={location.pathname === item.url}
                        className="text-white hover:bg-[#1a3548] data-[active=true]:bg-[#1a3548]"
                      >
                        <Link to={item.url}>
                          <item.icon className="w-4 h-4" aria-hidden="true" />
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
                    <SidebarMenuButton asChild className="text-white hover:bg-[#1a3548]">
                      <Link to="/app/configuracion">
                        <Settings className="w-4 h-4" />
                        <span>Configuración</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="text-white hover:bg-[#1a3548]">
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
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
