# 📋 PENDIENTES - Plataforma Operativa y Comercial con Facturación Electrónica

**Fecha de actualización:** 23 de enero de 2026  
**Estado Backend:** ✅ Completo para el alcance del MVP  
**Estado Frontend:** 🟢 Muy avanzado – faltan solo extras y refinamientos  
**MVP Operativo:** 🟢 En uso inicial – restan módulos de productos, guías y notificaciones

---

## 🎯 ESTADO DEL MVP - RESUMEN

### Cobertura vs Requerimientos MVP

- **2.1 Facturación electrónica (core tributario)**  
  ✅ Emisión de facturas y boletas vía NubeFact, listado con filtros, estado SUNAT y descargas PDF/XML/CDR.  
  🟡 Pendiente revisar/completar flujos de notas de crédito/débito y GRE contra los catálogos SUNAT y casos reales.
- **2.2 Multiempresa (multi-RUC)**  
  ✅ Gestión de empresas emisoras (backend + pantalla Empresas), selección de empresa emisora en facturación y uso de sus credenciales.
- **2.3 Oportunidades**  
  ✅ Modelo y API listos, vistas de listado/detalle operativas e integración con documentos y pagos según MVP.
- **2.4 Documentos y adjuntos**  
  ✅ Almacenamiento en MinIO, carga/descarga desde frontend y asociación a oportunidades.  
  🟡 Pendiente refinar filtros globales y exportaciones.
- **2.5 Pagos (MVP)**  
  ✅ Registro manual de pagos, asociación a oportunidades/comprobantes y vistas de listado.  
  🟡 Pendiente exportaciones y algunos KPIs adicionales en dashboard.
- **2.6 SLA y alertas**  
  ✅ Cálculo automático de vencimientos y visualización básica en dashboard/listados.  
  🟡 Notificaciones externas (email/WhatsApp) quedan como post-MVP.
- **2.7 Dashboards (web y TV)**  
  ✅ Dashboards web y TV funcionando con datos reales (ventas, oportunidades, alertas).  
  🟡 Ajustes finos de visualización y nuevos KPIs podrán añadirse en fases posteriores.

### ✅ MÓDULO 1: FACTURACIÓN ELECTRÓNICA (100%)
**Backend:**
- ✅ Integración NubeFact completa
- ✅ Modelos: Comprobante, ComprobanteItem, GuiaRemision
- ✅ Controllers: NubefactController (emitir, consultar, anular)
- ✅ Servicios: NubefactClient, NubefactMapper
- ✅ Rutas API: `/api/nubefact/*`

**Frontend:**
- ✅ Formularios de emisión:
  - Facturas electrónicas (01)
  - Boletas electrónicas (03)
  - Notas de crédito (07)
  - Notas de débito (08)
  - Guías de Remisión Electrónica (GRE)
- ✅ Lista de comprobantes emitidos con filtros
- ✅ Consulta de estado SUNAT por comprobante
- ✅ Descarga de **PDF / XML / CDR** por comprobante (según enlaces de NubeFact)

---

### ✅ MÓDULO 2: EMPRESAS (100%)
**Backend:**
- ✅ Modelo Empresa
- ✅ EmpresaController (CRUD completo)
- ✅ Rutas `/api/v1/empresas`

**Frontend:**
- ✅ Gestión completa de empresas (multi-RUC)
- ✅ Formularios validados
- ✅ Tabla con filtros y selección de empresa activa

---

### ✅ MÓDULO 3: OPORTUNIDADES (100%)
**Backend:**
- ✅ Modelo Oportunidad
- ✅ OportunidadController
- ✅ Relaciones con empresas, usuarios, documentos y pagos
- ✅ Rutas `/api/v1/oportunidades`

**Frontend:**
- ✅ Listado de oportunidades con filtros
- ✅ Detalle de oportunidad
- ✅ Integración con documentos adjuntos y pagos
- ✅ Indicadores básicos de SLA por oportunidad

---

### ✅ MÓDULO 4: DOCUMENTOS Y ADJUNTOS (100%)
**Backend:**
- ✅ Modelo Documento
- ✅ Storage con MinIO
- ✅ Versionamiento básico

**Frontend:**
- ✅ Componente de carga de archivos
- ✅ Visualizador de documentos por oportunidad
- ✅ Vista global de documentos
- ✅ Descarga de documentos desde MinIO
- ✅ Acceso a PDFs de comprobantes electrónicos relacionados (enlaces NubeFact)

---

### ✅ MÓDULO 5: PAGOS (100% MVP)
**Backend:**
- ✅ Modelo Pago
- ✅ PagoController
- ✅ Relaciones con oportunidades y comprobantes

**Frontend:**
- ✅ Formulario de registro de pagos
- ✅ Lista de pagos por oportunidad
- ✅ Vista global de pagos con filtros
- ✅ Asociación visual con oportunidades y comprobantes

---

### ✅ MÓDULO 6: SLA Y ALERTAS (MVP LISTO)
**Backend:**
- ✅ Modelo SlaConfiguracion
- ✅ Modelo Alerta
- ✅ Cálculo automático de vencimientos

**Frontend:**
- ✅ Indicadores visuales de SLA (en plazo / próximo / vencido)
- ✅ Integración con dashboard principal
- ✅ Listados básicos de pendientes
- 🔜 (Post-MVP): notificaciones por email / WhatsApp

---

### ✅ MÓDULO 7: DASHBOARD TV (MVP LISTO)
- ✅ Vista optimizada para pantallas grandes
- ✅ KPIs en tiempo real (ventas, oportunidades, alertas)
- ✅ Auto-refresh
- ✅ Modo solo lectura para monitoreo

---

## 🔑 FUNCIONALIDADES CLAVE YA IMPLEMENTADAS

- ✅ Emisión y consulta de comprobantes vía NubeFact API
- ✅ Descarga de **PDF / XML / CDR** desde:
  - Lista de comprobantes
  - Detalle / contexto de oportunidad (cuando aplica)
- ✅ Gestión de series por empresa y tipo de comprobante (front + back)
- ✅ Vista global de Documentos
- ✅ Vista global de Pagos
- ✅ Dashboards Web y TV conectados a datos reales
- ✅ Infraestructura Docker para PostgreSQL y MinIO estable

---

## 📌 PENDIENTES INMEDIATOS (SOBRE EL MVP ACTUAL)

### ✅ 1️⃣ Módulo de Productos (COMPLETADO 26/01/2026)
- [x] **Backend**: Modelo Product/Producto con campos: código, descripción, unidad_medida, precio_unitario, tipo_igv, stock.
- [x] **Backend**: ProductoController con CRUD completo (API `/api/v1/productos`).
- [x] **Frontend**: Vista de gestión de productos (listado, crear, editar, eliminar).
- [x] **Frontend**: Sincronización con formulario de comprobantes (búsqueda y selección de productos desde catálogo).
- [x] **Frontend**: Productos destacados/favoritos para acceso rápido en emisión.
- [ ] Importación/exportación de catálogo de productos (Excel/CSV).

### 2️⃣ Guías de Remisión (GRE)
- [ ] **Backend**: Completar flujo de emisión GRE con todos los campos SUNAT.
- [ ] **Backend**: Validaciones específicas para GRE (motivo traslado, datos transportista, ubigeos).
- [ ] **Frontend**: Formulario completo de emisión de GRE sincronizado con comprobantes.
- [ ] **Frontend**: Listado de guías emitidas con filtros y búsqueda.
- [ ] **Frontend**: Descarga de PDF/XML de guías desde NubeFact.
- [ ] Relación automática GRE ↔ Comprobantes de venta.

### 3️⃣ Exportación a Excel / CSV
- [x] Exportar lista de **comprobantes emitidos** a Excel/CSV (con filtros aplicados).
- [ ] Exportar lista de **documentos** a Excel/CSV.
- [ ] Exportar lista de **pagos** a Excel/CSV.
- [ ] Exportar catálogo de **productos** a Excel/CSV.
- [ ] Definir formato estándar (cabeceras y tipos de dato) alineado a contabilidad.

### 4️⃣ Histórico desde NubeFact
- [ ] Definir estrategia para **importar comprobantes históricos** existentes solo en NubeFact.
- [ ] Comando/endpoint que, dado un rango de fechas / tipo / serie, cree registros locales de solo lectura.
- [ ] Marcar claramente qué comprobantes vienen como histórico vs emitidos desde la plataforma.

### 5️⃣ Entorno de pruebas NubeFact
- [ ] Solicitar/definir **credenciales demo** de NubeFact para pruebas sin impacto en SUNAT.
- [ ] Permitir elegir modo `demo` / `producción` por empresa.
- [ ] Documentar buenas prácticas para pruebas de emisión.

### 6️⃣ Notificaciones y correos (Post-MVP ligero)
- [ ] Enviar PDF + XML por email al cliente al emitir comprobante (opcional).
- [ ] Plantilla básica de correo con datos del comprobante.
- [ ] Registro de envíos en la base de datos.

### 7️⃣ Testing y endurecimiento
- [ ] Tests E2E básicos (backend + frontend) para el flujo completo de emisión.
- [ ] Verificación de cargas y descargas de archivos (MinIO + NubeFact).
- [ ] Revisión de validaciones front/back para evitar emisiones inconsistentes.

---

## 🐳 DOCKER - ESTADO ACTUAL

**Configuración:** ✅ Completa y funcional

### Servicios activos:
- **PostgreSQL 15**: Base de datos principal (puerto 5432)
- **MinIO**: Almacenamiento S3 para documentos y adjuntos (puertos 9000/9001)
- **MinIO Init**: Auto-creación de bucket `facturacion`

### Recomendaciones Docker

1. Laravel y frontend se ejecutan localmente (fuera de Docker) en desarrollo.  
2. Para producción, considerar Nginx + PHP-FPM en contenedores dedicados.  
3. Mantener la configuración de `.env` alineada con los puertos y credenciales de Docker.

---

## 📝 ACTUALIZACIONES RECIENTES (23/01/2026)

### ✅ Corrección de sincronización API de comprobantes
- ✅ Modificado `NubefactController::emitirComprobante` para aceptar datos completos del frontend
- ✅ Backend ahora crea comprobante en BD antes de emitir a NubeFact (flujo completo)
- ✅ Corregidas rutas de API en frontend (`/facturacion/comprobantes`, `/facturacion/descargar/*`)
- ✅ Implementado soporte para transacciones DB con rollback automático en errores
- ✅ Mejorado manejo de errores y logging detallado

### ✅ Validación contra Manual Oficial NubeFact
- ✅ Corregido mapeo de campos: `codigo_tipo_moneda` (PEN/USD/EUR)
- ✅ Corregido campo IGV: `mto_igv` en lugar de `suma_igv`
- ✅ Corregido tipo de afectación: `tip_afe_igv` (10=Gravado, 20=Exonerado, 30=Inafecto)
- ✅ Agregado campo `tipo_de_cambio` al mapper
- ✅ Agregado campo `descuento` de items al mapper
- ✅ Todos los campos ahora coinciden con estructura de BD y manual NubeFact
- ✅ Formato de fechas DD-MM-YYYY según especificación
- ✅ Validación de estructura JSON enviada a NubeFact API

### ✅ Corrección de bugs frontend
- ✅ Fixed error `toFixed()` en ListaComprobantes convirtiendo `mto_imp_venta` a Number
- ✅ Corregido loop infinito de re-renders en EmitirComprobante usando `useMemo`

---

## ✅ MIGRACIÓN A NUBEFACT COMPLETADA

### 🎉 Cambios Implementados (20/01/2026)

**Backend migrado completamente de Greenter a NubeFact API:**

✅ **Greenter removido completamente**
- Package `codersfree/laravel-greenter` eliminado de composer.json
- Todos los servicios Greenter deshabilitados con excepciones
- Bootstrap cache limpiado (services.php, packages.php)
- Variables de entorno GREENTER_* removidas

✅ **Integración NubeFact implementada**
- `NubefactClient.php`: Cliente HTTP para 6 operaciones API
- `NubefactMapper.php`: Conversión bidireccional de datos
- `NubefactController.php`: 5 endpoints REST
- `NubefactSyncCommand.php`: Comando artisan de sincronización
- `config/nubefact.php`: Configuración centralizada
- Canal de logging dedicado: `nubefact`

✅ **Base de datos actualizada**
- 19 campos NubeFact agregados a tabla `comprobantes`
- Tabla `guia_remisions` creada (40+ columnas)
- Tabla `guia_remision_items` para líneas de GRE
- Modelos `GuiaRemision` y `GuiaRemisionItem` creados
- Migraciones ejecutadas en base de datos

✅ **Endpoints API disponibles**
- `POST /api/nubefact/comprobantes` - Emitir comprobante
- `GET /api/nubefact/comprobantes/{tipo}/{serie}/{numero}` - Consultar
- `DELETE /api/nubefact/comprobantes/{tipo}/{serie}/{numero}` - Anular
- `POST /api/nubefact/guias` - Emitir GRE
- `GET /api/nubefact/guias/{tipo}/{serie}/{numero}` - Consultar GRE

✅ **Tests implementados**
- `NubefactIntegrationTest.php` con 15 assertions pasando
- Tests de mapeo de tipos de documento y comprobantes
- Tests de conexión preparados (marcados como skipped)

✅ **Documentación completa**
- `backend/INTEGRACION_NUBEFACT.md` - Guía completa de integración
- `README.md` actualizado con instrucciones NubeFact
- Ejemplos oficiales en carpeta `examples/` (60+ archivos)
- Correcciones de tipos de datos según ejemplos NubeFact

✅ **Commits realizados (7 commits)**
```
b6ac622 - feat(nubefact): agregar modelos GuiaRemision y campos NubeFact en Comprobante
9a077b1 - feat(nubefact): agregar NubefactMapper, NubefactController y rutas de API
e76073b - feat(nubefact): agregar comando artisan nubefact:sync para sincronización
4799220 - test(nubefact): agregar tests de integración y mejorar mapeo de tipos
99c62e8 - docs(nubefact): agregar documentación completa de integración con NubeFact
483cb72 - fix(nubefact): corregir tipos de datos en NubefactMapper según ejemplos oficiales
536a20e - docs: actualizar README y documentación NubeFact con info completa
```

---
