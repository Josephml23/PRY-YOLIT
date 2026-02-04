# 📡 API de Sincronización Directa con NubeFact

Este documento explica cómo usar la API para obtener información directamente desde NubeFact **sin necesidad de cargar archivos Excel**.

---

## 🎯 ¿Qué puedes hacer?

Con estas nuevas funcionalidades puedes:

1. ✅ **Sincronizar comprobantes automáticamente** desde NubeFact a tu base de datos
2. ✅ **Consultar información en tiempo real** sin guardarla
3. ✅ **Actualizar estados masivamente** de comprobantes existentes
4. ✅ **Obtener datos históricos** directamente desde la API de NubeFact

---

## 🔌 Endpoints Disponibles

### 1. Verificar Estado de Conexión

**GET** `/api/nubefact-sync/estado`

Verifica que la conexión con NubeFact esté funcionando.

**Respuesta:**
```json
{
  "success": true,
  "mensaje": "Conexión con NubeFact establecida correctamente",
  "configuracion": {
    "base_url": "https://api.pse.pe/api/v1/...",
    "modo": "demo",
    "auto_sunat": true
  }
}
```

---

### 2. Ver Estadísticas de Sincronización

**GET** `/api/nubefact-sync/estadisticas`

Muestra cuántos comprobantes están sincronizados, pendientes, etc.

**Respuesta:**
```json
{
  "success": true,
  "estadisticas": {
    "total": 55,
    "con_enlace_nubefact": 55,
    "aceptados_sunat": 54,
    "nunca_consultados": 0,
    "desactualizados": 5,
    "ultima_sincronizacion": "2026-02-02 10:30:00"
  }
}
```

---

### 3. Consultar Comprobante Directo (Sin Guardar)

**GET** `/api/nubefact-sync/consultar/{tipo_doc}/{serie}/{numero}`

Obtiene información de un comprobante directamente desde NubeFact sin guardarlo en la BD.

**Ejemplo:**
```
GET /api/nubefact-sync/consultar/01/F010/21
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "enlace": "https://nubofact.pse.pe/cpe/...",
    "aceptada_por_sunat": true,
    "pdf_url": "https://...",
    "xml_url": "https://...",
    "total": 12000.00,
    "cliente_denominacion": "MUNICIPALIDAD PROVINCIAL DE CAYLLOMA",
    ...
  }
}
```

---

### 4. Sincronizar Comprobante Específico

**POST** `/api/nubefact-sync/comprobante`

Sincroniza un comprobante desde NubeFact y lo guarda/actualiza en la base de datos.

**Body:**
```json
{
  "tipo_doc": "01",
  "serie": "F010",
  "numero": 21,
  "empresa_id": 1
}
```

**Respuesta:**
```json
{
  "success": true,
  "accion": "actualizado",
  "comprobante": { ...datos del comprobante... },
  "mensaje": "Comprobante F010-21 actualizado exitosamente desde NubeFact"
}
```

---

### 5. Sincronizar Rango de Comprobantes

**POST** `/api/nubefact-sync/rango`

Sincroniza múltiples comprobantes de una misma serie (máximo 100 a la vez).

**Body:**
```json
{
  "tipo_doc": "01",
  "serie": "F010",
  "numero_inicio": 1,
  "numero_fin": 21,
  "empresa_id": 1
}
```

**Respuesta:**
```json
{
  "total": 21,
  "exitosos": 20,
  "errores": 1,
  "creados": 5,
  "actualizados": 15,
  "detalles": [
    {
      "numero": 1,
      "resultado": {
        "success": true,
        "accion": "creado",
        "mensaje": "Comprobante F010-1 creado exitosamente"
      }
    },
    ...
  ]
}
```

---

### 6. Sincronizar Comprobantes Pendientes

**POST** `/api/nubefact-sync/pendientes`

Sincroniza comprobantes que no han sido actualizados recientemente o que están pendientes.

**Body:**
```json
{
  "solo_pendientes": true,
  "empresa_id": 1,
  "tipo_doc": "01",
  "fecha_desde": "2025-07-01",
  "fecha_hasta": "2025-12-31",
  "limite": 50
}
```

**Parámetros opcionales:**
- `solo_pendientes` (boolean): Solo los que no han sido consultados en 24h
- `empresa_id` (int): Filtrar por empresa
- `tipo_doc` (string): Tipo de comprobante (01, 03, 07, 08)
- `fecha_desde` / `fecha_hasta` (date): Rango de fechas
- `limite` (int): Máximo de comprobantes (1-200, default: 50)

**Respuesta:**
```json
{
  "total": 50,
  "exitosos": 48,
  "errores": 2,
  "detalles": [ ... ]
}
```

---

## 🖥️ Uso desde Línea de Comandos

También puedes usar el comando Artisan para sincronizar:

```bash
# Sincronizar comprobante específico
php artisan nubefact:sync --comprobante=01-F010-21

# Sincronizar un rango
php artisan nubefact:sync --rango=01-F010-1:50

# Sincronizar por parámetros
php artisan nubefact:sync --tipo=01 --serie=F010 --numero=21

# Sincronizar pendientes
php artisan nubefact:sync --pendientes --limite=100

# Sincronizar por fecha
php artisan nubefact:sync --fecha-desde=2025-07-01 --fecha-hasta=2025-12-31

# Sincronizar por empresa
php artisan nubefact:sync --empresa=1 --limite=50
```

---

## 📋 Ejemplos de Uso Práctico

### Ejemplo 1: Verificar conexión antes de usar

```javascript
// En tu frontend o Postman
const verificarConexion = async () => {
  const response = await fetch('http://localhost:8000/api/nubefact-sync/estado');
  const data = await response.json();
  
  if (data.success) {
    console.log('✅ NubeFact está conectado');
  } else {
    console.error('❌ Error de conexión:', data.mensaje);
  }
};
```

### Ejemplo 2: Sincronizar comprobantes históricos

```javascript
// Sincronizar todos los comprobantes de la serie F010 del 1 al 50
const sincronizarHistorico = async () => {
  const response = await fetch('http://localhost:8000/api/nubefact-sync/rango', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tipo_doc: '01',
      serie: 'F010',
      numero_inicio: 1,
      numero_fin: 50,
      empresa_id: 1
    })
  });
  
  const resultado = await response.json();
  console.log(`Procesados: ${resultado.total}`);
  console.log(`Exitosos: ${resultado.exitosos}`);
  console.log(`Creados: ${resultado.creados}`);
  console.log(`Actualizados: ${resultado.actualizados}`);
};
```

### Ejemplo 3: Consultar un comprobante sin guardarlo

```javascript
// Solo ver la información sin afectar la BD
const consultarComprobante = async () => {
  const response = await fetch('http://localhost:8000/api/nubefact-sync/consultar/01/F010/21');
  const data = await response.json();
  
  if (data.success) {
    console.log('PDF URL:', data.data.pdf_url);
    console.log('Estado SUNAT:', data.data.sunat_description);
    console.log('Total:', data.data.total);
  }
};
```

### Ejemplo 4: Actualizar comprobantes antiguos

```javascript
// Actualizar todos los comprobantes no consultados en las últimas 24h
const actualizarAnuales = async () => {
  const response = await fetch('http://localhost:8000/api/nubefact-sync/pendientes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      solo_pendientes: true,
      limite: 100
    })
  });
  
  const resultado = await response.json();
  console.log('Comprobantes actualizados:', resultado.exitosos);
};
```

---

## ⚡ Ventajas de Usar la API Directa

### Antes (con archivos Excel)
```
1. Ir a NubeFact
2. Exportar comprobantes a CSV
3. Descargar archivo
4. Subir archivo a la plataforma
5. Procesar importación manual
```

### Ahora (con API directa)
```
1. Hacer una llamada POST a /api/nubefact-sync/rango
2. ✅ Listo - datos sincronizados automáticamente
```

### Beneficios
- ✅ **Sin archivos intermedios** - Datos directo desde NubeFact
- ✅ **Actualización automática** - Programar sincronizaciones periódicas
- ✅ **Tiempo real** - Consultar estado actual en NubeFact
- ✅ **Masivo** - Sincronizar rangos completos de comprobantes
- ✅ **Selectivo** - Solo actualizar lo que necesitas

---

## 🔐 Seguridad y Límites

- **Límite de rango:** Máximo 100 comprobantes por request para no saturar la API
- **Delay automático:** 0.2 segundos entre cada consulta al sincronizar rangos
- **Validación:** Todos los parámetros son validados antes de procesar
- **Logging:** Todas las operaciones quedan registradas en `storage/logs`

---

## 🛠️ Configuración

Las credenciales se configuran en `.env`:

```env
NUBEFACT_BASE_URL=https://api.pse.pe/api/v1/{tu_ruc_key}
NUBEFACT_TOKEN=tu_token_jwt_aqui
NUBEFACT_MODE=demo
NUBEFACT_AUTO_SUNAT=true
```

---

## 📞 Soporte

Si tienes dudas o problemas:

1. Verifica el estado de conexión: `GET /api/nubefact-sync/estado`
2. Revisa los logs: `storage/logs/laravel.log` y `storage/logs/nubefact.log`
3. Usa el modo verbose en comandos: `php artisan nubefact:sync --verbose`
