import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmitirFactura from './Facturacion/EmitirFactura';
import EmitirBoleta from './Facturacion/EmitirBoleta';
import EmitirNotaCredito from './Facturacion/EmitirNotaCredito';
import ListaComprobantes from './Facturacion/ListaComprobantes';
import { FileText, Receipt, FileCheck, List } from 'lucide-react';

export default function FacturacionNubefact() {
  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="factura" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="factura" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Factura
          </TabsTrigger>
          <TabsTrigger value="boleta" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Boleta
          </TabsTrigger>
          <TabsTrigger value="nota-credito" className="flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Nota Crédito
          </TabsTrigger>
          <TabsTrigger value="lista" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Comprobantes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="factura">
          <EmitirFactura />
        </TabsContent>

        <TabsContent value="boleta">
          <EmitirBoleta />
        </TabsContent>

        <TabsContent value="nota-credito">
          <EmitirNotaCredito />
        </TabsContent>

        <TabsContent value="lista">
          <ListaComprobantes />
        </TabsContent>
      </Tabs>
    </div>
  );
}
