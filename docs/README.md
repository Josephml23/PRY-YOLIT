# 📚 Documentación de la Plataforma

**Última actualización**: 3 de febrero de 2026

---

## 📖 Índice de Documentación

### 🎯 Requerimientos y Estado del Proyecto

- **[REQUERIMIENTOS.md](../REQUERIMIENTOS.md)** - Requerimientos completos del MVP
- **[requerimientos-mvp.md](../requerimientos-mvp.md)** - Versión simplificada del MVP
- **[PENDIENTES.md](../PENDIENTES.md)** - Tareas pendientes y estado actual

---

## 📂 Documentación por Módulo

### 🧾 NubeFact (Facturación Electrónica)

- **[MIGRACION_NUBEFACT_COMPLETADA.md](nubefact/MIGRACION_NUBEFACT_COMPLETADA.md)** - Migración de Greenter a NubeFact ✅
- **[API_SINCRONIZACION_NUBEFACT.md](nubefact/API_SINCRONIZACION_NUBEFACT.md)** - API de sincronización directa con NubeFact
- **[CONFIRMACION_INTEGRACION_NUBEFACT.md](nubefact/CONFIRMACION_INTEGRACION_NUBEFACT.md)** - Confirmación de integración
- **[SINCRONIZACION_COMPLETA_IMPLEMENTADA.md](nubefact/SINCRONIZACION_COMPLETA_IMPLEMENTADA.md)** - Sync de comprobantes + items + entidades + productos

**PDFs de Referencia:**
- [NUBEFACT DOC API JSON V1.pdf](../NUBEFACT%20DOC%20API%20JSON%20V1.pdf) - Documentación oficial API
- [API NUBEFACT - GUIA DE REMISIÓN.pdf](../API%20NUBEFACT%20-%20GUIA%20DE%20REMISIÓN.pdf) - Guías de remisión

---

### 🔍 OCR (Reconocimiento de Documentos)

- **[COMPLETADO.md](ocr/COMPLETADO.md)** - ✅ Instalación completada (Docker)
- **[DOCKER_OCR_SETUP.md](ocr/DOCKER_OCR_SETUP.md)** - Guía completa de setup con Docker
- **[DEPLOYMENT.md](ocr/DEPLOYMENT.md)** - Opciones de deployment (Docker, APIs)

**¿Con Docker puedo hacer pruebas locales?**
✅ **SÍ** - El servicio OCR está completamente funcional en Docker. Puedes:
- Procesar PDFs/imágenes localmente sin internet
- Obtener resultados en 3-5 segundos por documento
- Confianza del 85-90% en facturas
- Sin costo (gratis, ilimitado)

**Comandos rápidos:**
```bash
# Verificar que el contenedor esté corriendo
docker ps | grep facturacion_ocr

# Probar OCR con un archivo
docker exec facturacion_ocr python ocr_service.py "/app/storage/archivo.pdf"

# Desde Laravel (automático)
# Solo asegúrate de tener OCR_USE_DOCKER=true en .env
```

---

### 🎨 Desarrollo y Mejoras

- **[APLICACION_DISENO_FIGMA.md](desarrollo/APLICACION_DISENO_FIGMA.md)** - Implementación del diseño de Nubofact desde Figma
- **[MEJORAS_INTERFACE_DESIGN.md](desarrollo/MEJORAS_INTERFACE_DESIGN.md)** - Mejoras de UX/UI aplicadas
- **[MEJORAS_EMISION_COMPROBANTES.md](desarrollo/MEJORAS_EMISION_COMPROBANTES.md)** - Componente unificado de emisión
- **[OPTIMIZACIONES_APLICADAS.md](desarrollo/OPTIMIZACIONES_APLICADAS.md)** - Best practices Vercel + Supabase
- **[DIAGNOSTICO_DASHBOARD.md](desarrollo/DIAGNOSTICO_DASHBOARD.md)** - Diagnóstico de problemas del dashboard

---

## 🚀 Inicio Rápido

### 1. Levantar Servicios Docker
```bash
docker-compose up -d
```

Esto inicia:
- ✅ PostgreSQL (puerto 5432)
- ✅ MinIO (API: 9000, Console: 9001)
- ✅ OCR Service (facturacion_ocr)

### 2. Backend (Laravel)
```bash
cd backend
php artisan serve
```

### 3. Frontend (React)
```bash
cd frontend
npm run dev
```

---

## 🧪 Pruebas Locales con Docker

### OCR
```bash
# Copiar PDF de prueba
Copy-Item "examples\factura.pdf" "backend\storage\app\public\test.pdf"

# Ejecutar OCR
docker exec facturacion_ocr python ocr_service.py "/app/storage/test.pdf"
```

### Base de Datos
```bash
# Conectar a PostgreSQL
docker exec -it facturacion_postgres psql -U postgres -d plataforma_facturacion
```

### MinIO
- Console: http://localhost:9001
- User: minio
- Password: minio123

---

## 📦 Estructura de Carpetas

```
Plataforma_Op_Com_Facturacion_Elect/
├── backend/              # Laravel API
│   ├── app/
│   ├── database/
│   ├── python_ocr/      # Servicio OCR
│   │   ├── Dockerfile
│   │   ├── ocr_service.py
│   │   ├── requirements.txt
│   │   └── README.md
│   └── ...
├── frontend/            # React + TypeScript
│   ├── src/
│   └── ...
├── docs/                # 📚 Documentación organizada
│   ├── nubefact/       # NubeFact API
│   ├── ocr/            # OCR Docker
│   ├── desarrollo/     # Mejoras y diagnósticos
│   └── README.md       # Este archivo
├── examples/           # Archivos de ejemplo
├── docker-compose.yml  # Orquestación Docker
├── README.md           # README principal
├── REQUERIMIENTOS.md   # Requerimientos completos
└── PENDIENTES.md       # Tareas pendientes
```

---

## 🔗 Enlaces Útiles

### Documentación Externa
- [NubeFact](https://nubefact.com) - Proveedor SUNAT
- [SUNAT](https://www.sunat.gob.pe) - Portal oficial
- [Laravel 11](https://laravel.com/docs/11.x)
- [React 18](https://react.dev)

### Herramientas
- [MinIO Console](http://localhost:9001) - Gestión de archivos
- [PostgreSQL Admin](http://localhost:5432) - Base de datos

---

## ❓ Preguntas Frecuentes

### ¿Puedo hacer pruebas locales con Docker?
✅ **SÍ** - Todos los servicios (PostgreSQL, MinIO, OCR) funcionan localmente con Docker. No necesitas conexión a internet para la mayoría de funcionalidades (excepto NubeFact API).

### ¿Qué archivos se eliminaron en la limpieza?
- ❌ `INSTALACION.md` (obsoleto - ahora usamos Docker)
- ❌ `INSTALAR_POPPLER.md` (obsoleto - incluido en Docker)
- ❌ `verificar_instalacion.bat` (obsoleto - ahora usamos Docker)
- ❌ `insert_boletas_prueba.sql` (script de prueba antiguo)

### ¿Dónde están los documentos ahora?
Organizados en `docs/`:
- `docs/nubefact/` - Todo sobre NubeFact API
- `docs/ocr/` - Documentación de OCR con Docker
- `docs/desarrollo/` - Mejoras y diagnósticos

---

**Mantenido por:** Equipo de Desarrollo  
**Estado:** ✅ Producción Ready (MVP)
