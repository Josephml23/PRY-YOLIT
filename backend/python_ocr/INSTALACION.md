# 🐍 Guía de Instalación OCR con Python

## 📋 Comparativa de Opciones OCR

| Opción | Costo | Precisión | Complejidad | Mejor Para |
|--------|-------|-----------|-------------|------------|
| **Tesseract + Python** ⭐ | GRATIS | 70-85% | Media | Testing, POC, proyectos pequeños |
| **OCR.space API** | GRATIS (25k/mes) | 75-80% | Baja | Prototipado rápido |
| **Google Vision API** | $1.50/1000 imgs | 95%+ | Media | Producción, alta precisión |
| **AWS Textract** | $1.50/1000 págs | 90-95% | Media | Formularios estructurados |
| **Azure Computer Vision** | $1/1000 imgs | 90-95% | Media | Integración con Azure |

---

## ✅ **Opción 1: Tesseract OCR (LOCAL - RECOMENDADO PARA EMPEZAR)**

### Windows

#### Paso 1: Instalar Tesseract OCR
```powershell
# Opción A: Con Chocolatey (recomendado)
choco install tesseract

# Opción B: Instalador manual
# Descargar de: https://github.com/UB-Mannheim/tesseract/wiki
# Ejecutar el instalador y MARCAR "Add to PATH"
```

#### Paso 2: Instalar Poppler (para PDFs)
```powershell
# Descargar de: https://github.com/oschwartz10612/poppler-windows/releases/
# Extraer en C:\Program Files\poppler-xx.xx.x
# Agregar a PATH: C:\Program Files\poppler-xx.xx.x\Library\bin
```

#### Paso 3: Instalar Python packages
```powershell
cd backend\python_ocr
pip install -r requirements.txt
```

#### Paso 4: Configurar PATH de Tesseract (si es necesario)
Edita `backend\python_ocr\ocr_service.py` línea 23:
```python
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

#### Paso 5: Probar instalación
```powershell
# Probar Tesseract
tesseract --version

# Probar script Python
python backend\python_ocr\ocr_service.py examples\factura_ejemplo.pdf
```

### Linux/Ubuntu

```bash
# Instalar Tesseract y Poppler
sudo apt update
sudo apt install tesseract-ocr tesseract-ocr-spa poppler-utils

# Instalar Python packages
cd backend/python_ocr
pip3 install -r requirements.txt

# Probar
python3 ocr_service.py ../../examples/factura_ejemplo.pdf
```

### macOS

```bash
# Instalar con Homebrew
brew install tesseract tesseract-lang poppler

# Instalar Python packages
cd backend/python_ocr
pip3 install -r requirements.txt

# Probar
python3 ocr_service.py ../../examples/factura_ejemplo.pdf
```

---

## 🌐 **Opción 2: OCR.space API (REMOTO - SIN INSTALACIÓN)**

### Ventajas
✅ No requiere instalación local  
✅ API REST simple  
✅ 25,000 requests gratis/mes  
✅ Funciona de inmediato

### Configuración

#### Paso 1: Obtener API Key
1. Ir a: https://ocr.space/ocrapi
2. Registrarse (gratis)
3. Copiar tu API Key

#### Paso 2: Agregar a Laravel .env
```env
OCR_SPACE_API_KEY=tu_api_key_aqui
```

#### Paso 3: Cambiar método en Controller
Edita `backend/app/Http/Controllers/Api/DocumentoDigitalizadoController.php`:

```php
// Línea ~344: Comentar Python y descomentar OCR.space
// $resultado = $this->procesarConPython($rutaArchivo);
$resultado = $this->procesarConOCRSpace($rutaArchivo);
```

#### Paso 4: Instalar Guzzle (si no está)
```bash
cd backend
composer require guzzlehttp/guzzle
```

---

## 🚀 **Opción 3: Google Cloud Vision API (PRODUCCIÓN)**

### Costo
- $1.50 por cada 1,000 imágenes
- Primeras 1,000 imágenes gratis/mes

### Instalación

#### Paso 1: Crear proyecto en Google Cloud
1. Ir a: https://console.cloud.google.com
2. Crear nuevo proyecto
3. Activar "Cloud Vision API"
4. Crear credenciales (Service Account)
5. Descargar archivo JSON de credenciales

#### Paso 2: Instalar SDK de Google
```bash
cd backend
composer require google/cloud-vision
```

#### Paso 3: Configurar credenciales
```env
GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/tu/credenciales.json
```

#### Paso 4: Crear método en Controller
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

---

## 🔧 Troubleshooting

### Error: "tesseract: command not found"
```bash
# Windows: Agregar a PATH manualmente
# Linux: sudo apt install tesseract-ocr
# Mac: brew install tesseract
```

### Error: "Unable to load image from PDF"
```bash
# Falta Poppler
# Windows: Descargar de releases poppler-windows
# Linux: sudo apt install poppler-utils
# Mac: brew install poppler
```

### Error: "No module named 'pytesseract'"
```bash
pip install -r backend/python_ocr/requirements.txt
```

### OCR con baja precisión
1. **Mejorar calidad de imagen**: Escanear a 300 DPI mínimo
2. **Preprocesar imagen**: El script ya incluye preprocesamiento
3. **Usar idioma correcto**: El script usa 'spa' para español
4. **Considerar servicio cloud**: Google Vision tiene 95%+ precisión

---

## 📊 Mejoras Adicionales (Opcional)

### 1. Entrenamiento personalizado de Tesseract
```bash
# Crear dataset de facturas peruanas
# Entrenar con tus propias facturas para mejorar precisión
```

### 2. Machine Learning para post-procesamiento
```python
# Usar spaCy o NLTK para mejorar extracción de entidades
pip install spacy
python -m spacy download es_core_news_sm
```

### 3. UI para corrección manual
- Agregar editor de texto en frontend
- Permitir correcciones de usuario
- Entrenar modelo con correcciones (ML supervisado)

---

## 🎯 Recomendación Final

**Para desarrollo/testing:**
- Usa **Tesseract + Python** (gratis, local, suficiente para POC)

**Para producción baja escala:**
- Usa **OCR.space API** (gratis hasta 25k/mes, fácil)

**Para producción alta escala:**
- Usa **Google Vision API** (mejor precisión, escalable)

**Implementación sugerida:**
1. Empezar con Tesseract para validar el flujo
2. Si funciona bien, quedarse con Tesseract
3. Si necesitas más precisión, migrar a Google Vision
4. El código ya está preparado para cambiar fácilmente entre métodos

---

## 🧪 Probar el Sistema

```bash
# 1. Instalar dependencias Python
cd backend/python_ocr
pip install -r requirements.txt

# 2. Probar script Python directamente
python ocr_service.py ../../examples/factura_ejemplo.pdf

# 3. Subir archivo desde frontend
# El backend llamará automáticamente al script Python
```

Si el paso 2 funciona, el sistema completo funcionará! 🎉
