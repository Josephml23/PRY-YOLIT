import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmitirFactura from './Facturacion/EmitirFactura';
import ListaComprobantes from './Facturacion/ListaComprobantes';
import { FileText, List } from 'lucide-react';

export default function FacturacionNubefact() {
  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="emitir" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="emitir" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Emitir Comprobante
          </TabsTrigger>
          <TabsTrigger value="lista" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Lista de Comprobantes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emitir">
          <EmitirFactura />
        </TabsContent>

        <TabsContent value="lista">
          <ListaComprobantes />
        </TabsContent>
      </Tabs>
    </div>
  );
}
