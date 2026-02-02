# Aplicación del Diseño de Nubofact desde Figma

**Fecha:** 2 de febrero de 2026  
**Diseño fuente:** https://www.figma.com/design/498osHkA9mi6Y9eAoevl1w/Nubofact-design?node-id=1-2&m=dev  
**Commit:** 0f2b959

---

## 📋 Resumen

Se ha implementado el diseño visual de Nubofact desde Figma, aplicando su paleta de colores y estructura de componentes al dashboard existente de la plataforma.

---

## 🎨 Colores Aplicados

### Paleta de Nubofact
- **Fondo principal tarjetas:** `#0c5078` (azul oscuro Nubofact)
- **Fondo iconos:** `#164a6b` (azul intermedio)
- **Texto:** `#ffffff` (blanco)
- **Background general:** `#cbbfae` (beige claro - visto en diseño)

### Mapeo anterior → nuevo
- Antes: `bg-[hsl(var(--dashboard-dark))]` (CSS variable)
- Ahora: `bg-[#0c5078]` (valor directo del diseño)

---

## 🔧 Componentes Actualizados

### 1. MetricCard (frontend/src/components/dashboard/MetricCard.tsx)

**Nueva variante añadida:** `variant="nubofact"`

#### Estructura HTML (adaptada de Figma node 1:103)
```tsx
<div className="flex items-center gap-3 p-4 rounded-[10px] bg-[#0c5078] text-white">
  <div className="shrink-0 bg-[#164a6b] rounded p-3">
    <Icon className="h-6 w-6" />
  </div>
  <div className="flex flex-col gap-1">
    <p className="text-[12px] uppercase">{title}</p>
    <p className="text-[24px] font-bold tabular-nums">{value}</p>
  </div>
</div>
```

#### Cambios de diseño
| Aspecto | Antes (navy) | Ahora (nubofact) |
|---------|--------------|------------------|
| Layout | Card vertical (icon arriba) | Flex horizontal (icon izq) |
| Color fondo | `hsl(var(--dashboard-dark))` | `#0c5078` |
| Color icono | `hsl(var(--dashboard-dark))` + border | `#164a6b` sólido |
| Tamaño icono | 48px (h-12 w-12) | 24px (h-6 w-6) |
| Título | 12px normal | 12px uppercase |
| Valor | Variable (responsive) | 24px fijo |
| Border radius | Card default (~8px) | 10px (rounded-[10px]) |
| Padding | p-4 sm:p-5 lg:p-6 | p-4 fijo |
| Signature strip | Gradiente border-left 3px | No (diseño limpio) |

---

### 2. Dashboard (frontend/src/pages/Dashboard.tsx)

**Cambios aplicados:**
- 5 métricas KPI cambiadas de `variant="navy"` → `variant="nubofact"`
- Iconos mantenidos: FileText, CreditCard, BarChart3, Wallet
- Grid responsive: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-5`

#### Métricas actualizadas
1. **CPE Emitidos** - FileText icon
2. **Total CPE** - CreditCard icon
3. **Total Notas Venta** - FileText icon
4. **Monto Total General** - BarChart3 icon
5. **Utilidad Neta** - Wallet icon

---

### 3. Types (frontend/src/types/index.ts)

**Tipo actualizado:**
```typescript
variant?: 'default' | 'navy' | 'nubofact';
```

---

## 📐 Especificaciones de Diseño (extraídas de Figma)

### Nodo 1:103 - Container de métricas
- **Grid:** 5 columnas (repeat(5, minmax(0, 1fr)))
- **Gap:** 12px
- **Padding horizontal:** 67px
- **Background:** #cbbfae

### Nodo 1:104-1:150 - Tarjetas individuales
- **Dimensiones:** 270.4px × 84px (aprox)
- **Border radius:** 10px
- **Padding:** 16px (izquierdo)
- **Gap interno:** 12px

### Iconos (nodos 1:106, 1:119, etc.)
- **Tamaño contenedor:** 48px × 48px
- **Tamaño icono real:** 24px × 24px
- **Padding contenedor:** 12px
- **Background:** #164a6b
- **Border radius:** 4px (convertido a `rounded` = 4px en Tailwind)

### Tipografía
- **Título:** Arial Regular 12px, white
- **Valor:** Arial Bold 24px, white, tabular-nums

---

## 🎯 Diferencias con Diseño Nubofact Original

### Elementos adaptados al proyecto existente

1. **Responsividad mejorada**
   - Figma: Grid fijo 5 columnas
   - Implementado: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-5` (adaptive)

2. **Iconos**
   - Figma: SVG assets desde localhost:3845
   - Implementado: Lucide icons (FileText, CreditCard, etc.) - más mantenible

3. **Padding contenedor**
   - Figma: px-[67px] (fijo)
   - Implementado: p-3 sm:p-4 md:p-6 lg:p-8 (responsive) en Dashboard padre

4. **Espaciado**
   - Figma: gap-[12px]
   - Implementado: gap-3 sm:gap-4 (equivalente, responsive)

### Elementos NO implementados (pendientes)

❌ **Header navegación** (nodo 1:4)
- Menú principal con dropdowns
- Avatar de usuario
- Tabs "Dashboard" / "Dashboard gra"

❌ **Filtros superiores** (nodo 1:76)
- Título "Dashboard General"
- Selects: ESTABLECIMIENTO, PERIODO, FECHA DEL
- Icono de ayuda "?"

❌ **Sección CPE** (nodo 1:162)
- Lista de items con barras de progreso
- Números + nombres (Machala, Balanza, etc.)

❌ **Sección Notas de Venta** (nodo 1:215)
- Métricas Ingresos/Egresos/M Flujo
- Checkboxes "Consultar gráfos"
- Gráfico de barras pequeño

❌ **Sección Total Compras** (nodo 1:250)
- Cards de Total Compras/Saldo
- BarChart mensual

❌ **Tablas inferiores** (nodos 1:367+)
- Productor Top (dropdown + tabla)
- Clientes Top (dropdown + tabla)
- Productos con Stock Mínimo (tabla + paginación)
- Gráfico anual Facturas/Boletas/Notas/Compras
- Tabla mensual de totales

---

## ✅ Estado de Implementación

### Completado (Fase 1)
- ✅ MetricCard variante 'nubofact' con colores exactos
- ✅ Estructura HTML coincidente con Figma (flex horizontal)
- ✅ Tipografía: uppercase títulos, tabular-nums valores
- ✅ Iconos con fondo #164a6b
- ✅ Grid responsive 5 columnas
- ✅ Integración con Dashboard existente

### Pendiente (Fases futuras)
- ⏳ Header con navegación principal
- ⏳ Filtros superiores (establecimiento, periodo, fecha)
- ⏳ Secciones de gráficos (CPE, Notas Venta, Compras)
- ⏳ Tablas de datos (Productor Top, Clientes Top, Stock Mínimo)
- ⏳ Gráfico anual comparativo
- ⏳ Tabla mensual de totales

---

## 📝 Notas Técnicas

### Clases Tailwind usadas (nuevas)
- `rounded-[10px]` - Border radius específico del diseño
- `bg-[#0c5078]` - Color hex directo
- `bg-[#164a6b]` - Color hex directo para iconos
- `text-[12px]` - Tamaño específico título
- `text-[24px]` - Tamaño específico valor
- `uppercase` - Transformación de texto para títulos

### Warnings resueltos
- ❌ `rounded-[4px]` → ✅ `rounded` (clase canónica Tailwind)

### Compatibilidad
- ✅ React 18 + TypeScript
- ✅ Tailwind CSS (arbitrary values)
- ✅ shadcn/ui (preservado para variantes default/navy)
- ✅ Lucide icons (reemplazan SVG de Figma)

---

## 🔄 Próximos Pasos

### Fase 2: Componentes de datos
1. Implementar `CPEListPanel` (nodo 1:162)
   - Lista con progress bars
   - Integrar con datos reales del backend

2. Implementar `NotasVentaSummary` (nodo 1:215)
   - Métricas Ingresos/Egresos/Flujo
   - Checkboxes para filtros
   - Mini gráfico de barras

3. Implementar `ComprasCard` (nodo 1:250)
   - Cards de totales
   - BarChart mensual con Recharts

### Fase 3: Tablas y paginación
1. Componente `TopProductorTable`
2. Componente `TopClientesTable`
3. Componente `StockMinimoTable` con paginación
4. Gráfico anual comparativo
5. Tabla mensual de totales

### Fase 4: Layout global
1. Header con navegación
2. Filtros superiores integrados
3. Background #cbbfae general
4. Tabs Dashboard / Dashboard TV

---

## 📚 Referencias

- **Diseño Figma:** https://www.figma.com/design/498osHkA9mi6Y9eAoevl1w/Nubofact-design?node-id=1-2&m=dev
- **Metadata Figma (nodo 1:103):** Métricas KPI horizontales
- **Commit inicial:** 0f2b959
- **Interface Design Skill:** [.github/skills/interface-design/SKILL.md](file://.github/skills/interface-design/SKILL.md)
- **DESIGN_CONTEXT.md:** [frontend/docs/DESIGN_CONTEXT.md](frontend/docs/DESIGN_CONTEXT.md)

---

**Última actualización:** 2 de febrero de 2026  
**Autor:** GitHub Copilot (Claude Sonnet 4.5)
