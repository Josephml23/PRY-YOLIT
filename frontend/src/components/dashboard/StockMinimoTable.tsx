import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StockMinimoProduct {
  id: number;
  producto: string;
  stock: string | number;
  estado: 'AGOTADO' | 'BAJO' | 'CRITICO';
  almacen: string;
}

interface StockMinimoTableProps {
  data: StockMinimoProduct[];
  totalPages?: number;
  className?: string;
  onPedido?: (productId: number) => void;
}

/**
 * StockMinimoTable Component
 * Tabla de productos con stock mínimo con paginación (diseño Nubofact)
 */
// Vercel Best Practice: Extract constants outside component
const INITIAL_PAGE = 1;
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

export function StockMinimoTable({ 
  data, 
  totalPages = 52, 
  className,
  onPedido 
}: StockMinimoTableProps) {
  const [currentPage, setCurrentPage] = useState(INITIAL_PAGE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
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
    <Card className={`overflow-hidden shadow-md ${className}`}>
      <CardHeader className="bg-[hsl(var(--nubofact-primary))] text-white px-4 py-3">
        <CardTitle className="text-sm font-semibold">Productos con Stock Mínimo</CardTitle>
      </CardHeader>
      <CardContent className="bg-gray-200 dark:bg-gray-800 p-4 min-h-[280px]">
        {/* Tabla */}
        <div className="bg-white dark:bg-gray-900 rounded overflow-hidden mb-3">
          <table className="w-full text-xs">
            <thead className="bg-[hsl(var(--nubofact-primary))] text-white">
              <tr>
                <th className="px-2 py-2 text-left">#</th>
                <th className="px-2 py-2 text-left">Producto</th>
                <th className="px-2 py-2 text-center">Stock</th>
                <th className="px-2 py-2 text-center">Estado</th>
                <th className="px-2 py-2 text-center">Almacén</th>
                <th className="px-2 py-2 text-center">Aposentador</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((product) => (
                  <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-2 py-2">{product.id}</td>
                    <td className="px-2 py-2 text-[10px]">{product.producto}</td>
                    <td className="px-2 py-2 text-center">{product.stock}</td>
                    <td className="px-2 py-2 text-center">
                      <span className={`${getEstadoColor(product.estado)} text-white px-2 py-1 rounded text-[9px] font-semibold`}>
                        {product.estado}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center text-[10px]">{product.almacen}</td>
                    <td className="px-2 py-2 text-center">
                      <button 
                        className="bg-[hsl(var(--nubofact-primary))] text-white p-1 rounded hover:bg-[hsl(var(--nubofact-secondary))] transition-colors"
                        onClick={() => onPedido?.(product.id)}
                        title="Realizar pedido"
                      >
                        <ShoppingCart size={12} />
                      </button>
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
            <span className="text-xs text-gray-600">Pág. {currentPage}/{totalPages}</span>
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                typeof page === 'number' ? (
                  <button
                    key={index}
                    className={`w-6 h-6 text-xs rounded transition-colors ${
                      page === currentPage
                        ? 'bg-[hsl(var(--nubofact-primary))] text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={index} className="text-xs text-gray-600 mx-1">
                    {page}
                  </span>
                )
              ))}
              <button
                className="w-6 h-6 text-xs rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
