# Contexto de diseño – Plataforma Facturación Electrónica

**Versión:** 2.0 — Actualizado con Interface Design Principles (Intent First)

Documento de referencia para mantener coherencia al añadir o reformular pantallas. Actualizar cuando se definan nuevos patrones o componentes compartidos (para uso con Context7/MCP y desarrollo).

---

## 1. Intent: ¿Qué es este producto?

### Usuarios
- **Contadores** - Registran y validan comprobantes oficiales
- **Administradores** - Gestionan flujo de caja y cumplimiento
- **Dueños de negocio** - Monitorean ingresos y oportunidades

### Tareas Principales
1. Emitir comprobantes de pago electrónicos (CPE)
2. Rastrear estados de facturación (aceptado, pendiente, rechazado)
3. Controlar flujo de caja (pagado vs. por pagar)
4. Cumplir con normativa SUNAT (autoridad tributaria peruana)
5. Monitorear SLA de entregas y oportunidades

### Sensación del Producto
- **Profesional** como un libro contable físico (ledger)
- **Preciso** cada número tiene consecuencia legal
- **Confiable** como un sello fiscal oficial
- **Ordenado** registro meticuloso con jerarquía clara

---

## 2. Dominio: Facturación Electrónica

**Conceptos clave:**
Ledger (Libro Mayor), Stamp (Sello SUNAT), Seal (Lacre certificado), Invoice (Factura), Registry (Registro), Compliance (Cumplimiento), Vault (Bóveda de documentos)

**Color World:**
- **Ink Blue** #1e3a8a - Tinta oficial de documentos contables
- **Paper Cream** #fefce8 - Papel bond para facturas
- **Seal Red** #991b1b - Sellos oficiales, alertas críticas
- **Ledger Green** #166534 - Cantidades positivas, ingresos
- **Carbon Black** #18181b - Números, texto formal
- **Stamp Purple** #6b21a8 - Marca oficial, distintivo fiscal

---

## 3. Signature Element

**"Document Receipt Strip"** - Franja vertical sutil en el lado izquierdo de cards/tablas principales que simula el margen perforado de facturas impresas. Gradiente muy sutil (ledger-green → ink-blue), solo visible al prestar atención. Evoca autenticidad de comprobantes fiscales.

**Aplicación:**
- MetricCard variant="navy": border-left 3px con gradiente
- Tablas de facturas principales: pseudo-elemento con gradiente en primera columna
- Cards de desglose: border-left-2 en color semántico

---

## 4. Tokens y tema

- **Origen:** `frontend/src/index.css` (variables CSS en `:root` y `.dark`).
- **Componentes base:** Shadcn UI (estilo new-york), Tailwind, iconos Lucide.
- **Uso:** Preferir **siempre** variables semánticas (`bg-background`, `text-muted-foreground`, `border`, `primary`, `muted`, `accent`, `destructive`, `success`, `warning`) en lugar de colores fijos (evitar `slate-*`, `blue-*`, `green-*`, `amber-*`, etc.) para no conflictuar con el tema Shadcn y el modo claro/oscuro.
- **Tablas:** Cabeceras con `bg-muted/50` y `border-b-2`; filas hover `hover:bg-muted/50`; selección con `bg-accent/50`.
- **Espaciado:** Base unit 4px (Tailwind default). Páginas: `p-4 md:p-6 lg:p-8`; secciones: `space-y-6`; grids: `gap-4`. Consistencia > valores específicos.
- **Tipografía para datos financieros:** 
  - Siempre `tabular-nums` para alineación de decimales
  - Totales: `text-2xl font-bold` o `text-3xl font-bold` (Dashboard TV)
  - Desgloses: `text-sm` o `text-base`, regular/medium
  - Montos negativos/alertas: color semántico (`text-destructive`)

---

## 5. Craft Principles

### Subtle Layering
- **Surfaces:** Cambios mínimos pero distinguibles. Cards con `border` sutil, no saltos dramáticos.
- **Borders:** `border` (1px) ligero pero visible. No harsh, no invisible. Si los bordes son lo primero que notas, muy fuertes.
- **Shadows:** Solo en hover/active (`hover:shadow-lg`), nunca dramáticas.

### Depth Strategy
**Borders-only** - Approach técnico, limpio para herramientas densas:
- Cards: `border rounded-xl`
- Elevación mediante border más oscuro, no sombras
- Coherente con estilo "ledger" (libro contable con líneas claras)

### Color Lives Somewhere
- Colores derivan del dominio fiscal: ink-blue, ledger-green, seal-red
- No usar color decorativo sin significado
- Un color de acento (primary) usado con intención > cinco colores sin pensamiento

---

## 6. Componentes base (Shadcn)

Usar siempre que aplique:

- **Card, CardHeader, CardTitle, CardDescription, CardContent** para bloques de contenido y listados.
- **Table, TableHeader, TableBody, TableRow, TableHead, TableCell** para tablas de datos.
- **Button** (variantes: default, outline, ghost, destructive, link).
- **Input, Label, Select, Checkbox, Switch, Textarea** para formularios.
- **Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription** para modales.
- **Badge** para estados (aceptado, rechazado, pendiente).
- **Skeleton** para estados de carga.
- **Alert** para errores o avisos.

## Patrones por tipo de pantalla

### Listados (CRUD)

- **Estructura:** `PageHeader` (título + descripción + acciones: Nuevo, Exportar) → opcionalmente `FilterBar` → `Card` con `DataTable` (o composición Table + loading/empty) y paginación.
- **Estados:** loading → `TableSkeleton`; sin datos → `EmptyState` (icono + mensaje + CTA si aplica); error → `Alert` + botón reintentar.
- **Acciones por fila:** botones compactos (iconos) para editar/eliminar/ver, dentro de la última columna.

### Dashboards

- **Estructura:** `PageHeader` → bloque de filtros (Card o barra con fecha, cliente, etc.) → fila de `MetricCard` (KPIs) → grid de Cards (gráficos, tablas resumen, actividad reciente).
- **Filtros:** agrupar en una Card o barra horizontal; botón "Limpiar filtros" visible.
- **Gráficos:** usar `ChartContainer` + Recharts (BarChart, PieChart, etc.) dentro de Card.

### Formularios largos

- **Estructura:** `PageHeader` → una o varias Cards por sección (ej. ClienteCard, ItemsSection, ResumenTotalesCard en EmitirComprobante).
- **Acciones:** botones principales al final de la última sección o en un sticky footer.

## Componentes compartidos de layout/contenido

| Componente        | Uso |
|-------------------|-----|
| **PageHeader**    | Título (h1), descripción opcional, slot para acciones (Nuevo, Exportar). |
| **MetricCard**    | KPI: icono, título, valor principal, subtítulo o desglose opcional. |
| **FilterBar**     | Contenedor flexible para filtros + "Limpiar" / "Aplicar". |
| **EmptyState**    | Icono + mensaje + CTA opcional; listados y cards vacías. |
| **TableSkeleton**| Filas/columnas con Skeleton para carga de tablas. |

## Estados

- **Loading (tabla):** `TableSkeleton` con mismo número de columnas que la tabla.
- **Loading (cards):** Skeleton por bloque o spinner centrado si es una sola sección.
- **Empty:** `EmptyState` con mensaje claro (ej. "No se encontraron clientes").
- **Error:** `Alert variant="destructive"` con descripción y botón "Reintentar" si aplica.

## Tipado

- Interfaces de entidades y respuestas API en `frontend/src/types/` (y reexportaciones desde `lib/api` donde corresponda).
- Props de todos los componentes compartidos con interfaces exportadas; evitar `any`.
- Tipos para columnas/filas de DataTable cuando se introduzca componente genérico.

## Accesibilidad

- Labels en todos los inputs y selects; `aria-label` en iconos-only.
- Encabezados jerárquicos (PageHeader con nivel adecuado).
- Contraste y foco visibles (cubierto por Shadcn en buena parte).

## Responsividad

- Tablas: scroll horizontal en móvil (`overflow-x-auto`); columnas secundarias con `hidden md:table-cell` si es necesario.
- Filtros y acciones del header: apilar en móvil (`flex-col`), fila en desktop (`md:flex-row`).

---

## Gráficas (charts)

- **Componente:** Usar siempre `ChartContainer` de Shadcn + Recharts (BarChart, PieChart, etc.) dentro de una Card.
- **Config:** Definir `config` con `label` y `color` por serie; usar variables del tema: `hsl(var(--chart-1))`, `hsl(var(--muted-foreground))`, `hsl(var(--border))`. No usar colores fijos (blue-500, etc.).
- **Datos:** Derivar datos del estado/API de forma normalizada (ej. `datosFacturacionMensual`, `tiposComprobantes`). Para barras sin datos, mostrar placeholder (ej. 6 meses en 0) o un `EmptyState` dentro de la Card si no hay datos en absoluto.
- **Pie/Donut:** Renderizar solo cuando haya datos (`tiposComprobantes.length > 0`); no mostrar gráfico de torta vacío.
- **Tooltip:** Usar `ChartTooltipContent`; si el valor es monetario, pasar `formatter` que devuelva un nodo con etiqueta y valor formateado (ej. "S/ X,XXX.XX" con `toLocaleString('es-PE', { minimumFractionDigits: 2 })`).
- **Accesibilidad:** En el contenedor del gráfico, usar `role="img"` y `aria-label` con un resumen breve de los datos (ej. "Facturación mensual: Ene S/ 1,000.00, Feb S/ 2,500.00...").
- **Estados:** Si el gráfico depende de datos asíncronos, mostrar Skeleton o spinner hasta que lleguen; si no hay datos, mensaje claro o EmptyState.

---

## Estado del plan de reformulación

- **Hecho:** DESIGN_CONTEXT, tipos centralizados, PageHeader, MetricCard, FilterBar, EmptyState, TableSkeleton; ancho AppLayout (max-w-7xl); refactor de Clientes, Empresas, Dashboard, Configuracion, Oportunidades, Documentos, Pagos, GestionProductos; tema con success/warning; eliminación de colores fijos (slate, blue, green, amber) en favor de tokens semánticos; gráficas con tema, tooltip S/ y aria-label.
- **Opcional / futuras capturas:** Componente DataTable genérico (reutilizable para columnas configurables); nuevas vistas que sigan los mismos patrones (listado = PageHeader + FilterBar + Table + TableSkeleton/EmptyState). Actualizar este documento cuando se añadan nuevas pantallas o patrones.
