import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmitirComprobante from './Facturacion/EmitirComprobante';
import EmitirGuiaRemision from './Facturacion/EmitirGuiaRemision';
import ListaComprobantes from './Facturacion/ListaComprobantes';
import { FileText, Truck, List } from 'lucide-react';

export default function Facturacion() {
  return (
    <div className="container mx-auto py-4 sm:py-6">
      <Tabs defaultValue="emitir" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full max-w-3xl grid-cols-3">
          <TabsTrigger value="emitir" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Emitir Comprobantes</span>
            <span className="sm:hidden">Emitir</span>
          </TabsTrigger>
          <TabsTrigger value="guia" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span className="hidden sm:inline">Guía Remisión</span>
            <span className="sm:hidden">GRE</span>
          </TabsTrigger>
          <TabsTrigger value="lista" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Comprobantes</span>
            <span className="sm:hidden">Lista</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emitir">
          <EmitirComprobante />
        </TabsContent>

        <TabsContent value="guia">
          <EmitirGuiaRemision />
        </TabsContent>

        <TabsContent value="lista">
          <ListaComprobantes />
        </TabsContent>
      </Tabs>
    </div>
  );
}
