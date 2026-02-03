<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentoDigitalizado;
use App\Models\Compra;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentoDigitalizadoController extends Controller
{
    /**
     * Listar documentos digitalizados con filtros
     */
    public function index(Request $request)
    {
        $query = DocumentoDigitalizado::where('activo', true);

        // Filtrar por tipo de operación
        if ($request->has('tipo_operacion') && $request->tipo_operacion !== '') {
            $query->where('tipo_operacion', $request->tipo_operacion);
        }

        // Filtrar por estado de procesamiento
        if ($request->has('estado_procesamiento') && $request->estado_procesamiento !== '') {
            $query->where('estado_procesamiento', $request->estado_procesamiento);
        }

        // Filtrar por validación pendiente
        if ($request->has('requiere_validacion') && $request->requiere_validacion !== '') {
            $query->where('requiere_validacion', $request->requiere_validacion === 'true');
        }

        // Filtrar por número de documento
        if ($request->has('numero_documento') && $request->numero_documento !== '') {
            $query->where(function($q) use ($request) {
                $q->where('comprobante_completo', 'ILIKE', '%' . $request->numero_documento . '%')
                  ->orWhere('serie', 'ILIKE', '%' . $request->numero_documento . '%')
                  ->orWhere('numero', 'ILIKE', '%' . $request->numero_documento . '%');
            });
        }

        // Filtrar por entidad (RUC/DNI o razón social)
        if ($request->has('entidad') && $request->entidad !== '') {
            $query->where(function($q) use ($request) {
                $q->where('entidad_num_doc', 'ILIKE', '%' . $request->entidad . '%')
                  ->orWhere('entidad_razon_social', 'ILIKE', '%' . $request->entidad . '%');
            });
        }

        $documentos = $query->orderBy('created_at', 'desc')->get();
        
        return response()->json($documentos);
    }

    /**
     * Subir y procesar documento (PDF o imagen)
     */
    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'archivo' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240', // Max 10MB
            'tipo_operacion' => 'required|in:compra,venta',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $archivo = $request->file('archivo');
            $tipoOperacion = $request->tipo_operacion;
            
            // Generar nombre único para el archivo
            $nombreOriginal = $archivo->getClientOriginalName();
            $extension = $archivo->getClientOriginalExtension();
            $nombreUnico = Str::uuid() . '_' . time() . '.' . $extension;
            
            // Guardar archivo en storage
            $ruta = $archivo->storeAs('documentos_digitalizados/' . $tipoOperacion, $nombreUnico, 'public');
            
            // Crear registro en BD
            $documento = DocumentoDigitalizado::create([
                'nombre_archivo' => $nombreOriginal,
                'ruta_archivo' => $ruta,
                'tipo_archivo' => $extension,
                'tamano_archivo' => $archivo->getSize(),
                'tipo_operacion' => $tipoOperacion,
                'estado_procesamiento' => 'pendiente',
                'created_by' => $request->user()->email ?? 'sistema',
            ]);

            // TODO: Aquí se llamaría al servicio de OCR/procesamiento
            // Por ahora retornamos el documento creado
            $this->procesarDocumentoMock($documento);

            return response()->json([
                'success' => true,
                'data' => $documento,
                'message' => 'Documento subido exitosamente. El procesamiento iniciará en breve.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al subir el documento: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un documento por ID
     */
    public function show($id)
    {
        $documento = DocumentoDigitalizado::find($id);
        
        if (!$documento) {
            return response()->json([
                'success' => false,
                'message' => 'Documento no encontrado'
            ], 404);
        }

        return response()->json($documento);
    }

    /**
     * Actualizar datos extraídos manualmente
     */
    public function update(Request $request, $id)
    {
        $documento = DocumentoDigitalizado::find($id);
        
        if (!$documento) {
            return response()->json([
                'success' => false,
                'message' => 'Documento no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'tipo_comprobante' => 'nullable|string|max:50',
            'serie' => 'nullable|string|max:20',
            'numero' => 'nullable|string|max:20',
            'fecha_emision' => 'nullable|date',
            'entidad_tipo_doc' => 'nullable|string|max:10',
            'entidad_num_doc' => 'nullable|string|max:20',
            'entidad_razon_social' => 'nullable|string|max:255',
            'entidad_direccion' => 'nullable|string|max:500',
            'moneda' => 'nullable|string|max:10',
            'subtotal' => 'nullable|numeric',
            'igv' => 'nullable|numeric',
            'total' => 'nullable|numeric',
            'items_extraidos' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $documento->update($request->all());
            
            // Si se actualiza, generar comprobante_completo
            if ($request->has('serie') && $request->has('numero')) {
                $documento->comprobante_completo = $request->serie . '-' . $request->numero;
                $documento->save();
            }

            return response()->json([
                'success' => true,
                'data' => $documento,
                'message' => 'Documento actualizado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validar y confirmar datos extraídos
     */
    public function validar(Request $request, $id)
    {
        $documento = DocumentoDigitalizado::find($id);
        
        if (!$documento) {
            return response()->json([
                'success' => false,
                'message' => 'Documento no encontrado'
            ], 404);
        }

        try {
            $documento->update([
                'validado' => true,
                'requiere_validacion' => false,
                'fecha_validacion' => now(),
                'validado_por' => $request->user()->email ?? 'sistema',
                'estado_procesamiento' => 'completado',
            ]);

            return response()->json([
                'success' => true,
                'data' => $documento,
                'message' => 'Documento validado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al validar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Convertir documento validado a compra
     */
    public function convertirACompra(Request $request, $id)
    {
        $documento = DocumentoDigitalizado::find($id);
        
        if (!$documento) {
            return response()->json([
                'success' => false,
                'message' => 'Documento no encontrado'
            ], 404);
        }

        if ($documento->tipo_operacion !== 'compra') {
            return response()->json([
                'success' => false,
                'message' => 'El documento no es de tipo compra'
            ], 400);
        }

        if (!$documento->validado) {
            return response()->json([
                'success' => false,
                'message' => 'El documento debe estar validado antes de convertirlo'
            ], 400);
        }

        try {
            // Crear compra desde los datos extraídos
            $compra = Compra::create([
                'actividad' => 'Compra desde documento digitalizado',
                'fecha_actividad' => $documento->fecha_emision ?? now(),
                'proveedor_id' => null, // Buscar o crear proveedor
                'proveedor_nombre' => $documento->entidad_razon_social,
                'proveedor_ruc' => $documento->entidad_num_doc,
                'estado' => 'Pendiente de pago',
                'tipo_comprobante' => $documento->serie ? substr($documento->serie, 0, 1) : 'F',
                'serie_comprobante' => $documento->serie,
                'numero_comprobante' => $documento->numero,
                'comprobante_completo' => $documento->comprobante_completo,
                'tipo_comprobante_desc' => $documento->tipo_comprobante ?? 'FACTURA ELECTRONICA',
                'moneda' => $documento->moneda ?? 'PEN',
                'total' => $documento->total ?? 0,
                'cantidad_productos' => is_array($documento->items_extraidos) ? count($documento->items_extraidos) : 0,
                'activo' => true,
                'created_by' => $request->user()->email ?? 'sistema',
            ]);

            // Vincular documento con compra
            $documento->update([
                'compra_id' => $compra->id,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'compra' => $compra,
                    'documento' => $documento,
                ],
                'message' => 'Compra creada exitosamente desde el documento'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear compra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar documento
     */
    public function destroy($id)
    {
        $documento = DocumentoDigitalizado::find($id);
        
        if (!$documento) {
            return response()->json([
                'success' => false,
                'message' => 'Documento no encontrado'
            ], 404);
        }

        try {
            // Eliminar archivo físico
            if (Storage::disk('public')->exists($documento->ruta_archivo)) {
                Storage::disk('public')->delete($documento->ruta_archivo);
            }

            // Soft delete (marcar como inactivo)
            $documento->update(['activo' => false]);

            return response()->json([
                'success' => true,
                'message' => 'Documento eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mock de procesamiento de documento (simula OCR)
     * En producción, aquí se integraría con un servicio de OCR real
     */
    private function procesarDocumentoMock($documento)
    {
        try {
            // Simular procesamiento con datos de ejemplo
            $datosExtraidos = [
                'raw_text' => 'Texto extraído del documento (OCR)',
                'confidence' => 85.5,
                'processed_at' => now()->toISOString(),
            ];

            // Datos mock de una factura típica
            $documento->update([
                'estado_procesamiento' => 'completado',
                'datos_extraidos' => $datosExtraidos,
                'tipo_comprobante' => 'FACTURA ELECTRONICA',
                'serie' => 'F001',
                'numero' => str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT),
                'comprobante_completo' => 'F001-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT),
                'fecha_emision' => now()->subDays(rand(1, 30)),
                'entidad_tipo_doc' => 'RUC',
                'entidad_num_doc' => '20' . str_pad(rand(100000000, 999999999), 9, '0', STR_PAD_LEFT),
                'entidad_razon_social' => 'EMPRESA EJEMPLO S.A.C.',
                'moneda' => 'PEN',
                'subtotal' => 1000.00,
                'igv' => 180.00,
                'total' => 1180.00,
                'items_extraidos' => [
                    [
                        'codigo' => '001',
                        'descripcion' => 'PRODUCTO 1',
                        'cantidad' => 2,
                        'precio_unitario' => 500.00,
                        'subtotal' => 1000.00,
                    ]
                ],
                'confianza_ocr' => 85.5,
                'requiere_validacion' => true,
            ]);

        } catch (\Exception $e) {
            $documento->update([
                'estado_procesamiento' => 'error',
                'error_mensaje' => $e->getMessage(),
            ]);
        }
    }
}
