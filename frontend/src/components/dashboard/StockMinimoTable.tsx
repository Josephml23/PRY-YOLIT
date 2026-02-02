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
export function StockMinimoTable({ 
  data, 
  totalPages = 52, 
  className,
  onPedido 
}: StockMinimoTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getEstadoColor = (estado: StockMinimoProduct['estado']) => {
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

  // Páginas a mostrar en paginación
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 6;
    
    for (let i = 1; i <= Math.min(showPages, totalPages); i++) {
      pages.push(i);
    }
    
    if (totalPages > showPages) {
      pages.push('...');
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <Card className={`overflow-hidden shadow-md ${className}`}>
      <CardHeader className="bg-[#0c5078] text-white px-4 py-3">
        <CardTitle className="text-sm font-semibold">Productos con Stock Mínimo</CardTitle>
      </CardHeader>
      <CardContent className="bg-[#b8b8b8] p-4 min-h-[280px]">
        {/* Tabla */}
        <div className="bg-white rounded overflow-hidden mb-3">
          <table className="w-full text-xs">
            <thead className="bg-[#0c5078] text-white">
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
                        className="bg-[#0c5078] text-white p-1 rounded hover:bg-[#164a6b] transition-colors"
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
                        ? 'bg-[#0c5078] text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
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
                className="w-6 h-6 text-xs rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
