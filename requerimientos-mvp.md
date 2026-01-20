# 📘 Requerimientos del Proyecto  
**MVP – Plataforma Operativa y Comercial con Facturación Electrónica (NubeFact + SUNAT)**

---

## 1. 🎯 Objetivo del MVP

Desarrollar una plataforma que permita:

- Gestionar la operación comercial (oportunidades, documentos, pagos, SLA).
- Emitir comprobantes electrónicos a SUNAT usando **NubeFact API (JSON V1)**.
- Centralizar la información operativa y tributaria en una sola vista.
- Visualizar el estado del negocio mediante dashboards web y TV.
- Servir como base para futuras automatizaciones (OCR, IA, bots, integraciones).

---

## 2. 🧩 Alcance Funcional del MVP

---

### 2.1 Facturación Electrónica (Core Tributario)

#### Funcionalidades

- Emisión de:
  - Facturas electrónicas (01)
  - Boletas electrónicas (03)
  - Notas de crédito (07)
  - Notas de débito (08)
  - Guías de Remisión Electrónica – GRE Remitente (09) y, opcionalmente, Transportista (31)
- Envío a SUNAT vía **NubeFact API JSON V1**.
- Recepción y almacenamiento de:
  - XML firmado
  - CDR (ZIP)
  - Respuesta SUNAT (aceptado / rechazado / observado)
  - Hash y cadena para QR
  - Enlaces a recursos generados por NubeFact (PDF, XML, CDR)
- Descarga desde la plataforma de:
  - PDF de cada comprobante (representación impresa oficial NubeFact)
  - XML del comprobante
  - CDR de respuesta SUNAT
- Visualización en frontend de:
  - Listado de comprobantes emitidos con filtros (tipo, serie, estado, fechas)
  - Estado SUNAT y detalle de cada comprobante

#### Reglas

- Validación obligatoria con:
  - Catálogos SUNAT vigentes.
- No permitir emisión si:
  - Existen campos obligatorios incompletos.
  - Los códigos no pertenecen a catálogos oficiales.
  - No existen credenciales válidas.

---

### 2.2 Multiempresa (Multi-RUC)

#### Funcionalidades

- Registro de múltiples empresas emisoras:
  - RUC
  - Razón social
  - Dirección fiscal
  - Datos de contacto
  - Credenciales y parámetros de integración NubeFact (URL base, token, modo demo/producción)
- Emisión dinámica:

  - Selección de empresa activa en la interfaz
  - Uso automático del token/URL de la empresa activa en todos los llamados a NubeFact


#### Reglas

- Cada empresa opera de forma aislada:
  - Certificados independientes
  - Credenciales independientes
  - Separación lógica de documentos y storage

---

### 2.3 Gestión de Oportunidades

#### Funcionalidades

- Registro y seguimiento de oportunidades:
  - Empresa emisora
  - Área responsable
  - Tipo de operación
  - Estado
  - Responsable
  - Fechas de inicio y vencimiento
  - Monto estimado y probabilidad (opcional)
- Vista de listado y detalle por oportunidad.
- Asociación de documentos, pagos y comprobantes electrónicos a cada oportunidad.

#### Estados mínimos

- Nuevo  
- En proceso  
- Enviado  
- Observado  
- Ganado  
- Perdido  

---

### 2.4 Documentos y Adjuntos

#### Funcionalidades

- Adjuntar documentos por oportunidad:
  - TDR
  - OC / SIAF
  - Contratos
  - Conformidades
  - Entregables
  - Soportes de pago
- Almacenamiento centralizado en **MinIO**:
  - Clasificación por tipo
  - Asociación a oportunidad
  - Historial de versiones básico
- Funcionalidades de frontend:
  - Carga de archivos (drag & drop o selector)
  - Lista de documentos por oportunidad
  - Vista global de documentos
  - Descarga de documentos almacenados en MinIO
  - Acceso a PDFs de comprobantes electrónicos relacionados (vía enlaces NubeFact)

---

### 2.5 Pagos (MVP)

#### Funcionalidades

- Registro manual de pagos:
  - Fecha
  - Monto
  - Moneda
  - Medio de pago
  - Número de operación
  - Banco y referencia (opcional)
  - Archivo adjunto (imagen o PDF)
- Asociación:
  - A oportunidad
  - A comprobante electrónico
- Vistas de frontend:
  - Lista de pagos por oportunidad
  - Vista global de pagos con filtros (fechas, medio, empresa)
  - Descarga de comprobante de pago adjunto

---

### 2.6 SLA y Alertas

#### Funcionalidades

- Definición de SLA por:
  - Tipo de oportunidad
  - Área
  - Estado
- Cálculo automático:
  - Fecha límite
  - Estado visual:
    - 🟢 En plazo
    - 🟡 Próximo a vencer
    - 🔴 Vencido
- Alertas internas en la interfaz:
  - Listados de oportunidades vencidas o próximas a vencer
  - Resaltado visual en dashboards y vistas de detalle
- (Fase posterior al MVP):
  - Notificaciones por email / WhatsApp

---

### 2.7 Dashboards

#### Dashboard Web

- Oportunidades activas  
- Ganadas vs perdidas  
- Ventas por empresa y por período  
- Comprobantes emitidos recientes (con estado SUNAT)  
- Documentos pendientes  
- SLA próximos a vencer y vencidos  

#### Dashboard TV

- Vista solo lectura optimizada para pantallas grandes  
- KPIs:
  - Ventas del mes  
  - Embudo comercial  
  - Alertas críticas  
  - Oportunidades clave  
- Auto-refresh para uso en monitoreo continuo

---

## 3. 🏗 Arquitectura del Sistema

[ Frontend React + shadcn/ui ]  
│  
[ Laravel API (Módulos Operativos + NubefactClient) ]  
│  
[ PostgreSQL │ MinIO Storage ]  
│  
[ NubeFact API JSON V1 ]  
│  
[ SUNAT ]


---

## 4. 🗂 Modelo de Datos (MVP)

---

### 4.1 Empresa

- id  
- ruc  
- razon_social  
- nombre_comercial  
- direccion  
- certificado_path  
- sol_user  
- sol_password (encriptado)  
- client_id  
- client_secret  

---

### 4.2 Usuario

- id  
- nombre  
- email  
- rol  

---

### 4.3 Oportunidad

- id  
- empresa_id  
- area  
- estado  
- responsable_id  
- fecha_inicio  
- fecha_vencimiento  

---

### 4.4 Comprobante

- id  
- empresa_id  
- tipo_doc  
- serie  
- correlativo  
- cliente_tipo_doc  
- cliente_num_doc  
- cliente_razon  
- total  
- moneda  
- estado_sunat  
- xml_path / enlace_xml  
- cdr_path / enlace_cdr  
- pdf_url / enlace_pdf  
- cadena_qr  
- hash  
- raw_request  
- raw_response  

---

### 4.5 Documento

- id  
- oportunidad_id  
- tipo  
- storage_path  
- metadata  

---

### 4.6 Pago

- id  
- oportunidad_id  
- comprobante_id  
- fecha  
- monto  
- medio  
- nro_operacion  
- comprobante_path  

---

## 5. 🔄 Flujo de Emisión Electrónica

1. Usuario registra la operación y selecciona empresa emisora.  
2. Sistema valida:
  - Campos obligatorios.
  - Catálogos SUNAT.  
  - Series y numeración de comprobante.  
3. Se construye el payload JSON según especificación de NubeFact.  
4. El backend ejecuta la llamada a **NubeFact API** vía `NubefactClient`.  
5. NubeFact procesa el comprobante y lo envía a SUNAT.  
6. El sistema almacena:
  - XML (o enlace al XML)  
  - CDR (o enlace al CDR)  
  - Enlaces al PDF oficial  
  - Respuesta SUNAT y metadatos (hash, QR, códigos)  
7. Se actualiza el registro de comprobante en la base de datos.  
8. El frontend muestra el resultado al usuario y habilita botones de descarga de **PDF / XML / CDR**.

---

## 6. 🔐 Seguridad

- Credenciales únicamente en `.env`.  
- Certificados fuera del repositorio.  
- Encriptación de:
  - Usuario SOL  
  - Claves SUNAT  
- Control de acceso por roles:
  - Admin  
  - Operador  
  - Consulta  
- Auditoría básica:
  - Quién emitió  
  - Cuándo  
  - Qué documento  

---

## 7. 🛠 Requisitos Técnicos

---

### 7.1 Backend

- PHP ≥ 8.1  
- Laravel ≥ 11  
- Integración externa:
  - Cliente HTTP para **NubeFact API JSON V1** (Guzzle + servicio `NubefactClient`)

---

### 7.2 Extensiones PHP

- curl  
- json  
- openssl  

---

### 7.3 Frontend

- React 18+  
- **shadcn/ui** para:
  - Formularios  
  - Tablas  
  - Diálogos  
  - Dashboards  
- TailwindCSS como base de estilos.
- Consumo vía API REST.

---

### 7.4 Storage

- **MinIO** (S3 compatible)  
- Estructura mínima:
  - sunat/xml  
  - sunat/cdr  
  - sunat/pdf  
  - docs/  

---

### 7.5 Infraestructura

#### Desarrollo

- Docker para servicios de base de datos y storage:
  - PostgreSQL (contendor dedicado)
  - MinIO (S3 compatible)  
- Laravel ejecutándose localmente (`php artisan serve`).

#### Producción

- Docker / orquestador (según entorno).  
- Nginx + PHP-FPM para backend Laravel.  
- PostgreSQL administrado o en contenedor dedicado.  
- MinIO u otro servicio S3 compatible para storage.  

---

## 8. 🚀 Roadmap Post-MVP

- OCR automático de documentos.  
- Conciliación bancaria.  
- Bots de emisión y recordatorios automáticos.  
- IA:
  - Clasificación de oportunidades.  
  - Detección de riesgos comerciales.  
- Plataforma SaaS multi-tenant.  
- Portal de cliente para descarga de comprobantes.  

---

## 9. ✅ Estado del Proyecto (MVP)

- 🟢 Núcleo tributario NubeFact implementado (Facturas, Boletas, Notas, GRE, descargas PDF/XML/CDR).  
- 🟢 Módulos operativos básicos listos (Empresas, Oportunidades, Documentos, Pagos, SLA).  
- 🟢 Dashboards Web y TV conectados a datos reales.  
- 🟡 Pendientes técnicos: exportación a Excel, importador histórico desde NubeFact, autenticación y tests E2E.  

---
