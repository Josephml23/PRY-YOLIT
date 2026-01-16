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

        return Storage::disk('public')->download($comprobante->xml_path, $fileName);
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

        return Storage::disk('public')->download($comprobante->cdr_path, $fileName);
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

        return Storage::disk('public')->download($comprobante->pdf_path, $fileName);
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
