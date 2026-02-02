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
