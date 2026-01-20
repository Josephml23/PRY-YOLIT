# Plataforma Operativa y Comercial con Facturación Electrónica

## 🎯 Descripción

Sistema integral de gestión comercial y facturación electrónica integrado con **NubeFact API** (proveedor SUNAT Perú). Permite la emisión de comprobantes electrónicos, guías de remisión, gestión de oportunidades, control de SLA y administración multiempresa.

## 🚀 Características Principales

- ✅ **Facturación Electrónica vía NubeFact**
  - Facturas (01), Boletas (03)
  - Notas de Crédito (07) y Débito (08)
  - Guías de Remisión Electrónica (07, 08)
  - Integración con API JSON V1 de NubeFact
  - Generación automática de XML, CDR y PDF por NubeFact
  - Sincronización automática de estados SUNAT
  - QR obligatorio y PDF417 incluidos

- 🏢 **Multiempresa (Multi-RUC)**
  - Gestión de múltiples empresas emisoras
  - Certificados y credenciales independientes por empresa
  - Aislamiento total de datos

- 📊 **Gestión Comercial**
  - Oportunidades de negocio
  - Control de SLA
  - Gestión documental
  - Seguimiento de pagos
  - Dashboards en tiempo real

- 🔄 **Sincronización NubeFact**
  - Comando artisan para sync batch
  - Actualización automática de estados SUNAT
  - Almacenamiento local de respuestas API

## 🛠 Stack Tecnológico

### Backend
- **PHP** >= 8.2
- **Laravel** 11.x
- **PostgreSQL** 15+ (via Docker)
- **NubeFact API** (JSON V1)
- **MinIO** (almacenamiento S3 compatible)

### Frontend
- **React** 18+
- **TypeScript**
- **shadcn/ui** + TailwindCSS
- **Vite**

### Infraestructura Docker
- **PostgreSQL** 15-alpine (puerto 5432)
- **MinIO** (puertos 9000 API, 9001 Console)
- **Docker Compose** para orquestación

### Storage
- **MinIO** (S3 compatible) para documentos adjuntos
- **NubeFact Cloud** para XML/PDF/CDR de comprobantes

## 📋 Requisitos Previos

- **Docker Desktop** (para PostgreSQL + MinIO)
- **PHP >= 8.2** con extensiones:
  - pgsql, pdo_pgsql
  - openssl, zip, curl
  - mbstring, xml
- **Composer** >= 2.0
- **Node.js** >= 18
- **Cuenta NubeFact** (obtener en [nubefact.com](https://nubefact.com))

## ⚙️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/Plataforma_Op_Com_Facturacion_Elect.git
cd Plataforma_Op_Com_Facturacion_Elect
```

### 2. **Iniciar servicios Docker**

```bash
# Levantar PostgreSQL + MinIO
docker-compose up -d

# Verificar que estén corriendo
docker ps
```

**Servicios disponibles:**
- PostgreSQL: `localhost:5432`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001` (minio/minio123)

### 3. Instalar dependencias del backend

```bash
cd backend
composer install
```

### 4. Configurar variables de entorno

```bash
cp .env.example .env
php artisan key:generate
```

**Configurar NubeFact en `.env`:**
```env
NUBEFACT_BASE_URL=https://api.pse.pe/api/v1/{tu_ruc_key}
NUBEFACT_TOKEN=tu_token_jwt_aqui
NUBEFACT_AUTO_SUNAT=true
NUBEFACT_PDF_FORMAT=A4
```

Ver `backend/INTEGRACION_NUBEFACT.md` para documentación completa de NubeFact.

Editar `backend/.env` con las configuraciones Docker:

```env
# Base de datos PostgreSQL (Docker)
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=plataforma_facturacion
DB_USERNAME=postgres
DB_PASSWORD=postgres123

# MinIO S3 Storage (Docker)
FILESYSTEM_DISK=minio
MINIO_ENDPOINT=http://localhost:9000
MINIO_KEY=minio
MINIO_SECRET=minio123
MINIO_BUCKET=facturacion
MINIO_USE_PATH_STYLE_ENDPOINT=true
```

### 5. Configurar base de datos

```bash
# Ejecutar migraciones
php artisan migrate

# Poblar catálogos SUNAT
php artisan db:seed --class=CatalogosSunatSeeder
```

### 6. Crear enlace simbólico para storage

```bash
php artisan storage:link
```

### 7. Verificar integración NubeFact

```bash
# Ejecutar tests de integración
vendor/bin/phpunit tests/Feature/NubefactIntegrationTest.php --filter test_mapear

# Test manual (opcional - requiere credenciales reales)
php artisan tinker
>>> app(\App\Services\NubefactClient::class)->validarCredenciales();
```

### 8. Iniciar servidor de desarrollo

```bash
# Backend Laravel
php artisan serve
# Disponible en: http://127.0.0.1:8000

# Verificar API
curl http://127.0.0.1:8000/api/facturacion/comprobantes
```

## 📡 Endpoints API Principales

### Facturación

```bash
# Listar comprobantes
GET /api/facturacion/comprobantes

# Emitir con NubeFact
POST /api/nubefact/comprobantes
Body: {"comprobante_id": 123}

# Consultar estado
GET /api/nubefact/comprobantes/{tipo}/{serie}/{numero}

# Anular comprobante
DELETE /api/nubefact/comprobantes/{tipo}/{serie}/{numero}
Body: {"motivo": "Error en datos"}
```

### Guías de Remisión

```bash
# Emitir guía
POST /api/nubefact/guias
Body: {"guia_id": 456}

# Consultar estado
GET /api/nubefact/guias/{tipo}/{serie}/{numero}
```

### Sincronización

```bash
# Sincronizar comprobantes pendientes
php artisan nubefact:sync --pendientes

# Sincronizar por fecha
php artisan nubefact:sync --desde=2026-01-01 --hasta=2026-01-31

# Sincronizar empresa específica
php artisan nubefact:sync --empresa=1
```

## 🐳 Gestión de Docker

### Comandos útiles

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down

# Reiniciar servicios
docker-compose restart

# Eliminar datos (CUIDADO: borra la BD)
docker-compose down -v
```

### Acceso a contenedores

```bash
# PostgreSQL
docker exec -it facturacion_postgres psql -U postgres -d plataforma_facturacion

# MinIO (navegador)
# http://localhost:9001
# Usuario: minio
# Contraseña: minio123
```

### 6. Instalar dependencias del frontend

```bash
cd resources/js
npm install
```

### 7. Iniciar servicios

#### Terminal 1 - Backend
```bash
php artisan serve
```

#### Terminal 2 - Frontend
```bash
npm run dev
```

#### Terminal 3 - MinIO (opcional, si es local)
```bash
minio server ./minio-data --console-address ":9001"
```

## 📁 Estructura del Proyecto

```
Plataforma_Op_Com_Facturacion_Elect/
├── backend/
│   ├── app/
│   │   ├── Console/Commands/
│   │   │   └── NubefactSyncCommand.php
│   │   ├── Http/Controllers/Api/
│   │   │   ├── FacturacionController.php
│   │   │   ├── NubefactController.php      ← Emisión NubeFact
│   │   │   ├── EmpresaController.php
│   │   │   └── OportunidadController.php
│   │   ├── Models/
│   │   │   ├── Empresa.php
│   │   │   ├── Comprobante.php             ← Con campos NubeFact
│   │   │   ├── GuiaRemision.php            ← Nuevo modelo GRE
│   │   │   └── Oportunidad.php
│   │   └── Services/
│   │       ├── NubefactClient.php          ← Cliente API
│   │       ├── NubefactMapper.php          ← Conversión datos
│   │       └── FacturacionService.php
│   ├── config/
│   │   ├── nubefact.php                    ← Config NubeFact
│   │   └── logging.php                     ← Canal nubefact
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── *_add_nubefact_fields_to_comprobantes_table.php
│   │   │   └── *_create_guia_remisions_table.php
│   │   └── seeders/
│   │       └── CatalogosSunatSeeder.php
│   ├── tests/Feature/
│   │   └── NubefactIntegrationTest.php
│   ├── INTEGRACION_NUBEFACT.md             ← Documentación completa
│   └── .env
├── frontend/
│   └── src/
│       ├── components/
│       └── pages/
├── examples/                                ← 60+ ejemplos JSON NubeFact
│   ├── EJEMPLO JSON GENERAR CPE FACTURA 1 GRAVADA.txt
│   └── NubeFact-json.php
├── docker-compose.yml
└── README.md
```

## 🔐 Seguridad

- ⚠️ **NUNCA** subir tokens NubeFact al repositorio
- ⚠️ **NUNCA** commitear archivos `.env` con credenciales reales
- ✅ Usar variables de entorno para credenciales
- ✅ Rotar tokens NubeFact periódicamente
- ✅ Implementar roles y permisos (próximo paso)
- ✅ Auditoría completa de emisiones (logs en `storage/logs/nubefact-*.log`)

## 📚 Documentación

- **[Integración NubeFact](./backend/INTEGRACION_NUBEFACT.md)** ← Documentación completa API
- [Requerimientos del MVP](./requerimientos-mvp.md)
- [Catálogos SUNAT](https://cpe.sunat.gob.pe/node/88)
- [NubeFact Docs](https://nubefact.com/soporte)
- Manuales PDF en raíz del proyecto

## 🧪 Testing

```bash
# Backend (Laravel)
cd backend
vendor/bin/phpunit

# Tests específicos de NubeFact
vendor/bin/phpunit tests/Feature/NubefactIntegrationTest.php

# Frontend (React)
cd frontend
npm run test
```

## 🚀 Deployment

### Producción

1. **Actualizar credenciales NubeFact:**
   ```env
   NUBEFACT_BASE_URL=https://api.nubefact.com/api/v1/{ruc_key}
   NUBEFACT_TOKEN=token_produccion_aqui
   NUBEFACT_MODE=production
   ```

2. **Optimizar Laravel:**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

3. **Build frontend:**
   ```bash
   cd frontend
   npm run build
   ```

4. **Configurar cron para sincronización:**
   ```cron
   # Sincronizar comprobantes cada hora
   0 * * * * cd /path/to/app && php artisan nubefact:sync --pendientes
   ```

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: add some amazing feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Cambios en documentación
- `style:` Formato, punto y coma faltantes, etc
- `refactor:` Refactorización de código
- `test:` Añadir tests
- `chore:` Actualización de tareas de build, configs, etc
- `refactor:` Refactorización de código
- `test:` Añadir tests
- `chore:` Tareas de mantenimiento

## 📄 Licencia

Este proyecto es privado y propietario.

## 👥 Autor

**George Guerra Pacheco**  
📧 george.guerra@tecsup.edu.pe  
🎓 Tecsup

Desarrollado como parte del proyecto de Plataforma Operativa y Comercial con Facturación Electrónica integrada con SUNAT (Perú).

---

**⚡ Powered by Laravel + Greenter + React + shadcn/ui**
