# 📘 Requerimientos del Proyecto  
**MVP – Plataforma Operativa y Comercial con Facturación Electrónica (Greenter + SUNAT)**

---

## 1. 🎯 Objetivo del MVP

Desarrollar una plataforma que permita:

- Gestionar la operación comercial (oportunidades, documentos, pagos, SLA).
- Emitir comprobantes electrónicos directamente a SUNAT usando **Greenter**.
- Centralizar la información operativa y tributaria.
- Visualizar el estado del negocio mediante dashboards modernos.
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
- Envío directo a SUNAT vía **Greenter**.
- Recepción y almacenamiento de:
  - XML firmado
  - CDR (ZIP)
  - Respuesta SUNAT (aceptado / rechazado / observado)
- Generación de:
  - Representación impresa HTML
  - Representación PDF (wkhtmltopdf)

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
  - Certificado digital
  - Usuario SOL
- Emisión dinámica:

Greenter::setCompany([...])->send(...)


#### Reglas

- Cada empresa opera de forma aislada:
  - Certificados independientes
  - Credenciales independientes
  - Separación lógica de documentos y storage

---

### 2.3 Gestión de Oportunidades

#### Funcionalidades

- Registro de oportunidades:
  - Empresa emisora
  - Área responsable
  - Tipo de operación
  - Estado
  - Responsable
  - Fechas de inicio y vencimiento

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
  - Pagos
- Almacenamiento centralizado en **MinIO**:
  - Clasificación por tipo
  - Asociación a oportunidad
  - Historial de versiones básico

---

### 2.5 Pagos (MVP)

#### Funcionalidades

- Registro manual de pagos:
  - Fecha
  - Monto
  - Medio de pago
  - Número de operación
  - Archivo adjunto (imagen o PDF)
- Asociación:
  - A oportunidad
  - A comprobante

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
- Alertas internas:
  - Notificación dentro del sistema
  - (fase futura: email / WhatsApp)

---

### 2.7 Dashboards

#### Dashboard Web

- Oportunidades activas  
- Ganadas vs perdidas  
- Ventas por empresa  
- Documentos pendientes  
- SLA vencidos  

#### Dashboard TV

- Vista solo lectura  
- KPIs:
  - Ventas del mes  
  - Embudo comercial  
  - Alertas críticas  

---

## 3. 🏗 Arquitectura del Sistema

[ Frontend React + shadcn/ui ]
|
[ Laravel API ]
|
[ PostgreSQL ]
|
[ MinIO Storage ]
|
[ Servicio FE - Greenter ]
|
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
- xml_path  
- cdr_path  
- pdf_path  
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

1. Usuario registra la operación.  
2. Sistema valida:
   - Campos obligatorios.
   - Catálogos SUNAT.  
3. Se construye el objeto de emisión.  
4. Se ejecuta:
$response = Greenter::send('invoice', $data);


5. Se almacena:
   - XML  
   - CDR  
6. Se genera:
   - HTML  
   - PDF  
7. Se registra la respuesta SUNAT.  
8. Se muestra el resultado al usuario.

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
- Paquete:
  - `codersfree/laravel-greenter`

---

### 7.2 Extensiones PHP

- soap  
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

- XAMPP (PHP + PostgreSQL)  
- MinIO local  

#### Producción

- Docker  
- Nginx  
- PHP-FPM  
- MinIO independiente  

---

## 8. 🚀 Roadmap Post-MVP

- OCR automático de documentos.  
- Conciliación bancaria.  
- Bots de emisión.  
- IA:
  - Clasificación de oportunidades.  
  - Detección de riesgos comerciales.  
- Plataforma SaaS multi-tenant.  

---

## 9. ✅ Estado del Proyecto

- 🟢 Enunciado definido  
- 🟢 Stack definido (Laravel + Greenter + React + shadcn)  
- 🟢 Requerimientos base listos  
- 🟡 Inicio de desarrollo del core  

---
