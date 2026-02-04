#!/bin/bash
# Script de verificación del servicio OCR en Docker

echo "🔍 Verificando servicio OCR en Docker..."
echo ""

# 1. Verificar que el contenedor esté corriendo
echo "1️⃣ Estado del contenedor:"
docker ps | grep facturacion_ocr
if [ $? -eq 0 ]; then
    echo "   ✅ Contenedor corriendo"
else
    echo "   ❌ Contenedor no está corriendo"
    echo "   💡 Ejecuta: docker-compose up -d ocr_service"
    exit 1
fi
echo ""

# 2. Verificar instalación de Tesseract
echo "2️⃣ Versión de Tesseract:"
docker exec facturacion_ocr tesseract --version | head -n 1
echo ""

# 3. Verificar idiomas instalados
echo "3️⃣ Idiomas OCR disponibles:"
docker exec facturacion_ocr tesseract --list-langs | grep -E "(spa|eng)"
echo ""

# 4. Verificar paquetes Python
echo "4️⃣ Paquetes Python instalados:"
docker exec facturacion_ocr pip list | grep -E "(pytesseract|Pillow|pdf2image|opencv-python|numpy)"
echo ""

# 5. Verificar Poppler (para PDFs)
echo "5️⃣ Versión de Poppler:"
docker exec facturacion_ocr pdfinfo -v | head -n 1
echo ""

# 6. Verificar OpenCV
echo "6️⃣ OpenCV funcionando:"
docker exec facturacion_ocr python -c "import cv2; print(f'OpenCV {cv2.__version__} ✅')"
if [ $? -eq 0 ]; then
    echo "   ✅ OpenCV OK"
else
    echo "   ❌ OpenCV con problemas"
fi
echo ""

# 7. Verificar volumen montado
echo "7️⃣ Archivos en storage:"
docker exec facturacion_ocr ls -lh /app/storage/ | head -n 5
echo ""

echo "✅ Verificación completa!"
echo ""
echo "📝 Para probar OCR con un archivo:"
echo "   docker exec facturacion_ocr python ocr_service.py \"/app/storage/archivo.pdf\""
