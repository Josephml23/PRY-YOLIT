import api from './api';

export * from './nubefact';

export interface Empresa {
  id: number;
  ruc: string;
  razon_social: string;
  nombre_comercial?: string;
  ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
  direccion: string;
  sol_user: string;
  modo: 'beta' | 'produccion';
  created_at: string;
  updated_at: string;
}

export const empresasService = {
  getAll: () => api.get<Empresa[]>('/empresas'),
  getById: (id: number) => api.get<Empresa>(`/empresas/${id}`),
  create: (data: Partial<Empresa>) => api.post<Empresa>('/empresas', data),
  update: (id: number, data: Partial<Empresa>) => api.put<Empresa>(`/empresas/${id}`, data),
  delete: (id: number) => api.delete(`/empresas/${id}`),
};

export interface Comprobante {
  id: number;
  empresa_id: number;
  tipo_doc: string;
  serie: string;
  correlativo: number;
  numero_completo: string;
  cliente_razon_social: string;
  cliente_num_doc: string;
  moneda: string;
  mto_imp_venta: number;
  estado_sunat: string;
  codigo_sunat: string;
  mensaje_sunat: string;
  fecha_emision: string;
  xml_path?: string;
  cdr_path?: string;
  pdf_path?: string;
  created_at: string;
  updated_at: string;
}

export interface EmitirComprobanteRequest {
  empresa_id: number;
  usuario_id?: number;
  ublVersion: string;
  tipoOperacion: string;
  tipoDoc: string;
  serie?: string;
  correlativo?: number;
  fechaEmision: string;
  tipoMoneda: string;
  client: {
    tipoDoc: string;
    numDoc: string;
    rznSocial: string;
    address?: {
      direccion: string;
    };
  };
  mtoOperGravadas?: number;
  mtoOperExoneradas?: number;
  mtoOperInafectas?: number;
  mtoIGV?: number;
  totalImpuestos?: number;
  mtoImpVenta: number;
  details: Array<{
    codProducto: string;
    unidad: string;
    descripcion: string;
    cantidad: number;
    mtoValorUnitario: number;
    mtoValorVenta: number;
    mtoBaseIgv: number;
    porcentajeIgv: number;
    igv: number;
    tipAfeIgv: string;
    totalImpuestos: number;
    mtoPrecioUnitario: number;
  }>;
}

export const facturacionService = {
  emitir: (data: EmitirComprobanteRequest) => api.post('/facturacion/emitir', data),
  getAll: (params?: Record<string, unknown>) => api.get<Comprobante[]>('/facturacion', { params }),
  getById: (id: number) => api.get<Comprobante>(`/facturacion/${id}`),
  descargarXml: (id: number) => api.get(`/facturacion/descargar/xml/${id}`, { responseType: 'blob' }),
  descargarCdr: (id: number) => api.get(`/facturacion/descargar/cdr/${id}`, { responseType: 'blob' }),
  descargarPdf: (id: number) => api.get(`/facturacion/descargar/pdf/${id}`, { responseType: 'blob' }),
  descargarHtml: (id: number) => api.get(`/facturacion/descargar/html/${id}`),
};

export interface Oportunidad {
  id: number;
  empresa_id: number;
  cliente_razon_social: string;
  cliente_num_doc: string;
  area_responsable: string;
  tipo_operacion: string;
  estado: string;
  responsable: string;
  fecha_inicio: string;
  fecha_vencimiento?: string;
  monto_estimado?: number;
  created_at: string;
  updated_at: string;
}

export const oportunidadesService = {
  getAll: (params?: Record<string, unknown>) => api.get<Oportunidad[]>('/oportunidades', { params }),
  getById: (id: number) => api.get<Oportunidad>(`/oportunidades/${id}`),
  create: (data: Partial<Oportunidad>) => api.post<Oportunidad>('/oportunidades', data),
  update: (id: number, data: Partial<Oportunidad>) => api.put<Oportunidad>(`/oportunidades/${id}`, data),
  delete: (id: number) => api.delete(`/oportunidades/${id}`),
  cambiarEstado: (id: number, estado: string) => api.patch(`/oportunidades/${id}/estado`, { estado }),
};

export interface Pago {
  id: number;
  oportunidad_id?: number;
  comprobante_id?: number;
  monto: number;
  metodo_pago: string;
  fecha_pago: string;
  numero_operacion?: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export const pagosService = {
  getAll: (params?: Record<string, unknown>) => api.get<Pago[]>('/pagos', { params }),
  getById: (id: number) => api.get<Pago>(`/pagos/${id}`),
  create: (data: Partial<Pago>) => api.post<Pago>('/pagos', data),
  update: (id: number, data: Partial<Pago>) => api.put<Pago>(`/pagos/${id}`, data),
  delete: (id: number) => api.delete(`/pagos/${id}`),
};

export interface Documento {
  id: number;
  oportunidad_id: number;
  nombre_archivo: string;
  ruta_archivo: string;
  tipo_archivo: string;
  tamanio: number;
  created_at: string;
  updated_at: string;
}

export const documentosService = {
  getAll: (oportunidadId: number) => api.get<Documento[]>(`/documentos`, { params: { oportunidad_id: oportunidadId } }),
  upload: (oportunidadId: number, file: File) => {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('oportunidad_id', oportunidadId.toString());
    return api.post<Documento>('/documentos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: number) => api.delete(`/documentos/${id}`),
  download: (id: number) => api.get(`/documentos/${id}/descargar`, { responseType: 'blob' }),
};
