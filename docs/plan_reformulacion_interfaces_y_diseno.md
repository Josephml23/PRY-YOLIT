---
name: Reformulación interfaces y diseño
overview: "Plan para reformular las interfaces del frontend mejorando el diseño de forma incremental: definir un sistema de diseño documentado (compatible con Context7/MCP), crear componentes reutilizables siguiendo buenas prácticas de React y refactorizar páginas existentes para consistencia y escalabilidad ante futuras capturas."
todos: []
isProject: false
---

# Plan: Reformulación de interfaces y mejora de diseño

## Contexto actual

- **Stack UI:** Shadcn (estilo new-york), Tailwind, variables CSS en [frontend/src/index.css](../frontend/src/index.css), iconos Lucide.
- **Layout:** [AppLayout.tsx](../frontend/src/components/layout/AppLayout.tsx) con Sidebar y header; contenido en `<Outlet />`.
- **Páginas:** Dashboard (filtros + KPIs + gráficos), listados (Clientes, Empresas, GestionProductos) con tabla + búsqueda + diálogo CRUD, Facturación ya refactorizada en subcomponentes.
- **Objetivo:** Diseño consistente y moderno reutilizando Shadcn y definiendo patrones claros para nuevas pantallas.

---

## 1. Documento de contexto para diseño (Context7 / MCP)

- **Ubicación:** `frontend/docs/DESIGN_CONTEXT.md`
- **Contenido:** Tokens, componentes base, patrones por tipo de pantalla (listados, dashboards, formularios), estados (loading, empty, error), tipado centralizado, accesibilidad.

---

## 2. Componentes reutilizables

| Componente       | Ubicación |
|------------------|-----------|
| PageHeader      | `components/layout/PageHeader.tsx` |
| MetricCard      | `components/dashboard/MetricCard.tsx` |
| FilterBar       | `components/filters/FilterBar.tsx` |
| DataTable       | `components/data/DataTable.tsx` |
| EmptyState      | `components/ui/empty-state.tsx` |
| TableSkeleton   | `components/ui/table-skeleton.tsx` |

Principios: props tipadas, composición, single responsibility, accesibilidad.

---

## 3. Tipos centralizados

- `frontend/src/types/index.ts` con interfaces para entidades (Cliente, Empresa, Comprobante, Producto) y props de componentes compartidos.

---

## 4. Refactorización incremental de páginas

1. Listados (Clientes, Empresas, GestionProductos): PageHeader + FilterBar + DataTable + EmptyState/Skeleton.
2. Dashboard: MetricCard, filtros en Card, gráficos en Cards.
3. Dashboard TV: mismos tokens, MetricCard o variante.
4. Otras páginas: PageHeader + patrón de listado o formulario según corresponda.

---

## 5. Ajustes de layout y consistencia

- AppLayout: ancho máximo del contenido (max-w-5xl o similar).
- Padding unificado: `p-4 md:p-6 lg:p-8`, `space-y-6`.
- Estados de carga unificados (Skeleton o spinner).

---

## 6. Uso de Context7 / MCP

- Mantener DESIGN_CONTEXT.md actualizado al añadir componentes o patrones.
- Incluir este documento y DESIGN_CONTEXT en el contexto del MCP para nuevas interfaces.

---

## Resumen de entregables

| Entregable | Descripción |
|------------|-------------|
| frontend/docs/DESIGN_CONTEXT.md | Contexto de diseño y patrones. |
| frontend/src/types/ | Interfaces centralizadas. |
| PageHeader, MetricCard, FilterBar | Componentes de layout/dashboard. |
| EmptyState, TableSkeleton | Estados vacío y de carga. |
| DataTable | Tabla reutilizable con loading/empty. |
| Refactor listados y Dashboard | Uso de componentes compartidos. |
| Ajuste AppLayout | Ancho máximo del contenido. |

Este plan es incremental y se extiende con nuevas capturas, usando siempre DESIGN_CONTEXT como referencia.
