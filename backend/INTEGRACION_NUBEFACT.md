# Integración con NubeFact API

## 📋 Descripción

Esta plataforma está integrada con la API de NubeFact para emisión y sincronización de comprobantes electrónicos (facturación electrónica) y guías de remisión electrónicas (GRE) en Perú.

## 🔧 Configuración

### Variables de Entorno (.env)

```env
NUBEFACT_BASE_URL=https://api.pse.pe/api/v1/{ruc_key}
NUBEFACT_TOKEN=eyJhbGciOiJIUzI1NiJ9...
NUBEFACT_TIMEOUT=30
NUBEFACT_AUTO_SUNAT=true
NUBEFACT_AUTO_EMAIL=false
NUBEFACT_PDF_FORMAT=A4
NUBEFACT_INCLUDE_BASE64=false
NUBEFACT_MODE=demo
```

### Archivo de Configuración

Ver `config/nubefact.php` para opciones avanzadas.

## 🚀 Funcionalidades

### 1. Emisión de Comprobantes

**Endpoint:** `POST /api/nubefact/comprobantes`

**Request:**
```json
{
  "comprobante_id": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comprobante emitido exitosamente",
  "data": {
    "comprobante_id": 123,
    "enlace": "https://app.nubefact.com/ve/...",
    "aceptada_por_sunat": true,
    "pdf_url": "https://...",
    "xml_url": "https://...",
    "cdr_url": "https://...",
    "cadena_qr": "...",
    "sunat_code": "0",
    "sunat_description": "La Factura numero F001-123 ha sido aceptada"
  }
}
```

### 2. Consultar Estado de Comprobante

**Endpoint:** `GET /api/nubefact/comprobantes/{tipo}/{serie}/{numero}`

Ejemplo: `GET /api/nubefact/comprobantes/01/F001/123`

### 3. Anular Comprobante

**Endpoint:** `DELETE /api/nubefact/comprobantes/{tipo}/{serie}/{numero}`

**Request:**
```json
{
  "motivo": "Error en monto"
}
```

### 4. Emitir Guía de Remisión (GRE)

**Endpoint:** `POST /api/nubefact/guias`

**Request:**
```json
{
  "guia_id": 456
}
```

**Nota:** Las guías requieren 2 pasos:
1. Generación (envía a SUNAT pero sin PDF)
2. Consulta automática hasta obtener aceptación (con reintentos)

### 5. Consultar Guía

**Endpoint:** `GET /api/nubefact/guias/{tipo}/{serie}/{numero}`

Ejemplo: `GET /api/nubefact/guias/7/T001/1`

## 🔄 Sincronización

### Comando Artisan

Sincronizar comprobantes desde NubeFact:

```bash
# Sincronizar todos los comprobantes con enlace NubeFact
php artisan nubefact:sync

# Sincronizar solo pendientes de aceptación SUNAT
php artisan nubefact:sync --pendientes

# Sincronizar por empresa
php artisan nubefact:sync --empresa=1

# Sincronizar por rango de fechas
php artisan nubefact:sync --desde=2024-01-01 --hasta=2024-01-31

# Sincronizar comprobante específico
php artisan nubefact:sync --tipo=01 --serie=F001 --numero=123

# Forzar resincronización (incluye los que no tienen enlace)
php artisan nubefact:sync --force
```

### Opciones del Comando

- `--empresa={id}`: Filtrar por empresa específica
- `--desde={Y-m-d}`: Fecha desde
- `--hasta={Y-m-d}`: Fecha hasta
- `--tipo={codigo}`: Tipo de comprobante (01=Factura, 03=Boleta, 07=NC, 08=ND)
- `--serie={serie}`: Serie específica
- `--numero={numero}`: Número específico
- `--pendientes`: Solo comprobantes pendientes de aceptación SUNAT
- `--force`: Forzar sincronización aunque ya tenga datos

## 📊 Estructura de Datos

### Tabla: comprobantes

**Campos NubeFact agregados:**

- `nubefact_enlace`: URL única del comprobante en NubeFact
- `nubefact_aceptada_por_sunat`: Boolean - aceptación SUNAT
- `nubefact_sunat_ticket`: Ticket para anulaciones
- `nubefact_pdf_url`: URL del PDF
- `nubefact_xml_url`: URL del XML
- `nubefact_cdr_url`: URL del CDR (Constancia de Recepción)
- `nubefact_cadena_qr`: Cadena para código QR (obligatorio desde 2019)
- `nubefact_codigo_hash`: Hash del comprobante
- `nubefact_codigo_barras`: Código de barras PDF417
- `nubefact_pdf_base64`: PDF comprimido en base64 (opcional)
- `nubefact_xml_base64`: XML comprimido en base64 (opcional)
- `nubefact_cdr_base64`: CDR comprimido en base64 (opcional)
- `nubefact_response_json`: Respuesta completa de NubeFact (auditoría)
- `nubefact_enviado_at`: Timestamp de envío
- `nubefact_consultado_at`: Timestamp de última consulta
- `anulado`: Boolean - si fue anulado
- `anulado_at`: Timestamp de anulación
- `motivo_anulacion`: Motivo de anulación

### Tabla: guia_remisions

**Campos principales:**

- Información del cliente/destinatario
- Fechas de emisión e inicio de traslado
- Puntos de partida y llegada (con ubigeos)
- Datos de transporte (tipo, vehículo, conductor)
- Para GRE Remitente (tipo 7): datos del transportista
- Para GRE Transportista (tipo 8): datos del destinatario
- Campos NubeFact (similares a comprobantes)

## 🧪 Testing

```bash
# Ejecutar tests de integración NubeFact
vendor/bin/phpunit tests/Feature/NubefactIntegrationTest.php

# Solo tests de mapeo (no requieren API)
vendor/bin/phpunit tests/Feature/NubefactIntegrationTest.php --filter test_mapear
```

**Nota:** Los tests de conexión real están marcados como `skipped` para evitar llamadas innecesarias a la API.

## 📁 Arquitectura

### Servicios

1. **NubefactClient** (`app/Services/NubefactClient.php`)
   - Cliente HTTP para comunicación con API NubeFact
   - 6 operaciones principales:
     - `generarComprobante()`
     - `consultarComprobante()`
     - `generarAnulacion()`
     - `consultarAnulacion()`
     - `generarGuia()`
     - `consultarGuia()`
   - Manejo de errores según códigos 10-51 de NubeFact
   - Logging a canal dedicado 'nubefact'

2. **NubefactMapper** (`app/Services/NubefactMapper.php`)
   - Conversión de modelos internos a JSON NubeFact
   - `comprobanteToNubefact()`: Comprobante → JSON
   - `guiaToNubefact()`: GuiaRemision → JSON
   - `updateComprobanteFromNubefact()`: Actualizar modelo con respuesta
   - `updateGuiaFromNubefact()`: Actualizar guía con respuesta

### Controladores

**NubefactController** (`app/Http/Controllers/Api/NubefactController.php`)
- Endpoints REST para emisión, consulta y anulación
- Validación de requests
- Orquestación de servicios (Client + Mapper)
- Respuestas JSON estandarizadas

### Comandos

**NubefactSyncCommand** (`app/Console/Commands/NubefactSyncCommand.php`)
- Sincronización batch de comprobantes
- Filtros flexibles (empresa, fechas, tipo, serie, etc.)
- Barra de progreso y resumen estadístico
- Detección de cambios para evitar updates innecesarios

## 🔍 Logging

Todos los eventos de NubeFact se registran en:

**Canal:** `nubefact` (ver `config/logging.php`)  
**Driver:** `daily` (rotación diaria)  
**Retención:** 30 días  
**Nivel:** `debug`

**Ubicación:** `storage/logs/nubefact-YYYY-MM-DD.log`

## 🚨 Códigos de Error NubeFact

Ver mapeo completo en `config/nubefact.php` → `error_codes`

Principales:
- **10**: Datos incorrectos
- **11**: Token no autorizado
- **12**: CPE duplicado
- **13**: RUC no registrado
- **14**: RUC inválido
- **20-30**: Validaciones SUNAT
- **40-51**: Errores de sistema

## 🛠️ Troubleshooting

### Error: "Token no autorizado"

Verificar `NUBEFACT_TOKEN` en `.env` y regenerar desde panel NubeFact.

### Error: "CPE duplicado"

El comprobante ya existe en NubeFact. Usar consulta en lugar de emisión.

### Guía sin PDF

Las GRE requieren 2 pasos. Esperar aceptación SUNAT (el controlador hace reintentos automáticos).

### Comprobante no se sincroniza

Verificar que tenga `nubefact_enlace` poblado. Si no, usar `--force` en sync.

## 📚 Documentación NubeFact

- API JSON V1: Ver `NUBEFACT DOC API JSON V1.pdf`
- Guías GRE: Ver `API NUBEFACT - GUIA DE REMISIÓN.pdf`
- Ejemplos JSON: Ver carpeta `/examples`

## 🔐 Seguridad

- Token JWT almacenado en `.env` (nunca en código)
- Validación de credenciales antes de cada operación
- Auditoría completa con `nubefact_response_json`
- HTTPS obligatorio en producción

## 📈 Próximos Pasos

- [ ] Implementar webhook para notificaciones de SUNAT
- [ ] Dashboard con estadísticas de emisión
- [ ] Reintento automático de comprobantes rechazados
- [ ] Exportación masiva de XMLs/PDFs
- [ ] Integración con MinIO para almacenar PDFs localmente

---

**Última actualización:** Enero 2026  
**Versión API NubeFact:** JSON V1  
**Laravel:** 11.x
