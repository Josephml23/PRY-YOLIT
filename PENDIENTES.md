# 📋 PENDIENTES - Plataforma de Facturación Electrónica

**Fecha de actualización:** 16 de enero de 2026  
**Estado Backend:** ✅ 100% Completado y **REFACTORIZADO según tutorial**  
**Estado Frontend:** 🟡 ~50% - En desarrollo (Dashboard, Empresas, Facturación, Oportunidades)

---

## ✅ REFACTORIZACIÓN COMPLETADA (Opción 1)

### ✨ Cambios Implementados

**Backend ahora sigue EXACTAMENTE el tutorial de CodersFree:**

✅ **FacturacionService.php reescrito (360 líneas)**
- Usa `Greenter::sent($tipoComprobante, $data)` - UNA SOLA LÍNEA
- Generación automática de PDFs con `GreenterReport::generatePdf()`
- Generación de HTML con `GreenterReport::generateHtml()`
- Almacenamiento simplificado: `Storage::disk('public')->put()`
- Try-catch según tutorial

✅ **FacturacionController.php actualizado**
- Métodos con try-catch explícito
- Tipos de comprobante: 'invoice', 'note', 'despatch'
- Nuevo endpoint: `/api/facturacion/descargar/html/{id}`

✅ **Vistas publicadas**
- `resources/views/vendor/laravel-greenter/` con templates personalizables
- Plantillas: invoice.html.twig, note.html.twig, despatch.html.twig

✅ **Configuración actualizada**
- `config/greenter.php` con bin_path para WKHTMLtoPDF
- Configuración dinámica de empresa en runtime

---

## ⚠️ ACCIÓN REQUERIDA: Instalar WKHTMLtoPDF

### 📥 Instrucciones Completas

Ver archivo: [INSTRUCCIONES_WKHTMLTOPDF.md](INSTRUCCIONES_WKHTMLTOPDF.md)

**Resumen rápido:**
1. Descargar: https://wkhtmltopdf.org/downloads.html
2. Instalar en: `C:\Program Files\wkhtmltopdf\`
3. Verificar: `& "C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe" --version`

**SIN este programa:** Sistema funciona pero NO genera PDFs (solo XML/CDR)  
**CON este programa:** Sistema 100% funcional con representación impresa

---

## 🎯 PLAN DE ACCIÓN ACTUALIZADO

- [ ] **Inicializar proyecto React con Vite**
  ```bash
  cd C:\Plataforma_Op_Com_Facturacion_Elect
  npm create vite@latest frontend -- --template react-ts
  cd frontend
  npm install
  ```

- [ ] **Instalar shadcn/ui**
  ```bash
  npx shadcn-ui@latest init
  ```

- [ ] **Configurar TailwindCSS y dependencias**
  - Instalar: `axios`, `react-router-dom`, `zustand`, `react-hook-form`, `zod`

- [ ] **Crear estructura de carpetas**
  ```
  frontend/src/
  ├── components/
  │   ├── ui/           # Componentes shadcn
  │   ├── layout/       # Header, Sidebar, Layout
  │   └── forms/        # Formularios de emisión
  ├── pages/
  │   ├── Dashboard.tsx
  │   ├── Empresas/
  │   ├── Oportunidades/
  │   ├── Facturacion/
  │   ├── Documentos/
  │   └── Pagos/
  ├── services/         # API clients
  ├── hooks/            # Custom hooks
  ├── stores/           # Zustand stores
  └── lib/              # Utilidades
  ```

- [ ] **Componentes shadcn a instalar**
  - `button`, `card`, `form`, `input`, `select`, `table`, `dialog`
  - `dropdown-menu`, `tabs`, `badge`, `alert`, `toast`

#### 3️⃣ **MÓDULOS FRONTEND** (Por Prioridad)

##### 🔴 **Módulo de Facturación** (CRÍTICO)
- [ ] Formulario de emisión de **Facturas** (01)
- [ ] Formulario de emisión de **Boletas** (03)
- [ ] Formulario de emisión de **Notas de Crédito** (07)
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
  
- [ ] **Gestión de Documentos**
  - Upload a MinIO con preview
  - Galería de documentos por oportunidad
  
- [ ] **Registro de Pagos**
  - Formulario con método de pago
  - Asociar a oportunidad/comprobante
  - Timeline de pagos

##### 🔵 **Extras**
- [ ] **Catálogos SUNAT**
  - Tablas de consulta de catálogos 01-53
  
- [ ] **Sistema de Alertas**
  - Notificaciones en tiempo real
  - Marcar como leída
  - Badge de contador
  
- [ ] **Auditoría**
  - Logs de operaciones
  - Filtros por usuario/fecha

#### 4️⃣ **INTEGRACIÓN BACKEND-FRONTEND**

- [ ] **Configurar CORS en Laravel**
  ```bash
  php artisan config:publish cors
  ```
  Permitir origen: `http://localhost:5173` (Vite)

- [ ] **Crear servicio API client en React**
  ```typescript
  // frontend/src/services/api.ts
  const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api'
  });
  ```

- [ ] **Autenticación** (⚠️ PENDIENTE)
  - Laravel Sanctum SPA authentication
  - Middleware de autenticación en rutas protegidas
  - Login/Logout frontend
  - Protección de rutas React con react-router

#### 5️⃣ **CONFIGURACIÓN DOCKER PARA DESARROLLO COMPLETO**

- [ ] **Actualizar docker-compose.yml**
  - Agregar servicio `laravel` (PHP-FPM + Nginx)
  - Agregar servicio `frontend` (Node para Vite)
  - Networking entre servicios

- [ ] **Variables de entorno**
  - Archivo `.env.example` para referencia
  - Documentar todas las credenciales necesarias

#### 6️⃣ **TESTING Y VALIDACIÓN**

- [ ] **Backend Testing**
  - PHPUnit tests para endpoints críticos
  - Tests de integración con SUNAT beta
  
- [ ] **Frontend Testing**
  - Vitest + React Testing Library
  - Tests de componentes formularios

#### 7️⃣ **DOCUMENTACIÓN**

- [ ] **README.md detallado**
  - Instalación paso a paso
  - Configuración de credenciales SUNAT
  - Catálogos oficiales de referencia
  
- [ ] **Diagramas de arquitectura**
  - Diagrama de base de datos (ER)
  - Flujo de emisión de comprobantes
  
- [ ] **API Documentation**
  - Swagger/OpenAPI para endpoints REST

---

## 🎯 PLAN DE ACCIÓN RECOMENDADO

### **Opción A: Refactorizar Backend (Seguir Tutorial)**
1. ✅ Reescribir `FacturacionService.php` usando fachada `Greenter`
2. ✅ Instalar y configurar WKHTMLtoPDF
3. ✅ Publicar vistas y personalizar plantillas
4. ✅ Agregar endpoints para HTML/PDF
5. 🚀 Proceder con Frontend React

**Ventaja:** Código más limpio y mantenible (según tutorial)  
**Desventaja:** Requiere refactorizar servicio que ya funciona

### **Opción B: Mantener Implementación Actual (Más Rápido)**
1. ✅ Backend funcional con greenter base (YA HECHO)
2. ❌ Agregar generación de PDFs manualmente (sin laravel-greenter)
3. 🚀 Enfoque en Frontend React inmediatamente

**Ventaja:** No perder tiempo refactorizando  
**Desventaja:** Código más complejo, sin usar las ventajas de laravel-greenter

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
