/**
 * Tipos centralizados para la aplicación.
 * Reexporta entidades de lib/api y define interfaces para vistas y componentes compartidos.
 */

// Reexportar tipos de API
export type {
  PaginatedResponse,
  ApiResponse,
  Empresa,
  EmpresaFormData,
  ComprobanteItem,
  ComprobanteEmitido,
  Comprobante,
  ClientePayload,
  Producto,
  ProductoFormData,
  Entidad,
  Oportunidad,
  Documento,
  Pago,
  EstadoOportunidad,
} from '@/lib/api';

// --- Entidades de vista (listados / formularios) ---

/** Cliente tal como se muestra en listados y formularios CRUD */
export interface Cliente {
  id: number;
  tipo_doc: string;
  num_doc?: string;
  denominacion: string;
  razon_comercial?: string | null;
  direccion?: string | null;
  email?: string | null;
  telefono?: string | null;
}

/** Datos del formulario de cliente (crear/editar) */
export interface ClienteFormData {
  tipo_doc: string;
  num_doc: string;
  denominacion: string;
  razon_comercial: string;
  direccion: string;
  email: string;
  telefono: string;
}

// --- Props de componentes compartidos ---

export interface PageHeaderProps {
  /** Título principal (h1) */
  title: string;
  /** Descripción opcional debajo del título */
  description?: string;
  /** Contenido a la derecha (botones Nuevo, Exportar, etc.) */
  actions?: React.ReactNode;
}

export interface MetricCardProps {
  /** Título del KPI */
  title: string;
  /** Valor principal (número o texto) */
  value: string | number;
  /** Icono (componente Lucide) */
  icon: React.ComponentType<{ className?: string }>;
  /** Texto secundario debajo del valor */
  description?: string;
  /** Desglose opcional (lista de líneas) */
  details?: Array<{ label: string; value: string | number }>;
  /** Clases adicionales para la card */
  className?: string;
  /** Variante del estilo (default: card normal, navy: fondo azul marino con icono grande, nubofact: diseño Nubofact original) */
  variant?: 'default' | 'navy' | 'nubofact';
}

export interface EmptyStateProps {
  /** Icono (componente Lucide) */
  icon: React.ComponentType<{ className?: string }>;
  /** Mensaje principal */
  title: string;
  /** Mensaje secundario opcional */
  description?: string;
  /** Botón o enlace de acción opcional */
  action?: React.ReactNode;
}

export interface FilterBarProps {
  /** Contenido de los filtros (inputs, selects) */
  children: React.ReactNode;
  /** Botón "Limpiar" o similar; opcional */
  onClear?: () => void;
  /** Etiqueta del botón de limpiar */
  clearLabel?: string;
  /** Clases adicionales */
  className?: string;
}

// --- Dashboard Section 1 Types ---

export interface DashboardFiltros {
  /** ID del establecimiento seleccionado */
  establecimiento: string;
  /** Tipo de período para el dashboard */
  periodo: 'POR_FECHA' | 'HOY' | 'ESTA_SEMANA' | 'ESTE_MES' | 'ESTE_AÑO';
  /** Fecha inicial (formato YYYY-MM-DD) */
  fechaDel: string;
}

export interface DashboardStats {
  /** Cantidad total de CPE emitidos (todos los tipos) */
  cpeEmitidos: number;
  /** Monto total de CPE (Facturas + NC + ND) */
  totalCPE: number;
  /** Monto pagado de CPE */
  cpePagado: number;
  /** Monto por pagar de CPE */
  cpePorPagar: number;
  /** Monto total de CPE */
  cpeTotal: number;
  /** Monto total de Boletas de Venta (Notas de Venta) */
  totalNotasVenta: number;
  /** Monto pagado de Boletas */
  notasVentaPagado: number;
  /** Monto por pagar de Boletas */
  notasVentaPorPagar: number;
  /** Monto total de Boletas */
  notasVentaTotal: number;
  /** Monto total general (CPE + Boletas) */
  montoTotalGeneral: number;
  /** Utilidad neta calculada (Ingresos - Egresos) */
  utilidadNeta: number;
  /** Datos de ventas por hora para el gráfico */
  ventasPorHora: Array<{ hora: string; total: number }>;
}

export interface DashboardFilterPanelProps {
  /** Establecimiento seleccionado */
  establecimiento: string;
  /** Período seleccionado */
  periodo: DashboardFiltros['periodo'];
  /** Fecha inicial */
  fechaDel: string;
  /** Callback cuando cambian los filtros */
  onFiltrosChange: (filtros: DashboardFiltros) => void;
}

export interface DesgloseSummaryPanelProps {
  /** Título del panel */
  title: string;
  /** Items a mostrar en el desglose */
  items: Array<{
    /** Etiqueta del item */
    label: string;
    /** Valor del item */
    value: string;
    /** Si debe resaltarse en azul */
    highlight?: boolean;
  }>;
}
