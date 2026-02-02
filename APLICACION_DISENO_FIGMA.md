# Aplicación del Diseño de Nubofact desde Figma

**Fecha:** 2 de febrero de 2026  
**Diseño fuente:** https://www.figma.com/design/498osHkA9mi6Y9eAoevl1w/Nubofact-design?node-id=1-2&m=dev  
**Commit inicial:** 0f2b959 (métricas)  
**Commit completo:** b9d56b2 (diseño completo)

---

## 📋 Resumen

Se ha implementado el **diseño visual completo de Nubofact** desde Figma, aplicando su paleta de colores, estructura de componentes y layout al dashboard de la plataforma.

### ✅ Implementado en este commit:
- **Variables CSS** con colores de marca Nubofact
- **Header completo** con navegación y usuario
- **Panel de filtros** estilo Nubofact
- **Fondo beige** (#cbbfae) en todo el dashboard
- **Layout completo** según diseño original

---

## 🎨 Colores Aplicados

### Paleta de Nubofact (Variables CSS)
```css
/* Light Mode */
--nubofact-primary: 200 60% 19%;      /* #0c5078 - Azul primario (métricas, filtros) */
--nubofact-secondary: 200 52% 24%;    /* #164a6b - Azul secundario (iconos) */
--nubofact-header: 203 46% 25%;       /* #234662 - Azul header principal */
--nubofact-header-dark: 203 54% 19%;  /* #1a3548 - Azul header tabs */
--nubofact-background: 35 31% 80%;    /* #cbbfae - Fondo beige */
--nubofact-accent: 142 79% 73%;       /* #7bf1a8 - Verde acento (rol usuario) */

/* Dark Mode */
--nubofact-primary: 200 60% 25%;
--nubofact-secondaImplementados

### 1. Variables CSS (frontend/src/index.css)

**Agregadas al theme:**
```css
/* Nubofact Brand Colors */
--nubofact-primary: 200 60% 19%;
--nubofact-secondary: 200 52% 24%;
--nubofact-header: 203 46% 25%;
--nubofact-header-dark: 203 54% 19%;
--nubofact-background: 35 31% 80%;
--nubofact-accent: 142 79% 73%;
```

**Sistema HSL:** Formato `H S% L%` para compatibilidad con `hsl(var(--variable))`

---

### 2. NubofactHeader (frontend/src/components/layout/NubofactHeader.tsx)

**Nueva implementación completa** basada en Figma nodo 1:4

#### Estructura HTML (adaptada de Figma)
```tsx
<header className="bg-[hsl(var(--nubofact-header))] text-white">
  {/* Top Bar - altura 64px */}
  <div className="flex items-center justify-between px-4 h-16">
    {/* Logo + Navigation */}
    <div className="flex items-center gap-4">
      {/* Logo NUBOFACT */}
      <div className="bg-white rounded px-2 py-1 h-12">
        <span className="text-[hsl(var(--nubofact-primary))] font-bold text-lg">
          NUBOFACT
        </span>
      </div>
      
      {/* Menú navegación: 6 items con dropdowns */}
      <nav className="flex items-center gap-1">
        {/* Mantenimiento, Compras, Inventario, CPE's, Archivo De Caja, Reportes */}
      </nav>
    </div>
    
    {/* User Info */}
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-full bg-gray-300">
        <User className="h-6 w-6" />
      </div>
      <div className="text-right">
        <span className="text-[hsl(var(--nubofact-accent))] text-xs">
          Administrador
        </span>
        <span className="text-xs">PRODUCCION</span>
      </div>
    </div>
  </div>
  
  {/* Tabs Bar - altura 36px */}
  <div className="bg-[hsl(var(--nubofact-header-dark))] h-9">
    <Link className={activeTab ? 'bg-gray-200 text-gray-900' : 'text-white'}>
      Dashboard
    </Link>
    <Link>Dashboard gra</Link>
  </div>
</header>
```

#### Navegación implementada
| Item | Icon | Path | Dropdown |
|------|------|------|----------|
| Mantenimiento | Settings | /mantenimiento | ✓ |
| Compras | ShoppingCart | /compras | ✓ |
| Inventario | Package | /inventario | ✓ |
| CPE's | FileText | /cpes | ✓ |
| Archivo De Caja | Archive | /archivo-caja | ✓ |
| Reportes | BarChart3 | /reportes | ✓ |

#### Estados y efectos
- **Hover:** `hover:bg-white/10` en items de navegación
- **Active:** `bg-white/20` en ruta activa
- **Tab activo:** `bg-gray-200 text-gray-900`
- **Tab inactivo:** `text-white hover:bg-white/10`

---

### 3. DashboardFilters (frontend/src/components/dashboard/DashboardFilters.tsx)

**Nueva implementación** basada en Figma nodo 1:76

#### Estructura HTML
```tsx
<div className="bg-[hsl(var(--nubofact-primary))] rounded-[10px] p-4">
  <div className="flex items-center justify-between">
    {/* Left: Title + Filters */}
    <div className="flex items-center gap-8">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-white text-xl font-bold leading-7">
          Dashboard General
        </h1>
        <p className="text-white/80 text-xs">
          Resumen de operaciones y rendimiento
        </p>
      </div>
      
      {/* Filters: 3 inputs */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-white text-xs uppercase">
            ESTABLECIMIENTO
          </label>
          <input className="bg-white rounded px-3 py-1.5 text-xs w-48 h-7" />
        </div>
        {/* PERIODO, FECHA DEL ... */}
      </div>
    </div>
    
    {/* Right: Help Icon */}
    <div className="opacity-40">
      <span className="text-white text-2xl">?</span>
    </div>
  </div>
</div>
```

#### Props interface
```typescript
interface DashboardFiltersProps {
  establecimiento?: string;
  periodo?: string;
  fechaDel?: string;
  onEstablecimientoChange?: (value: string) => void;
  onPeriodoChange?: (value: string) => void;
  onFechaDelChange?: (value: string) => void;
  className?: string;
}
```

#### Especificaciones de diseño
- **Background:** `#0c5078` (--nubofact-primary)
- **Border radius:** 10px
- **Padding:** 16px
- **Altura:** 80px (auto)
- **Inputs:** bg-white, h-7, text-xs, placeholder text-black/50
- **Labels:** uppercase, text-xs, text-white
- **Help icon:** opacity-40, text-2xl

---

### 4. MetricCard (frontend/src/components/dashboard/MetricCard.tsx)

**Variante 'nubofact' añadida** (ya existente desde commit anterior
### Uso en componentes
| Componente | Color Variable | Valor Hex | Uso |
|------------|----------------|-----------|-----|
| MetricCard background | `--nubofact-primary` | #0c5078 | Fondo de tarjetas KPI |
| MetricCard icon box | `--nubofact-secondary` | #164a6b | Contenedor de iconos |
| Header principal | `--nubofact-header` | #234662 | Barra navegación superior |
| Header tabs | `--nubofact-header-dark` | #1a3548 | Barra de tabs Dashboard |
| Dashboard background | `--nubofact-background` | #cbbfae | Fondo general de página |
| Rol usuario | `--nubofact-accent` | #7bf1a8 | Texto "Administrador" |
| DashboardFilters | `--nubofact-primary` | #0c5078 | Panel de filtros |

### Mapeo anterior → nuevo
- Antes: `bg-[hsl(var(--dashboard-dark))]` (CSS variable genérica)
- Ahora: `bg-[hsl(var(--nubofact-primary))]` (valor directo del diseño)
- Beneficio: Colores exactos de marca Nubofact en todo el dashboard

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

❌ **Sección CPE detallada** (nodo 1:162)
- Lista de items con barras de progreso
- Números + nombres (Machala, Balanza, etc.)

❌ **Sección Notas de Venta detallada** (nodo 1:215)
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

**NOTA:** Los componentes de gráficos básicos (CPE, Notas Venta, Totales) ya existen y están integrados en el Dashboard.

---

## ✅ Estado de Implementación

### Completado (100%)
- ✅ **Variables CSS Nubofact** con sistema de colores HSL
- ✅ **MetricCard** variante 'nubofact' con colores exactos
- ✅ **NubofactHeader** con navegación completa
- ✅ **DashboardFilters** panel de filtros estilo Nubofact
- ✅ **Layout Dashboard** con fondo beige y estructura completa
- ✅ **Estructura HTML** coincidente con Figma (flex horizontal en métricas)
- ✅ **Tipografía** uppercase títulos, tabular-nums valores
- ✅ **Iconos** con fondo #164a6b en contenedores rounded
- ✅ **Grid responsive** 5 columnas para métricas
- ✅ **Integración** con componentes existentes (charts, desglose)

### Pendiente (Fases futuras)
- ⏳ Secciones de gráficos avanzados (CPE, Notas Venta detalladas)
- ⏳ Tablas de datos (Productor Top, Clientes Top, Stock Mínimo)
- ⏳ Gráfico anual comparativo
- ⏳ Tabla mensual de totales
- ⏳ Modo Dashboard TV con diseño Nubofact

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

### Fase Actual: Layout y Diseño Visual ✅ COMPLETADO
- ✅ Variables CSS con colores Nubofact
- ✅ Header con navegación completa
- ✅ Panel de filtros estilo Nubofact
- ✅ Layout con fondo beige
- ✅ Métricas KPI estilo Nubofact

### Fase 2: Componentes de datos avanzados
1. Implementar `CPEDetailPanel` (nodo 1:162)
   - Lista con progress bars
   - Integrar con datos reales del backend

2. Implementar `NotasVentaDetailPanel` (nodo 1:215)
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
- Commits:**
- `0f2b959` - Variante 'nubofact' en MetricCard
- `b9d56b2` - Diseño completo con header, filtros y variables CSS

****Commit inicial:** 0f2b959
- **Interface Design Skill:** [.github/skills/interface-design/SKILL.md](file://.github/skills/interface-design/SKILL.md)
- **DESIGN_CONTEXT.md:** [frontend/docs/DESIGN_CONTEXT.md](frontend/docs/DESIGN_CONTEXT.md)

---

**Última actualización:** 2 de febrero de 2026  
**Autor:** GitHub Copilot (Claude Sonnet 4.5)
