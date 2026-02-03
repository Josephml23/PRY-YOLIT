<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FacturacionController;
use App\Http\Controllers\Api\EmpresaController;
use App\Http\Controllers\Api\OportunidadController;
use App\Http\Controllers\Api\DocumentoController;
use App\Http\Controllers\Api\PagoController;
use App\Http\Controllers\Api\CatalogoSunatController;
use App\Http\Controllers\Api\AlertaController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EntidadController;
use App\Http\Controllers\Api\NubefactController;
use App\Http\Controllers\Api\NubefactSyncController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\SerieController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rutas de facturación electrónica
Route::prefix('facturacion')->group(function () {
    // Listar y buscar comprobantes
    Route::get('/comprobantes', [FacturacionController::class, 'index']);
    Route::get('/comprobantes/export', [FacturacionController::class, 'exportarExcel']);
    Route::get('/items/export', [FacturacionController::class, 'exportarItems']);
    Route::get('/comprobantes/{id}', [FacturacionController::class, 'show']);
    
    // Emitir comprobantes
    Route::post('/emitir/factura', [FacturacionController::class, 'emitirFactura']);
    Route::post('/emitir/boleta', [FacturacionController::class, 'emitirBoleta']);
    Route::post('/emitir/nota-credito', [FacturacionController::class, 'emitirNotaCredito']);
    Route::post('/emitir/nota-debito', [FacturacionController::class, 'emitirNotaDebito']);
    Route::post('/emitir/resumen', [FacturacionController::class, 'emitirResumen']);
    Route::post('/emitir/comunicacion-baja', [FacturacionController::class, 'emitirComunicacionBaja']);
    Route::post('/emitir/retencion', [FacturacionController::class, 'emitirRetencion']);
    Route::post('/emitir/percepcion', [FacturacionController::class, 'emitirPercepcion']);
    
    // Consultas SUNAT
    Route::get('/consultar/{id}', [FacturacionController::class, 'consultarTicket']);
    Route::get('/descargar/xml/{id}', [FacturacionController::class, 'descargarXml']);
    Route::get('/descargar/cdr/{id}', [FacturacionController::class, 'descargarCdr']);
    Route::get('/descargar/pdf/{id}', [FacturacionController::class, 'descargarPdf']);
    Route::get('/descargar/html/{id}', [FacturacionController::class, 'descargarHtml']); // NUEVO
    Route::post('/enviar-email/{id}', [FacturacionController::class, 'enviarEmail']);
    
    // Estadísticas y reportes
    Route::get('/estadisticas', [FacturacionController::class, 'estadisticas']);
    Route::get('/reporte/ventas', [FacturacionController::class, 'reporteVentas']);
});

// Rutas de emisión y sincronización con NubeFact
Route::prefix('nubefact')->middleware('api')->group(function () {
    // Comprobantes
    Route::post('/comprobantes', [NubefactController::class, 'emitirComprobante']);
    Route::get('/comprobantes/{tipo}/{serie}/{numero}', [NubefactController::class, 'consultarComprobante']);
    Route::delete('/comprobantes/{tipo}/{serie}/{numero}', [NubefactController::class, 'anularComprobante']);
    
    // Guías de remisión
    Route::post('/guias', [NubefactController::class, 'emitirGuia']);
    Route::get('/guias/{tipo}/{serie}/{numero}', [NubefactController::class, 'consultarGuia']);
});

// Rutas para sincronización directa con NubeFact API (sin archivos Excel)
Route::prefix('nubefact-sync')->middleware('api')->group(function () {
    // Verificar estado de conexión
    Route::get('/estado', [NubefactSyncController::class, 'verificarEstado']);
    
    // Estadísticas de sincronización
    Route::get('/estadisticas', [NubefactSyncController::class, 'estadisticas']);
    
    // Consultar comprobante directo (sin guardar)
    Route::get('/consultar/{tipo_doc}/{serie}/{numero}', [NubefactSyncController::class, 'consultarEnNubefact']);
    
    // Sincronizar comprobante específico
    Route::post('/comprobante', [NubefactSyncController::class, 'sincronizarComprobante']);
    
    // Sincronizar rango de comprobantes
    Route::post('/rango', [NubefactSyncController::class, 'sincronizarRango']);
    
    // Sincronizar pendientes
    Route::post('/pendientes', [NubefactSyncController::class, 'sincronizarPendientes']);
});

// Rutas adicionales para futuras implementaciones
Route::prefix('v1')->group(function () {
    // Empresas
    Route::get('empresas', [EmpresaController::class, 'index']);
    Route::post('empresas', [EmpresaController::class, 'store']);
    Route::get('empresas/{id}', [EmpresaController::class, 'show']);
    Route::put('empresas/{id}', [EmpresaController::class, 'update']);
    Route::delete('empresas/{id}', [EmpresaController::class, 'destroy']);
    Route::patch('empresas/{id}/toggle-activo', [EmpresaController::class, 'toggleActivo']);
    Route::patch('empresas/{id}/cambiar-modo', [EmpresaController::class, 'cambiarModo']);
    
    // Oportunidades
    Route::get('oportunidades', [OportunidadController::class, 'index']);
    Route::post('oportunidades', [OportunidadController::class, 'store']);
    Route::get('oportunidades/{id}', [OportunidadController::class, 'show']);
    Route::put('oportunidades/{id}', [OportunidadController::class, 'update']);
    Route::delete('oportunidades/{id}', [OportunidadController::class, 'destroy']);
    Route::patch('oportunidades/{id}/estado', [OportunidadController::class, 'cambiarEstado']);
    Route::get('oportunidades/estadisticas/general', [OportunidadController::class, 'estadisticas']);
    
    // Documentos
    Route::get('documentos', [DocumentoController::class, 'index']);
    Route::post('documentos', [DocumentoController::class, 'store']);
    Route::get('documentos/{id}', [DocumentoController::class, 'show']);
    Route::put('documentos/{id}', [DocumentoController::class, 'update']);
    Route::delete('documentos/{id}', [DocumentoController::class, 'destroy']);
    Route::get('documentos/{id}/descargar', [DocumentoController::class, 'descargar']);
    Route::get('documentos/{id}/url', [DocumentoController::class, 'getUrl']);
    Route::get('documentos/oportunidad/{oportunidadId}', [DocumentoController::class, 'porOportunidad']);
    
    // Pagos
    Route::get('pagos', [PagoController::class, 'index']);
    Route::post('pagos', [PagoController::class, 'store']);
    Route::get('pagos/{id}', [PagoController::class, 'show']);
    Route::put('pagos/{id}', [PagoController::class, 'update']);
    Route::delete('pagos/{id}', [PagoController::class, 'destroy']);
    Route::get('pagos/{id}/comprobante', [PagoController::class, 'descargarComprobante']);
    Route::get('pagos/oportunidad/{oportunidadId}', [PagoController::class, 'porOportunidad']);
    Route::get('pagos/estadisticas/general', [PagoController::class, 'estadisticas']);
    
    // Catálogos SUNAT
    Route::get('catalogos', [CatalogoSunatController::class, 'catalogos']);
    Route::get('catalogos/lista', [CatalogoSunatController::class, 'index']);
    Route::get('catalogos/{catalogo}', [CatalogoSunatController::class, 'show']);
    
    // Alertas
    Route::get('alertas', [AlertaController::class, 'index']);
    Route::patch('alertas/{id}/leida', [AlertaController::class, 'marcarLeida']);
    Route::post('alertas/marcar-todas-leidas', [AlertaController::class, 'marcarTodasLeidas']);
    Route::delete('alertas/{id}', [AlertaController::class, 'destroy']);
    Route::post('alertas/verificar-sla', [AlertaController::class, 'verificarSla']);
    Route::get('alertas/no-leidas', [AlertaController::class, 'noLeidas']);
    
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::get('dashboard/tv', [DashboardController::class, 'tv']);
    Route::get('dashboard/ventas-mes', [DashboardController::class, 'ventasPorMes']);
    Route::get('dashboard/stats', [DashboardController::class, 'getStats']);
    Route::get('dashboard/cpe-ranking', [DashboardController::class, 'getCPERanking']);
    Route::get('dashboard/productos-top', [DashboardController::class, 'getProductosTop']);
    Route::get('dashboard/clientes-top', [DashboardController::class, 'getClientesTop']);
    Route::get('dashboard/stock-minimo', [DashboardController::class, 'getStockMinimo']);
    Route::get('dashboard/monthly-comparison', [DashboardController::class, 'getMonthlyComparison']);

    // Entidades (clientes y proveedores)
    Route::get('entidades', [EntidadController::class, 'index']);
    Route::post('entidades', [EntidadController::class, 'store']);
    Route::get('entidades/{id}', [EntidadController::class, 'show']);
    Route::put('entidades/{id}', [EntidadController::class, 'update']);
    Route::delete('entidades/{id}', [EntidadController::class, 'destroy']);

    // Clientes (alias de entidades marcadas como clientes)
    Route::get('clientes', [EntidadController::class, 'index']);
    Route::post('clientes', [EntidadController::class, 'store']);
    Route::get('clientes/{id}', [EntidadController::class, 'show']);
    Route::put('clientes/{id}', [EntidadController::class, 'update']);
    Route::delete('clientes/{id}', [EntidadController::class, 'destroy']);

    // Series de facturación
    Route::get('/series', [SerieController::class, 'index']);
    Route::post('/series', [SerieController::class, 'store']);
    Route::put('/series/{id}', [SerieController::class, 'update']);
    Route::delete('/series/{id}', [SerieController::class, 'destroy']);
    
    // Productos
    Route::get('productos', [ProductoController::class, 'index']);
    Route::post('productos', [ProductoController::class, 'store']);
    Route::get('productos/destacados', [ProductoController::class, 'destacados']);
    Route::get('productos/{id}', [ProductoController::class, 'show']);
    Route::put('productos/{id}', [ProductoController::class, 'update']);
    Route::delete('productos/{id}', [ProductoController::class, 'destroy']);
    Route::patch('productos/{id}/restaurar', [ProductoController::class, 'restore']);
    Route::patch('productos/{id}/toggle-destacado', [ProductoController::class, 'toggleDestacado']);
    Route::post('productos/importar', [ProductoController::class, 'importar']);
});
