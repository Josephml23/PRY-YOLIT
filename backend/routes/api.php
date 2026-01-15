<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FacturacionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rutas de facturación electrónica
Route::prefix('facturacion')->group(function () {
    // Listar y buscar comprobantes
    Route::get('/comprobantes', [FacturacionController::class, 'index']);
    Route::get('/comprobantes/{id}', [FacturacionController::class, 'show']);
    
    // Emitir comprobantes
    Route::post('/emitir/factura', [FacturacionController::class, 'emitirFactura']);
    Route::post('/emitir/boleta', [FacturacionController::class, 'emitirBoleta']);
    Route::post('/emitir/nota-credito', [FacturacionController::class, 'emitirNotaCredito']);
    Route::post('/emitir/nota-debito', [FacturacionController::class, 'emitirNotaDebito']);
    
    // Consultas SUNAT
    Route::get('/consultar/{id}', [FacturacionController::class, 'consultarTicket']);
    Route::get('/descargar/xml/{id}', [FacturacionController::class, 'descargarXml']);
    Route::get('/descargar/cdr/{id}', [FacturacionController::class, 'descargarCdr']);
    Route::get('/descargar/pdf/{id}', [FacturacionController::class, 'descargarPdf']);
    Route::post('/enviar-email/{id}', [FacturacionController::class, 'enviarEmail']);
    
    // Estadísticas y reportes
    Route::get('/estadisticas', [FacturacionController::class, 'estadisticas']);
    Route::get('/reporte/ventas', [FacturacionController::class, 'reporteVentas']);
});

// Rutas adicionales para futuras implementaciones
Route::prefix('v1')->group(function () {
    // Empresas
    // Route::apiResource('empresas', EmpresaController::class);
    
    // Oportunidades
    // Route::apiResource('oportunidades', OportunidadController::class);
    
    // Documentos
    // Route::apiResource('documentos', DocumentoController::class);
    
    // Pagos
    // Route::apiResource('pagos', PagoController::class);
    
    // Catálogos SUNAT
    // Route::get('catalogos/{tipo}', [CatalogoSunatController::class, 'index']);
});
