<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FacturacionService;
use App\Models\Comprobante;
use App\Models\Empresa;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class FacturacionController extends Controller
{
    protected $facturacionService;

    public function __construct(FacturacionService $facturacionService)
    {
        $this->facturacionService = $facturacionService;
    }

    /**
     * Listar comprobantes con filtros
     */
    public function index(Request $request): JsonResponse
    {
        $query = Comprobante::with(['empresa', 'usuario', 'items']);

        // Filtros
        if ($request->has('empresa_id')) {
            $query->where('empresa_id', $request->empresa_id);
        }

        if ($request->has('tipo_doc')) {
            $query->where('tipo_doc', $request->tipo_doc);
        }

        if ($request->has('estado_sunat')) {
            $query->where('estado_sunat', $request->estado_sunat);
        }

        if ($request->has('cliente_num_doc')) {
            $query->where('cliente_num_doc', 'like', "%{$request->cliente_num_doc}%");
        }

        if ($request->has('fecha_desde')) {
            $query->whereDate('fecha_emision', '>=', $request->fecha_desde);
        }

        if ($request->has('fecha_hasta')) {
            $query->whereDate('fecha_emision', '<=', $request->fecha_hasta);
        }

        // Búsqueda por serie-correlativo
        if ($request->has('numero')) {
            $query->where(function($q) use ($request) {
                $q->whereRaw("CONCAT(serie, '-', correlativo) LIKE ?", ["%{$request->numero}%"]);
            });
        }

        // Ordenamiento
        $query->orderBy('fecha_emision', 'desc');

        // Paginación
        $comprobantes = $query->paginate($request->per_page ?? 15);

        return response()->json($comprobantes);
    }

    /**
     * Obtener un comprobante específico
     */
    public function show(string $id): JsonResponse
    {
        $comprobante = Comprobante::with(['empresa', 'usuario', 'items', 'oportunidad'])
            ->findOrFail($id);

        return response()->json([
            'comprobante' => $comprobante,
            'urls' => [
                'xml' => $comprobante->xml_path ? asset('storage/' . $comprobante->xml_path) : null,
                'cdr' => $comprobante->cdr_path ? asset('storage/' . $comprobante->cdr_path) : null,
                'pdf' => $comprobante->pdf_path ? asset('storage/' . $comprobante->pdf_path) : null,
            ],
        ]);
    }

    /**
     * Emitir una factura electrónica
     */
    public function emitirFactura(Request $request): JsonResponse
    {
        $validator = $this->validarFactura($request);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = $request->all();
            $data['tipoDoc'] = '01'; // Factura

            // Llamar al servicio (enfoque simplificado del tutorial)
            $resultado = $this->facturacionService->emitirComprobante($data, 'invoice');

            return response()->json($resultado, 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
            ], 500);
        }
    }

    /**
     * Emitir una boleta electrónica
     */
    public function emitirBoleta(Request $request): JsonResponse
    {
        $validator = $this->validarBoleta($request);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = $request->all();
            $data['tipoDoc'] = '03'; // Boleta

            $resultado = $this->facturacionService->emitirComprobante($data, 'invoice');

            return response()->json($resultado, 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
            ], 500);
        }
    }

    /**
     * Emitir una nota de crédito
     */
    public function emitirNotaCredito(Request $request): JsonResponse
    {
        $validator = $this->validarNotaCredito($request);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = $request->all();
            $data['tipoDoc'] = '07'; // Nota de Crédito

            $resultado = $this->facturacionService->emitirComprobante($data, 'note');

            return response()->json($resultado, 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
            ], 500);
        }
    }

    /**
     * Emitir una nota de débito
     */
    public function emitirNotaDebito(Request $request): JsonResponse
    {
        $validator = $this->validarNotaDebito($request);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = $request->all();
            $data['tipoDoc'] = '08'; // Nota de Débito

            $resultado = $this->facturacionService->emitirComprobante($data, 'note');

            return response()->json($resultado, 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
            ], 500);
        }
    }

    /**
     * Enviar resumen diario (RC)
     */
    public function emitirResumen(Request $request): JsonResponse
    {
        $validator = $this->validarResumen($request);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        return response()->json([
            'success' => false,
            'message' => 'La funcionalidad de resumen diario debe realizarse mediante NubeFact. Use el endpoint /api/nubefact/comprobantes para emisión.',
        ], 501);
    }

    /**
     * Enviar comunicación de baja (RA)
     */
    public function emitirComunicacionBaja(Request $request): JsonResponse
    {
        $validator = $this->validarComunicacionBaja($request);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        return response()->json([
            'success' => false,
            'message' => 'La anulación de comprobantes debe realizarse mediante NubeFact. Use DELETE /api/nubefact/comprobantes/{tipo}/{serie}/{numero}',
        ], 501);
    }

    /**
     * Emitir comprobante de retención
     */
    public function emitirRetencion(Request $request): JsonResponse
    {
        $validator = $this->validarRetencion($request);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        return response()->json([
            'success' => false,
            'message' => 'La emisión de retenciones debe realizarse mediante NubeFact API. Funcionalidad en desarrollo.',
        ], 501);
    }

    /**
     * Emitir comprobante de percepción
     */
    public function emitirPercepcion(Request $request): JsonResponse
    {
        $validator = $this->validarPercepcion($request);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        return response()->json([
            'success' => false,
            'message' => 'La emisión de percepciones debe realizarse mediante NubeFact API. Funcionalidad en desarrollo.',
        ], 501);
    }

    /**
     * Obtener siguiente correlativo
     */
    public function siguienteCorrelativo(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'empresa_id' => 'required|exists:empresas,id',
            'tipo_doc' => 'required|in:01,03,07,08',
            'serie' => 'required|string|max:4',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $ultimo = Comprobante::where('empresa_id', $request->empresa_id)
            ->where('tipo_doc', $request->tipo_doc)
            ->where('serie', $request->serie)
            ->orderBy('correlativo', 'desc')
            ->first();

        $siguiente = $ultimo ? (int) $ultimo->correlativo + 1 : 1;

        return response()->json([
            'serie' => $request->serie,
            'correlativo' => str_pad($siguiente, 8, '0', STR_PAD_LEFT),
            'numero_completo' => $request->serie . '-' . str_pad($siguiente, 8, '0', STR_PAD_LEFT),
        ]);
    }

    /**
     * Descargar XML de un comprobante
     */
    public function descargarXml(string $id)
    {
        $comprobante = Comprobante::findOrFail($id);

        if (!$comprobante->xml_path || !Storage::disk('public')->exists($comprobante->xml_path)) {
            return response()->json([
                'success' => false,
                'message' => 'Archivo XML no disponible.',
            ], 404);
        }

        $fileName = ($comprobante->serie . '-' . $comprobante->correlativo) . '.xml';
        $path = Storage::disk('public')->path($comprobante->xml_path);

        return response()->download($path, $fileName);
    }

    /**
     * Descargar CDR de un comprobante
     */
    public function descargarCdr(string $id)
    {
        $comprobante = Comprobante::findOrFail($id);

        if (!$comprobante->cdr_path || !Storage::disk('public')->exists($comprobante->cdr_path)) {
            return response()->json([
                'success' => false,
                'message' => 'Archivo CDR no disponible.',
            ], 404);
        }

        $fileName = ($comprobante->serie . '-' . $comprobante->correlativo) . '.zip';
        $path = Storage::disk('public')->path($comprobante->cdr_path);

        return response()->download($path, $fileName);
    }

    /**
     * Descargar PDF de un comprobante
     */
    public function descargarPdf(string $id)
    {
        $comprobante = Comprobante::findOrFail($id);

        if (!$comprobante->pdf_path || !Storage::disk('public')->exists($comprobante->pdf_path)) {
            return response()->json([
                'success' => false,
                'message' => 'Archivo PDF no disponible.',
            ], 404);
        }

        $fileName = ($comprobante->serie . '-' . $comprobante->correlativo) . '.pdf';
        $path = Storage::disk('public')->path($comprobante->pdf_path);

        return response()->download($path, $fileName);
    }

    /**
     * Validación para factura
     */
    private function validarFactura(Request $request)
    {
        return Validator::make($request->all(), [
            'empresa_id' => 'required|exists:empresas,id',
            'client.tipoDoc' => 'required|in:6',
            'client.numDoc' => 'required|digits:11',
            'client.rznSocial' => 'required|string|max:255',
            'tipoMoneda' => 'required|in:PEN,USD,EUR',
            'details' => 'required|array|min:1',
            'details.*.descripcion' => 'required|string',
            'details.*.cantidad' => 'required|numeric|min:0',
            'details.*.mtoValorUnitario' => 'required|numeric|min:0',
            'mtoImpVenta' => 'required|numeric|min:0',
        ]);
    }

    /**
     * Validación para boleta
     */
    private function validarBoleta(Request $request)
    {
        return Validator::make($request->all(), [
            'empresa_id' => 'required|exists:empresas,id',
            'client.tipoDoc' => 'required|in:1,4,6,7',
            'client.numDoc' => 'required|string',
            'client.rznSocial' => 'required|string|max:255',
            'tipoMoneda' => 'required|in:PEN,USD,EUR',
            'details' => 'required|array|min:1',
            'details.*.descripcion' => 'required|string',
            'details.*.cantidad' => 'required|numeric|min:0',
            'details.*.mtoValorUnitario' => 'required|numeric|min:0',
            'mtoImpVenta' => 'required|numeric|min:0',
        ]);
    }

    /**
     * Validación para nota de crédito
     */
    private function validarNotaCredito(Request $request)
    {
        return Validator::make($request->all(), [
            'empresa_id' => 'required|exists:empresas,id',
            'tipDocAfectado' => 'required|in:01,03',
            'numDocfectado' => 'required|string',
            'codMotivo' => 'required|string',
            'desMotivo' => 'required|string|max:255',
            'client.tipoDoc' => 'required|string',
            'client.numDoc' => 'required|string',
            'client.rznSocial' => 'required|string|max:255',
            'details' => 'required|array|min:1',
            'mtoImpVenta' => 'required|numeric',
        ]);
    }

    /**
     * Validación para nota de débito
     */
    private function validarNotaDebito(Request $request)
    {
        return Validator::make($request->all(), [
            'empresa_id' => 'required|exists:empresas,id',
            'tipDocAfectado' => 'required|in:01,03',
            'numDocfectado' => 'required|string',
            'codMotivo' => 'required|string',
            'desMotivo' => 'required|string|max:255',
            'client.tipoDoc' => 'required|string',
            'client.numDoc' => 'required|string',
            'client.rznSocial' => 'required|string|max:255',
            'details' => 'required|array|min:1',
            'mtoImpVenta' => 'required|numeric',
        ]);
    }

    /**
     * Validación para resumen diario (RC)
     */
    private function validarResumen(Request $request)
    {
        return Validator::make($request->all(), [
            'empresa_id' => 'required|exists:empresas,id',
            'fecGeneracion' => 'required|date',
            'fecResumen' => 'required|date',
            'correlativo' => 'required|string',
            'details' => 'required|array|min:1',
        ]);
    }

    /**
     * Validación para comunicación de baja (RA)
     */
    private function validarComunicacionBaja(Request $request)
    {
        return Validator::make($request->all(), [
            'empresa_id' => 'required|exists:empresas,id',
            'fecGeneracion' => 'required|date',
            'fecComunicacion' => 'required|date',
            'correlativo' => 'required|string',
            'details' => 'required|array|min:1',
        ]);
    }

    /**
     * Validación para comprobante de retención
     */
    private function validarRetencion(Request $request)
    {
        return Validator::make($request->all(), [
            'empresa_id' => 'required|exists:empresas,id',
            'serie' => 'required|string',
            'correlativo' => 'required|string',
            'fechaEmision' => 'required|date',
            'regimen' => 'required|string',
            'tasa' => 'required|numeric',
            'details' => 'required|array|min:1',
        ]);
    }

    /**
     * Validación para comprobante de percepción
     */
    private function validarPercepcion(Request $request)
    {
        return Validator::make($request->all(), [
            'empresa_id' => 'required|exists:empresas,id',
            'serie' => 'required|string',
            'correlativo' => 'required|string',
            'fechaEmision' => 'required|date',
            'regimen' => 'required|string',
            'tasa' => 'required|numeric',
            'details' => 'required|array|min:1',
        ]);
    }

    /**
     * Estadísticas de facturación
     */
    public function estadisticas(Request $request): JsonResponse
    {
        $empresaId = $request->empresa_id;
        $fechaDesde = $request->fecha_desde ?? now()->startOfMonth();
        $fechaHasta = $request->fecha_hasta ?? now();

        $query = Comprobante::whereBetween('fecha_emision', [$fechaDesde, $fechaHasta]);

        if ($empresaId) {
            $query->where('empresa_id', $empresaId);
        }

        $estadisticas = [
            'total_emitidos' => $query->count(),
            'total_aceptados' => (clone $query)->where('estado_sunat', 'aceptado')->count(),
            'total_rechazados' => (clone $query)->where('estado_sunat', 'rechazado')->count(),
            'total_pendientes' => (clone $query)->where('estado_sunat', 'pendiente')->count(),
            'monto_total' => (clone $query)->where('estado_sunat', 'aceptado')->sum('mto_imp_venta'),
            'facturas' => (clone $query)->where('tipo_doc', '01')->count(),
            'boletas' => (clone $query)->where('tipo_doc', '03')->count(),
            'notas_credito' => (clone $query)->where('tipo_doc', '07')->count(),
            'notas_debito' => (clone $query)->where('tipo_doc', '08')->count(),
        ];

        return response()->json($estadisticas);
    }

    /**
     * Exportar comprobantes a Excel
     */
    public function exportarExcel(Request $request)
    {
        try {
            $query = Comprobante::with(['empresa']);

            // Aplicar los mismos filtros que en index()
            if ($request->has('empresa_id')) {
                $query->where('empresa_id', $request->empresa_id);
            }

            if ($request->has('tipo_doc')) {
                $query->where('tipo_doc', $request->tipo_doc);
            }

            if ($request->has('estado_sunat')) {
                $query->where('estado_sunat', $request->estado_sunat);
            }

            if ($request->has('numero')) {
                $numero = $request->numero;
                $query->where(function($q) use ($numero) {
                    $q->where('serie', 'like', "%{$numero}%")
                      ->orWhere('correlativo', 'like', "%{$numero}%")
                      ->orWhere('cliente_razon_social', 'like', "%{$numero}%");
                });
            }

            if ($request->has('fecha_desde')) {
                $query->whereDate('fecha_emision', '>=', $request->fecha_desde);
            }

            if ($request->has('fecha_hasta')) {
                $query->whereDate('fecha_emision', '<=', $request->fecha_hasta);
            }

            $comprobantes = $query->orderBy('fecha_emision', 'desc')->get();

            // Crear contenido CSV
            $csvContent = "FECHA,TIPO,SERIE,NUMERO,RUC_DNI,DENOMINACION,MONEDA,TOTAL_GRAVADA,TOTAL_GRATUITA,TOTAL_OPERACIONES,PAGADO,ANULADO,ENVIADO_CLIENTE,ESTADO_SUNAT\n";

            foreach ($comprobantes as $c) {
                $csvContent .= sprintf(
                    "%s,%s,%s,%s,%s,\"%s\",%s,%s,%s,%s,%s,%s,%s,%s\n",
                    $c->fecha_emision,
                    $c->tipo_doc === '01' ? 'FACTURA' : ($c->tipo_doc === '03' ? 'BOLETA' : $c->tipo_doc),
                    $c->serie,
                    $c->correlativo,
                    $c->cliente_num_doc,
                    str_replace('"', '""', $c->cliente_razon_social), // Escapar comillas
                    $c->moneda,
                    number_format($c->mto_base_imp ?? $c->mto_imp_venta ?? 0, 2, '.', ''),
                    number_format($c->mto_oper_gratuitas ?? 0, 2, '.', ''),
                    number_format($c->mto_imp_venta ?? 0, 2, '.', ''),
                    $c->pagado ? 'SI' : 'NO',
                    $c->anulado ? 'SI' : 'NO',
                    $c->enviado_cliente ? 'SI' : 'NO',
                    strtoupper($c->estado_sunat ?? 'PENDIENTE')
                );
            }

            // Generar nombre de archivo
            $filename = 'comprobantes_' . date('Y-m-d_H-i-s') . '.csv';

            return response($csvContent, 200)
                ->header('Content-Type', 'text/csv; charset=UTF-8')
                ->header('Content-Disposition', "attachment; filename=\"{$filename}\"")
                ->header('Pragma', 'no-cache')
                ->header('Cache-Control', 'must-revalidate, post-check=0, pre-check=0')
                ->header('Expires', '0');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al exportar: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generar HTML de un comprobante (NUEVO - Según tutorial)
     */
    public function descargarHtml(string $id)
    {
        try {
            $html = $this->facturacionService->generarHtml($id);
            
            return response($html, 200)
                ->header('Content-Type', 'text/html');
                
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
