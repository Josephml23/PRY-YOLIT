# 🔧 Diagnóstico Dashboard - Gráficas No Aparecen

## Problema Reportado
Usuario ejecutó query SQL que mostró:
- 28 Facturas (tipo_doc = '01') - S/ 227,827.32
- 10 Notas de Crédito (tipo_doc = '07') - S/ 18,957.12
- **0 Boletas (tipo_doc = '03')** - S/ 0.00

**Resultado**: Las gráficas no se muestran en el dashboard.

## Causa Raíz

### 1. Filtro de Fechas
El dashboard usa por defecto `periodo: 'ESTE_MES'` con `fechaDel: fecha_actual`.

En `DashboardController.php` líneas 285-293:
```php
$todosLosCPE = Comprobante::whereIn('tipo_doc', ['01', '03', '07', '08'])
    ->whereDate('fecha_emision', '>=', $fechaDel)
    ->whereDate('fecha_emision', '<=', $fechaHasta)
    ->where('estado_sunat', 'aceptado')
    ->where(function($q) {
        $q->whereNull('anulado')
          ->orWhere('anulado', false);
    })
    ->get();
```

Si `fechaDel = '2026-01-28'` y `periodo = 'ESTE_MES'`, entonces:
- `fechaHasta = '2026-01-31'` (fin de mes)
- Solo busca datos entre **2026-01-28** y **2026-01-31** (3 días)

### 2. Lógica de Renderizado de Gráficas
En `Dashboard.tsx` líneas 70-79:
```typescript
const dataCPEPie = [
  { name: 'Pagado', value: stats.cpePagado, color: CHART_COLORS.pagado },
  { name: 'Por Pagar', value: stats.cpePorPagar, color: CHART_COLORS.porPagar },
].filter(item => item.value > 0);  // ← FILTRO: Solo valores > 0

// Líneas 176-213:
{dataCPEPie.length > 0 && (  // ← CONDICIONAL: Solo renderiza si hay datos
  <ChartContainer>
    <PieChart>...</PieChart>
  </ChartContainer>
)}
```

**Si todos los valores son 0, el array filtrado queda vacío → no se renderiza la gráfica.**

### 3. No Hay Boletas (tipo_doc = '03')
El query del usuario no mostró ninguna Boleta, por lo tanto:
- `totalNotasVenta = 0`
- `notasVentaPagado = 0`
- `notasVentaPorPagar = 0`
- El panel "Notas de Venta" muestra S/ 0.00
- **La gráfica de Notas de Venta NO aparece**

## Soluciones

### Solución 1: Verificar Fechas de los Datos Reales
Ejecutar el script de diagnóstico `test_dashboard_query.sql` para:
1. Ver el rango de fechas de todos los comprobantes
2. Contar registros por año
3. Verificar si hay datos específicos en enero 2026
4. Detectar si hay Boletas en la BD

### Solución 2: Cambiar Filtro del Dashboard
En el frontend, el usuario puede:
1. Cambiar el período a "ESTE_AÑO" para ver datos de todo 2026
2. O usar "POR_FECHA" y seleccionar un rango más amplio (ej: 2026-01-01)

### Solución 3: Insertar Datos de Prueba (Temporal)
Si la BD está vacía para 2026, insertar comprobantes de prueba:
```sql
INSERT INTO comprobantes (
  tipo_doc, serie, correlativo, fecha_emision, 
  estado_sunat, anulado, pagado, mto_imp_venta,
  cliente_tipo_doc, cliente_num_doc, cliente_razon_social
) VALUES 
  ('01', 'F001', 1, '2026-01-28', 'aceptado', false, true, 1500.00, '6', '20123456789', 'Cliente Test 1'),
  ('03', 'B001', 1, '2026-01-28', 'aceptado', false, false, 500.00, '1', '12345678', 'Cliente Test 2'),
  ('07', 'NC01', 1, '2026-01-28', 'aceptado', false, true, 200.00, '6', '20123456789', 'Cliente Test 1');
```

## Próximos Pasos

1. **Usuario debe ejecutar** `test_dashboard_query.sql` y compartir resultados
2. **Verificar** si hay datos en el rango de fechas actual
3. **Ajustar filtros** o **insertar datos de prueba** según sea necesario
4. **Confirmar** que las gráficas se renderizan correctamente

## Notas Técnicas

### Pagado / Por pagar (según Nubefact)
- **Pagado** y **Por pagar** provienen del estado marcado en Nubefact.
- En el reporte/exportación CSV de Nubefact aparece la columna **PAGADO** con valores "SI" o "NO".
- El import mapea: PAGADO = "SI" → `pagado = true`, sino `pagado = false`.
- Si la mayoría de comprobantes figura como "Por pagar", es porque en Nubefact no están marcados como pagados. No es un error de la API; es el estado que tiene cada documento en Nubefact.

### Tipos de Comprobantes (NubeFact)
- `01`: Facturas
- `03`: Boletas de Venta (= Notas de Venta en esta app)
- `07`: Notas de Crédito
- `08`: Notas de Débito

### KPIs del Dashboard
- **CPE Emitidos**: Facturas + Boletas + NC + ND
- **Total CPE**: Facturas + NC + ND (SIN Boletas)
- **Total Notas Venta**: Solo Boletas (tipo_doc = '03')
- **Monto Total General**: Suma de todos los CPE
- **Utilidad Neta**: Ingresos - Egresos (egresos = 0 por ahora)

### Paneles de Desglose
- **Panel CPE**: Facturas (01) + NC (07) + ND (08)
- **Panel Notas de Venta**: Boletas (03)
- **Panel Totales Generales**: Resumen general con gráfico de barras

---
**Fecha**: 2026-01-28
**Estado**: Pendiente de resultados del script SQL
