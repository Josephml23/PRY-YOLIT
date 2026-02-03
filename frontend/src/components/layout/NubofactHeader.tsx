import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Settings, 
  ShoppingCart, 
  Package, 
  FileText, 
  Archive, 
  BarChart3,
  ChevronDown,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  hasDropdown?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Mantenimiento', icon: Settings, path: '/mantenimiento', hasDropdown: true },
  { label: 'Compras', icon: ShoppingCart, path: '/compras', hasDropdown: true },
  { label: 'Inventario', icon: Package, path: '/inventario', hasDropdown: true },
  { label: "CPE's", icon: FileText, path: '/cpes', hasDropdown: true },
  { label: 'Archivo De Caja', icon: Archive, path: '/archivo-caja', hasDropdown: true },
  { label: 'Reportes', icon: BarChart3, path: '/reportes', hasDropdown: true },
];

const dashboardTabs = [
  { label: 'Dashboard', path: '/' },
  { label: 'Dashboard Caja', path: '/dashboard-caja' },
];

export function NubofactHeader() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('/');

  return (
    <header className="bg-[hsl(var(--nubofact-header))] text-white">
      {/* Top Bar - Altura ajustada para logo más grande */}
      <div className="flex items-center justify-between px-4 h-16">
        {/* Logo y Navigation Menu */}
        <div className="flex items-center gap-8">
          {/* Logo Nubefact - SVG inline, pegado a la izquierda */}
          <div>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 170 32" 
              height="40"
              aria-label="Nubefact Logo"
              style={{ display: 'block' }}
            >
              <text 
                x="0" 
                y="24" 
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                fontWeight="800"
                fontSize="32"
                style={{ fill: 'rgb(var(--nubofact-logo-text))', transition: 'fill 0.3s ease' }}
              >
                Nubefact
              </text>
              
              <circle 
                cx="161" 
                cy="18" 
                r="6" 
                style={{ fill: 'rgb(var(--nubofact-logo-dot))' }}
              />
            </svg>
          </div>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-1 px-3 h-9 rounded text-sm transition-colors',
                    'hover:bg-white/10',
                    location.pathname === item.path && 'bg-white/20'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.hasDropdown && <ChevronDown className="h-3.5 w-3.5" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
            <User className="h-6 w-6 text-gray-600" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[hsl(var(--nubofact-accent))] text-xs">
              Administrador
            </span>
            <span className="text-xs">PRODUCCION</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar - Altura reducida */}
      <div className="bg-[hsl(var(--nubofact-header-dark))] h-8 flex items-center">
        {dashboardTabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            onClick={() => setActiveTab(tab.path)}
            className={cn(
              'px-6 py-2 text-sm transition-colors h-full flex items-center text-white',
              activeTab === tab.path
                ? 'hover:bg-primary hover:text-primary-foreground active:bg-primary active:text-primary-foreground'
                : 'hover:bg-white/10'
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
