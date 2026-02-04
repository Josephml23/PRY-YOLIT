# 🔍 Sistema de Digitalización de Documentos con OCR

## ¿Qué hace este módulo?

Permite subir facturas, boletas o comprobantes en PDF o imagen y **extraer automáticamente** los datos usando OCR (Reconocimiento Óptico de Caracteres):

- 📄 Tipo de comprobante (Factura, Boleta, etc.)
- 🔢 Serie y número (F001-00001234)
- 📅 Fecha de emisión
- 🏢 RUC, razón social y dirección del proveedor
- 💰 Subtotal, IGV y Total
- 📦 Items/productos del comprobante

---

## 🚀 3 Opciones de Implementación (de más fácil a más compleja)

### **Opción 1: Tesseract OCR + Python (GRATIS, LOCAL)** ⭐ RECOMENDADO

**Ventajas:**
- ✅ Completamente GRATIS
- ✅ No requiere API keys ni internet
- ✅ Privacidad total (procesa todo localmente)
- ✅ Buen rendimiento (70-85% precisión)
- ✅ Ya está implementado y listo para usar

**Desventajas:**
- ⚠️ Requiere instalar Tesseract y Python packages
- ⚠️ Precisión menor que servicios cloud premium

**Instalación:**
Ver guía completa: [`backend/python_ocr/INSTALACION.md`](backend/python_ocr/INSTALACION.md)

```bash
# Windows
choco install tesseract
pip install -r backend/python_ocr/requirements.txt

# Linux
sudo apt install tesseract-ocr tesseract-ocr-spa
pip3 install -r backend/python_ocr/requirements.txt

# macOS
brew install tesseract
pip3 install -r backend/python_ocr/requirements.txt
```

**Estado:** ✅ IMPLEMENTADO - Solo requiere instalar dependencias

---

### **Opción 2: OCR.space API (GRATIS, REMOTO)**

**Ventajas:**
- ✅ GRATIS hasta 25,000 requests/mes
- ✅ No requiere instalación local
- ✅ API REST simple
- ✅ Funciona de inmediato
- ✅ Ya está implementado en el código

**Desventajas:**
- ⚠️ Requiere internet
- ⚠️ Límite de 25k requests/mes en plan gratuito
- ⚠️ Menor precisión que Google Vision

**Configuración:**

1. Registrarse en: https://ocr.space/ocrapi
2. Obtener API Key
3. Agregar a `.env`:
```env
OCR_SPACE_API_KEY=tu_api_key
```

4. Cambiar método en `DocumentoDigitalizadoController.php` línea ~344:
```php
// Comentar Python
// $resultado = $this->procesarConPython($rutaArchivo);

// Descomentar OCR.space
$resultado = $this->procesarConOCRSpace($rutaArchivo);
```

5. Instalar Guzzle:
```bash
composer require guzzlehttp/guzzle
```

**Estado:** ✅ IMPLEMENTADO - Solo requiere configurar API key

---

### **Opción 3: Google Cloud Vision API (PAGO, MÁS PRECISO)**

**Ventajas:**
- ✅ **95%+ precisión** (el mejor)
- ✅ Reconoce texto manuscrito
- ✅ Detecta tablas y estructura de documentos
- ✅ Escalable y confiable
- ✅ Primeras 1,000 imágenes gratis/mes

**Desventajas:**
- 💰 Costo: $1.50 por cada 1,000 imágenes (después de las primeras 1,000)
- ⚠️ Requiere cuenta Google Cloud
- ⚠️ Requiere configurar credenciales

**Instalación:**

1. Crear proyecto en Google Cloud Console
2. Activar Cloud Vision API
3. Crear Service Account y descargar JSON
4. Instalar SDK:
```bash
composer require google/cloud-vision
```

5. Configurar `.env`:
```env
GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/credenciales.json
```

6. Implementar método (código de ejemplo en INSTALACION.md)

**Estado:** ⏳ NO IMPLEMENTADO - Requiere desarrollo adicional

---

## 📊 Comparativa Rápida

| Característica | Tesseract (Python) | OCR.space API | Google Vision API |
|----------------|-------------------|---------------|-------------------|
| **Costo** | GRATIS | GRATIS (25k/mes) | $1.50/1000 imgs |
| **Precisión** | 70-85% | 75-80% | **95%+** |
| **Requiere instalación** | Sí | No | No |
| **Requiere internet** | No | Sí | Sí |
| **Velocidad** | Rápida | Media | Rápida |
| **Privacidad** | Total | Baja | Baja |
| **Límite** | Ilimitado | 25k/mes | Ilimitado |
| **Estado** | ✅ Implementado | ✅ Implementado | ⏳ Por implementar |

---

## 🎯 ¿Cuál elegir?

### Para desarrollo y testing:
**→ Tesseract + Python**
- Es gratis, funciona offline y tiene buena precisión
- Ideal para validar el flujo completo del sistema

### Para producción pequeña/mediana (< 25k documentos/mes):
**→ OCR.space API**
- Fácil de configurar, no requiere instalación
- Buena opción si no quieres mantener infraestructura

### Para producción con alta precisión:
**→ Google Vision API**
- Si necesitas 95%+ de precisión
- Si procesas muchos documentos y puedes pagar

---

## 🧪 Cómo probar

### 1. Con Tesseract Python (local):

```bash
# Instalar dependencias
cd backend/python_ocr
pip install -r requirements.txt

# Probar script directamente con un PDF de ejemplo
python ocr_service.py ../../examples/factura_ejemplo.pdf

# Si funciona, el sistema completo funcionará
```

### 2. Con OCR.space API (remoto):

```bash
# Solo configurar API key en .env
OCR_SPACE_API_KEY=tu_key

# Cambiar método en Controller
# Ya está listo, solo descomentar línea
```

### 3. Desde la aplicación web:

1. Ir a **Compras → Digitalización de Documentos**
2. Clic en **Subir Documento**
3. Seleccionar tipo de operación (Compra/Venta)
4. Elegir archivo PDF o imagen
5. Clic en **Procesar**
6. ¡Ver datos extraídos automáticamente!

---

## 📁 Archivos creados

```
backend/
  python_ocr/
    ocr_service.py          # Script Python con Tesseract
    requirements.txt        # Dependencias Python
    INSTALACION.md          # Guía completa de instalación
  app/Http/Controllers/Api/
    DocumentoDigitalizadoController.php  # 3 métodos OCR implementados
```

---

## 🔧 Troubleshooting

### "tesseract: command not found"
→ No está instalado Tesseract. Ver guía: `backend/python_ocr/INSTALACION.md`

### "Unable to load PDF"
→ Falta Poppler. Ver guía: `backend/python_ocr/INSTALACION.md`

### Baja precisión OCR
1. Escanear documentos a 300 DPI mínimo
2. Asegurarse que el texto sea legible
3. Considerar usar Google Vision API

### "Error decodificando respuesta Python"
→ Verificar que Python está instalado y en PATH:
```bash
python --version
# o
python3 --version
```

---

## 🚀 Mejoras futuras

- [ ] Vista previa de PDF/imagen en modal
- [ ] Corrección manual con editor de texto
- [ ] Validación automática con SUNAT
- [ ] Machine Learning para mejorar precisión
- [ ] Procesamiento en cola para múltiples documentos
- [ ] Exportar a Excel
- [ ] OCR de facturas manuscritas

---

## 📖 Recursos adicionales

- [Tesseract OCR Documentation](https://github.com/tesseract-ocr/tesseract)
- [OCR.space API Docs](https://ocr.space/ocrapi)
- [Google Cloud Vision Docs](https://cloud.google.com/vision/docs)
- [pytesseract GitHub](https://github.com/madmaze/pytesseract)

---

**💡 Recomendación:** Empieza con **Tesseract + Python** para validar el flujo. Si funciona bien, quédate con eso. Si necesitas más precisión, migra a Google Vision. El código ya está preparado para cambiar fácilmente entre métodos.
