#!/usr/bin/env python3
"""
Servicio OCR para extracción de datos de facturas
Usar: python ocr_service.py <ruta_archivo>
"""

import sys
import json
import re
from pathlib import Path
from typing import Dict, List, Optional

try:
    import pytesseract
    from PIL import Image
    from pdf2image import convert_from_path
    import cv2
    import numpy as np
except ImportError as e:
    print(json.dumps({
        "success": False,
        "error": f"Dependencias faltantes: {str(e)}. Ejecuta: pip install pytesseract pillow pdf2image opencv-python"
    }))
    sys.exit(1)

# Configurar ruta de Tesseract (ajustar según instalación)
# Windows: pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
# Linux/Mac: generalmente está en PATH


class FacturaOCR:
    """Extractor de datos de facturas usando Tesseract OCR"""
    
    def __init__(self, archivo_path: str):
        self.archivo_path = Path(archivo_path)
        self.texto_completo = ""
        self.confianza = 0.0
        
    def procesar(self) -> Dict:
        """Procesa el archivo y extrae datos"""
        try:
            # Convertir archivo a imagen(es)
            imagenes = self._convertir_a_imagenes()
            
            # Extraer texto de todas las imágenes
            textos = []
            confianzas = []
            
            for img in imagenes:
                # Preprocesar imagen para mejorar OCR
                img_procesada = self._preprocesar_imagen(img)
                
                # Extraer texto con confianza
                datos = pytesseract.image_to_data(img_procesada, output_type=pytesseract.Output.DICT, lang='spa')
                
                texto = pytesseract.image_to_string(img_procesada, lang='spa')
                textos.append(texto)
                
                # Calcular confianza promedio
                confidencias_validas = [float(c) for c in datos['conf'] if int(c) != -1]
                if confidencias_validas:
                    confianzas.append(sum(confidencias_validas) / len(confidencias_validas))
            
            self.texto_completo = "\n".join(textos)
            self.confianza = sum(confianzas) / len(confianzas) if confianzas else 0.0
            
            # Extraer datos estructurados
            datos_extraidos = self._extraer_datos()
            
            return {
                "success": True,
                "datos": datos_extraidos,
                "confianza_ocr": round(self.confianza, 2),
                "texto_completo": self.texto_completo
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _convertir_a_imagenes(self) -> List:
        """Convierte PDF o imagen a lista de imágenes PIL"""
        extension = self.archivo_path.suffix.lower()
        
        if extension == '.pdf':
            # Convertir PDF a imágenes
            return convert_from_path(str(self.archivo_path), dpi=300)
        elif extension in ['.jpg', '.jpeg', '.png']:
            # Cargar imagen directamente
            return [Image.open(self.archivo_path)]
        else:
            raise ValueError(f"Formato no soportado: {extension}")
    
    def _preprocesar_imagen(self, img: Image.Image) -> Image.Image:
        """Mejora la imagen para mejor OCR"""
        # Convertir PIL a OpenCV
        img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        
        # Convertir a escala de grises
        gris = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
        
        # Aplicar threshold adaptativo
        threshold = cv2.adaptiveThreshold(
            gris, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        
        # Reducir ruido
        denoised = cv2.fastNlMeansDenoising(threshold)
        
        # Convertir de vuelta a PIL
        return Image.fromarray(denoised)
    
    def _extraer_datos(self) -> Dict:
        """Extrae datos estructurados del texto"""
        datos = {
            "tipo_comprobante": self._extraer_tipo_comprobante(),
            "serie": self._extraer_serie(),
            "numero": self._extraer_numero(),
            "comprobante_completo": None,
            "fecha_emision": self._extraer_fecha(),
            "entidad_tipo_doc": "RUC",  # Asumir RUC por defecto
            "entidad_num_doc": self._extraer_ruc(),
            "entidad_razon_social": self._extraer_razon_social(),
            "entidad_direccion": self._extraer_direccion(),
            "moneda": self._extraer_moneda(),
            "subtotal": self._extraer_monto("SUBTOTAL|SUB TOTAL|BASE IMPONIBLE"),
            "igv": self._extraer_monto("IGV|I.G.V"),
            "total": self._extraer_monto("TOTAL|IMPORTE TOTAL"),
            "items_extraidos": self._extraer_items()
        }
        
        # Generar comprobante completo
        if datos["serie"] and datos["numero"]:
            datos["comprobante_completo"] = f"{datos['serie']}-{datos['numero']}"
        
        return datos
    
    def _extraer_tipo_comprobante(self) -> Optional[str]:
        """Identifica tipo de comprobante"""
        texto_upper = self.texto_completo.upper()
        
        if re.search(r'\bFACTURA\s+ELECTR[OÓ]NICA\b', texto_upper):
            return "FACTURA ELECTRONICA"
        elif re.search(r'\bFACTURA\b', texto_upper):
            return "FACTURA"
        elif re.search(r'\bBOLETA\s+DE\s+VENTA\b', texto_upper):
            return "BOLETA DE VENTA"
        elif re.search(r'\bBOLETA\b', texto_upper):
            return "BOLETA"
        elif re.search(r'\bNOTA\s+DE\s+CR[EÉ]DITO\b', texto_upper):
            return "NOTA DE CREDITO"
        elif re.search(r'\bNOTA\s+DE\s+D[EÉ]BITO\b', texto_upper):
            return "NOTA DE DEBITO"
        
        return None
    
    def _extraer_serie(self) -> Optional[str]:
        """Extrae serie del comprobante (ej: F001, B001)"""
        # Buscar patrones como F001, B001, E001, etc.
        match = re.search(r'\b([A-Z]\d{3})\b', self.texto_completo)
        if match:
            return match.group(1)
        
        # Buscar "SERIE: F001" o similar
        match = re.search(r'SERIE\s*:?\s*([A-Z]\d{3})', self.texto_completo, re.IGNORECASE)
        if match:
            return match.group(1)
        
        return None
    
    def _extraer_numero(self) -> Optional[str]:
        """Extrae número del comprobante"""
        # Buscar después de la serie (ej: F001-00123456)
        match = re.search(r'[A-Z]\d{3}-(\d{4,8})', self.texto_completo)
        if match:
            return match.group(1)
        
        # Buscar "N°: 00123456" o "NUMERO: 00123456"
        match = re.search(r'N[UÚ]MERO\s*:?\s*(\d{4,8})', self.texto_completo, re.IGNORECASE)
        if match:
            return match.group(1)
        
        match = re.search(r'N[°º]\s*:?\s*(\d{4,8})', self.texto_completo)
        if match:
            return match.group(1)
        
        return None
    
    def _extraer_fecha(self) -> Optional[str]:
        """Extrae fecha de emisión (formato: YYYY-MM-DD)"""
        # Patrones de fecha: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
        patrones = [
            r'(\d{1,2})[/-](\d{1,2})[/-](\d{4})',  # DD/MM/YYYY
            r'(\d{4})[/-](\d{1,2})[/-](\d{1,2})',  # YYYY-MM-DD
        ]
        
        for patron in patrones:
            match = re.search(patron, self.texto_completo)
            if match:
                grupos = match.groups()
                if len(grupos) == 3:
                    if len(grupos[0]) == 4:  # YYYY-MM-DD
                        return f"{grupos[0]}-{grupos[1].zfill(2)}-{grupos[2].zfill(2)}"
                    else:  # DD/MM/YYYY
                        return f"{grupos[2]}-{grupos[1].zfill(2)}-{grupos[0].zfill(2)}"
        
        return None
    
    def _extraer_ruc(self) -> Optional[str]:
        """Extrae RUC (11 dígitos que empiezan con 10 o 20)"""
        # Buscar RUC cerca de palabras clave
        match = re.search(r'RUC\s*:?\s*(\d{11})', self.texto_completo, re.IGNORECASE)
        if match:
            return match.group(1)
        
        # Buscar cualquier secuencia de 11 dígitos que empiece con 10 o 20
        match = re.search(r'\b((?:10|20)\d{9})\b', self.texto_completo)
        if match:
            return match.group(1)
        
        return None
    
    def _extraer_razon_social(self) -> Optional[str]:
        """Extrae razón social"""
        # Buscar después de "RAZÓN SOCIAL" o similar
        match = re.search(
            r'RAZ[OÓ]N\s+SOCIAL\s*:?\s*([A-Z\s\.\,]+)',
            self.texto_completo,
            re.IGNORECASE
        )
        if match:
            return match.group(1).strip()
        
        # Si hay RUC, buscar texto cercano que parezca razón social
        ruc = self._extraer_ruc()
        if ruc:
            # Buscar líneas cercanas al RUC
            lineas = self.texto_completo.split('\n')
            for i, linea in enumerate(lineas):
                if ruc in linea:
                    # Revisar líneas adyacentes
                    for offset in [-1, 0, 1]:
                        idx = i + offset
                        if 0 <= idx < len(lineas):
                            candidato = lineas[idx].strip()
                            if len(candidato) > 10 and candidato.isupper():
                                return candidato
        
        return None
    
    def _extraer_direccion(self) -> Optional[str]:
        """Extrae dirección"""
        match = re.search(
            r'DIRECCI[OÓ]N\s*:?\s*(.+)',
            self.texto_completo,
            re.IGNORECASE
        )
        if match:
            return match.group(1).strip()
        
        return None
    
    def _extraer_moneda(self) -> str:
        """Identifica moneda (PEN o USD)"""
        texto_upper = self.texto_completo.upper()
        
        if any(palabra in texto_upper for palabra in ['DOLAR', 'DOLLAR', 'USD', 'US$', '$']):
            return 'USD'
        
        return 'PEN'  # Por defecto soles
    
    def _extraer_monto(self, patron_label: str) -> Optional[float]:
        """Extrae monto asociado a una etiqueta"""
        # Buscar patrón: LABEL: 1,234.56 o LABEL 1,234.56
        patron = rf'{patron_label}\s*:?\s*S?/?\s*([\d,]+\.?\d*)'
        match = re.search(patron, self.texto_completo, re.IGNORECASE)
        
        if match:
            monto_str = match.group(1).replace(',', '')
            try:
                return float(monto_str)
            except ValueError:
                pass
        
        return None
    
    def _extraer_items(self) -> List[Dict]:
        """Extrae items/productos de la factura"""
        items = []
        
        # Buscar tabla de items (simplificado)
        # En producción, esto requeriría análisis más sofisticado
        lineas = self.texto_completo.split('\n')
        
        for linea in lineas:
            # Buscar líneas que parezcan items (cantidad + descripción + precio)
            # Ejemplo: "2.00 PRODUCTO ABC 150.00 300.00"
            match = re.match(
                r'(\d+\.?\d*)\s+(.{10,}?)\s+([\d,]+\.?\d+)\s+([\d,]+\.?\d+)',
                linea.strip()
            )
            if match:
                cantidad = float(match.group(1))
                descripcion = match.group(2).strip()
                precio_unitario = float(match.group(3).replace(',', ''))
                subtotal = float(match.group(4).replace(',', ''))
                
                items.append({
                    "codigo": "",  # No suele estar en OCR básico
                    "descripcion": descripcion,
                    "cantidad": cantidad,
                    "precio_unitario": precio_unitario,
                    "subtotal": subtotal
                })
        
        return items if items else None


def main():
    """Punto de entrada del script"""
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Uso: python ocr_service.py <ruta_archivo>"
        }))
        sys.exit(1)
    
    archivo = sys.argv[1]
    
    if not Path(archivo).exists():
        print(json.dumps({
            "success": False,
            "error": f"Archivo no encontrado: {archivo}"
        }))
        sys.exit(1)
    
    # Procesar archivo
    ocr = FacturaOCR(archivo)
    resultado = ocr.procesar()
    
    # Retornar JSON
    print(json.dumps(resultado, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
