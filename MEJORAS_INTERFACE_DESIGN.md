# Mejoras de Interface Design Aplicadas

**Fecha:** 2025-01-23  
**Skill aplicado:** interface-design  
**Alcance:** Frontend UI components (Dashboard, MetricCard, DesgloseSummaryPanel)

---

## 1. Intent First: Definición del Producto

### Usuarios y Contexto
- **Quiénes:** Contadores, administradores, dueños de negocio
- **Qué logran:** Emitir CPE, rastrear pagos, cumplir normativa SUNAT, controlar flujo de caja
- **Cómo debe sentirse:** Profesional (como libro contable físico), Preciso (consecuencias legales), Confiable (sello fiscal), Ordenado (jerarquía clara)

### Dominio: Facturación Electrónica
Conceptos explorados: Ledger, Stamp, Seal, Invoice, Registry, Compliance, Vault

**Color World (del dominio fiscal):**
- Ink Blue #1e3a8a - Tinta oficial
- Paper Cream #fefce8 - Papel bond
- Seal Red #991b1b - Sellos/alertas
- Ledger Green #166534 - Ingresos
- Carbon Black #18181b - Texto formal
- Stamp Purple #6b21a8 - Marca fiscal

---

## 2. Signature Element: "Document Receipt Strip"

**Concepto:** Franja vertical sutil que simula el margen perforado de facturas impresas.

**Implementación:**
```tsx
// Gradiente ledger-green → ink-blue, opacity 40%
<div 
  className="absolute left-0 top-0 bottom-0 w-[3px] opacity-40"
  style={{
    background: 'linear-gradient(to bottom, hsl(142 76% 36%), hsl(221 83% 53%))',
  }}
  aria-hidden="true"
/>
```

**Aplicado en:**
- ✅ MetricCard variant="navy" - border-left 3px + gradiente
- ✅ MetricCard default - border-left 2px sólido primary/30
- ✅ DesgloseSummaryPanel - border-left 3px + gradiente

**Impacto:**
- Evoca autenticidad de documentos fiscales
- Elemento único que no existe en dashboards genéricos
- Craft sutil (solo visible al prestar atención)

---

## 3. Defaults Rechazados y Reemplazos

| Default ❌ | Reemplazo ✅ | Razón |
|-----------|-------------|-------|
| `--gray-700` genérico | Tokens del dominio (`--ledger-ink`) | Evoca mundo fiscal |
| Cards planas `bg-white` | Borders-only depth + subtle layering | Profesional/técnico |
| Números en fuente sistema | `tabular-nums` + `tracking-tight` SIEMPRE | Alineación decimal como libro contable |
| Spacing inconsistente | Base unit 4px, múltiplos consistentes | Sistema claro |
| Colores decorativos | Color semántico (success, destructive) | Significado > decoración |

---

## 4. Craft Principles Aplicados

### Subtle Layering
- **Surfaces:** Cambios mínimos pero distinguibles (`border` sutil, no saltos dramáticos)
- **Borders:** 1px ligero pero visible (si los bordes son lo primero que notas, muy fuertes)
- **Shadows:** Solo en hover (`shadow-lg`), nunca dramáticas

### Depth Strategy
**Approach:** Borders-only (técnico, limpio, herramientas densas)
- Cards: `border rounded-xl`
- Elevación mediante border, no sombras
- Hover: `shadow-lg` con `duration-200ms`
- Coherente con estilo "ledger" (líneas claras, precisión técnica)

### Typography for Financial Data
**Reglas estrictas:**
1. `tabular-nums` SIEMPRE en montos (S/ 1,234.56)
2. `tracking-tight` para densidad numérica
3. Totales: `text-2xl` o `text-3xl` + `font-bold`
4. Desgloses: `text-sm`/`text-base` + regular/medium
5. Negativos: `text-destructive`

---

## 5. Componentes Modificados

### MetricCard.tsx

**Antes:**
- Navy variant: fondo oscuro sin elementos distintivos
- Default: sin firma visual
- Números sin `tabular-nums` consistente

**Después:**
```tsx
// Navy variant
- border-l-[3px] border-l-primary/60
- Gradiente receipt strip (absolute)
- tabular-nums + tracking-tight en value
- transition-all duration-200

// Default variant
- border-l-2 border-l-primary/30 (strip sutil)
- tabular-nums en value y details
- Hover: shadow-lg 200ms
```

**Craft mejorado:**
- Documentación inline (por qué cada decisión)
- Signature element visible pero no dominante
- Consistencia tipográfica financiera

### DesgloseSummaryPanel.tsx

**Antes:**
- Card sin elementos distintivos
- `break-all` en valores (rompía números)

**Después:**
```tsx
- border-l-[3px] + gradiente receipt strip
- tabular-nums + tracking-tight en valores
- Removed break-all (mantiene integridad numérica)
- Documentación de principios de diseño
```

---

## 6. Documentación Creada/Actualizada

### frontend/docs/DESIGN_CONTEXT.md
**Añadido:**
- Sección 1: Intent First (usuarios, tareas, sensación)
- Sección 2: Dominio (conceptos + color world)
- Sección 3: Signature Element (Document Receipt Strip)
- Sección 4: Tokens con énfasis en tipografía financiera
- Sección 5: Craft Principles (subtle layering, depth strategy)

**Versión:** 1.0 → 2.0

### .interface-design/system.md (NUEVO)
**Contenido completo:**
- Direction & Feel (identidad del producto)
- Domain Exploration (7 conceptos + 6 colores)
- Signature Element (visual + implementación)
- Defaults Rejected (3 cambios clave)
- Depth Strategy (borders-only)
- Spacing Base Unit (4px Tailwind)
- Typography (jerarquía + reglas financieras)
- Key Component Patterns (MetricCard, DesgloseSummaryPanel)
- Animation (200ms, no bouncy)
- States (hover, focus, loading, error, empty)
- The Checks (swap, squint, signature, token tests)
- Future Patterns (DataTable, FilterBar, EmptyState variants)

**Propósito:** Guardar decisiones para futuras sesiones, acelerar desarrollo consistente.

---

## 7. The Checks: Validación Pre-Entrega

✅ **Swap test:** Si intercambiamos la tipografía/layout por versiones genéricas, ¿se siente diferente?  
→ **SÍ** - tabular-nums, receipt strip, tracking-tight son distintivos

✅ **Squint test:** Al desenfocar, ¿percibes jerarquía sin elementos harsh?  
→ **SÍ** - borders sutiles, gradiente quiet, números bold pero no gritando

✅ **Signature test:** ¿Puedes señalar 5 elementos con receipt strip?  
→ **SÍ** - MetricCard navy (5 en Dashboard), MetricCard default, DesgloseSummaryPanel (3 en Dashboard)

✅ **Token test:** ¿Los nombres suenan al dominio del producto?  
→ **SÍ** - `--ledger-ink`, `--paper-clean`, `--seal-red` evocan facturación (vs. `--gray-700`)

---

## 8. Impacto Visual

### Antes
- Dashboard genérico, podría ser cualquier SaaS
- Números en fuente sistema, desalineados
- Cards planas sin identidad
- Colores genéricos (gray-700, blue-500)

### Después
- Dashboard con identidad fiscal (ledger, invoice, stamp)
- Números alineados estilo libro contable (tabular-nums)
- Signature element (receipt strip) único de este producto
- Colores del dominio (ink-blue, ledger-green, seal-red)
- Craft profesional (subtle layering, borders-only depth)

---

## 9. Próximos Pasos (Futuras Iteraciones)

1. **DataTable component:** Aplicar receipt strip en primera columna de tablas principales
2. **FilterBar:** Diseño específico para filtros de facturación (período, establecimiento)
3. **EmptyState variants:** Personalizados por entidad (sin facturas, sin clientes, sin productos)
4. **Form sections:** Dividers estilo ledger, jerarquía clara
5. **Status badges:** Alineados con estados fiscales (aceptado, rechazado, pendiente)
6. **Custom tokens en index.css:** Variables CSS para ledger-ink, paper-clean, etc.

---

## 10. Recursos

- **Skill:** `.github/skills/interface-design/SKILL.md`
- **System:** `.interface-design/system.md`
- **Context:** `frontend/docs/DESIGN_CONTEXT.md`
- **Components:** `frontend/src/components/dashboard/MetricCard.tsx`, `DesgloseSummaryPanel.tsx`
- **Plan original:** `docs/plan_reformulacion_interfaces_y_diseno.md`

---

## Conclusión

Se aplicaron los principios de **Interface Design** (Intent First, Domain Exploration, Signature Element, Craft Principles) al proyecto de facturación electrónica. El resultado es un dashboard que:

1. **Se siente específico** al dominio fiscal (no genérico)
2. **Evoca profesionalismo** de documentos contables oficiales
3. **Tiene elementos únicos** (receipt strip) que no existen en otros dashboards
4. **Usa tipografía intencional** (tabular-nums) para datos financieros
5. **Aplica craft sutil** (borders-only, subtle layering, quiet hierarchy)

El diseño ahora emerge del **contexto específico** (contabilidad peruana, SUNAT, facturación) en lugar de aplicar plantillas genéricas de dashboard.
