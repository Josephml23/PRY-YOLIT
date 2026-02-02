interface MonthlyTableRow {
  mes: string;
  facturas: string | number;
  boletas: string | number;
  notasVenta: string | number;
  compras: string | number;
  isTotal?: boolean;
}

interface MonthlyTableProps {
  data: MonthlyTableRow[];
  className?: string;
}

/**
 * MonthlyTable Component
 * Tabla resumen mensual con totales (diseño Nubofact)
 */
export function MonthlyTable({ data, className }: MonthlyTableProps) {
  return (
    <div className={`bg-muted rounded-lg shadow-md p-4 min-h-70 ${className}`}>
      <div className="bg-card border border-border rounded overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-[hsl(var(--nubofact-primary))] text-white">
            <tr>
              <th className="px-3 py-2 text-left">Mes</th>
              <th className="px-3 py-2 text-right">Facturas</th>
              <th className="px-3 py-2 text-right">Boletas</th>
              <th className="px-3 py-2 text-right">Notas de Venta</th>
              <th className="px-3 py-2 text-right">Compras</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr 
                key={index} 
                className={`border-b border-border ${
                  row.isTotal ? 'bg-primary/10 font-semibold' : 'hover:bg-muted/50 transition-colors'
                }`}
              >
                <td className="px-3 py-2">{row.mes}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.facturas}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.boletas}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.notasVenta}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.compras}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
