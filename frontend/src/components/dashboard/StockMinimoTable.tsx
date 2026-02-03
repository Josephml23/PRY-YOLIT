import { ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StockMinimoProduct {
  id: number;
  producto: string;
  stock: string | number;
  estado: 'AGOTADO' | 'BAJO' | 'CRITICO';
  almacen: string;
}

interface StockMinimoTableProps {
  data: StockMinimoProduct[];
  totalPages: number;
  currentPage: number;
  className?: string;
  onPedido?: (productId: number) => void;
  onPageChange: (page: number) => void;
}

/**
 * StockMinimoTable Component
 * Tabla de productos con stock mínimo con paginación (diseño Nubofact)
 */
// Vercel Best Practice: Extract constants outside component
const VISIBLE_PAGES = 6;

// React Best Practice: Extract pure function outside component
const getEstadoColor = (estado: 'AGOTADO' | 'BAJO' | 'CRITICO') => {
  switch (estado) {
    case 'AGOTADO':
      return 'bg-red-600';
    case 'CRITICO':
      return 'bg-orange-600';
    case 'BAJO':
      return 'bg-yellow-600';
    default:
      return 'bg-gray-600';
  }
};

const truncateText = (text: string, maxLength: number = 25): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export function StockMinimoTable({ 
  data, 
  totalPages, 
  currentPage,
  className,
  onPedido,
  onPageChange 
}: StockMinimoTableProps) {
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // React Best Practice: Extract pure function for page numbers calculation
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    for (let i = 1; i <= Math.min(VISIBLE_PAGES, totalPages); i++) {
      pages.push(i);
    }
    
    if (totalPages > VISIBLE_PAGES) {
      pages.push('...');
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <Card className={`overflow-hidden shadow-md p-0 ${className}`}>
      <CardHeader className="bg-primary text-primary-foreground px-4 py-2 space-y-0">
        <CardTitle className="text-sm font-semibold">Productos con Stock Mínimo</CardTitle>
      </CardHeader>
      <CardContent className="bg-muted px-4 py-3">
        {/* Tabla con scroll horizontal para responsividad */}
        <div className="bg-card border border-border rounded overflow-x-auto mb-3">
          <table className="w-full text-xs">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-2 py-2 text-left whitespace-nowrap">#</th>
                <th className="px-2 py-2 text-left whitespace-nowrap">Producto</th>
                <th className="px-2 py-2 text-center whitespace-nowrap">Stock</th>
                <th className="px-2 py-2 text-center whitespace-nowrap">Estado</th>
                <th className="px-2 py-2 text-center whitespace-nowrap">Almacén</th>
                <th className="px-2 py-2 text-center whitespace-nowrap min-w-30">Aprovisionar</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((product) => (
                  <tr key={product.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-2 py-2.5">{product.id}</td>
                    <td className="px-2 py-2.5">
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help text-[10px]">
                              {truncateText(product.producto, 25)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-xs">{product.producto}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                    <td className="px-2 py-2.5 text-center">{product.stock}</td>
                    <td className="px-2 py-2.5 text-center">
                      <span className={`${getEstadoColor(product.estado)} text-white px-2 py-1 rounded text-[9px] font-semibold`}>
                        {product.estado}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-center text-[10px]">{product.almacen}</td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center justify-center">
                        <button 
                          className="bg-primary text-primary-foreground p-1.5 rounded hover:bg-primary/80 transition-colors inline-flex items-center justify-center"
                          onClick={() => onPedido?.(product.id)}
                          title="Aprovisionar producto"
                        >
                          <ShoppingCart size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-8 text-center text-gray-500" colSpan={6}>
                    No hay productos con stock bajo
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {data.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground">Pág. {currentPage}/{totalPages}</span>
            <div className="flex items-center gap-1">
              {/* Botón anterior */}
              <button
                className="w-6 h-6 text-xs rounded bg-card border border-border text-foreground hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                &lt;
              </button>
              
              {getPageNumbers().map((page, index) => (
                typeof page === 'number' ? (
                  <button
                    key={index}
                    className={`w-6 h-6 text-xs rounded transition-colors ${
                      page === currentPage
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border text-foreground hover:bg-muted/80'
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={index} className="text-xs text-muted-foreground mx-1">
                    {page}
                  </span>
                )
              ))}
              
              {/* Botón siguiente */}
              <button
                className="w-6 h-6 text-xs rounded bg-card border border-border text-foreground hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
