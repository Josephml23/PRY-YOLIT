-- =====================================================
-- INSERTAR BOLETAS DE PRUEBA PARA DASHBOARD 2025
-- =====================================================
-- Este script inserta 10 boletas de venta (tipo_doc = '03')
-- para que el panel "Notas de Venta" del dashboard muestre datos.
--
-- IMPORTANTE: Ajusta los valores según tu estructura real de BD
-- =====================================================

-- Verificar primero si la tabla comprobantes tiene estos campos
-- Si algún campo no existe, elimínalo del INSERT

INSERT INTO comprobantes (
    tipo_doc,
    serie,
    correlativo,
    fecha_emision,
    fecha_vencimiento,
    cliente_tipo_doc,
    cliente_num_doc,
    cliente_razon_social,
    estado_sunat,
    anulado,
    pagado,
    mto_imp_venta,
    mto_igv,
    mto_base_igv,
    moneda,
    forma_pago,
    created_at,
    updated_at
) VALUES 
-- Boletas pagadas (para gráfico verde)
('03', 'B001', 1, '2025-07-15', '2025-07-15', '1', '12345678', 'Juan Perez Lopez', 'aceptado', false, true, 150.00, 22.88, 127.12, 'PEN', 'CONTADO', NOW(), NOW()),
('03', 'B001', 2, '2025-08-20', '2025-08-20', '1', '23456789', 'Maria Garcia Rodriguez', 'aceptado', false, true, 250.00, 38.14, 211.86, 'PEN', 'CONTADO', NOW(), NOW()),
('03', 'B001', 3, '2025-09-10', '2025-09-10', '1', '34567890', 'Carlos Sanchez Gomez', 'aceptado', false, true, 320.00, 48.81, 271.19, 'PEN', 'CONTADO', NOW(), NOW()),
('03', 'B001', 4, '2025-10-05', '2025-10-05', '1', '45678901', 'Ana Martinez Torres', 'aceptado', false, true, 180.00, 27.46, 152.54, 'PEN', 'CONTADO', NOW(), NOW()),
('03', 'B001', 5, '2025-11-12', '2025-11-12', '1', '56789012', 'Luis Fernandez Diaz', 'aceptado', false, true, 420.00, 64.07, 355.93, 'PEN', 'CONTADO', NOW(), NOW()),

-- Boletas por pagar (para gráfico rojo)
('03', 'B001', 6, '2025-08-25', '2025-09-25', '1', '67890123', 'Rosa Vargas Mendoza', 'aceptado', false, false, 280.00, 42.71, 237.29, 'PEN', 'CREDITO', NOW(), NOW()),
('03', 'B001', 7, '2025-09-15', '2025-10-15', '1', '78901234', 'Pedro Ramirez Castro', 'aceptado', false, false, 350.00, 53.39, 296.61, 'PEN', 'CREDITO', NOW(), NOW()),
('03', 'B001', 8, '2025-10-20', '2025-11-20', '1', '89012345', 'Sofia Herrera Ruiz', 'aceptado', false, false, 190.00, 28.98, 161.02, 'PEN', 'CREDITO', NOW(), NOW()),
('03', 'B001', 9, '2025-11-25', '2025-12-25', '1', '90123456', 'Jorge Morales Vega', 'aceptado', false, false, 460.00, 70.17, 389.83, 'PEN', 'CREDITO', NOW(), NOW()),
('03', 'B001', 10, '2025-12-10', '2026-01-10', '1', '01234567', 'Laura Silva Paredes', 'aceptado', false, false, 520.00, 79.32, 440.68, 'PEN', 'CREDITO', NOW(), NOW());

-- =====================================================
-- Verificar inserción
-- =====================================================
SELECT 
    tipo_doc,
    COUNT(*) as cantidad,
    SUM(mto_imp_venta) as total,
    SUM(CASE WHEN pagado = true THEN mto_imp_venta ELSE 0 END) as total_pagado,
    SUM(CASE WHEN pagado != true OR pagado IS NULL THEN mto_imp_venta ELSE 0 END) as total_por_pagar
FROM comprobantes
WHERE tipo_doc = '03'
  AND fecha_emision >= '2025-01-01'
  AND fecha_emision <= '2025-12-31'
  AND estado_sunat = 'aceptado'
  AND (anulado IS NULL OR anulado = false)
GROUP BY tipo_doc;

-- =====================================================
-- Resultado esperado:
-- tipo_doc: 03
-- cantidad: 10
-- total: 3120.00 (150+250+320+180+420+280+350+190+460+520)
-- total_pagado: 1320.00 (150+250+320+180+420)
-- total_por_pagar: 1800.00 (280+350+190+460+520)
-- =====================================================
