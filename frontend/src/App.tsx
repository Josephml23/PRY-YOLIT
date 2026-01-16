import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { AppLayout } from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';

// Páginas temporales
const EmpresasPage = () => <div>Empresas - En desarrollo</div>;
const OportunidadesPage = () => <div>Oportunidades - En desarrollo</div>;
const FacturacionPage = () => <div>Facturación - En desarrollo</div>;
const DocumentosPage = () => <div>Documentos - En desarrollo</div>;
const PagosPage = () => <div>Pagos - En desarrollo</div>;

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="facturacion-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="empresas" element={<EmpresasPage />} />
            <Route path="oportunidades" element={<OportunidadesPage />} />
            <Route path="facturacion" element={<FacturacionPage />} />
            <Route path="documentos" element={<DocumentosPage />} />
            <Route path="pagos" element={<PagosPage />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
