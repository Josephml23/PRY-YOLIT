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

class FacturacionService
{
    /**
     * Emitir un comprobante electrónico
     *
     * @param array $data
     * @return array
     */
    public function emitirComprobante(array $data)
    {
        DB::beginTransaction();

        try {
            // 1. Validar empresa
            $empresa = Empresa::findOrFail($data['empresa_id']);
            
            // 2. Generar serie y correlativo si no se proporcionan
            if (empty($data['serie'])) {
                $data['serie'] = $this->generarSerie($data['tipo_doc'], $empresa->id);
            }
            
            if (empty($data['correlativo'])) {
                $data['correlativo'] = $this->generarCorrelativo($data['tipo_doc'], $data['serie'], $empresa->id);
            }

            // 3. Crear registro en base de datos
            $comprobante = $this->crearComprobante($data);

            // 4. Crear ítems del comprobante
            if (!empty($data['details'])) {
                $this->crearItems($comprobante, $data['details']);
            }

            // 5. Preparar data para Greenter
            $greenterData = $this->prepararDataGreenter($comprobante, $data);

            // 6. Configurar empresa emisora dinámicamente
            $greenterConfig = $this->configurarEmpresaGreenter($empresa);

            // 7. Determinar el tipo de documento para envío
            $tipoEnvio = $this->determinarTipoEnvio($data['tipo_doc']);

            // 8. Enviar a SUNAT
            $response = Greenter::setCompany($greenterConfig)->send($tipoEnvio, $greenterData);

            // 9. Procesar respuesta
            $resultado = $this->procesarRespuesta($response, $comprobante);

            DB::commit();

            return [
                'success' => true,
                'comprobante' => $comprobante->fresh(),
                'response' => $resultado,
            ];

        } catch (\Throwable $e) {
            DB::rollBack();
            
            Log::error('Error al emitir comprobante', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $data,
            ]);

            // Actualizar estado si el comprobante fue creado
            if (isset($comprobante)) {
                $comprobante->update([
                    'estado_sunat' => 'rechazado',
                    'mensaje_sunat' => $e->getMessage(),
                ]);
            }

            return [
                'success' => false,
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
            ];
        }
    }

    /**
     * Determinar el tipo de envío según el tipo de documento
     */
    private function determinarTipoEnvio(string $tipoDoc): string
    {
        $tipos = [
            '01' => 'invoice',  // Factura
            '03' => 'invoice',  // Boleta
            '07' => 'note',     // Nota de Crédito
            '08' => 'note',     // Nota de Débito
            '09' => 'despatch', // Guía de Remisión
            '20' => 'retention',// Retención
            '40' => 'perception',// Percepción
        ];

        return $tipos[$tipoDoc] ?? 'invoice';
    }

    /**
     * Crear el registro del comprobante en la base de datos
     */
    private function crearComprobante(array $data): Comprobante
    {
        return Comprobante::create([
            'empresa_id' => $data['empresa_id'],
            'oportunidad_id' => $data['oportunidad_id'] ?? null,
            'usuario_id' => auth()->id() ?? $data['usuario_id'],
            'tipo_doc' => $data['tipo_doc'] ?? $data['tipoDoc'],
            'serie' => $data['serie'],
            'correlativo' => $data['correlativo'],
            'cliente_tipo_doc' => $data['client']['tipoDoc'],
            'cliente_num_doc' => $data['client']['numDoc'],
            'cliente_razon_social' => $data['client']['rznSocial'],
            'cliente_direccion' => $data['client']['address'] ?? null,
            'cliente_email' => $data['client']['email'] ?? null,
            'moneda' => $data['tipoMoneda'] ?? 'PEN',
            'mto_oper_gravadas' => $data['mtoOperGravadas'] ?? 0,
            'mto_oper_exoneradas' => $data['mtoOperExoneradas'] ?? 0,
            'mto_oper_inafectas' => $data['mtoOperInafectas'] ?? 0,
            'mto_oper_exportacion' => $data['mtoOperExportacion'] ?? 0,
            'mto_oper_gratuitas' => $data['mtoOperGratuitas'] ?? 0,
            'mto_igv' => $data['mtoIGV'] ?? 0,
            'mto_isc' => $data['mtoISC'] ?? 0,
            'total_impuestos' => $data['totalImpuestos'] ?? 0,
            'valor_venta' => $data['valorVenta'] ?? 0,
            'sub_total' => $data['subTotal'] ?? 0,
            'redondeo' => $data['redondeo'] ?? 0,
            'mto_imp_venta' => $data['mtoImpVenta'],
            'fecha_emision' => $data['fechaEmision'] ?? now(),
            'fecha_vencimiento' => $data['fecVencimiento'] ?? null,
            'forma_pago' => $data['formaPago']['tipo'] ?? 'Contado',
            'cuotas' => isset($data['formaPago']['cuotas']) ? json_encode($data['formaPago']['cuotas']) : null,
            // Para notas de crédito/débito
            'tipo_doc_relacionado' => $data['tipDocAfectado'] ?? null,
            'serie_relacionado' => isset($data['numDocAfectado']) ? explode('-', $data['numDocAfectado'])[0] : null,
            'correlativo_relacionado' => isset($data['numDocAfectado']) ? explode('-', $data['numDocAfectado'])[1] : null,
            'motivo' => $data['desMotivo'] ?? null,
            'estado_sunat' => 'pendiente',
            'raw_request' => json_encode($data),
        ]);
    }

    /**
     * Crear los ítems del comprobante
     */
    private function crearItems(Comprobante $comprobante, array $details): void
    {
        foreach ($details as $index => $item) {
            ComprobanteItem::create([
                'comprobante_id' => $comprobante->id,
                'item' => $index + 1,
                'codigo_producto' => $item['codProducto'] ?? null,
                'descripcion' => $item['descripcion'],
                'unidad' => $item['unidad'] ?? 'NIU',
                'cantidad' => $item['cantidad'],
                'mto_valor_unitario' => $item['mtoValorUnitario'],
                'mto_precio_unitario' => $item['mtoPrecioUnitario'] ?? $item['mtoValorUnitario'],
                'mto_valor_venta' => $item['mtoValorVenta'],
                'mto_base_igv' => $item['mtoBaseIgv'] ?? 0,
                'porcentaje_igv' => $item['porcentajeIgv'] ?? 18,
                'igv' => $item['igv'] ?? 0,
                'tip_afe_igv' => $item['tipAfeIgv'] ?? '10',
                'isc' => $item['isc'] ?? 0,
                'tip_sis_isc' => $item['tipSisIsc'] ?? null,
                'total_impuestos' => $item['totalImpuestos'] ?? 0,
                'descuento' => $item['descuento'] ?? 0,
            ]);
        }
    }

    /**
     * Preparar data en el formato requerido por Greenter
     */
    private function prepararDataGreenter(Comprobante $comprobante, array $data): array
    {
        $greenterData = [
            'ublVersion' => $data['ublVersion'] ?? '2.1',
            'tipoOperacion' => $data['tipoOperacion'] ?? '0101',
            'tipoDoc' => $comprobante->tipo_doc,
            'serie' => $comprobante->serie,
            'correlativo' => $comprobante->correlativo,
            'fechaEmision' => $comprobante->fecha_emision,
            'tipoMoneda' => $comprobante->moneda,
            'client' => [
                'tipoDoc' => $comprobante->cliente_tipo_doc,
                'numDoc' => $comprobante->cliente_num_doc,
                'rznSocial' => $comprobante->cliente_razon_social,
            ],
        ];

        // Agregar dirección del cliente si existe
        if ($comprobante->cliente_direccion) {
            $greenterData['client']['address'] = $comprobante->cliente_direccion;
        }

        // Para Facturas y Boletas (01, 03)
        if (in_array($comprobante->tipo_doc, ['01', '03'])) {
            $greenterData = array_merge($greenterData, [
                'formaPago' => [
                    'tipo' => $comprobante->forma_pago,
                ],
                'mtoOperGravadas' => (float) $comprobante->mto_oper_gravadas,
                'mtoOperExoneradas' => (float) $comprobante->mto_oper_exoneradas,
                'mtoOperInafectas' => (float) $comprobante->mto_oper_inafectas,
                'mtoOperGratuitas' => (float) $comprobante->mto_oper_gratuitas,
                'mtoIGV' => (float) $comprobante->mto_igv,
                'totalImpuestos' => (float) $comprobante->total_impuestos,
                'valorVenta' => (float) $comprobante->valor_venta,
                'subTotal' => (float) $comprobante->sub_total,
                'mtoImpVenta' => (float) $comprobante->mto_imp_venta,
            ]);

            // Agregar cuotas si es a crédito
            if ($comprobante->forma_pago === 'Credito' && $comprobante->cuotas) {
                $greenterData['formaPago']['cuotas'] = $comprobante->cuotas;
            }

            // Agregar fecha de vencimiento si existe
            if ($comprobante->fecha_vencimiento) {
                $greenterData['fecVencimiento'] = $comprobante->fecha_vencimiento;
            }
        }

        // Para Notas de Crédito y Débito (07, 08)
        if (in_array($comprobante->tipo_doc, ['07', '08'])) {
            $greenterData = array_merge($greenterData, [
                'tipDocAfectado' => $comprobante->tipo_doc_relacionado,
                'numDocfectado' => "{$comprobante->serie_relacionado}-{$comprobante->correlativo_relacionado}",
                'codMotivo' => $data['codMotivo'] ?? '01',
                'desMotivo' => $comprobante->motivo,
                'mtoOperGravadas' => (float) $comprobante->mto_oper_gravadas,
                'mtoOperExoneradas' => (float) $comprobante->mto_oper_exoneradas,
                'mtoOperInafectas' => (float) $comprobante->mto_oper_inafectas,
                'mtoIGV' => (float) $comprobante->mto_igv,
                'totalImpuestos' => (float) $comprobante->total_impuestos,
                'mtoImpVenta' => (float) $comprobante->mto_imp_venta,
            ]);

            // Agregar guías relacionadas si existen
            if (isset($data['guias']) && !empty($data['guias'])) {
                $greenterData['guias'] = $data['guias'];
            }
        }

        // Agregar detalles
        $greenterData['details'] = $data['details'];

        // Agregar leyendas
        $greenterData['legends'] = $data['legends'] ?? [
            [
                'code' => '1000',
                'value' => $this->numeroALetras($comprobante->mto_imp_venta, $comprobante->moneda),
            ],
        ];

        return $greenterData;
    }

    /**
     * Configurar empresa para Greenter de manera dinámica
     */
    private function configurarEmpresaGreenter(Empresa $empresa): array
    {
        return [
            'ruc' => $empresa->ruc,
            'razonSocial' => $empresa->razon_social,
            'nombreComercial' => $empresa->nombre_comercial ?? $empresa->razon_social,
            'address' => [
                'ubigeo' => $empresa->ubigeo,
                'departamento' => $empresa->departamento,
                'provincia' => $empresa->provincia,
                'distrito' => $empresa->distrito,
                'direccion' => $empresa->direccion,
            ],
            'certificate' => $empresa->certificado_path ? storage_path($empresa->certificado_path) : public_path('certs/certificate.pem'),
            'clave_sol' => [
                'user' => $empresa->sol_user,
                'password' => $empresa->sol_password,
            ],
        ];
    }

    /**
     * Procesar la respuesta de SUNAT y almacenar archivos
     */
    private function procesarRespuesta($response, Comprobante $comprobante): array
    {
        $document = $response->getDocument();
        $name = $document->getName();

        // Almacenar XML
        $xmlPath = "sunat/xml/{$name}.xml";
        Storage::put($xmlPath, $response->getXml());

        // Almacenar CDR
        $cdrPath = "sunat/cdr/{$name}.zip";
        Storage::put($cdrPath, $response->getCdrZip());

        // Generar y almacenar PDF
        $pdf = GreenterReport::generatePdf($document);
        $pdfPath = "sunat/pdf/{$name}.pdf";
        Storage::put($pdfPath, $pdf);

        // Leer respuesta CDR
        $cdrResponse = $response->readCdr();

        // Actualizar comprobante
        $comprobante->update([
            'estado_sunat' => 'aceptado',
            'codigo_sunat' => $cdrResponse['code'] ?? null,
            'mensaje_sunat' => $cdrResponse['description'] ?? 'Aceptado',
            'hash_cpe' => $response->getDocument()->getHash() ?? null,
            'xml_path' => $xmlPath,
            'cdr_path' => $cdrPath,
            'pdf_path' => $pdfPath,
            'raw_response' => $cdrResponse,
        ]);

        return [
            'cdrResponse' => $cdrResponse,
            'xml' => Storage::url($xmlPath),
            'cdr' => Storage::url($cdrPath),
            'pdf' => Storage::url($pdfPath),
        ];
    }

    /**
     * Generar serie automática
     */
    private function generarSerie(string $tipoDoc, int $empresaId): string
    {
        $prefijos = [
            '01' => 'F',  // Factura
            '03' => 'B',  // Boleta
            '07' => 'FC', // Nota de Crédito
            '08' => 'FD', // Nota de Débito
        ];

        $prefijo = $prefijos[$tipoDoc] ?? 'F';
        
        return $prefijo . '001';
    }

    /**
     * Generar correlativo automático
     */
    private function generarCorrelativo(string $tipoDoc, string $serie, int $empresaId): string
    {
        $ultimo = Comprobante::where('empresa_id', $empresaId)
            ->where('tipo_doc', $tipoDoc)
            ->where('serie', $serie)
            ->orderBy('correlativo', 'desc')
            ->first();

        $numero = $ultimo ? (int) $ultimo->correlativo + 1 : 1;

        return str_pad($numero, 8, '0', STR_PAD_LEFT);
    }

    /**
     * Convertir número a letras
     */
    private function numeroALetras(float $numero, string $moneda): string
    {
        // Implementación básica - se puede mejorar con una librería
        $monedaTexto = $moneda === 'USD' ? 'DÓLARES AMERICANOS' : 'SOLES';
        $entero = (int) $numero;
        $decimal = round(($numero - $entero) * 100);

        // Aquí deberías implementar la conversión completa de números a letras
        // Por ahora retornamos un formato simplificado
        return strtoupper("SON {$entero} CON {$decimal}/100 {$monedaTexto}");
    }
}
