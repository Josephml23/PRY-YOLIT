import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { AppLayout } from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import DashboardTv from '@/pages/DashboardTv';
import Empresas from '@/pages/Empresas';
import Clientes from '@/pages/Clientes';
import Facturacion from '@/pages/Facturacion';
import FacturacionNubefact from '@/pages/FacturacionNubefact';
import Oportunidades from '@/pages/Oportunidades';
import DetalleOportunidad from '@/pages/DetalleOportunidad';
import Configuracion from '@/pages/Configuracion';
import DocumentosPage from '@/pages/Documentos';
import PagosPage from '@/pages/Pagos';
import GestionProductos from '@/pages/GestionProductos';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="facturacion-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard-tv" element={<DashboardTv />} />
            <Route path="empresas" element={<Empresas />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="oportunidades" element={<Oportunidades />} />
            <Route path="oportunidades/:id" element={<DetalleOportunidad />} />
            <Route path="facturacion" element={<Facturacion />} />
            <Route path="facturacion-nubefact" element={<FacturacionNubefact />} />
            <Route path="productos" element={<GestionProductos />} />
            <Route path="documentos" element={<DocumentosPage />} />
            <Route path="pagos" element={<PagosPage />} />
            <Route path="configuracion" element={<Configuracion />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
