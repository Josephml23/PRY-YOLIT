<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comprobante;
use App\Models\Oportunidad;
use App\Models\Empresa;
use App\Models\Alerta;
use App\Models\Entidad;
use App\Services\SlaService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    protected $slaService;

    public function __construct(SlaService $slaService)
    {
        $this->slaService = $slaService;
    }

    /**
     * Dashboard principal
     */
    public function index(Request $request): JsonResponse
    {
        $empresaId = $request->get('empresa_id');

        // Estadísticas de facturación
        $facturacion = $this->estadisticasFacturacion($empresaId);

        // Estadísticas de oportunidades
        $oportunidades = $this->estadisticasOportunidades($empresaId);

        // SLA
        $sla = $this->slaService->resumenSlas();

        // Alertas
        $alertas = $this->estadisticasAlertas();

        // Clientes (a partir de comprobantes reales)
        $clientes = $this->estadisticasClientes($empresaId);

        return response()->json([
            'success' => true,
            'data' => [
                'facturacion' => $facturacion,
                'oportunidades' => $oportunidades,
                'sla' => $sla,
                'alertas' => $alertas,
                'clientes' => $clientes,
            ]
        ]);
    }

    /**
     * Estadísticas de facturación
     */
    private function estadisticasFacturacion($empresaId = null): array
    {
        $query = Comprobante::query();

        if ($empresaId) {
            $query->where('empresa_id', $empresaId);
        }

        $hoy = now();
        $inicioMes = $hoy->copy()->startOfMonth();
        $finMes = $hoy->copy()->endOfMonth();

        return [
            'total_mes' => $query->whereBetween('fecha_emision', [$inicioMes, $finMes])
                ->sum('mto_imp_venta'),
            'total_aceptados' => $query->where('estado_sunat', 'aceptado')->count(),
            'total_rechazados' => $query->where('estado_sunat', 'rechazado')->count(),
            'total_pendientes' => $query->where('estado_sunat', 'pendiente')->count(),
            'por_tipo' => Comprobante::selectRaw('tipo_doc, count(*) as cantidad, sum(mto_imp_venta) as total')
                ->when($empresaId, fn($q) => $q->where('empresa_id', $empresaId))
                ->groupBy('tipo_doc')
                ->get()
                ->mapWithKeys(fn($item) => [$item->tipo_doc => [
                    'cantidad' => $item->cantidad,
                    'total' => $item->total
                ]]),
        ];
    }

    /**
     * Estadísticas de oportunidades
     */
    private function estadisticasOportunidades($empresaId = null): array
    {
        $query = Oportunidad::query();

        if ($empresaId) {
            $query->where('empresa_id', $empresaId);
        }

        return [
            'total' => $query->count(),
            'activas' => $query->whereNotIn('estado', ['ganado', 'perdido', 'cancelado'])->count(),
            'ganadas' => $query->where('estado', 'ganado')->count(),
            'perdidas' => $query->where('estado', 'perdido')->count(),
            'monto_total' => $query->sum('monto_estimado'),
            'monto_ganado' => $query->where('estado', 'ganado')->sum('monto_estimado'),
            'por_estado' => Oportunidad::selectRaw('estado, count(*) as cantidad')
                ->when($empresaId, fn($q) => $q->where('empresa_id', $empresaId))
                ->groupBy('estado')
                ->get()
                ->pluck('cantidad', 'estado'),
        ];
    }

    /**
     * Estadísticas de alertas
     */
    private function estadisticasAlertas(): array
    {
        return [
            'total_no_leidas' => Alerta::where('leido', false)->count(),
            'por_prioridad' => Alerta::selectRaw('prioridad, count(*) as cantidad')
                ->where('leido', false)
                ->groupBy('prioridad')
                ->get()
                ->pluck('cantidad', 'prioridad'),
        ];
    }

    /**
     * Estadísticas de clientes basadas en comprobantes y entidades
     */
    private function estadisticasClientes($empresaId = null): array
    {
        $query = Comprobante::query();

        if ($empresaId) {
            $query->where('empresa_id', $empresaId);
        }

        $clientes = $query
            ->selectRaw('cliente_tipo_doc, cliente_num_doc, cliente_razon_social, COUNT(*) as cantidad, SUM(mto_imp_venta) as total')
            ->groupBy('cliente_tipo_doc', 'cliente_num_doc', 'cliente_razon_social')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        return [
            'total_clientes' => $clientes->count(),
            'top_clientes' => $clientes,
        ];
    }

    /**
     * Dashboard para TV (modo lectura)
     */
    public function tv(): JsonResponse
    {
        $facturacion = $this->estadisticasFacturacion();
        $oportunidades = $this->estadisticasOportunidades();
        $sla = $this->slaService->resumenSlas();

        // Últimas facturas emitidas
        $ultimasFacturas = Comprobante::with('empresa')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get(['id', 'empresa_id', 'tipo_doc', 'serie', 'correlativo', 'cliente_razon_social', 'mto_imp_venta', 'estado_sunat', 'created_at']);

        // Oportunidades próximas a vencer
        // No existe columna cliente_nombre en la tabla; usamos titulo como identificador visible
        $proximasVencer = Oportunidad::where('fecha_vencimiento', '>', now())
            ->where('fecha_vencimiento', '<=', now()->addDays(7))
            ->whereNotIn('estado', ['ganado', 'perdido', 'cancelado'])
            ->orderBy('fecha_vencimiento')
            ->limit(5)
            ->get(['id', 'titulo', 'estado', 'fecha_vencimiento', 'monto_estimado']);

        return response()->json([
            'success' => true,
            'data' => [
                'facturacion' => $facturacion,
                'oportunidades' => $oportunidades,
                'sla' => $sla,
                'ultimas_facturas' => $ultimasFacturas,
                'proximas_vencer' => $proximasVencer,
            ]
        ]);
    }

    /**
     * Ventas por mes (últimos 12 meses)
     */
    public function ventasPorMes(Request $request): JsonResponse
    {
        $empresaId = $request->get('empresa_id');

        $ventas = Comprobante::selectRaw("
                DATE_FORMAT(fecha_emision, '%Y-%m') as mes,
                SUM(mto_imp_venta) as total,
                COUNT(*) as cantidad
            ")
            ->when($empresaId, fn($q) => $q->where('empresa_id', $empresaId))
            ->where('estado_sunat', 'aceptado')
            ->where('fecha_emision', '>=', now()->subMonths(12))
            ->groupBy('mes')
            ->orderBy('mes')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $ventas
        ]);
    }
}
