# 📁 Ejemplos de NubeFact

Esta carpeta contiene ejemplos de uso de la API de NubeFact para diferentes tipos de comprobantes electrónicos.

## 📄 Archivos JSON

Los archivos `.txt` contienen ejemplos oficiales de NubeFact con el formato JSON para:

### Comprobantes de Pago Electrónicos (CPE)
- **Facturas (01)** - Ejemplos 1-33 con diferentes escenarios (gravadas, exoneradas, inafectas, gratuitas, exportación, descuentos, percepciones, detracciones, etc.)
- **Boletas (03)** - Ejemplos 1-24 con validaciones específicas para boletas
- **Notas de Crédito (07)** - Para facturas y boletas
- **Notas de Débito (08)** - Para facturas y boletas

### Guías de Remisión Electrónica (GRE)
- **Remitente** - TTT1-1, TTT1-2, TTT1-3 (diferentes modalidades de transporte)
- **Transportista** - VVV1-1

### Consultas y Anulaciones
- Ejemplos de consulta de estado de comprobantes
- Ejemplos de anulación (comunicación de baja)

## 📊 Archivos CSV (No versionados)

Los archivos `.csv` contienen **datos reales exportados desde NubeFact** y están excluidos del repositorio por razones de privacidad:

### `20434906301-COMPROBANTES-*.csv`
Contiene el listado completo de comprobantes emitidos con campos como:
- Fecha emisión, vencimiento
- Tipo, Serie, Número  
- Cliente (RUC, denominación)
- Montos (gravado, exonerado, IGV, total)
- Estado SUNAT
- Flags: pagado, anulado, enviado al cliente
- Forma de pago y detalles

### `20434906301-ITEMS-*.csv`  
Contiene el detalle de ítems/líneas de cada comprobante:
- Productos/servicios detallados
- Cantidades, precios unitarios
- Tipos de IGV/ISC
- Descuentos por ítem

## 🔒 Seguridad

**⚠️ IMPORTANTE:** Los archivos CSV no se suben al repositorio porque contienen:
- RUCs y razones sociales reales
- Montos de facturación reales  
- Información comercial sensible

Solo se mantienen localmente para desarrollo y testing del importador histórico.

## 🚀 Uso

Estos archivos se utilizan para:
1. **Testing** - Validar la integración con NubeFact API
2. **Desarrollo** - Implementar importador de histórico desde CSV
3. **Formato de referencia** - Para la función de exportar a Excel del frontend

## 📋 Formato de exportación

El CSV de NubeFact se puede usar como referencia para nuestro endpoint `/api/facturacion/comprobantes/export` que genera archivos compatibles con Excel.