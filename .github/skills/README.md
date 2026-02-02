# Agent Skills para VS Code

Este proyecto utiliza **Agent Skills** para proporcionar mejores prácticas y guías de optimización automáticas.

## 📁 Ubicación

Los skills están instalados en:
```
.github/skills/
├── interface-design/
│   └── SKILL.md (Diseño de interfaces y dashboards)
├── vercel-react-best-practices/
│   └── SKILL.md (57 reglas de React/Next.js)
└── supabase-postgres-best-practices/
    └── SKILL.md (Guía completa de PostgreSQL)
```

## ✅ Skills Instalados

### 1. **interface-design**
- **Autor**: Dammy Jay
- **Categoría**: UI/UX Design
- **Descripción**: Guía completa para diseño de interfaces (dashboards, admin panels, SaaS apps)
- **Alcance**:
  - ✅ Dashboards
  - ✅ Admin panels
  - ✅ SaaS applications
  - ✅ Tools y settings pages
  - ✅ Data interfaces
  - ❌ NO para: Landing pages, marketing sites, campaigns

**Uso**: Se aplica cuando trabajas con:
- Diseño de dashboards
- Interfaces administrativas
- Aplicaciones SaaS
- Herramientas internas
- Páginas de configuración
- Interfaces de datos

**Principios clave**:
- Craft y consistencia
- Evitar templates genéricos
- Diseño intencional
- Patrones específicos del dominio

### 2. **vercel-react-best-practices**
- **Autor**: Vercel Labs
- **Versión**: 1.0.0
- **Reglas**: 57 reglas de optimización
- **Categorías**:
  - Eliminación de waterfalls (CRÍTICO)
  - Bundle size optimization (CRÍTICO)
  - Server-side performance (ALTO)
  - Client-side data fetching (MEDIO-ALTO)
  - Code splitting
  - Component optimization
  - State management
  - Build optimization

**Uso**: Se aplica automáticamente cuando trabajas con:
- Componentes React
- Páginas Next.js
- Data fetching (cliente/servidor)
- Optimización de bundle
- Performance improvements

### 2. **supabase-postgres-best-practices**
- **Autor**: Supabase
- **Versión**: 1.1.0
- **Fecha**: Enero 2026
- **Categorías**:
  - Query performance (CRÍTICO)
  - Connection management (CRÍTICO)
  - Index optimization (ALTO)
  - Schema design (ALTO)
  - Row-Level Security (RLS)
  - Advanced features
  - Monitoring & debugging
  - Migrations

**Uso**: Se aplica automáticamente cuando trabajas con:
- Consultas SQL
- Diseño de esquemas
- Optimización de queries
- Configuración de conexiones
- Row-Level Security (RLS)

## 🔄 Sincronización Global ↔ Proyecto

Los skills también están disponibles **globalmente** en:
```
~\.agents\skills\
```

Esto permite que estén disponibles para:
- ✅ VS Code (desde `.github/skills/`)
- ✅ Otros agentes globales (desde `~\.agents\skills/`)

## 📖 Documentación

Para ver la documentación completa de cada skill:

```powershell
# Skill de Interface Design
Get-Content .github\skills\interface-design\SKILL.md

# Skill de React
Get-Content .github\skills\vercel-react-best-practices\SKILL.md

# Skill de PostgreSQL
Get-Content .github\skills\supabase-postgres-best-practices\SKILL.md
```

## 🎯 Optimizaciones Aplicadas

Ver [OPTIMIZACIONES_APLICADAS.md](../OPTIMIZACIONES_APLICADAS.md) para ejemplos concretos de cómo estos skills mejoraron el proyecto:

- ✅ -82% queries en backend
- ✅ -67% bundle size frontend
- ✅ -55% tiempo de carga
- ✅ Zero unnecessary re-renders

## 🔗 Referencias

- [Interface Design Skill](https://github.com/dammyjay93/interface-design)
- [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills/tree/vercel-react-best-practices)
- [Supabase PostgreSQL Best Practices](https://github.com/supabase/agent-skills/tree/supabase-postgres-best-practices)
- [VS Code Skills Documentation](https://code.visualstudio.com/docs)
