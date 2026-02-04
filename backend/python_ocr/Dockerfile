FROM python:3.12-slim

# Instalar Tesseract y Poppler
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-spa \
    poppler-utils \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Directorio de trabajo
WORKDIR /app

# Copiar requirements
COPY requirements.txt .

# Instalar dependencias Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar script
COPY ocr_service.py .

# Exponer puerto para API (opcional)
EXPOSE 8000

# Comando por defecto
CMD ["python", "ocr_service.py"]
