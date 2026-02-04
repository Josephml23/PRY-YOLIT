# 🚀 Guía de Deployment en Producción - OCR

## 🎯 Opciones para Servidor/Producción

| Opción | Complejidad | Costo | Escalabilidad | Recomendado Para |
|--------|-------------|-------|---------------|------------------|
| **Docker** 🐳 | Media | Gratis | Alta | VPS, Servidor propio |
| **Google Vision API** ☁️ | Baja | $1.50/1000 | Infinita | Cloud, cualquier servidor |
| **AWS Textract** ☁️ | Baja | $1.50/1000 | Infinita | Si ya usas AWS |
| **OCR.space API** | Muy Baja | Gratis 25k/mes | Media | Proyectos pequeños |

---

## ✅ **Opción 1: Docker (RECOMENDADA)** 🐳

### Ventajas
- ✅ Mismo entorno en desarrollo y producción
- ✅ Fácil deployment en cualquier servidor con Docker
- ✅ No requiere instalar dependencias manualmente
- ✅ Totalmente gratis
- ✅ Funciona offline (sin APIs externas)

### Instalación en Servidor

#### 1. Instalar Docker (una sola vez)

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose

# Reiniciar sesión
exit
```

#### 2. Desplegar la aplicación

```bash
# Clonar repositorio
git clone tu-repo
cd Plataforma_Op_Com_Facturacion_Elect

# Construir y levantar servicios
docker-compose up -d

# El servicio OCR se construirá automáticamente
```

#### 3. Configurar Laravel

Editar `backend/.env`:

```env
# Usar Docker para OCR
OCR_USE_DOCKER=true
```

¡Listo! No necesitas instalar Tesseract, Poppler ni Python en el servidor.

#### 4. Verificar funcionamiento

```bash
# Ver logs del contenedor OCR
docker logs facturacion_ocr

# Probar OCR
docker exec facturacion_ocr python ocr_service.py /app/storage/test.pdf

# Ver estado
docker-compose ps
```

### Deployment continuo (CI/CD)

```bash
# En servidor, después de hacer git pull
docker-compose down
docker-compose build ocr_service
docker-compose up -d
```

### Ventajas en producción
- ✅ Mismo código funciona en desarrollo y producción
- ✅ No hay "funciona en mi máquina" (Docker garantiza consistencia)
- ✅ Fácil rollback (solo cambiar imagen)
- ✅ Escalable (puedes levantar múltiples contenedores)

---

## ✅ **Opción 2: Google Cloud Vision API** ☁️

### Ventajas
- ✅ **95%+ precisión** (la mejor)
- ✅ Cero instalación
- ✅ Funciona en cualquier servidor
- ✅ Escalable infinitamente
- ✅ Mantenida por Google

### Desventajas
- 💰 Costo: $1.50 por cada 1,000 imágenes (después de las primeras 1,000 gratis/mes)

### Instalación

#### 1. Crear proyecto en Google Cloud

1. Ir a: https://console.cloud.google.com
2. Crear nuevo proyecto
3. Activar "Cloud Vision API"
4. Crear Service Account:
   - IAM & Admin → Service Accounts
   - Create Service Account
   - Grant role: "Cloud Vision API User"
   - Create Key → JSON → Download

#### 2. Subir credenciales al servidor

```bash
# En servidor
mkdir -p /var/www/credentials
chmod 700 /var/www/credentials

# Copiar archivo JSON (desde tu local)
scp google-credentials.json usuario@servidor:/var/www/credentials/
```

#### 3. Instalar SDK de Google

```bash
cd backend
composer require google/cloud-vision
```

#### 4. Configurar Laravel

Editar `backend/.env`:

```env
GOOGLE_APPLICATION_CREDENTIALS=/var/www/credentials/google-credentials.json
OCR_USE_DOCKER=false
```

#### 5. Implementar método en Controller

El código ya está preparado. Solo necesitas implementar:

```php
use Google\Cloud\Vision\V1\ImageAnnotatorClient;

private function procesarConGoogleVision($rutaArchivo)
{
    $imageAnnotator = new ImageAnnotatorClient();
    
    $image = file_get_contents($rutaArchivo);
    $response = $imageAnnotator->documentTextDetection($image);
    $texts = $response->getTextAnnotations();
    
    $textoCompleto = $texts[0]->getDescription() ?? '';
    
    $imageAnnotator->close();
    
    return [
        'success' => true,
        'datos' => $this->extraerDatosDeTexto($textoCompleto),
        'confianza_ocr' => 95.0,
        'texto_completo' => $textoCompleto
    ];
}
```

Luego en `procesarDocumentoMock` línea 344:

```php
// Opción 1: Docker/Python local
// $resultado = $this->procesarConPython($rutaArchivo);

// Opción 2: OCR.space API
// $resultado = $this->procesarConOCRSpace($rutaArchivo);

// Opción 3: Google Vision API ← USAR ESTA
$resultado = $this->procesarConGoogleVision($rutaArchivo);
```

### Costo estimado

| Volumen mensual | Costo mensual |
|----------------|---------------|
| 0 - 1,000 | $0 (gratis) |
| 1,000 - 10,000 | $13.50 |
| 10,000 - 50,000 | $73.50 |
| 50,000+ | Negociar precio empresarial |

---

## ✅ **Opción 3: OCR.space API** (Más simple)

### Ventajas
- ✅ **Gratis hasta 25,000/mes**
- ✅ Cero instalación
- ✅ Funciona en 2 minutos
- ✅ No requiere tarjeta de crédito

### Instalación (2 minutos)

#### 1. Registrarse
https://ocr.space/ocrapi

#### 2. Copiar API Key

#### 3. Configurar en servidor

Editar `backend/.env`:

```env
OCR_SPACE_API_KEY=tu_api_key_aqui
OCR_USE_DOCKER=false
```

#### 4. Instalar Guzzle

```bash
cd backend
composer require guzzlehttp/guzzle
```

#### 5. Activar en Controller

Línea 344 en `DocumentoDigitalizadoController.php`:

```php
// Comentar Python
// $resultado = $this->procesarConPython($rutaArchivo);

// Descomentar OCR.space
$resultado = $this->procesarConOCRSpace($rutaArchivo);
```

¡Listo! Ya funciona sin instalar nada.

### Límites
- 25,000 requests/mes gratis
- Si necesitas más: $6.99/mes (100k requests)

---

## 🎯 **Mi Recomendación según tu caso:**

### Para VPS/Servidor propio (DigitalOcean, Linode, etc.):
**→ Usar Docker** 🐳
- No pagas por requests
- Mejor privacidad (datos no salen del servidor)
- Más control

```bash
# En servidor
docker-compose up -d
# Agregar a .env: OCR_USE_DOCKER=true
```

### Para serverless/Cloud (Heroku, Vercel, Railway):
**→ Usar Google Vision API** ☁️
- No puedes ejecutar Docker
- Pagas solo por uso
- Mejor precisión

### Para proyectos pequeños (< 25k docs/mes):
**→ Usar OCR.space API**
- Completamente gratis
- Setup en 2 minutos

---

## 📋 Checklist de Deployment

### Con Docker:
- [ ] Servidor tiene Docker instalado
- [ ] `docker-compose.yml` incluye servicio `ocr_service`
- [ ] `.env` tiene `OCR_USE_DOCKER=true`
- [ ] `docker-compose up -d` ejecutado
- [ ] Verificar: `docker ps` muestra `facturacion_ocr`

### Con API Cloud:
- [ ] Cuenta creada en servicio (Google/OCR.space)
- [ ] API Key obtenida
- [ ] `.env` configurado con credenciales
- [ ] SDK instalado (`composer require google/cloud-vision` o Guzzle)
- [ ] Método activado en Controller
- [ ] Probar con factura de ejemplo

---

## 🔄 Migración entre opciones

El código está preparado para cambiar fácilmente:

```php
// Cambiar en DocumentoDigitalizadoController.php línea ~344

// Desarrollo local
$resultado = $this->procesarConPython($rutaArchivo);

// Producción con Docker
$resultado = $this->procesarConPython($rutaArchivo); // + OCR_USE_DOCKER=true en .env

// Producción con API
$resultado = $this->procesarConOCRSpace($rutaArchivo);
// o
$resultado = $this->procesarConGoogleVision($rutaArchivo);
```

Solo cambias 1 línea de código + configuración en `.env`

---

## 🆘 Troubleshooting en Producción

### Docker no encuentra el archivo
```bash
# Verificar volúmenes
docker-compose exec ocr_service ls -la /app/storage

# Verificar permisos
sudo chown -R www-data:www-data backend/storage
```

### Error "Container not found"
```bash
# Reconstruir servicio
docker-compose build ocr_service
docker-compose up -d
```

### API retorna timeout
```bash
# Aumentar timeout en Laravel
# config/services.php
'ocr' => [
    'timeout' => 60, // segundos
],
```

---

**Resumen:** Para deployment en servidor real, usa **Docker** (gratis, profesional, escalable) o **Google Vision API** (más fácil, más preciso, pagas por uso).

**No necesitas instalar Tesseract/Poppler manualmente en producción.** 🎉
