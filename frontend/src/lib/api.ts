import apiClient from '../services/api';

// Tipos genéricos de respuestas API
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Tipos específicos
export interface Empresa {
  id: number;
  ruc: string;
  razon_social: string;
  nombre_comercial: string;
  ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
  direccion: string;
  telefono?: string;
  email?: string;
  certificado_path?: string;
  sol_user: string;
  client_id?: string;
  logo_path?: string;
  activo: boolean;
  modo: 'beta' | 'prod';
  created_at: string;
  updated_at: string;
}

export interface EmpresaFormData {
  ruc: string;
  razon_social: string;
  nombre_comercial: string;
  ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
  direccion: string;
  telefono?: string;
  email?: string;
  sol_user: string;
  sol_password: string;
  client_id?: string;
  client_secret?: string;
  modo: 'beta' | 'prod';
  activo: boolean;
}

export interface ComprobanteEmitido {
  id: number;
  empresa_id: number;
  tipo_doc: string;
  serie: string;
  correlativo: string;
  cliente_tipo_doc: string;
  cliente_num_doc: string;
  cliente_razon_social: string;
  moneda: string;
  mto_imp_venta: number;
  estado_sunat: string;
  mensaje_sunat?: string;
  xml_path?: string;
  cdr_path?: string;
  pdf_path?: string;
  fecha_emision: string;
}

export interface ClientePayload {
  tipoDoc: string;
  numDoc: string;
  rznSocial: string;
  address?: {
    direccion?: string;
  };
  email?: string;
}

export interface DetalleItemPayload {
  descripcion: string;
  cantidad: number;
  mtoValorUnitario: number;
}

export interface EmisionFacturaPayload {
  empresa_id: number;
  tipoMoneda: 'PEN' | 'USD' | 'EUR';
  client: ClientePayload;
  details: DetalleItemPayload[];
  mtoImpVenta: number;
}

export interface EmisionResponse {
  success: boolean;
  comprobante: ComprobanteEmitido;
  cdr_response: {
    code: string;
    description: string;
  };
  xml_url?: string;
  cdr_url?: string;
  pdf_url?: string;
}

export interface Comprobante {
  id: number;
  empresa_id: number;
  tipo: string;
  serie: string;
  numero: string;
  cliente: string;
  total: number;
  estado: string;
  fecha: string;
}

export interface Oportunidad {
  id: number;
  empresa_id: number;
  nombre: string;
  descripcion?: string;
  estado: string;
  responsable?: string;
  fecha_inicio: string;
  fecha_vencimiento?: string;
  created_at: string;
}

export interface Documento {
  id: number;
  oportunidad_id: number;
  tipo: string;
  nombre: string;
  ruta: string;
  created_at: string;
}

// Servicios de API
export const api = {
  // Empresas
  empresas: {
    listar: (params?: Record<string, unknown>) =>
      apiClient.get<PaginatedResponse<Empresa>>('/v1/empresas', { params }),
    obtener: (id: number) => apiClient.get<ApiResponse<Empresa>>(`/v1/empresas/${id}`),
    crear: (data: EmpresaFormData) => apiClient.post<ApiResponse<Empresa>>('/v1/empresas', data),
    actualizar: (id: number, data: Partial<EmpresaFormData>) =>
      apiClient.put<ApiResponse<Empresa>>(`/v1/empresas/${id}`, data),
    eliminar: (id: number) => apiClient.delete<ApiResponse<unknown>>(`/v1/empresas/${id}`),
    toggleActivo: (id: number) =>
      apiClient.patch<ApiResponse<Empresa>>(`/v1/empresas/${id}/toggle-activo`),
    cambiarModo: (id: number) =>
      apiClient.patch<ApiResponse<Empresa>>(`/v1/empresas/${id}/cambiar-modo`),
  },

  // Facturación electrónica
  facturacion: {
    emitirFactura: (data: EmisionFacturaPayload) =>
      apiClient.post<EmisionResponse>('/facturacion/emitir/factura', data),
    emitirBoleta: (data: EmisionFacturaPayload) =>
      apiClient.post<EmisionResponse>('/facturacion/emitir/boleta', data),
    listarComprobantes: (params?: Record<string, unknown>) =>
      apiClient.get<PaginatedResponse<ComprobanteEmitido>>('/facturacion/comprobantes', { params }),
  },

  // Oportunidades
  oportunidades: {
    listar: (params?: Record<string, unknown>) => apiClient.get<Oportunidad[]>('/oportunidades', { params }),
    obtener: (id: number) => apiClient.get<Oportunidad>(`/oportunidades/${id}`),
    crear: (data: Partial<Oportunidad>) => apiClient.post<Oportunidad>('/oportunidades', data),
    actualizar: (id: number, data: Partial<Oportunidad>) => apiClient.put<Oportunidad>(`/oportunidades/${id}`, data),
    eliminar: (id: number) => apiClient.delete(`/oportunidades/${id}`),
  },

  // Documentos
  documentos: {
    listar: (oportunidadId: number) => apiClient.get<Documento[]>(`/oportunidades/${oportunidadId}/documentos`),
    subir: (oportunidadId: number, formData: FormData) => 
      apiClient.post<Documento>(`/oportunidades/${oportunidadId}/documentos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    eliminar: (id: number) => apiClient.delete(`/documentos/${id}`),
  },
};
