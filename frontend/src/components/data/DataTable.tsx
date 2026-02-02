import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { cn } from '@/lib/utils';
import type { EmptyStateProps } from '@/types';

export interface DataTableColumn<T> {
  id: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  /** Definición de columnas: id, header, cell(row), className opcional */
  columns: DataTableColumn<T>[];
  /** Datos a mostrar */
  data: T[];
  /** Estado de carga: muestra TableSkeleton */
  loading?: boolean;
  /** Estado vacío: icono, título, descripción y acción opcional */
  emptyState: Pick<EmptyStateProps, 'icon' | 'title' | 'description' | 'action'> & { className?: string };
  /** Función para obtener la key de cada fila */
  getRowId: (row: T) => string | number;
  /** Clase adicional para la fila (ej. hover:bg-muted/50) */
  rowClassName?: string;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyState,
  getRowId,
  rowClassName,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <TableSkeleton columns={columns.length} rows={8} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={emptyState.icon}
        title={emptyState.title}
        description={emptyState.description}
        action={emptyState.action}
        className={emptyState.className}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 border-b-2">
            {columns.map((col) => (
              <TableHead
                key={col.id}
                className={cn('py-2 px-2', col.className)}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={getRowId(row)}
              className={cn('hover:bg-muted/50 transition-colors', rowClassName)}
            >
              {columns.map((col) => (
                <TableCell key={col.id} className={cn('py-2 px-2', col.className)}>
                  {col.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
