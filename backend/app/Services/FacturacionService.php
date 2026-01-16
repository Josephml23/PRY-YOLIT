<?php

namespace App\Services;

use App\Models\Empresa;
use App\Models\Comprobante;
use App\Models\ComprobanteItem;
use CodersFree\LaravelGreenter\Facades\Greenter;
use CodersFree\LaravelGreenter\Facades\GreenterReport;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * Servicio de facturación electrónica usando laravel-greenter
 * Basado en el tutorial oficial de CodersFree
 */
class FacturacionService
{
    /**
     * Emitir un comprobante electrónico (ENFOQUE SIMPLIFICADO DEL TUTORIAL)
     *
     * @param array $data Data del comprobante en formato Greenter
     * @param string $tipoComprobante 'invoice', 'note', 'despatch', etc.
     * @return array
     * @throws Exception
     */
    public function emitirComprobante(array $data, string $tipoComprobante = 'invoice')
    {
        DB::beginTransaction();

        try {
            // 1. Validar empresa
            $empresa = Empresa::findOrFail($data['empresa_id']);
            
            // 2. Configurar credenciales dinámicas de la empresa
            $this->configurarEmpresa($empresa);
            
            // 3. Generar serie y correlativo automáticamente si no vienen
            if (empty($data['serie'])) {
                $data['serie'] = $this->generarSerie($data['tipoDoc'] ?? '01', $empresa->id);
            }
            
            if (empty($data['correlativo'])) {
                $data['correlativo'] = $this->generarCorrelativo($data['tipoDoc'] ?? '01', $data['serie'], $empresa->id);
            }

            // 4. ENVIAR A SUNAT (UNA SOLA LÍNEA - COMO EN EL TUTORIAL)
            // Si hay error, el paquete lanza automáticamente GreenterException
            $response = Greenter::send($tipoComprobante, $data);

            // 5. Obtener el documento generado y su nombre
            $document = $response->getDocument();
            $name = $document->getName();

            // 6. Almacenar XML y CDR (COMO EN EL TUTORIAL)
            $xmlPath = "sunat/xml/{$name}.xml";
            $cdrPath = "sunat/cdr/{$name}.zip";
            
            Storage::disk('public')->put($xmlPath, $response->getXml());
            Storage::disk('public')->put($cdrPath, $response->getCdrZip());

            // 7. Generar PDF usando GreenterReport
            $pdf = GreenterReport::generatePdf($document);
            $pdfPath = "sunat/pdf/{$name}.pdf";
            Storage::disk('public')->put($pdfPath, $pdf);

            // 8. Guardar comprobante en base de datos
            $comprobante = $this->guardarComprobante($data, $empresa, $response, [
                'xml_path' => $xmlPath,
                'cdr_path' => $cdrPath,
                'pdf_path' => $pdfPath,
            ]);

            // 9. Guardar items si existen
            if (!empty($data['details'])) {
                $this->guardarItems($comprobante, $data['details']);
            }

            DB::commit();

            return [
                'success' => true,
                'comprobante' => $comprobante,
                'cdr_response' => $response->getCdrResponse(),
                'xml_url' => asset('storage/' . $xmlPath),
                'cdr_url' => asset('storage/' . $cdrPath),
                'pdf_url' => asset('storage/' . $pdfPath),
            ];

        } catch (Exception $e) {
            DB::rollBack();
            
            Log::error('Error al emitir comprobante', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'data' => $data,
            ]);

            throw $e;
        }
    }

    /**
     * Generar representación HTML de un comprobante
     */
    public function generarHtml($comprobanteId): string
    {
        $comprobante = Comprobante::with('items')->findOrFail($comprobanteId);
        
        // Reconstruir data desde comprobante
        $data = $this->reconstruirDataDesdeComprobante($comprobante);
        
        // Configurar empresa
        $this->configurarEmpresa($comprobante->empresa);
        
        // Generar documento nuevamente y obtener HTML
        $response = Greenter::send('invoice', $data);
        $document = $response->getDocument();
        
        return GreenterReport::generateHtml($document);
    }

    /**
     * Configurar empresa emisora dinámicamente
     */
    private function configurarEmpresa(Empresa $empresa): void
    {
        // Configurar las variables de entorno dinámicamente
        config([
            'greenter.company.ruc' => $empresa->ruc,
            'greenter.company.razonSocial' => $empresa->razon_social,
            'greenter.company.nombreComercial' => $empresa->nombre_comercial ?? $empresa->razon_social,
            'greenter.company.address.ubigeo' => $empresa->ubigeo,
            'greenter.company.address.departamento' => $empresa->departamento,
            'greenter.company.address.provincia' => $empresa->provincia,
            'greenter.company.address.distrito' => $empresa->distrito,
            'greenter.company.address.direccion' => $empresa->direccion,
            'greenter.company.clave_sol.user' => $empresa->sol_user,
            'greenter.company.clave_sol.password' => $empresa->sol_password,
            'greenter.mode' => $empresa->modo ?? 'beta',
        ]);
    }

    /**
     * Guardar comprobante en base de datos
     */
    private function guardarComprobante(array $data, Empresa $empresa, $response, array $paths): Comprobante
    {
        return Comprobante::create([
            'empresa_id' => $empresa->id,
            'oportunidad_id' => $data['oportunidad_id'] ?? null,
            'usuario_id' => $data['usuario_id'] ?? null,
            'tipo_doc' => $data['tipoDoc'],
            'serie' => $data['serie'],
            'correlativo' => $data['correlativo'],
            
            // Datos del cliente
            'cliente_tipo_doc' => $data['client']['tipoDoc'],
            'cliente_num_doc' => $data['client']['numDoc'],
            'cliente_razon_social' => $data['client']['rznSocial'],
            'cliente_direccion' => $data['client']['address']['direccion'] ?? null,
            'cliente_email' => $data['client']['email'] ?? null,
            
            // Montos
            'moneda' => $data['tipoMoneda'] ?? 'PEN',
            'mto_oper_gravadas' => $data['mtoOperGravadas'] ?? 0,
            'mto_oper_exoneradas' => $data['mtoOperExoneradas'] ?? 0,
            'mto_oper_inafectas' => $data['mtoOperInafectas'] ?? 0,
            'mto_igv' => $data['mtoIGV'] ?? 0,
            'total_impuestos' => $data['totalImpuestos'] ?? 0,
            'mto_imp_venta' => $data['mtoImpVenta'],
            
            // Fechas
            'fecha_emision' => $data['fechaEmision'] ?? now(),
            'fecha_vencimiento' => $data['fecVencimiento'] ?? null,
            
            // Forma de pago
            'forma_pago' => $data['formaPago']['tipo'] ?? 'Contado',
            'cuotas' => isset($data['formaPago']['cuotas']) ? json_encode($data['formaPago']['cuotas']) : null,
            
            // Respuesta SUNAT
            'estado_sunat' => 'aceptado',
            'codigo_sunat' => $response->getCdrResponse()->getCode(),
            'mensaje_sunat' => $response->getCdrResponse()->getDescription(),
            'hash_cpe' => $response->getHash(),
            
            // Archivos
            'xml_path' => $paths['xml_path'],
            'cdr_path' => $paths['cdr_path'],
            'pdf_path' => $paths['pdf_path'],
            
            // Notas de crédito/débito
            'tipo_doc_relacionado' => $data['tipDocAfectado'] ?? null,
            'serie_relacionado' => isset($data['numDocAfectado']) ? explode('-', $data['numDocAfectado'])[0] : null,
            'correlativo_relacionado' => isset($data['numDocAfectado']) ? explode('-', $data['numDocAfectado'])[1] : null,
            'motivo' => $data['desMotivo'] ?? null,
        ]);
    }

    /**
     * Guardar items del comprobante
     */
    private function guardarItems(Comprobante $comprobante, array $details): void
    {
        foreach ($details as $index => $item) {
            ComprobanteItem::create([
                'comprobante_id' => $comprobante->id,
                'item' => $index + 1,
                'cod_producto' => $item['codProducto'] ?? null,
                'descripcion' => $item['descripcion'],
                'unidad' => $item['unidad'] ?? 'NIU',
                'cantidad' => $item['cantidad'],
                'mto_valor_unitario' => $item['mtoValorUnitario'],
                'mto_valor_venta' => $item['mtoValorVenta'],
                'mto_base_igv' => $item['mtoBaseIgv'] ?? $item['mtoValorVenta'],
                'porcentaje_igv' => $item['porcentajeIgv'] ?? 18,
                'igv' => $item['igv'],
                'tipo_afectacion_igv' => $item['tipAfeIgv'] ?? '10',
                'total_impuestos' => $item['totalImpuestos'] ?? $item['igv'],
                'mto_precio_unitario' => $item['mtoPrecioUnitario'] ?? $item['mtoValorUnitario'],
            ]);
        }
    }

    /**
     * Generar serie para un tipo de documento
     */
    private function generarSerie(string $tipoDoc, int $empresaId): string
    {
        $prefijos = [
            '01' => 'F',    // Factura
            '03' => 'B',    // Boleta
            '07' => 'FC',   // Nota de Crédito
            '08' => 'FD',   // Nota de Débito
            '09' => 'T',    // Guía de Remisión
        ];

        $prefijo = $prefijos[$tipoDoc] ?? 'F';
        
        // Obtener último correlativo de serie
        $ultimaSerie = Comprobante::where('empresa_id', $empresaId)
            ->where('tipo_doc', $tipoDoc)
            ->where('serie', 'like', "{$prefijo}%")
            ->orderBy('serie', 'desc')
            ->value('serie');

        if ($ultimaSerie) {
            $numero = (int) substr($ultimaSerie, strlen($prefijo)) + 1;
        } else {
            $numero = 1;
        }

        return $prefijo . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Generar correlativo para una serie
     */
    private function generarCorrelativo(string $tipoDoc, string $serie, int $empresaId): int
    {
        $ultimoCorrelativo = Comprobante::where('empresa_id', $empresaId)
            ->where('tipo_doc', $tipoDoc)
            ->where('serie', $serie)
            ->max('correlativo');

        return ($ultimoCorrelativo ?? 0) + 1;
    }

    /**
     * Reconstruir data desde comprobante guardado (para regenerar HTML/PDF)
     */
    private function reconstruirDataDesdeComprobante(Comprobante $comprobante): array
    {
        return [
            'tipoDoc' => $comprobante->tipo_doc,
            'serie' => $comprobante->serie,
            'correlativo' => $comprobante->correlativo,
            'fechaEmision' => $comprobante->fecha_emision->format('Y-m-d'),
            'tipoMoneda' => $comprobante->moneda,
            
            'client' => [
                'tipoDoc' => $comprobante->cliente_tipo_doc,
                'numDoc' => $comprobante->cliente_num_doc,
                'rznSocial' => $comprobante->cliente_razon_social,
                'address' => [
                    'direccion' => $comprobante->cliente_direccion ?? '-',
                ],
            ],
            
            'mtoOperGravadas' => $comprobante->mto_oper_gravadas,
            'mtoIGV' => $comprobante->mto_igv,
            'totalImpuestos' => $comprobante->total_impuestos,
            'mtoImpVenta' => $comprobante->mto_imp_venta,
            
            'details' => $comprobante->items->map(function ($item) {
                return [
                    'codProducto' => $item->cod_producto,
                    'unidad' => $item->unidad,
                    'descripcion' => $item->descripcion,
                    'cantidad' => $item->cantidad,
                    'mtoValorUnitario' => $item->mto_valor_unitario,
                    'mtoValorVenta' => $item->mto_valor_venta,
                    'mtoBaseIgv' => $item->mto_base_igv,
                    'porcentajeIgv' => $item->porcentaje_igv,
                    'igv' => $item->igv,
                    'tipAfeIgv' => $item->tipo_afectacion_igv,
                    'totalImpuestos' => $item->total_impuestos,
                    'mtoPrecioUnitario' => $item->mto_precio_unitario,
                ];
            })->toArray(),
        ];
    }

    /**
     * Enviar resumen diario de boletas/notas (RC)
     * No registra información en la tabla de comprobantes, solo almacena XML/CDR.
     */
    public function enviarResumen(array $data): array
    {
        try {
            $empresa = Empresa::findOrFail($data['empresa_id']);

            $this->configurarEmpresa($empresa);

            unset($data['empresa_id']);

            $response = Greenter::send('summary', $data);

            $document = $response->getDocument();
            $name = $document->getName();

            $xmlPath = "sunat/xml/{$name}.xml";
            $cdrPath = "sunat/cdr/{$name}.zip";

            Storage::disk('public')->put($xmlPath, $response->getXml());
            Storage::disk('public')->put($cdrPath, $response->getCdrZip());

            return [
                'success' => true,
                'tipo' => 'summary',
                'nombre' => $name,
                'cdr_response' => $response->getCdrResponse(),
                'xml_url' => asset('storage/' . $xmlPath),
                'cdr_url' => asset('storage/' . $cdrPath),
            ];
        } catch (Exception $e) {
            Log::error('Error al enviar resumen diario', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'data' => $data,
            ]);

            throw $e;
        }
    }

    /**
     * Enviar comunicación de baja (RA)
     * No registra información en la tabla de comprobantes, solo almacena XML/CDR.
     */
    public function comunicarBaja(array $data): array
    {
        try {
            $empresa = Empresa::findOrFail($data['empresa_id']);

            $this->configurarEmpresa($empresa);

            unset($data['empresa_id']);

            $response = Greenter::send('voided', $data);

            $document = $response->getDocument();
            $name = $document->getName();

            $xmlPath = "sunat/xml/{$name}.xml";
            $cdrPath = "sunat/cdr/{$name}.zip";

            Storage::disk('public')->put($xmlPath, $response->getXml());
            Storage::disk('public')->put($cdrPath, $response->getCdrZip());

            return [
                'success' => true,
                'tipo' => 'voided',
                'nombre' => $name,
                'cdr_response' => $response->getCdrResponse(),
                'xml_url' => asset('storage/' . $xmlPath),
                'cdr_url' => asset('storage/' . $cdrPath),
            ];
        } catch (Exception $e) {
            Log::error('Error al enviar comunicacion de baja', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'data' => $data,
            ]);

            throw $e;
        }
    }

    /**
     * Emitir comprobante de retención
     * No registra información en la tabla de comprobantes, solo almacena XML/CDR.
     */
    public function emitirRetencion(array $data): array
    {
        try {
            $empresa = Empresa::findOrFail($data['empresa_id']);

            $this->configurarEmpresa($empresa);

            unset($data['empresa_id']);

            $response = Greenter::send('retention', $data);

            $document = $response->getDocument();
            $name = $document->getName();

            $xmlPath = "sunat/xml/{$name}.xml";
            $cdrPath = "sunat/cdr/{$name}.zip";

            Storage::disk('public')->put($xmlPath, $response->getXml());
            Storage::disk('public')->put($cdrPath, $response->getCdrZip());

            return [
                'success' => true,
                'tipo' => 'retention',
                'nombre' => $name,
                'cdr_response' => $response->getCdrResponse(),
                'xml_url' => asset('storage/' . $xmlPath),
                'cdr_url' => asset('storage/' . $cdrPath),
            ];
        } catch (Exception $e) {
            Log::error('Error al emitir comprobante de retencion', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'data' => $data,
            ]);

            throw $e;
        }
    }

    /**
     * Emitir comprobante de percepción
     * No registra información en la tabla de comprobantes, solo almacena XML/CDR.
     */
    public function emitirPercepcion(array $data): array
    {
        try {
            $empresa = Empresa::findOrFail($data['empresa_id']);

            $this->configurarEmpresa($empresa);

            unset($data['empresa_id']);

            $response = Greenter::send('perception', $data);

            $document = $response->getDocument();
            $name = $document->getName();

            $xmlPath = "sunat/xml/{$name}.xml";
            $cdrPath = "sunat/cdr/{$name}.zip";

            Storage::disk('public')->put($xmlPath, $response->getXml());
            Storage::disk('public')->put($cdrPath, $response->getCdrZip());

            return [
                'success' => true,
                'tipo' => 'perception',
                'nombre' => $name,
                'cdr_response' => $response->getCdrResponse(),
                'xml_url' => asset('storage/' . $xmlPath),
                'cdr_url' => asset('storage/' . $cdrPath),
            ];
        } catch (Exception $e) {
            Log::error('Error al emitir comprobante de percepcion', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'data' => $data,
            ]);

            throw $e;
        }
    }
}
