import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmitirFactura from './Facturacion/EmitirFactura';
import EmitirBoleta from './Facturacion/EmitirBoleta';
import EmitirNotaCredito from './Facturacion/EmitirNotaCredito';
import EmitirNotaDebito from './Facturacion/EmitirNotaDebito';
import ListaComprobantes from './Facturacion/ListaComprobantes';
import { FileText, Receipt, FileCheck, FileX, List } from 'lucide-react';

export default function FacturacionNubefact() {
  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="factura" className="space-y-6">
        <TabsList className="grid w-full max-w-3xl grid-cols-5">
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
            NC
          </TabsTrigger>
          <TabsTrigger value="nota-debito" className="flex items-center gap-2">
            <FileX className="w-4 h-4" />
            ND
          </TabsTrigger>
          <TabsTrigger value="lista" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Lista
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

        <TabsContent value="nota-debito">
          <EmitirNotaDebito />
        </TabsContent>

        <TabsContent value="lista">
          <ListaComprobantes />
        </TabsContent>
      </Tabs>
    </div>
  );
}
