# Script de verificación del servicio OCR en Docker (Windows PowerShell)

Write-Host "🔍 Verificando servicio OCR en Docker..." -ForegroundColor Cyan
Write-Host ""

# 1. Verificar que el contenedor esté corriendo
Write-Host "1️⃣ Estado del contenedor:" -ForegroundColor Yellow
$container = docker ps --filter "name=facturacion_ocr" --format "{{.Names}}"
if ($container -eq "facturacion_ocr") {
    Write-Host "   ✅ Contenedor corriendo" -ForegroundColor Green
} else {
    Write-Host "   ❌ Contenedor no está corriendo" -ForegroundColor Red
    Write-Host "   💡 Ejecuta: docker-compose up -d ocr_service" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# 2. Verificar instalación de Tesseract
Write-Host "2️⃣ Versión de Tesseract:" -ForegroundColor Yellow
docker exec facturacion_ocr tesseract --version 2>&1 | Select-Object -First 1
Write-Host ""

# 3. Verificar idiomas instalados
Write-Host "3️⃣ Idiomas OCR disponibles:" -ForegroundColor Yellow
docker exec facturacion_ocr tesseract --list-langs 2>&1 | Select-String -Pattern "(spa|eng)"
Write-Host ""

# 4. Verificar paquetes Python
Write-Host "4️⃣ Paquetes Python instalados:" -ForegroundColor Yellow
docker exec facturacion_ocr pip list | Select-String -Pattern "(pytesseract|Pillow|pdf2image|opencv-python|numpy)"
Write-Host ""

# 5. Verificar Poppler (para PDFs)
Write-Host "5️⃣ Versión de Poppler:" -ForegroundColor Yellow
docker exec facturacion_ocr pdfinfo -v 2>&1 | Select-Object -First 1
Write-Host ""

# 6. Verificar OpenCV
Write-Host "6️⃣ OpenCV funcionando:" -ForegroundColor Yellow
$opencvTest = docker exec facturacion_ocr python -c "import cv2; print(f'OpenCV {cv2.__version__} ✅')" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   $opencvTest" -ForegroundColor Green
} else {
    Write-Host "   ❌ OpenCV con problemas" -ForegroundColor Red
}
Write-Host ""

# 7. Verificar volumen montado
Write-Host "7️⃣ Archivos en storage:" -ForegroundColor Yellow
docker exec facturacion_ocr ls -lh /app/storage/ 2>&1 | Select-Object -First 5
Write-Host ""

# 8. Prueba rápida de OCR
Write-Host "8️⃣ Probando OCR con archivo de ejemplo:" -ForegroundColor Yellow
if (Test-Path "backend\storage\app\public\test_factura.pdf") {
    Write-Host "   Archivo encontrado: test_factura.pdf" -ForegroundColor Green
    Write-Host "   Ejecutando OCR..." -ForegroundColor Cyan
    
    $result = docker exec facturacion_ocr python ocr_service.py "/app/storage/test_factura.pdf" 2>&1 | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "   ✅ OCR exitoso!" -ForegroundColor Green
        Write-Host "   📊 Confianza: $($result.confianza_ocr)%" -ForegroundColor Cyan
        Write-Host "   📄 Tipo: $($result.datos.tipo_comprobante)" -ForegroundColor Cyan
        Write-Host "   🏢 RUC: $($result.datos.entidad_num_doc)" -ForegroundColor Cyan
    } else {
        Write-Host "   ❌ Error: $($result.error)" -ForegroundColor Red
    }
} else {
    Write-Host "   ⚠️ Archivo de prueba no encontrado" -ForegroundColor Yellow
    Write-Host "   💡 Copia un PDF a: backend\storage\app\public\test_factura.pdf" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "✅ Verificación completa!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Para probar OCR con un archivo:" -ForegroundColor Cyan
Write-Host '   docker exec facturacion_ocr python ocr_service.py "/app/storage/archivo.pdf"' -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentación completa en:" -ForegroundColor Cyan
Write-Host '   backend\python_ocr\DOCKER_OCR_SETUP.md' -ForegroundColor White
