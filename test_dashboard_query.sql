-- =====================================================
-- SCRIPT DE PRUEBA PARA DASHBOARD 2026
-- =====================================================

-- 1. VERIFICAR RANGO DE FECHAS DE TODOS LOS COMPROBANTES
SELECT 
    MIN(fecha_emision) as fecha_minima,
    MAX(fecha_emision) as fecha_maxima,
    COUNT(*) as total_registros
FROM comprobantes;

-- 2. CONTEO POR AÑO
SELECT 
    EXTRACT(YEAR FROM fecha_emision) as anio,
    COUNT(*) as cantidad
FROM comprobantes
GROUP BY EXTRACT(YEAR FROM fecha_emision)
ORDER BY anio DESC;

-- 3. DATOS PARA DASHBOARD 2026 (EXACTAMENTE LO QUE USA EL BACKEND)
-- Cambia las fechas según lo que necesites probar
SELECT 
    tipo_doc,
    COUNT(*) as cantidad,
    SUM(mto_imp_venta) as total,
    SUM(CASE WHEN pagado = true THEN mto_imp_venta ELSE 0 END) as total_pagado,
    SUM(CASE WHEN pagado != true OR pagado IS NULL THEN mto_imp_venta ELSE 0 END) as total_por_pagar
FROM comprobantes
WHERE fecha_emision >= '2026-01-01'
  AND fecha_emision <= '2026-01-31'  -- Ajusta según el período que quieras probar
  AND estado_sunat = 'aceptado'
  AND (anulado IS NULL OR anulado = false)
GROUP BY tipo_doc
ORDER BY tipo_doc;

-- 4. VERIFICAR SI HAY BOLETAS (tipo_doc = '03') EN 2026
SELECT 
    COUNT(*) as cantidad_boletas,
    SUM(mto_imp_venta) as total_boletas
FROM comprobantes
WHERE tipo_doc = '03'
  AND fecha_emision >= '2026-01-01'
  AND fecha_emision <= '2026-01-31'
  AND estado_sunat = 'aceptado'
  AND (anulado IS NULL OR anulado = false);

-- 5. VENTAS POR HORA (PARA EL GRÁFICO)
SELECT 
    EXTRACT(HOUR FROM fecha_emision) as hora,
    COUNT(*) as cantidad,
    SUM(mto_imp_venta) as total
FROM comprobantes
WHERE fecha_emision >= '2026-01-01'
  AND fecha_emision <= '2026-01-31'
  AND estado_sunat = 'aceptado'
  AND (anulado IS NULL OR anulado = false)
GROUP BY EXTRACT(HOUR FROM fecha_emision)
ORDER BY hora;

-- 6. VERIFICAR TODOS LOS REGISTROS DE 2026 (LIMITAR A 20)
SELECT 
    id,
    tipo_doc,
    serie,
    correlativo,
    fecha_emision,
    mto_imp_venta,
    estado_sunat,
    anulado,
    pagado,
    cliente_razon_social
FROM comprobantes
WHERE fecha_emision >= '2026-01-01'
  AND fecha_emision <= '2026-12-31'
ORDER BY fecha_emision DESC
LIMIT 20;
