# Instalación de Poppler para Windows

## ¿Qué es Poppler?
Poppler es una librería necesaria para convertir PDFs a imágenes. Sin ella, Tesseract no puede leer PDFs.

## Instalación Rápida

### Opción 1: Descarga Manual (RECOMENDADO)

1. **Descargar Poppler:**
   https://github.com/oschwartz10612/poppler-windows/releases/latest
   
   Buscar archivo: `Release-XX.XX.X-0.zip`

2. **Extraer:**
   - Descomprimir el archivo ZIP
   - Copiar la carpeta completa a: `C:\Program Files\poppler`
   - La ruta final debería ser: `C:\Program Files\poppler\Library\bin\`

3. **Agregar a PATH:**
   
   **Opción A - PowerShell (Temporal, solo esta sesión):**
   ```powershell
   $env:Path += ";C:\Program Files\poppler\Library\bin"
   ```
   
   **Opción B - Sistema (Permanente):**
   - Abrir "Editar las variables de entorno del sistema"
   - Clic en "Variables de entorno"
   - En "Variables del sistema", seleccionar "Path"
   - Clic en "Editar"
   - Clic en "Nuevo"
   - Agregar: `C:\Program Files\poppler\Library\bin`
   - Clic en "Aceptar" en todas las ventanas
   - **REINICIAR la terminal PowerShell**

4. **Verificar:**
   ```powershell
   pdftoppm -v
   ```

### Opción 2: Con Chocolatey

Si tienes Chocolatey instalado:
```powershell
choco install poppler
```

---

## Solución Temporal (Sin instalar Poppler)

Si no quieres instalar Poppler ahora, puedes:

1. **Usar solo imágenes JPG/PNG:**
   - Convertir el PDF a imagen con cualquier herramienta
   - Subir la imagen en lugar del PDF

2. **Usar OCR.space API:**
   - No requiere Poppler
   - Ver instrucciones en README.md

---

## Archivos Necesarios

Para que el OCR funcione completamente necesitas:

| Componente | Estado | Para qué sirve |
|------------|--------|----------------|
| Python | ✅ Instalado | Ejecutar scripts |
| pytesseract + paquetes | ✅ Instalado | OCR en Python |
| Tesseract OCR | ✅ Instalado | Motor de reconocimiento |
| **Poppler** | ❌ **FALTA** | Convertir PDF a imágenes |

---

## Después de instalar Poppler:

```powershell
# Agregar temporalmente a PATH en esta sesión
$env:Path += ";C:\Program Files\poppler\Library\bin"

# Probar OCR
cd C:\Plataforma_Op_Com_Facturacion_Elect\backend\python_ocr
python ocr_service.py "..\..\examples\20434906301-01-F010-21.pdf"
```

Deberías ver un JSON con los datos extraídos de la factura! 🎉
