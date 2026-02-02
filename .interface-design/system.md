# Interface Design System – Plataforma Facturación Electrónica

**Created:** 2025-01-23  
**Domain:** Electronic invoicing / Fiscal compliance platform for Peru (SUNAT)

---

## Direction & Feel

**Product Identity:**
This is a **professional fiscal ledger** made digital. Like physical accounting books used by auditors and tax authorities — precise, trustworthy, meticulously organized. Every number has legal consequence. The interface evokes the authority and permanence of official documents.

**Not:** A colorful SaaS dashboard. Not playful. Not minimalist-to-the-point-of-vague.

**Sensory Keywords:**
- Ink on paper (official documents)
- Ledger precision (tabular alignment)
- Stamp authenticity (fiscal seals)
- Registry order (systematic hierarchy)

---

## Domain Exploration

**Concepts:**
1. **Ledger** (Libro Mayor) - Official transaction registry
2. **Stamp** (Sello SUNAT) - Tax authority certification
3. **Seal** (Lacre) - Document integrity verification
4. **Invoice** (Factura) - Formal payment receipt
5. **Registry** (Registro) - Ordered control system
6. **Compliance** (Cumplimiento) - Regulatory conformity
7. **Vault** (Bóveda) - Secure document storage

**Color World:**
- **Ink Blue** #1e3a8a - Official document ink
- **Paper Cream** #fefce8 - Invoice bond paper
- **Seal Red** #991b1b - Official stamps, critical alerts
- **Ledger Green** #166534 - Positive amounts, income
- **Carbon Black** #18181b - Numbers, formal text
- **Stamp Purple** #6b21a8 - Fiscal mark, official badge

---

## Signature Element

### "Document Receipt Strip"

A subtle vertical gradient stripe on the left edge of key cards/tables, simulating the perforated margin of printed invoices. Only visible when you look for it — evokes authenticity without shouting.

**Visual:**
```
3px border-left with gradient: 
  ledger-green (hsl(142 76% 36%)) → ink-blue (hsl(221 83% 53%))
  opacity: 40%
```

**Application:**
- `MetricCard` variant="navy": 3px gradient strip
- `DesgloseSummaryPanel`: 3px gradient strip
- `MetricCard` default: 2px solid primary/30
- Main data tables: pseudo-element on first column (future)

**Why this works:**
- Rooted in domain (physical invoice margins)
- Distinguishes this product (not generic dashboard)
- Whisper-quiet craft (not decorative)

---

## Defaults Rejected

1. ❌ **Generic gray tokens** (`--gray-700`)  
   ✅ **Domain tokens** (`--ledger-ink`, `--paper-clean`)

2. ❌ **Flat white cards**  
   ✅ **Bordered surfaces** with subtle layering (borders-only depth)

3. ❌ **Numbers in system font**  
   ✅ **Tabular-nums always** for decimal alignment (like ledger columns)

---

## Depth Strategy

**Approach:** Borders-only (technical, clean, dense tools)

- No dramatic shadows
- Elevation via subtle border color shifts
- Hover: `shadow-lg` only, duration 200ms
- Cards: `border rounded-xl`
- Surfaces barely different but distinguishable

**Why:** Aligns with "professional ledger" feel — clean lines, technical precision, not soft/organic.

---

## Spacing Base Unit

**Base:** 4px (Tailwind default)

**Conventions:**
- Pages: `p-4 md:p-6 lg:p-8`
- Sections: `space-y-6`
- Card grids: `gap-4`
- Within cards: `p-4 sm:p-5 lg:p-6`

**Principle:** Consistency > specific values. All spacing traces to 4px multiples.

---

## Typography

### Hierarchy

- **Headlines (PageHeader):** font-bold, tight tracking
- **Body:** text-sm to text-base, readable line-height
- **Data (numbers):** 
  - Always `tabular-nums` for alignment
  - `tracking-tight` for density
  - Totals: `text-2xl` or `text-3xl` + `font-bold`
  - Breakdowns: `text-sm` or `text-base` + regular/medium

### Financial Data Rules

1. **ALWAYS** `tabular-nums` class on amounts (S/ 1,234.56)
2. **ALWAYS** `tracking-tight` for tighter number spacing
3. Negative amounts: `text-destructive`
4. Highlights: semantic color (`text-blue-600 dark:text-blue-300`)

---

## Key Component Patterns

### MetricCard

**Navy variant:**
```tsx
- border-l-[3px] border-l-primary/60
- Gradient receipt strip (absolute positioned)
- Icon: h-10/11/12 (responsive), opacity-80
- Title: text-xs/sm, opacity-70
- Value: tabular-nums tracking-tight font-bold
```

**Default variant:**
```tsx
- border-l-2 border-l-primary/30 (subtle strip)
- Standard card layout
- Value: text-2xl tabular-nums tracking-tight
- Details: tabular-nums on values
```

### DesgloseSummaryPanel

```tsx
- Same gradient receipt strip as MetricCard navy
- Items: label (opacity-70) + value (tabular-nums tracking-tight)
- Highlights: text-blue-600 dark:text-blue-300
- Children section: border-t separator
```

### PageHeader

```tsx
- Title + description + actions layout
- Responsive: stack on mobile, row on desktop
- Actions: gap-2/3, Button variants
```

---

## Animation

- Transitions: `duration-200` (fast, not instant)
- Hover: `transition-all duration-200` or `transition-shadow`
- No bouncy/spring effects (professional, not playful)
- Micro-interactions only (150-200ms)

---

## States

**Every component needs:**
- Default
- Hover (shadow-lg, 200ms)
- Focus (ring, accessible)
- Disabled (opacity-50)

**Data states:**
- Loading: `TableSkeleton`, spinner
- Empty: `EmptyState` (icon + message + CTA)
- Error: `Alert` destructive variant

---

## The Checks (Run Before Presenting)

1. **Swap test:** Would swapping typeface/layout for generic versions feel different? (YES = good)
2. **Squint test:** Can you perceive hierarchy when blurred? Nothing harsh jumping out? (YES = good)
3. **Signature test:** Can you point to 5 places with receipt strip? (YES = implemented)
4. **Token test:** Do variable names sound like billing domain? (YES = `--ledger`, `--invoice`)

---

## Future Patterns to Add

- DataTable with receipt strip on first column
- FilterBar with domain-specific filters (período, establecimiento)
- EmptyState variants for each entity type
- Form sections with ledger-style dividers
- Status badges aligned with fiscal states

---

## References

- Main doc: `frontend/docs/DESIGN_CONTEXT.md`
- Color tokens: `frontend/src/index.css`
- Components: `frontend/src/components/dashboard/`
- Skill: `.github/skills/interface-design/SKILL.md`
