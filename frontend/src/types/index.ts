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
  a_cuenta?: boolean;
  created_by?: string;
  created_at?: string;
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

/** Proveedor tal como se muestra en listados y formularios CRUD */
export interface Proveedor {
  id: number;
  tipo_doc: string;
  num_doc?: string;
  denominacion: string;
  razon_comercial?: string | null;
  direccion?: string | null;
  email?: string | null;
  telefono?: string | null;
  created_by?: string;
  created_at?: string;
}

/** Datos del formulario de proveedor (crear/editar) */
export interface ProveedorFormData {
  tipo_doc: string;
  num_doc: string;
  denominacion: string;
  razon_comercial: string;
  direccion: string;
  email: string;
  telefono: string;
}

/** Vendedor tal como se muestra en listados y formularios CRUD */
export interface Vendedor {
  id: number;
  nombre: string;
  email?: string;
  telefono?: string;
  porcentaje_comision: number;
  activo: boolean;
  created_by?: string;
  created_at?: string;
  ventas_cpe?: number;
  ventas_nv?: number;
  total_ventas?: number;
  total_comision?: number;
}

/** Datos del formulario de vendedor (crear/editar) */
export interface VendedorFormData {
  nombre: string;
  email: string;
  telefono: string;
  porcentaje_comision: number;
  activo: boolean;
}

/** Personal tal como se muestra en listados y formularios CRUD */
export interface Personal {
  id: number;
  nombre: string;
  numero?: string;
  puesto_asignado?: string;
  salario_base: number;
  email?: string;
  telefono?: string;
  activo: boolean;
  created_by?: string;
  created_at?: string;
}

/** Datos del formulario de personal (crear/editar) */
export interface PersonalFormData {
  nombre: string;
  numero: string;
  puesto_asignado: string;
  salario_base: number;
  email: string;
  telefono: string;
  activo: boolean;
}

export interface CuentaBancaria {
  id: number;
  descripcion: string;
  numero: string;
  balance: number;
  abreviatura?: string;
  banco?: string;
  moneda: string;
  activo: boolean;
  created_by?: string;
  created_at?: string;
}

export interface CuentaBancariaFormData {
  descripcion: string;
  numero: string;
  balance: number;
  abreviatura: string;
  banco: string;
  moneda: string;
  activo: boolean;
}

export interface Banco {
  id: number;
  abreviatura?: string;
  descripcion: string;
  imagen?: string;
  activo: boolean;
  created_by?: string;
  created_at?: string;
}

export interface BancoFormData {
  abreviatura: string;
  descripcion: string;
  imagen?: string;
  activo: boolean;
}

export interface Categoria {
  id: number;
  nombre: string;
  identificador?: string;
  activo: boolean;
  created_by?: string;
  created_at?: string;
}

export interface CategoriaFormData {
  nombre: string;
  identificador?: string;
  activo: boolean;
}

export interface Marca {
  id: number;
  nombre: string;
  activo: boolean;
  created_by?: string;
  created_at?: string;
}

export interface MarcaFormData {
  nombre: string;
  activo: boolean;
}

export interface Atributo {
  id: number;
  codigo?: string;
  descripcion: string;
  activo: boolean;
  created_by?: string;
  created_at?: string;
}

export interface AtributoFormData {
  codigo?: string;
  descripcion: string;
  activo: boolean;
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
  periodo: 'COMPLETO' | 'POR_FECHA' | 'HOY' | 'ESTA_SEMANA' | 'ESTE_MES' | 'ESTE_AÑO';
  /** Fecha inicial (formato YYYY-MM-DD) */
  fechaDel: string;
  /** Fecha final (formato YYYY-MM-DD) - solo para POR_FECHA */
  fechaHasta?: string;
}

export interface CPERankingItem {
  /** Nombre del tipo de comprobante (Facturas, Boletas, etc.) */
  name: string;
  /** Cantidad de comprobantes de este tipo */
  value: number;
  /** Porcentaje del total */
  percentage: number;
}

export interface ProductoTopItem {
  /** ID del producto en el ranking */
  id: number;
  /** Nombre del producto */
  producto: string;
  /** Unidad de medida */
  unidad: string;
  /** Precio unitario de venta con IGV */
  precio_unitario: number;
  /** Cantidad total vendida */
  cantidad: number;
  /** Monto total de ventas */
  total: number;
}

export interface ClienteTopItem {
  /** ID del cliente en el ranking */
  id: number;
  /** Nombre del cliente */
  cliente: string;
  /** Cantidad de transacciones */
  transacciones: number;
  /** Monto total de compras */
  total: number;
}

export interface StockMinimoProduct {
  /** ID del producto */
  id: number;
  /** Nombre del producto */
  producto: string;
  /** Stock actual */
  stock: string | number;
  /** Estado del stock */
  estado: 'AGOTADO' | 'BAJO' | 'CRITICO';
  /** Almacén donde se encuentra */
  almacen: string;
}

export interface StockMinimoResponse {
  /** Array de productos */
  data: StockMinimoProduct[];
  /** Total de productos con stock mínimo */
  total: number;
  /** Página actual */
  current_page: number;
  /** Items por página */
  per_page: number;
  /** Total de páginas */
  total_pages: number;
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
  /** Monto total de Boletas de Venta (tipo_doc 03) */
  totalBoletas: number;
  /** Monto pagado de Boletas */
  boletasPagado: number;
  /** Monto por pagar de Boletas */
  boletasPorPagar: number;
  /** Monto total de Boletas */
  boletasTotal: number;
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

export interface MonthlyComparisonData {
  /** Mes del año */
  mes: string;
  /** Total de facturas */
  facturas: number;
  /** Total de boletas */
  boletas: number;
  /** Total de notas de crédito */
  notasCredito: number;
  /** Total de notas de débito */
  notasDebito: number;
  /** Total de compras */
  compras: number;
}

export interface MonthlyTableRow {
  /** Mes del año */
  mes: string;
  /** Total de facturas formateado */
  facturas: string;
  /** Total de boletas formateado */
  boletas: string;
  /** Total de notas de crédito formateado */
  notasCredito: string;
  /** Total de notas de débito formateado */
  notasDebito: string;
  /** Total de compras formateado */
  compras: string;
  /** Si es la fila de totales */
  isTotal?: boolean;
}
