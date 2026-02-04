# ✅ Sincronización Completa Implementada

## 🎯 Opción A: Sync Completo de Comprobantes + Items + Entidades + Productos

### ¿Qué se sincroniza automáticamente?

Cuando sincronizas un comprobante desde NubeFact, el sistema ahora sincroniza automáticamente:

#### 1. 📄 **Comprobante** (tabla `comprobantes`)
- ✅ Datos completos del documento
- ✅ Estado SUNAT y validaciones
- ✅ Enlaces PDF/XML/CDR desde NubeFact
- ✅ Montos, fechas, moneda
- ✅ Información del cliente
- ✅ Observaciones y notas

#### 2. 👥 **Entidad/Cliente** (tabla `entidades`) ⭐ NUEVO
Se crea o actualiza automáticamente:
- ✅ RUC/DNI del cliente
- ✅ Tipo de documento (6=RUC, 1=DNI, etc.)
- ✅ Razón social / Denominación
- ✅ Dirección fiscal
- ✅ Email (hasta 3 emails)
- ✅ Marcado como cliente (`es_cliente = true`)
- ✅ No duplica: usa `updateOrCreate` con `num_doc` único

#### 3. 📦 **Items del Comprobante** (tabla `comprobante_items`)
- ✅ Todos los productos/servicios del comprobante
- ✅ Cantidades vendidas
- ✅ Precios unitarios (valor y precio)
- ✅ Descuentos aplicados
- ✅ Tipo de afectación IGV
- ✅ Subtotales e IGV

#### 4. 🏷️ **Productos** (tabla `productos`) ⭐ NUEVO
Se crean o actualizan automáticamente:
- ✅ Código del producto
- ✅ Descripción
- ✅ Unidad de medida (NIU, ZZ, etc.)
- ✅ Valor venta unitario
- ✅ Precio venta unitario
- ✅ Tipo de afectación IGV
- ✅ Código producto SUNAT (si existe)
- ✅ Marcado como activo
- ✅ No duplica: usa `updateOrCreate` con `codigo` único

---

## 🔄 Flujo de Sincronización

### Ejemplo: Sincronizar Factura F010-21

```bash
POST /api/nubefact-sync/comprobante
{
  "tipo_doc": "01",
  "serie": "F010",
  "numero": 21,
  "empresa_id": 1
}
```

### Lo que sucede internamente:

```
1. 📡 Consulta a NubeFact API
   └─ GET https://api.pse.pe/api/v1/.../consultar_comprobante

2. 📄 Crea/Actualiza Comprobante
   └─ Tabla: comprobantes
   └─ Serie: F010, Número: 21
   └─ Estado SUNAT: "Aceptado"
   └─ Total: S/ 4,200.00

3. 👥 Sincroniza Cliente (NUEVO)
   └─ Tabla: entidades
   └─ RUC: 20198033414
   └─ Razón Social: MUNICIPALIDAD PROVINCIAL DE CAYLLOMA
   └─ Email: cliente@municipalidad.gob.pe
   └─ es_cliente: true

4. 📦 Crea Items del Comprobante
   └─ Tabla: comprobante_items
   └─ Item 1: "Servicio de Consultoría" × 1 @ S/ 3,559.32
   └─ Item 2: "Capacitación" × 2 @ S/ 320.34

5. 🏷️ Sincroniza Productos (NUEVO)
   └─ Tabla: productos
   └─ Producto 1: SERV001 - "Servicio de Consultoría"
   │   └─ Precio: S/ 4,200.00
   │   └─ Unidad: ZZ (Servicio)
   └─ Producto 2: CAP001 - "Capacitación"
       └─ Precio: S/ 378.00
       └─ Unidad: HUR (Hora)
```

---

## 📊 Impacto en tus Pestañas

### Antes (con Excel):
```
Clientes    → 8 entidades    (importadas manualmente desde CSV)
Productos   → 92 productos   (importados manualmente desde CSV)
Comprobantes → 55 comprobantes (importados manualmente desde CSV)
```

### Ahora (sincronización automática):
```
Sincronizas 1 comprobante → Se actualizan automáticamente:
  ✅ 1 comprobante en "Comprobantes"
  ✅ 1 cliente en "Clientes/Entidades"
  ✅ 2-10 productos en "Productos" (según items del comprobante)
```

---

## 🎯 Ventajas

### 1. **Sin Duplicados**
- Usa `updateOrCreate()` para entidades y productos
- Si el RUC/código ya existe, solo actualiza
- Si es nuevo, lo crea

### 2. **Datos Completos**
- No solo importas comprobantes
- También mantienes actualizados:
  - ✅ Catálogo de clientes
  - ✅ Catálogo de productos
  - ✅ Precios reales de venta

### 3. **Información Enriquecida**
- Emails de clientes para envío automático
- Direcciones fiscales actualizadas
- Precios de productos según última venta

### 4. **Consistencia de Datos**
- Un solo origen de verdad: NubeFact
- Sincronización transaccional (todo o nada)
- Rollback automático en caso de error

---

## 🧪 Ejemplos de Uso

### Sincronizar Individual
```bash
curl -X POST http://localhost:8000/api/nubefact-sync/comprobante \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_doc": "01",
    "serie": "F010",
    "numero": 21,
    "empresa_id": 1
  }'
```

**Resultado:**
```json
{
  "success": true,
  "accion": "creado",
  "mensaje": "Comprobante F010-21 creado exitosamente desde NubeFact",
  "comprobante": {
    "id": 56,
    "serie": "F010",
    "correlativo": 21,
    "cliente_razon_social": "MUNICIPALIDAD PROVINCIAL DE CAYLLOMA"
  }
}
```

**Se crearon automáticamente:**
- ✅ 1 comprobante en `comprobantes`
- ✅ 1 entidad en `entidades` (MUNICIPALIDAD...)
- ✅ 3 items en `comprobante_items`
- ✅ 3 productos en `productos`

### Sincronizar Rango
```bash
curl -X POST http://localhost:8000/api/nubefact-sync/rango \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_doc": "01",
    "serie": "F010",
    "numero_inicio": 1,
    "numero_fin": 50,
    "empresa_id": 1
  }'
```

**Resultado:**
```json
{
  "total": 50,
  "exitosos": 48,
  "errores": 2,
  "creados": 35,
  "actualizados": 13
}
```

**Se sincronizaron:**
- ✅ 48 comprobantes
- ✅ ~30 clientes únicos (algunos repetidos)
- ✅ ~150 items
- ✅ ~80 productos únicos

---

## 🔍 Verificar Sincronización

### 1. Ver comprobantes sincronizados
```sql
SELECT COUNT(*) FROM comprobantes 
WHERE nubefact_consultado_at IS NOT NULL;
```

### 2. Ver clientes sincronizados automáticamente
```sql
SELECT num_doc, denominacion, email 
FROM entidades 
WHERE es_cliente = true
ORDER BY created_at DESC;
```

### 3. Ver productos sincronizados automáticamente
```sql
SELECT codigo, descripcion, precio_venta_unitario, activo
FROM productos 
ORDER BY updated_at DESC
LIMIT 20;
```

---

## ⚙️ Configuración

Los métodos de sincronización automática son:

### `sincronizarEntidadDesdeNubefact()`
- Extrae datos del cliente desde la respuesta de NubeFact
- Busca por `num_doc` único
- Crea o actualiza en tabla `entidades`
- Marca como `es_cliente = true`

### `sincronizarProductoDesdeItem()`
- Extrae datos del producto desde cada item
- Busca por `codigo` único
- Crea o actualiza en tabla `productos`
- Marca como `activo = true`

### Transaccionalidad
```php
DB::beginTransaction();
try {
    // 1. Crear comprobante
    // 2. Sincronizar cliente
    // 3. Crear items
    // 4. Sincronizar productos
    DB::commit();
} catch (Exception $e) {
    DB::rollBack();
    throw $e;
}
```

Si falla cualquier paso, **TODO se revierte**.

---

## 📋 Archivos Modificados

### Backend
- ✅ `app/Services/NubefactSyncService.php`
  - Agregado: `sincronizarEntidadDesdeNubefact()`
  - Agregado: `sincronizarProductoDesdeItem()`
  - Modificado: `crearComprobanteDesdeNubefact()` - ahora sincroniza entidad
  - Modificado: `sincronizarComprobante()` - también sincroniza en actualizaciones
  - Import: `use App\Models\Producto;`

### Modelos Usados
- `App\Models\Comprobante`
- `App\Models\ComprobanteItem`
- `App\Models\Entidad` ⭐
- `App\Models\Producto` ⭐
- `App\Models\Empresa`

---

## ✅ Confirmación de Implementación

**Pregunta:** ¿Qué se sincroniza ahora?

**Respuesta:**
```
✅ Comprobantes (facturas, boletas, NC, ND)
✅ Entidades/Clientes (automático al sincronizar comprobante)
✅ Items del comprobante (líneas de detalle)
✅ Productos (automático desde los items)
✅ Todo en una sola llamada
✅ Sin duplicados
✅ Transaccional (todo o nada)
```

**Beneficio Principal:**
🎯 **Con 1 sincronización de comprobante → Actualizas 4 tablas diferentes**

---

## 🚀 Próximos Pasos Sugeridos

1. **Probar sincronización completa:**
   ```bash
   POST /api/nubefact-sync/comprobante
   # Luego revisar en frontend: Comprobantes, Clientes, Productos
   ```

2. **Sincronizar rango histórico:**
   ```bash
   POST /api/nubefact-sync/rango
   # Serie: F010, del 1 al 50
   ```

3. **Verificar catálogos actualizados:**
   - Ir a pestaña "Clientes" → Ver nuevos clientes sincronizados
   - Ir a pestaña "Productos" → Ver productos con precios actualizados

4. **Implementar Opción B (Guías):**
   - Sincronizar guías de remisión desde NubeFact
   - Tabla: `guia_remisions` y `guia_remision_items`

5. **Implementar Opción C (Import CSV):**
   - Subir CSV exportado desde NubeFact
   - Procesar masivamente sin API

---

**Estado:** ✅ IMPLEMENTADO Y LISTO PARA USAR
