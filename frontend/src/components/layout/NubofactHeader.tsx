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
  { label: 'Dashboard gra', path: '/dashboard-grafico' },
];

export function NubofactHeader() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('/');

  return (
    <header className="bg-[hsl(var(--nubofact-header))] text-white">
      {/* Top Bar - Altura reducida */}
      <div className="flex items-center justify-between px-4 h-12">
        {/* Navigation Menu */}
        <div className="flex items-center gap-4">
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
        <div className="flex items-center gap-2">
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
              'px-6 py-2 text-sm transition-colors h-full flex items-center',
              activeTab === tab.path
                ? 'bg-gray-200 text-gray-900'
                : 'text-white hover:bg-white/10'
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
