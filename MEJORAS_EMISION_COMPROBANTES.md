# Mejoras en la Emisión de Comprobantes

## 📋 Resumen de Cambios

Se ha implementado un **componente unificado y responsivo** para la emisión de los 4 tipos de comprobantes electrónicos, basado en las capturas de NubeFact.

## ✨ Características Implementadas

### 1. Componente Unificado (`EmitirComprobante.tsx`)

Un solo componente que maneja:
- ✅ **Factura Electrónica** (tipo 01)
- ✅ **Boleta de Venta** (tipo 03)
- ✅ **Nota de Crédito** (tipo 07)
- ✅ **Nota de Débito** (tipo 08)

### 2. Diseño basado en NubeFact

#### Barra de Herramientas
- 🛠️ **General**: Datos básicos del comprobante (fecha, serie, número, pagado)
- ➕ **Adicionales**: Orden de compra, placa de vehículo, observaciones
- 📄 **Guía de Remisión Física** (placeholder)
- 🧾 **Formato de PDF** (placeholder)

#### Cabecera de Comprobante
- **IGV %**: Selector con 18%, 10% (Ley 31556), 4% (IVAP)
- **Tipo de operación**: Catálogo 51 de SUNAT
- **Moneda**: PEN, USD, EUR
- **Tipo de cambio**: Obligatorio cuando moneda ≠ PEN

#### Layout Responsivo de Items
- **Desktop**: Layout de 2 columnas
  - Izquierda (2fr): Lista de items
  - Derecha (1fr): Panel lateral con:
    - Productos destacados (placeholder)
    - Resumen de totales
    - Switch de detracción
- **Mobile**: Layout vertical apilado

### 3. Responsividad Completa

```css
/* Breakpoints implementados */
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px
```

#### Adaptaciones Móviles
- Tabs compactos con íconos
- Grillas responsivas (1 columna → 2 columnas → 4 columnas)
- Etiquetas abreviadas en campos estrechos
- Botones full-width en móvil

### 4. Validación Dinámica

- **Factura**: Requiere RUC del cliente
- **Boleta**: Documento opcional < S/ 700, obligatorio ≥ S/ 700
- **Notas**: Requieren documento del cliente

### 5. Cálculos Automáticos

- IGV dinámico según % seleccionado
- Precio unitario con IGV calculado automáticamente
- Totales en tiempo real
- Redondeo a 2 decimales

## 🎨 Experiencia de Usuario

### Cambio Rápido de Tipo
- Tabs superiores para cambiar entre Factura, Boleta, NC, ND
- Al cambiar tipo:
  - Se ajusta la serie (F001, B001, FC001, FD001)
  - Se adaptan las validaciones
  - Se actualiza el título y descripción
  - Se resetea el formulario

### Feedback Visual
- Iconos descriptivos para cada tipo
- Mensajes de validación contextuales
- Toasts de éxito/error específicos por tipo
- Estados de carga en botones

### Accesibilidad
- Labels descriptivos
- Placeholders contextuales
- Mensajes de error claros
- Navegación por teclado

## 📁 Estructura de Archivos

```
frontend/src/pages/Facturacion/
├── EmitirComprobante.tsx       ← NUEVO: Componente unificado
├── EmitirFactura.tsx           ← Mantener como respaldo
├── EmitirBoleta.tsx            ← Mantener como respaldo
├── EmitirNotaCredito.tsx       ← Mantener como respaldo
├── EmitirNotaDebito.tsx        ← Mantener como respaldo
└── EmitirGuiaRemision.tsx

frontend/src/pages/
└── FacturacionNubefact.tsx     ← Actualizado para usar componente unificado
```

## 🚀 Uso

### Navegación Principal
```tsx
// En FacturacionNubefact.tsx
<Tabs>
  <TabsTrigger>Emitir Comprobantes</TabsTrigger>  ← Usa EmitirComprobante
  <TabsTrigger>Guía Remisión</TabsTrigger>
  <TabsTrigger>Comprobantes</TabsTrigger>
</Tabs>
```

### Selector de Tipo Interno
```tsx
// Dentro de EmitirComprobante
<Tabs value={tipoActivo} onValueChange={cambiarTipo}>
  <TabsTrigger>Factura</TabsTrigger>
  <TabsTrigger>Boleta</TabsTrigger>
  <TabsTrigger>Nota de Crédito</TabsTrigger>
  <TabsTrigger>Nota de Débito</TabsTrigger>
</Tabs>
```

## 🔧 Configuración por Tipo

```typescript
const TIPOS_CONFIG = {
  factura: {
    codigo: '01',
    titulo: 'Factura Electrónica',
    icono: FileText,
    seriePrefix: 'F',
    requiereDocumento: true,
  },
  boleta: {
    codigo: '03',
    titulo: 'Boleta de Venta',
    icono: Receipt,
    seriePrefix: 'B',
    requiereDocumento: false,
  },
  // ...
}
```

## 📱 Responsividad Detallada

### Grid de Cabecera
```tsx
// Desktop: 4 columnas (IGV, Tipo Op, Moneda, T.Cambio)
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4

// Items: 5 columnas (Unidad, Cant, V.Unit, Desc, P.Unit)
grid-cols-2 sm:grid-cols-5
```

### Layout Principal
```tsx
// Desktop: 2 columnas (Items + Resumen)
lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]

// Mobile: Apilado vertical
space-y-6
```

## 🎯 Próximos Pasos Sugeridos

1. **Productos Destacados**: Implementar carrusel/grid de productos frecuentes
2. **Búsqueda de Clientes**: Autocompletado por RUC/DNI
3. **Plantillas**: Guardar y cargar configuraciones comunes
4. **Vista Previa**: Mostrar PDF inline antes de emitir
5. **Historial**: Últimos comprobantes emitidos
6. **Validación SUNAT**: Validar RUC/DNI contra API de SUNAT

## ⚠️ Consideraciones

- Los archivos individuales (`EmitirFactura.tsx`, etc.) se mantienen como respaldo
- El componente unificado requiere el componente `Tabs` de shadcn/ui
- Las series se cargan dinámicamente según el tipo de comprobante
- El cálculo de IGV es reactivo según el porcentaje seleccionado

## 🐛 Testing Recomendado

- [ ] Cambiar entre tipos de comprobante
- [ ] Validar campos requeridos por tipo
- [ ] Probar cálculos con diferentes % de IGV
- [ ] Verificar responsividad en móvil/tablet/desktop
- [ ] Probar con moneda extranjera
- [ ] Validar emisión exitosa de cada tipo
- [ ] Verificar vista previa de PDF

---

**Fecha**: 23 de Enero, 2026  
**Versión**: 1.0  
**Estado**: ✅ Implementado y Listo para Testing
