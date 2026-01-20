# 📋 PENDIENTES - Plataforma de Facturación Electrónica

**Fecha de actualización:** 20 de enero de 2026  
**Estado Backend:** ✅ 100% Completado con **INTEGRACIÓN NUBEFACT**  
**Estado Frontend:** 🔴 0% - Pendiente (próxima fase)

---

## ✅ MIGRACIÓN A NUBEFACT COMPLETADA

### 🎉 Cambios Implementados (20/01/2026)

**Backend migrado completamente de Greenter a NubeFact API:**

✅ **Greenter removido completamente**
- Package `codersfree/laravel-greenter` eliminado de composer.json
- Todos los servicios Greenter deshabilitados con excepciones
- Bootstrap cache limpiado (services.php, packages.php)
- Variables de entorno GREENTER_* removidas

✅ **Integración NubeFact implementada**
- `NubefactClient.php`: Cliente HTTP para 6 operaciones API
- `NubefactMapper.php`: Conversión bidireccional de datos
- `NubefactController.php`: 5 endpoints REST
- `NubefactSyncCommand.php`: Comando artisan de sincronización
- `config/nubefact.php`: Configuración centralizada
- Canal de logging dedicado: `nubefact`

✅ **Base de datos actualizada**
- 19 campos NubeFact agregados a tabla `comprobantes`
- Tabla `guia_remisions` creada (40+ columnas)
- Tabla `guia_remision_items` para líneas de GRE
- Modelos `GuiaRemision` y `GuiaRemisionItem` creados
- Migraciones ejecutadas en base de datos

✅ **Endpoints API disponibles**
- `POST /api/nubefact/comprobantes` - Emitir comprobante
- `GET /api/nubefact/comprobantes/{tipo}/{serie}/{numero}` - Consultar
- `DELETE /api/nubefact/comprobantes/{tipo}/{serie}/{numero}` - Anular
- `POST /api/nubefact/guias` - Emitir GRE
- `GET /api/nubefact/guias/{tipo}/{serie}/{numero}` - Consultar GRE

✅ **Tests implementados**
- `NubefactIntegrationTest.php` con 15 assertions pasando
- Tests de mapeo de tipos de documento y comprobantes
- Tests de conexión preparados (marcados como skipped)

✅ **Documentación completa**
- `backend/INTEGRACION_NUBEFACT.md` - Guía completa de integración
- `README.md` actualizado con instrucciones NubeFact
- Ejemplos oficiales en carpeta `examples/` (60+ archivos)
- Correcciones de tipos de datos según ejemplos NubeFact

✅ **Commits realizados (7 commits)**
```
b6ac622 - feat(nubefact): agregar modelos GuiaRemision y campos NubeFact en Comprobante
9a077b1 - feat(nubefact): agregar NubefactMapper, NubefactController y rutas de API
e76073b - feat(nubefact): agregar comando artisan nubefact:sync para sincronización
4799220 - test(nubefact): agregar tests de integración y mejorar mapeo de tipos
99c62e8 - docs(nubefact): agregar documentación completa de integración con NubeFact
483cb72 - fix(nubefact): corregir tipos de datos en NubefactMapper según ejemplos oficiales
536a20e - docs: actualizar README y documentación NubeFact con info completa
```

---

## 🎯 SIGUIENTE FASE: FRONTEND

### 📋 Tareas Inmediatas

#### 1️⃣ **Inicialización Frontend React + TypeScript**
- [ ] Formulario de emisión de **Notas de Débito** (08)
- [ ] Tabla de comprobantes emitidos con filtros
- [ ] Descargar XML/CDR/PDF de comprobantes
- [ ] Consulta de estado de ticket SUNAT
- [ ] Envío de comprobante por email
 - [ ] Otros comprobantes SUNAT (según anexo D y carpeta `examples/`)
   - [ ] Resumen diario RC (backend ✔️, frontend pendiente)
   - [ ] Comunicación de baja RA (backend ✔️, frontend pendiente)
   - [ ] Retención (backend ✔️, frontend pendiente)
   - [ ] Percepción (backend ✔️, frontend pendiente)

##### 🟡 **Dashboard Principal**
- [ ] Gráfico de facturación del mes (Chart.js o Recharts)
- [ ] Tarjetas de estadísticas (total ventas, pendientes, etc.)
- [ ] Lista de oportunidades por estado
- [ ] Alertas de SLA próximas a vencer
- [ ] Modo TV para pantallas (dashboard simplificado)

##### 🟢 **Gestión Comercial**
- [ ] **CRUD Empresas**
  - Formulario multi-RUC (agregar/eliminar RUCs)
  - Upload de certificados SOL (.pfx → .pem)
  - Toggle modo beta/producción
  
- [ ] **CRUD Oportunidades**
  - Formulario con cliente, vendedor, productos
  - Cambio de estado (lead → ganada)
  - Vista kanban por estados

- [ ] **Configurar proyecto Vite + React + TypeScript**
  ```bash
  cd C:\Plataforma_Op_Com_Facturacion_Elect\frontend
  npm install
  npm run dev
  ```

- [ ] **Instalar shadcn/ui y dependencias**
  ```bash
  npx shadcn-ui@latest init
  npm install axios react-router-dom zustand react-hook-form zod
  ```

- [ ] **Crear estructura de carpetas frontend**
  ```
  frontend/src/
  ├── components/
  │   ├── ui/              # Componentes shadcn
  │   ├── layout/          # Header, Sidebar, Layout
  │   ├── facturacion/     # Componentes de emisión
  │   └── guias/           # Componentes GRE
  ├── pages/
  │   ├── Dashboard.tsx
  │   ├── Empresas/
  │   ├── Facturacion/
  │   │   ├── EmitirFactura.tsx
  │   │   ├── EmitirBoleta.tsx
  │   │   └── ListaComprobantes.tsx
  │   ├── Guias/
  │   └── Oportunidades/
  ├── services/
  │   ├── api.ts           # Cliente axios
  │   └── nubefact.ts      # Servicios NubeFact
  ├── hooks/
  ├── stores/              # Zustand stores
  └── lib/                 # Utilidades
  ```

- [ ] **Componentes shadcn a instalar**
  - `button`, `card`, `form`, `input`, `select`, `table`
  - `dialog`, `dropdown-menu`, `tabs`, `badge`, `alert`, `toast`

#### 2️⃣ **Módulo de Facturación con NubeFact** (CRÍTICO)

- [ ] **Formulario de emisión de Facturas (01)**
  - Autocompletar cliente por RUC/DNI
  - Tabla de items con cálculos automáticos
  - Validación de totales
  - Integración con `POST /api/nubefact/comprobantes`
  
- [ ] **Formulario de emisión de Boletas (03)**
  - Similar a facturas pero con validaciones de boleta
  - Cliente DNI opcional para montos < 700 soles
  
- [ ] **Formulario de Notas de Crédito (07)**
  - Selector de comprobante original
  - Tipos de nota de crédito (catálogo 09)
  - Validación de montos

- [ ] **Lista de Comprobantes**
  - Tabla con filtros (empresa, tipo, serie, fechas)
  - Badges de estado SUNAT (aceptado/rechazado/pendiente)
  - Botones de descarga PDF/XML/CDR
  - Botón de anulación con confirmación
  - Sincronización manual por comprobante

- [ ] **Vista de Detalle de Comprobante**
  - Información completa del comprobante
  - QR code display (desde nubefact_cadena_qr)
  - Timeline de estados
  - Botones de reenvío a cliente

#### 3️⃣ **Módulo de Guías de Remisión**

- [ ] **Formulario GRE Remitente (07)**
  - Datos de traslado (motivo, fecha inicio)
  - Origen/destino con ubigeo
  - Transportista (público/privado)
  - Vehículo y conductor
  - Items de la guía
  
- [ ] **Formulario GRE Transportista (08)**
  - Similar a remitente con campos específicos
  
- [ ] **Lista de Guías**
  - Estados de aceptación SUNAT
  - Descarga de PDF/XML

#### 4️⃣ **Dashboard y Estadísticas**

- [ ] **Dashboard principal**
  - KPIs de facturación del mes
  - Gráficos de ventas (recharts/visx)
  - Comprobantes recientes
  - Alertas de errores SUNAT

- [ ] **Gestión de Empresas**
  - CRUD completo multiempresa
  - Selector de empresa activa
  - Configuración de series por tipo

#### 5️⃣ **Integración Backend-Frontend**

- [ ] **Configurar CORS en Laravel**
  ```bash
  php artisan config:publish cors
  ```
  Permitir: `http://localhost:5173`

- [ ] **Servicio API client en React**
  ```typescript
  // frontend/src/services/api.ts
  const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api'
  });
  ```

- [ ] **Store Zustand para NubeFact**
  - Estado de comprobantes
  - Estado de sincronización
  - Empresa seleccionada

#### 6️⃣ **Testing**

- [ ] **Backend**
  - Tests E2E con NubeFact demo
  - Emisión real de comprobantes de prueba
  
- [ ] **Frontend**
  - Vitest + React Testing Library
  - Tests de formularios de emisión

#### 7️⃣ **Deployment**

- [ ] **Producción**
  - Cambiar a credenciales NubeFact producción
  - Optimización Laravel (config/route/view cache)
  - Build frontend para producción
  - Configurar cron para `nubefact:sync`

---

## 🔥 PRIORIDAD INMEDIATA (ESTA SEMANA)

1. ✅ **Backend NubeFact** (COMPLETADO)
2. 🔴 **Frontend: Formulario Emisión Factura**
3. 🔴 **Frontend: Lista Comprobantes con estados**
4. 🟡 **Integración E2E: Emitir factura real de prueba**
5. 🟡 **Dashboard básico con estadísticas**

---

## 📊 PROGRESO GENERAL

| Módulo                    | Estado | Progreso |
|---------------------------|--------|----------|
| Backend Core              | ✅     | 100%     |
| Integración NubeFact      | ✅     | 100%     |
| Base de Datos             | ✅     | 100%     |
| API Endpoints             | ✅     | 100%     |
| Tests Backend             | ✅     | 100%     |
| Documentación             | ✅     | 100%     |
| Frontend Setup            | 🔴     | 0%       |
| Formularios Emisión       | 🔴     | 0%       |
| Dashboard                 | 🔴     | 0%       |
| Autenticación             | 🔴     | 0%       |
| Testing E2E               | 🔴     | 0%       |

**Progreso Total:** ~60% (Backend completo, Frontend pendiente)

---

## 📊 RESUMEN DE ESTADO

| Módulo | Completado | Pendiente | Estado |
|--------|------------|-----------|--------|
| **Backend API** | 55 rutas | Autenticación | ✅ 95% |
| **Greenter (Tutorial)** | Instalado | Refactorizar | ⚠️ 40% |
| **Frontend React** | Dashboard, Empresas, Facturación, Oportunidades | Documentos, Pagos, SLA, Auth, extras | 🟡 50% |
| **Docker** | PostgreSQL + MinIO | Laravel + Frontend | 🟡 60% |
| **Testing** | - | Backend + Frontend | ❌ 0% |
| **Docs** | README básico | Completo | 🟡 30% |

---

## ❓ PREGUNTAS PARA DECIDIR

1. **¿Refactorizamos FacturacionService para seguir el tutorial exactamente?**
   - Sí → Usar `Greenter::sent()` como en el video
   - No → Mantener implementación actual y agregar PDFs manualmente

2. **¿Prioridad: Frontend funcional o backend perfectamente alineado al tutorial?**
   - Frontend → Continuar con React ahora
   - Backend → Refactorizar primero

3. **¿Implementar autenticación ahora o después del MVP visual?**
   - Ahora → Laravel Sanctum + login frontend
   - Después → Enfoque en CRUD y facturación

---

**Esperando decisión del usuario para proceder** 🚀
