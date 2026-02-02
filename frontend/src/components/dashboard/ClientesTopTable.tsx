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
      <CardHeader className="bg-[hsl(var(--nubofact-primary))] text-white px-4 py-3">
        <CardTitle className="text-sm font-semibold">Clientes Top</CardTitle>
      </CardHeader>
      <CardContent className="bg-gray-200 dark:bg-gray-800 p-4 min-h-[280px]">
        {/* Dropdown */}
        <div className="mb-3">
          <select className="w-full bg-background text-foreground border border-input rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary">
            <option>Adicionar anónimemes</option>
            <option>Top 5</option>
            <option>Top 10</option>
            <option>Top 20</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="bg-card rounded overflow-hidden border border-border">
          <table className="w-full text-xs">
            <thead className="bg-primary text-primary-foreground">
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
                  <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
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
