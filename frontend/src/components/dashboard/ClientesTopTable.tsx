import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ClienteTopItem {
  id: number;
  cliente: string;
  transacciones: number;
  total: number;
}

interface ClientesTopTableProps {
  data: ClienteTopItem[];
  className?: string;
}

/**
 * ClientesTopTable Component
 * Tabla de clientes top con dropdown (diseño Nubofact)
 */
export function ClientesTopTable({ data, className }: ClientesTopTableProps) {
  return (
    <Card className={`overflow-hidden shadow-md ${className}`}>
      <CardHeader className="bg-[#0c5078] text-white px-4 py-3">
        <CardTitle className="text-sm font-semibold">Clientes Top</CardTitle>
      </CardHeader>
      <CardContent className="bg-[#b8b8b8] p-4 min-h-[280px]">
        {/* Dropdown */}
        <div className="mb-3">
          <select className="w-full bg-white border border-gray-400 rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c5078]">
            <option>Adicionar anónimemes</option>
            <option>Top 5</option>
            <option>Top 10</option>
            <option>Top 20</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-[#0c5078] text-white">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Cliente</th>
                <th className="px-3 py-2 text-left">Trans</th>
                <th className="px-3 py-2 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-3 py-3">{item.id}</td>
                    <td className="px-3 py-3">{item.cliente}</td>
                    <td className="px-3 py-3">{item.transacciones}</td>
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
