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
- **PostgreSQL** 15+
- **Greenter** (Laravel Greenter)

### Frontend
- **React** 18+
- **shadcn/ui** + TailwindCSS
- **Vite**

### Storage
- **MinIO** (S3 compatible)

## 📋 Requisitos Previos

- PHP >= 8.1 con extensiones:
  - soap
  - openssl
  - pgsql
  - pdo_pgsql
- Composer
- Node.js >= 18
- PostgreSQL >= 15
- MinIO
- wkhtmltopdf (para PDFs)

## ⚙️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/diegomejiam/Nubofact-Web-y-Facturador.git
cd Nubofact-Web-y-Facturador
```

### 2. Instalar dependencias del backend

```bash
composer install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
php artisan key:generate
```

Editar `.env` con tus configuraciones:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=facturacion_db
DB_USERNAME=postgres
DB_PASSWORD=

# MinIO
FILESYSTEM_DISK=minio
MINIO_ENDPOINT=http://localhost:9000
MINIO_KEY=minioadmin
MINIO_SECRET=minioadmin
MINIO_BUCKET=facturacion

# SUNAT (Producción)
GREENTER_MODE=beta
GREENTER_RUC=
GREENTER_USER_SOL=
GREENTER_PASSWORD_SOL=
```

### 4. Configurar base de datos

```bash
php artisan migrate
php artisan db:seed
```

### 5. Publicar assets de Greenter

```bash
php artisan vendor:publish --tag=greenter-laravel
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

Diego Mejía - [@diegomejiam](https://github.com/diegomejiam)

---

**⚡ Powered by Laravel + Greenter + React + shadcn/ui**
