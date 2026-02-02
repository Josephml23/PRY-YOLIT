import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductoTopItem {
  id: number;
  producto: string;
  cantidad: number;
  total: number;
}

interface ProductosTopTableProps {
  data: ProductoTopItem[];
  className?: string;
}

/**
 * ProductosTopTable Component
 * Tabla de productos top con dropdown (diseño Nubofact)
 */
export function ProductosTopTable({ data, className }: ProductosTopTableProps) {
  return (
    <Card className={`overflow-hidden shadow-md ${className}`}>
      <CardHeader className="bg-[hsl(var(--nubofact-primary))] text-white px-4 py-3">
        <CardTitle className="text-sm font-semibold">Productor Top</CardTitle>
      </CardHeader>
      <CardContent className="bg-gray-200 dark:bg-gray-800 p-4 min-h-[280px]">
        {/* Dropdown */}
        <div className="mb-3">
          <select className="w-full bg-white dark:bg-gray-900 border border-gray-400 dark:border-gray-600 rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--nubofact-primary))]">
            <option>Adicionar X Anónimenes</option>
            <option>Top 5</option>
            <option>Top 10</option>
            <option>Top 20</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="bg-white dark:bg-gray-900 rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-[hsl(var(--nubofact-primary))] text-white">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Producto</th>
                <th className="px-3 py-2 text-left">Mex</th>
                <th className="px-3 py-2 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-3 py-3">{item.id}</td>
                    <td className="px-3 py-3">{item.producto}</td>
                    <td className="px-3 py-3">{item.cantidad}</td>
                    <td className="px-3 py-3">S/ {item.total.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <>
                  <tr className="border-b border-gray-200">
                    <td className="px-3 py-3 text-center text-gray-500" colSpan={4}>
                      No hay datos disponibles
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-3 py-3" colSpan={4}>&nbsp;</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-3 py-3" colSpan={4}>&nbsp;</td>
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
