# Requerimientos – Plataforma Operativa y Comercial con Facturación Electrónica

**Documento único de referencia:** alcance del MVP, lo realizado y lo pendiente.  
**Última actualización:** 28 de enero de 2026.

---

## 1. Objetivo del MVP

- Gestionar la operación comercial (oportunidades, documentos, pagos, SLA).
- Emitir comprobantes electrónicos a SUNAT usando **NubeFact API (JSON V1)**.
- Centralizar la información operativa y tributaria en una sola vista.
- Visualizar el estado del negocio mediante dashboards web y TV.
- Base para futuras automatizaciones (OCR, IA, integraciones).

---

## 2. Alcance funcional (requerimientos MVP)

### 2.1 Facturación electrónica (core tributario)

- Emisión: Facturas (01), Boletas (03), Notas de crédito (07), Notas de débito (08), Guías de Remisión Electrónica (09/31).
- Envío a SUNAT vía NubeFact API JSON V1.
- Almacenamiento de XML, CDR, respuesta SUNAT, hash, QR, enlaces PDF/XML/CDR.
- Descarga desde la plataforma de PDF, XML y CDR.
- Listado de comprobantes con filtros (tipo, serie, estado, fechas) y detalle por comprobante.
- Validación contra catálogos SUNAT; credenciales por empresa.

### 2.2 Multiempresa (multi-RUC)

- Registro de empresas emisoras (RUC, razón social, dirección, credenciales NubeFact).
- Selección de empresa activa en la interfaz; uso automático de token/URL de la empresa en llamadas a NubeFact.

### 2.3 Oportunidades

- Registro y seguimiento (empresa, área, estado, responsable, fechas, monto).
- Listado y detalle; asociación con documentos, pagos y comprobantes.
- Estados: Nuevo, En proceso, Enviado, Observado, Ganado, Perdido.

### 2.4 Documentos y adjuntos

- Adjuntos por oportunidad (TDR, OC, contratos, conformidades, etc.).
- Almacenamiento en MinIO; clasificación por tipo; asociación a oportunidad.
- Frontend: carga, lista por oportunidad, vista global, descarga.

### 2.5 Pagos (MVP)

- Registro manual (fecha, monto, moneda, medio, referencia, adjunto).
- Asociación a oportunidad y comprobante.
- Lista por oportunidad y vista global con filtros.

### 2.6 SLA y alertas

- SLA por tipo de oportunidad, área y estado.
- Cálculo automático de fecha límite; estados visuales (en plazo, próximo, vencido).
- Alertas en interfaz; post-MVP: notificaciones email/WhatsApp.

### 2.7 Dashboards

- **Web:** Oportunidades activas, ganadas vs perdidas, ventas por empresa/período, comprobantes recientes, documentos pendientes, SLA próximos/vencidos.
- **TV:** Vista solo lectura para pantallas grandes; KPIs (ventas, embudo, alertas); auto-refresh.

---

## 3. Lo realizado

### 3.1 Módulos funcionales (estado actual)

| Módulo | Backend | Frontend |
|--------|---------|----------|
| **Facturación electrónica** | Integración NubeFact (emitir, consultar, anular). Modelos Comprobante, ComprobanteItem, GuiaRemision. NubefactController, NubefactClient, NubefactMapper. | Formularios Factura, Boleta, NC, ND, GRE. Lista comprobantes con filtros. Descarga PDF/XML/CDR. |
| **Empresas** | EmpresaController CRUD. Rutas `/api/v1/empresas`. | Gestión empresas, selección empresa activa. |
| **Oportunidades** | OportunidadController. Relaciones con empresas, documentos, pagos. | Listado con filtros, detalle, documentos, pagos, SLA. |
| **Documentos** | MinIO, modelo Documento, versionamiento básico. | Carga, lista por oportunidad, vista global, descarga. |
| **Pagos** | PagoController. Relación oportunidad/comprobante. | Registro de pagos, lista por oportunidad, vista global con filtros. |
| **SLA y alertas** | SlaConfiguracion, Alerta. Cálculo de vencimientos. | Indicadores en listados y dashboard. |
| **Dashboard TV** | Datos en tiempo real. | Vista optimizada, KPIs, auto-refresh. |
| **Productos** | Modelo Producto, ProductoController CRUD. API `/api/v1/productos`. | Gestión productos, integración con formulario de comprobantes. |

### 3.2 Reformulación de interfaces y diseño (plan aplicado)

- **Documento de diseño:** `frontend/docs/DESIGN_CONTEXT.md` (tokens, patrones por pantalla, componentes base).
- **Tipos centralizados:** `frontend/src/types/index.ts` (entidades y props de componentes).
- **Componentes reutilizables:**
  - PageHeader, MetricCard, FilterBar, DataTable, EmptyState, TableSkeleton.
  - DashboardFilterPanel, DesgloseSummaryPanel (dashboard).
- **Listados refactorizados:** Clientes, Empresas, GestionProductos con PageHeader + FilterBar + DataTable + EmptyState/Skeleton.
- **Dashboard – Sección 1: Dashboard General (realizado):**
  - **Barra de filtros:** Panel superior “Dashboard General” con selectores: Establecimiento (ej. OFICINA PRINCIPAL), Período (HOY, ESTA_SEMANA, ESTE_MES, ESTE_AÑO, POR_FECHA), Fecha del (date picker). Valores enviados al backend para filtrar por rango de fechas.
  - **5 KPIs (MetricCard variant navy):** CPE Emitidos (cantidad de comprobantes 01, 03, 07, 08 aceptados no anulados), Total CPE (suma Facturas + NC + ND, sin Boletas), Total Notas Venta (suma Boletas 03), Monto Total General (suma de todos los CPE del período), Utilidad Neta (ingresos − egresos; egresos = 0 por ahora). Formato de montos con `formatCurrencyKpi` (compacto para millones) y tamaños responsivos.
  - **Panel CPE:** Desglose Total Pagado, Total por Pagar, Total (Facturas + NC + ND). Gráfico de pie (Pagado vs Por Pagar) con Recharts; solo se muestra si hay datos.
  - **Panel Notas de Venta:** Desglose Total Pagado, Total por Pagar, Total (solo Boletas 03). Gráfico de pie (Pagado vs Por Pagar). Estado pagado/por pagar según columna PAGADO del reporte Nubefact.
  - **Panel Totales Generales:** Tres valores destacados (Total Nota Venta, Total CPE, Total General) y gráfico de barras (CPE, Notas Venta, Total General). Opcionalmente ventas por hora en el período (backend entrega array `ventasPorHora`).
  - **Backend:** `GET /api/v1/dashboard/stats` con query params `establecimiento`, `periodo`, `fecha_del`. Cálculo de `fecha_hasta` según período (fin de día/semana/mes/año o +30 días). Consultas a tabla `comprobantes` filtradas por `tipo_doc`, `estado_sunat`, `anulado`, `pagado`, rango de fechas. Respuesta JSON con todos los KPIs y `ventasPorHora` para gráficos.
  - **Componentes:** DashboardFilterPanel, MetricCard (variant navy), DesgloseSummaryPanel, ChartContainer + Recharts (PieChart, BarChart). Paleta dashboard (tokens `--dashboard-dark` / `--dashboard-dark-foreground`) para modo claro/oscuro.
- **Layout:** AppLayout con sidebar, header, tema claro/oscuro; Landing; rutas unificadas.
- **Detalle del plan:** [docs/plan_reformulacion_interfaces_y_diseno.md](docs/plan_reformulacion_interfaces_y_diseno.md).

### 3.3 Infraestructura y migración

- Docker: PostgreSQL, MinIO (bucket `facturacion`).
- Migración de Greenter a NubeFact completada (backend y documentación).
- Exportación de comprobantes a CSV/Excel desde listado.
- Importación de comprobantes desde CSV NubeFact (comando artisan).

---

## 4. Lo que falta

### 4.1 Guías de Remisión (GRE)

- [ ] Backend: flujo completo de emisión GRE con campos SUNAT.
- [ ] Validaciones GRE (motivo traslado, transportista, ubigeos).
- [ ] Frontend: formulario GRE completo, listado con filtros, descarga PDF/XML.
- [ ] Relación GRE ↔ Comprobantes de venta.

### 4.2 Exportaciones

- [ ] Exportar documentos a Excel/CSV.
- [ ] Exportar pagos a Excel/CSV.
- [ ] Exportar productos a Excel/CSV.
- [ ] Formato estándar alineado a contabilidad.

### 4.3 Productos

- [ ] Importación/exportación de catálogo (Excel/CSV).

### 4.4 Histórico y NubeFact

- [ ] Importar comprobantes históricos solo en NubeFact (rango fechas/tipo/serie).
- [ ] Marcar comprobantes históricos vs emitidos desde la plataforma.
- [ ] Credenciales demo NubeFact; modo demo/producción por empresa.

### 4.5 Notificaciones (post-MVP)

- [ ] Envío de PDF/XML por email al emitir (opcional).
- [ ] Plantilla de correo y registro de envíos.

### 4.6 Testing y calidad

- [ ] Tests E2E para flujo de emisión.
- [ ] Verificación de cargas/descargas (MinIO + NubeFact).
- [ ] Revisión de validaciones front/back.

### 4.7 Dashboard – Sección 2: Desglose de Operaciones y Stock

Panel con seis módulos debajo de la Sección 1 (Dashboard General) ya implementada:

- [ ] **CPE Emitidos por tipo:** Panel que lista tipos de comprobante (Facturas, Boletas, Notas Venta, Notas Crédito, Notas Débito) con cantidad emitida por cada uno. Datos desde API/BD comprobantes.
- [ ] **Utilidades / Ganancias:** Bloque con valores Ingreso, Egreso, Utilidad (Ingreso − Egreso). Casillas de verificación: “Considerar gastos” y “Filtrar por producto”. Fuente: ingresos por comprobantes; egresos (módulo compras o Nubefact cuando aplique).
- [ ] **Total Compras:** Dos tarjetas con Total Compras y Total; a la derecha gráfico de barras con compras mensuales (Ene–Dic). Requiere datos de compras (API Nubefact o módulo propio).
- [ ] **Productos Top:** Tabla con columnas #, Producto, Mov. (movimientos), Total. Opción “Ordenar X movimientos”. Backend: agregar endpoint de productos más vendidos por período.
- [ ] **Clientes Top:** Tabla con columnas #, Cliente, Trans. (transacciones), Total. Opción “Ordenar por transacciones”. Backend: agregar endpoint de clientes por monto/cantidad en el período.
- [ ] **Productos con Stock Mínimo:** Tabla con #, Producto, Stock, Estado (ej. badge “Agotado” en rojo), Almacén, botón “Aprovisionar” (carrito). Datos desde modelo Producto y stock; alertas por debajo de mínimo.

### 4.8 Dashboard – Sección 3: Análisis Mensual

Comparativo mensual de ventas y compras a lo largo del año:

- [ ] **Gráfico de barras comparativo:** Eje Y con escala (ej. 0–200 000), eje X con meses (ENERO–DICIEMBRE). Cuatro barras por mes: Facturas, Boletas, Notas de Venta, Compras (colores distintos por serie). Datos desde comprobantes agrupados por mes y tipo; compras desde API/módulo de compras.
- [ ] **Tabla de datos mensual:** Columnas Mes, Facturas, Boletas, Notas de Venta, Compras. Una fila por mes (Enero–Diciembre) con totales numéricos. Fila final de totales resaltada. Misma fuente de datos que el gráfico.
- [ ] **Backend:** Endpoint (ej. `/api/v1/dashboard/analisis-mensual`) que devuelva por año/mes los totales por tipo de comprobante y compras, con formato listo para gráfico y tabla.

### 4.9 Dashboard y UX (ajustes generales)

- [ ] Ajustes finos de visualización y KPIs adicionales en fases posteriores.
- [ ] Revisar flujos de notas de crédito/débito y GRE con catálogos SUNAT.

---

## 5. Arquitectura y referencias

- **Stack:** Frontend React + Shadcn + Tailwind. Backend Laravel 11 + PHP 8.1. PostgreSQL, MinIO. NubeFact API JSON V1.
- **Documentación:**  
  - [backend/INTEGRACION_NUBEFACT.md](backend/INTEGRACION_NUBEFACT.md)  
  - [frontend/docs/DESIGN_CONTEXT.md](frontend/docs/DESIGN_CONTEXT.md)  
  - [docs/plan_reformulacion_interfaces_y_diseno.md](docs/plan_reformulacion_interfaces_y_diseno.md)  
  - [DIAGNOSTICO_DASHBOARD.md](DIAGNOSTICO_DASHBOARD.md) (dashboard y datos).  
- **Otros:** MEJORAS_EMISION_COMPROBANTES.md, MIGRACION_NUBEFACT_COMPLETADA.md.

Este documento unifica la referencia de requerimientos, estado actual y pendientes. Para historial detallado de módulos y migración NubeFact se pueden consultar PENDIENTES.md y requerimientos-mvp.md en el repositorio.
