@echo off
echo ================================================
echo Verificando instalacion de Tesseract OCR
echo ================================================
echo.

echo [1/3] Verificando Tesseract en PATH...
tesseract --version 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Tesseract encontrado en PATH
    echo.
) else (
    echo [ERROR] Tesseract NO encontrado en PATH
    echo.
    echo Posibles soluciones:
    echo 1. Instalar Tesseract desde: https://github.com/UB-Mannheim/tesseract/wiki
    echo 2. Agregar a PATH: C:\Program Files\Tesseract-OCR
    echo 3. O configurar ruta en ocr_service.py linea 23
    echo.
    pause
    exit /b 1
)

echo [2/3] Verificando Python...
python --version
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python instalado
    echo.
) else (
    echo [ERROR] Python no encontrado
    pause
    exit /b 1
)

echo [3/3] Verificando paquetes Python...
python -c "import pytesseract, PIL, pdf2image, cv2, numpy; print('[OK] Todos los paquetes instalados')" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo.
) else (
    echo [ERROR] Faltan paquetes Python
    echo Ejecuta: pip install -r requirements.txt
    echo.
    pause
    exit /b 1
)

echo ================================================
echo SISTEMA LISTO PARA OCR
echo ================================================
echo.
echo Puedes probar con:
echo python ocr_service.py ..\..\examples\factura_ejemplo.pdf
echo.
pause
