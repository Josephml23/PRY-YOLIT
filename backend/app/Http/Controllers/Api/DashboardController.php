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
        $fechaDesde = $request->get('fecha_desde');
        $fechaHasta = $request->get('fecha_hasta');
        $clienteNumDoc = $request->get('cliente_num_doc');

        // Estadísticas de facturación
        $facturacion = $this->estadisticasFacturacion($empresaId, $fechaDesde, $fechaHasta, $clienteNumDoc);

        // Estadísticas de oportunidades
        $oportunidades = $this->estadisticasOportunidades($empresaId);

        // SLA
        $sla = $this->slaService->resumenSlas();

        // Alertas
        $alertas = $this->estadisticasAlertas();

        // Clientes (a partir de comprobantes reales)
        $clientes = $this->estadisticasClientes($empresaId, $fechaDesde, $fechaHasta, $clienteNumDoc);

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
     * Optimización: Una sola query con agregaciones condicionales (reduce N+1)
     */
    private function estadisticasFacturacion($empresaId = null, $fechaDesde = null, $fechaHasta = null, $clienteNumDoc = null): array
    {
        // PostgreSQL Best Practice: Single aggregated query instead of multiple clones
        $stats = Comprobante::selectRaw("
            COALESCE(SUM(mto_imp_venta), 0) as total_mes,
            COUNT(CASE WHEN estado_sunat = 'aceptado' THEN 1 END) as total_aceptados,
            COUNT(CASE WHEN estado_sunat = 'rechazado' THEN 1 END) as total_rechazados,
            COUNT(CASE WHEN estado_sunat = 'pendiente' THEN 1 END) as total_pendientes
        ")
            ->when($empresaId, fn($q) => $q->where('empresa_id', $empresaId))
            ->when($clienteNumDoc, fn($q) => $q->where('cliente_num_doc', 'like', "%{$clienteNumDoc}%"))
            ->when($fechaDesde, fn($q) => $q->whereDate('fecha_emision', '>=', $fechaDesde))
            ->when($fechaHasta, fn($q) => $q->whereDate('fecha_emision', '<=', $fechaHasta))
            ->first();

        $totalMes = $stats->total_mes ?? 0;
        $totalAceptados = $stats->total_aceptados ?? 0;
        $totalRechazados = $stats->total_rechazados ?? 0;
        $totalPendientes = $stats->total_pendientes ?? 0;

        $porTipo = Comprobante::selectRaw('tipo_doc, count(*) as cantidad, sum(mto_imp_venta) as total')
            ->when($empresaId, fn($q) => $q->where('empresa_id', $empresaId))
            ->when($clienteNumDoc, fn($q) => $q->where('cliente_num_doc', 'like', "%{$clienteNumDoc}%"))
            ->when($fechaDesde, fn($q) => $q->whereDate('fecha_emision', '>=', $fechaDesde))
            ->when($fechaHasta, fn($q) => $q->whereDate('fecha_emision', '<=', $fechaHasta))
            ->groupBy('tipo_doc')
            ->get()
            ->mapWithKeys(fn($item) => [$item->tipo_doc => [
                'cantidad' => $item->cantidad,
                'total' => $item->total
            ]]);

        return [
            'total_mes' => $totalMes,
            'total_aceptados' => $totalAceptados,
            'total_rechazados' => $totalRechazados,
            'total_pendientes' => $totalPendientes,
            'por_tipo' => $porTipo,
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
    private function estadisticasClientes($empresaId = null, $fechaDesde = null, $fechaHasta = null, $clienteNumDoc = null): array
    {
        $query = Comprobante::query();

        if ($empresaId) {
            $query->where('empresa_id', $empresaId);
        }

        if ($clienteNumDoc) {
            $query->where('cliente_num_doc', 'like', "%{$clienteNumDoc}%");
        }

        if ($fechaDesde) {
            $query->whereDate('fecha_emision', '>=', $fechaDesde);
        }

        if ($fechaHasta) {
            $query->whereDate('fecha_emision', '<=', $fechaHasta);
        }

        // Top clientes según facturación real (a partir de comprobantes)
        $clientes = $query
            ->selectRaw('cliente_tipo_doc, cliente_num_doc, cliente_razon_social, COUNT(*) as cantidad, SUM(mto_imp_venta) as total')
            ->groupBy('cliente_tipo_doc', 'cliente_num_doc', 'cliente_razon_social')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        // Total de clientes/proveedores registrados en la tabla entidades
        $entidadesQuery = Entidad::query();

        if ($empresaId) {
            $entidadesQuery->where('empresa_id', $empresaId);
        }

        $totalRegistros = $entidadesQuery
            ->where(function ($q) {
                $q->where('es_cliente', true)
                  ->orWhere('es_proveedor', true);
            })
            ->count();

        return [
            'total_clientes' => $totalRegistros,
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
        // Best Practice: Select only needed columns, use index on created_at
        $ultimasFacturas = Comprobante::with('empresa:id,razon_social') // Specify empresa columns
            ->select('id', 'empresa_id', 'tipo_doc', 'serie', 'correlativo', 'cliente_razon_social', 'mto_imp_venta', 'estado_sunat', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

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
        $fechaDesde = $request->get('fecha_desde');
        $fechaHasta = $request->get('fecha_hasta');
        $clienteNumDoc = $request->get('cliente_num_doc');

        // PostgreSQL: usamos TO_CHAR para agrupar por año-mes
        $ventas = Comprobante::selectRaw("
            TO_CHAR(fecha_emision, 'YYYY-MM') as mes,
            SUM(mto_imp_venta) as total,
            COUNT(*) as cantidad
            ")
            ->when($empresaId, fn($q) => $q->where('empresa_id', $empresaId))
            ->when($clienteNumDoc, fn($q) => $q->where('cliente_num_doc', 'like', "%{$clienteNumDoc}%"))
            ->when($fechaDesde, fn($q) => $q->whereDate('fecha_emision', '>=', $fechaDesde))
            ->when($fechaHasta, fn($q) => $q->whereDate('fecha_emision', '<=', $fechaHasta))
            ->when(!$fechaDesde && !$fechaHasta, fn($q) => $q->where('fecha_emision', '>=', now()->subMonths(12)))
            ->where('estado_sunat', 'aceptado')
            ->groupBy('mes')
            ->orderBy('mes')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $ventas
        ]);
    }

    /**
     * Dashboard Section 1: Stats con filtros
     * GET /api/dashboard/stats?establecimiento=1&periodo=POR_FECHA&fecha_del=2026-01-15
     */
    public function getStats(Request $request): JsonResponse
    {
        $establecimiento = $request->get('establecimiento', '1');
        $periodo = $request->get('periodo', 'ESTE_MES');
        $fechaDel = $request->get('fecha_del', now()->format('Y-m-d'));

        // Calcular fecha_hasta según período
        $fechaHasta = $this->calcularFechaHasta($periodo, $fechaDel);

        // PostgreSQL Best Practice: Single aggregated query with conditional sums
        // Avoid loading all records into memory then filtering in PHP
        $stats = Comprobante::selectRaw("
            COUNT(*) as cpe_emitidos,
            COALESCE(SUM(CASE WHEN tipo_doc IN ('01', '07', '08') THEN mto_imp_venta ELSE 0 END), 0) as total_cpe,
            COALESCE(SUM(CASE WHEN tipo_doc IN ('01', '07', '08') AND pagado = true THEN mto_imp_venta ELSE 0 END), 0) as cpe_pagado,
            COALESCE(SUM(CASE WHEN tipo_doc IN ('01', '07', '08') AND (pagado = false OR pagado IS NULL) THEN mto_imp_venta ELSE 0 END), 0) as cpe_por_pagar,
            COALESCE(SUM(CASE WHEN tipo_doc = '03' THEN mto_imp_venta ELSE 0 END), 0) as total_notas_venta,
            COALESCE(SUM(CASE WHEN tipo_doc = '03' AND pagado = true THEN mto_imp_venta ELSE 0 END), 0) as notas_venta_pagado,
            COALESCE(SUM(CASE WHEN tipo_doc = '03' AND (pagado = false OR pagado IS NULL) THEN mto_imp_venta ELSE 0 END), 0) as notas_venta_por_pagar,
            COALESCE(SUM(mto_imp_venta), 0) as ingresos
        ")
            ->whereIn('tipo_doc', ['01', '03', '07', '08'])
            ->whereDate('fecha_emision', '>=', $fechaDel)
            ->whereDate('fecha_emision', '<=', $fechaHasta)
            ->where('estado_sunat', 'aceptado')
            ->where(function($q) {
                $q->whereNull('anulado')
                  ->orWhere('anulado', false);
            })
            ->first();

        $cpeEmitidos = $stats->cpe_emitidos;
        $totalCPE = $stats->total_cpe;
        $cpePagado = $stats->cpe_pagado;
        $cpePorPagar = $stats->cpe_por_pagar;
        $totalNotasVenta = $stats->total_notas_venta;
        $notasVentaPagado = $stats->notas_venta_pagado;
        $notasVentaPorPagar = $stats->notas_venta_por_pagar;
        $ingresos = $stats->ingresos;
        $egresos = 0; // TODO: implementar cuando exista módulo de compras
        $utilidadNeta = $ingresos - $egresos;

        // Ventas por hora (para gráfico)
        $ventasPorHora = $this->getVentasPorHora($fechaDel, $fechaHasta);

        return response()->json([
            'cpeEmitidos' => $cpeEmitidos,
            'totalCPE' => round($totalCPE, 2),
            'cpePagado' => round($cpePagado, 2),
            'cpePorPagar' => round($cpePorPagar, 2),
            'cpeTotal' => round($totalCPE, 2),
            'totalNotasVenta' => round($totalNotasVenta, 2),
            'notasVentaPagado' => round($notasVentaPagado, 2),
            'notasVentaPorPagar' => round($notasVentaPorPagar, 2),
            'notasVentaTotal' => round($totalNotasVenta, 2),
            'montoTotalGeneral' => round($ingresos, 2),
            'utilidadNeta' => round($utilidadNeta, 2),
            'ventasPorHora' => $ventasPorHora,
        ]);
    }

    /**
     * Calcular fecha_hasta según el período seleccionado
     */
    private function calcularFechaHasta(string $periodo, string $fechaDel): string
    {
        $fecha = \Carbon\Carbon::parse($fechaDel);

        switch ($periodo) {
            case 'HOY':
                return $fecha->format('Y-m-d');
            case 'ESTA_SEMANA':
                return $fecha->copy()->endOfWeek()->format('Y-m-d');
            case 'ESTE_MES':
                return $fecha->copy()->endOfMonth()->format('Y-m-d');
            case 'ESTE_AÑO':
                return $fecha->copy()->endOfYear()->format('Y-m-d');
            case 'POR_FECHA':
            default:
                // Por defecto, si es POR_FECHA, usar 30 días desde fecha_del
                return $fecha->copy()->addDays(30)->format('Y-m-d');
        }
    }

    /**
     * Obtener ventas por hora del período
     */
    private function getVentasPorHora(string $fechaDel, string $fechaHasta): array
    {
        // Generar array de 24 horas con total = 0
        $ventasPorHora = [];
        for ($hora = 0; $hora < 24; $hora++) {
            $ventasPorHora[] = [
                'hora' => str_pad($hora, 2, '0', STR_PAD_LEFT) . 'h',
                'total' => 0,
            ];
        }

        // Consultar ventas agrupadas por hora
        $ventas = Comprobante::selectRaw("
            EXTRACT(HOUR FROM fecha_emision) as hora,
            SUM(mto_imp_venta) as total
            ")
            ->whereDate('fecha_emision', '>=', $fechaDel)
            ->whereDate('fecha_emision', '<=', $fechaHasta)
            ->where('estado_sunat', 'aceptado')
            ->where(function($q) {
                $q->whereNull('anulado')
                  ->orWhere('anulado', false);
            })
            ->groupBy('hora')
            ->orderBy('hora')
            ->get();

        // Actualizar valores reales
        foreach ($ventas as $venta) {
            $horaIndex = (int)$venta->hora;
            if ($horaIndex >= 0 && $horaIndex < 24) {
                $ventasPorHora[$horaIndex]['total'] = round($venta->total, 2);
            }
        }

        return $ventasPorHora;
    }
}
