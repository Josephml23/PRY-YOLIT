# Plataforma Operativa y Comercial con Facturación Electrónica

## 🎯 Descripción

Sistema integral de gestión comercial y facturación electrónica integrado con SUNAT (Perú). Permite la emisión de comprobantes electrónicos, gestión de oportunidades, control de SLA y administración multiempresa.

## 🚀 Características Principales

- ✅ **Facturación Electrónica SUNAT**
  - Facturas (01), Boletas (03)
  - Notas de Crédito (07) y Débito (08)
  - Integración directa con SUNAT vía Greenter
  - Generación automática de XML, CDR y PDF

- 🏢 **Multiempresa (Multi-RUC)**
  - Gestión de múltiples empresas emisoras
  - Certificados y credenciales independientes
  - Aislamiento total de datos

- 📊 **Gestión Comercial**
  - Oportunidades de negocio
  - Control de SLA
  - Gestión documental
  - Seguimiento de pagos
  - Dashboards en tiempo real

## 🛠 Stack Tecnológico

### Backend
- **PHP** >= 8.1
- **Laravel** 11.x
- **PostgreSQL** 15+ (via Docker)
- **Greenter** (Laravel Greenter v1.0.3)
- **WKHTMLtoPDF** (generación de PDFs)

### Frontend
- **React** 18+
- **shadcn/ui** + TailwindCSS
- **Vite**

### Infraestructura Docker
- **PostgreSQL** 15-alpine (puerto 5432)
- **MinIO** (puertos 9000 API, 9001 Console)
- **Docker Compose** para orquestación

### Storage
- **MinIO** (S3 compatible) para XML/PDF/CDR

## 📋 Requisitos Previos

- **Docker Desktop** (para PostgreSQL + MinIO)
- **WKHTMLtoPDF** ([descargar](https://wkhtmltopdf.org/downloads.html))
- PHP >= 8.1 con extensiones:
  - soap
  - openssl
  - pgsql
  - pdo_pgsql
  - zip
- Composer
- Node.js >= 18
- **Docker Desktop** (requerido para PostgreSQL + MinIO)
- wkhtmltopdf (para PDFs)

## ⚙️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/diegomejiam/Nubofact-Web-y-Facturador.git
cd Nubofact-Web-y-Facturador
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

# Greenter (Facturación SUNAT)
GREENTER_MODE=beta
GREENTER_COMPANY_RUC=20000000001
GREENTER_COMPANY_NAME="MI EMPRESA SAC"
GREENTER_SOL_USER=MODDATOS
GREENTER_SOL_PASS=MODDATOS
GREENTER_PDF_BIN_PATH="C:/Program Files/wkhtmltopdf/bin/wkhtmltopdf.exe"
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

### 7. Iniciar servidor de desarrollo

```bash
# Backend Laravel
php artisan serve
# Disponible en: http://127.0.0.1:8000

# Verificar API
curl http://127.0.0.1:8000/api/facturacion/comprobantes
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
├── app/
│   ├── Http/Controllers/Api/
│   │   ├── FacturacionController.php
│   │   ├── EmpresaController.php
│   │   └── OportunidadController.php
│   ├── Models/
│   │   ├── Empresa.php
│   │   ├── Comprobante.php
│   │   └── Oportunidad.php
│   └── Services/
│       └── FacturacionService.php
├── database/
│   ├── migrations/
│   └── seeders/
│       └── CatalogosSunatSeeder.php
├── resources/
│   └── js/
│       ├── components/
│       └── pages/
└── public/
    ├── certs/
    └── images/
```

## 🔐 Seguridad

- ⚠️ **NUNCA** subir certificados al repositorio
- ✅ Usar variables de entorno para credenciales
- ✅ Encriptar usuario SOL y claves SUNAT
- ✅ Implementar roles y permisos
- ✅ Auditoría de emisiones

## 📚 Documentación

- [Requerimientos del MVP](./requerimientos-mvp.md)
- [Catálogos SUNAT](https://cpe.sunat.gob.pe/node/88)
- [Greenter Docs](https://greenter.dev/)

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
