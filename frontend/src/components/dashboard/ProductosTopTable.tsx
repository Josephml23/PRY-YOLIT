import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ProductoTopItem {
  id: number;
  producto: string;
  unidad: string;
  precio_unitario: number;
  cantidad: number;
  total: number;
}

interface ProductosTopTableProps {
  data: ProductoTopItem[];
  className?: string;
}

// Vercel Best Practice: Extract pure function outside component
const truncateText = (text: string, maxLength: number = 25): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * ProductosTopTable Component
 * Tabla de productos top con dropdown (diseño Nubofact)
 */
export function ProductosTopTable({ data, className }: ProductosTopTableProps) {
  return (
    <Card className={`overflow-hidden shadow-md p-0 ${className}`}>
      <CardHeader className="bg-primary text-primary-foreground px-4 py-2 space-y-0">
        <CardTitle className="text-sm font-semibold">Productos Top</CardTitle>
      </CardHeader>
      <CardContent className="bg-muted px-4 py-3">
        {/* Tabla con scroll horizontal para responsividad */}
        <div className="bg-card rounded overflow-x-auto border border-border">
          <table className="w-full text-xs">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-2 py-2 text-left whitespace-nowrap">#</th>
                <th className="px-2 py-2 text-left whitespace-nowrap">Producto</th>
                <th className="px-2 py-2 text-left whitespace-nowrap">
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">UM</span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">Unidad de Medida</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </th>
                <th className="px-2 py-2 text-right whitespace-nowrap">
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">P. Unit.</span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">Incluye IGV</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </th>
                <th className="px-2 py-2 text-right whitespace-nowrap">
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">Cant.</span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">Cantidad</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </th>
                <th className="px-2 py-2 text-right whitespace-nowrap">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-2 py-2.5">{item.id}</td>
                    <td className="px-2 py-2.5">
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">
                              {truncateText(item.producto, 25)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-xs">{item.producto}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                    <td className="px-2 py-2.5">{item.unidad}</td>
                    <td className="px-2 py-2.5 text-right">S/ {item.precio_unitario.toFixed(2)}</td>
                    <td className="px-2 py-2.5 text-right">{item.cantidad.toFixed(0)}</td>
                    <td className="px-2 py-2.5 text-right font-medium">S/ {item.total.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <>
                  <tr className="border-b border-border">
                    <td className="px-2 py-3 text-center text-muted-foreground" colSpan={6}>
                      No hay datos disponibles
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-2 py-3" colSpan={6}>&nbsp;</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-2 py-3" colSpan={6}>&nbsp;</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
