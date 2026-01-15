# 🔧 Instalación de WKHTMLtoPDF para Generación de PDFs

## ⚠️ REQUERIDO para generar PDFs de comprobantes

**WKHTMLtoPDF** es una herramienta que convierte HTML a PDF usando el motor WebKit. Es necesaria para que `GreenterReport::generatePdf()` funcione.

---

## 📥 Descargar e Instalar

### **Windows (tu sistema actual)**

1. **Descargar:**
   - Visita: https://wkhtmltopdf.org/downloads.html
   - Descarga: **wkhtmltopdf 0.12.6-1 (64-bit)** para Windows
   - Archivo: `wkhtmltox-0.12.6-1.msvc2015-win64.exe`

2. **Instalar:**
   - Ejecuta el instalador descargado
   - Instalar en la ruta por defecto: `C:\Program Files\wkhtmltopdf\`
   - Completa la instalación

3. **Verificar instalación:**
   ```powershell
   # Debería mostrar la versión
   & "C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe" --version
   ```

4. **Configurar en Laravel:**
   
   La ruta ya está configurada en `config/greenter.php` línea 80:
   ```php
   'bin_path' => env('GREENTER_PDF_BIN_PATH', 'C:/Program Files/wkhtmltopdf/bin/wkhtmltopdf.exe'),
   ```

   Si instalaste en otra ubicación, actualiza en `.env`:
   ```env
   GREENTER_PDF_BIN_PATH="C:/tu/ruta/personalizada/wkhtmltopdf.exe"
   ```

---

### **Linux (para producción)**

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y wkhtmltopdf

# CentOS/RHEL
sudo yum install -y wkhtmltopdf

# Verificar
wkhtmltopdf --version
```

**Configuración en `.env` (Linux):**
```env
GREENTER_PDF_BIN_PATH=/usr/bin/wkhtmltopdf
```

---

### **macOS**

```bash
# Con Homebrew
brew install --cask wkhtmltopdf

# Verificar
wkhtmltopdf --version
```

**Configuración en `.env` (macOS):**
```env
GREENTER_PDF_BIN_PATH=/usr/local/bin/wkhtmltopdf
```

---

## ✅ Verificar Funcionamiento

Una vez instalado, prueba la generación de PDFs:

```powershell
cd C:\Plataforma_Op_Com_Facturacion_Elect\backend
php artisan tinker
```

```php
// En tinker
use CodersFree\LaravelGreenter\Facades\GreenterReport;

// Verificar configuración
config('greenter.report.bin_path');

// Salir
exit
```

---

## 🎯 Uso en el Sistema

Con WKHTMLtoPDF instalado, el servicio de facturación ahora puede generar PDFs automáticamente:

```php
// En FacturacionService.php (línea 68)
$pdf = GreenterReport::generatePdf($document);
Storage::disk('public')->put($pdfPath, $pdf);
```

Cada comprobante emitido generará 3 archivos:
- ✅ XML - Documento electrónico estructurado
- ✅ CDR (ZIP) - Constancia de recepción de SUNAT
- ✅ PDF - Representación impresa visual (requiere WKHTMLtoPDF)

---

## 🐛 Troubleshooting

### Error: "Process failed with code 1"
- Verifica que la ruta en `GREENTER_PDF_BIN_PATH` sea correcta
- Asegúrate que el archivo `.exe` existe
- En Windows usa `/` en lugar de `\` en la ruta

### Error: "No such file or directory"
- WKHTMLtoPDF no está instalado
- La ruta configurada es incorrecta

### Error de permisos (Linux)
```bash
sudo chmod +x /usr/bin/wkhtmltopdf
```

---

## 📋 Siguiente Paso

**SIN WKHTMLtoPDF:** El sistema funcionará pero no generará PDFs (solo XML y CDR)

**CON WKHTMLtoPDF:** Sistema completo con representación impresa en PDF

**Recomendación:** Instala ahora para tener el sistema completo antes de pasar al frontend.
