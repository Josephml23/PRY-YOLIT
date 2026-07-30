<?php

namespace App\Services\VoiceIA;

use App\Models\Entidad;
use App\Models\Producto;
use App\Models\Serie;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

/**
 * Servicio de extracción de intenciones para comandos de voz de facturación.
 * Procesa comandos estrictamente con IA o datos reales de la BD. Sin datos ficticios.
 */
class VoiceIntentService
{
    /**
     * Analizar el texto transcrito y extraer los datos estructurados.
     */
    public function analizarIntencion(string $texto, ?int $empresaId = 1): array
    {
        // 0. Normalizar palabras numéricas a dígitos en la entrada de voz (ej: "dos" -> "2")
        $textoNormalizado = $this->normalizarNumerosEnTexto($texto);
        $textoTrim = trim($textoNormalizado);
        $textoLower = mb_strtolower($textoTrim, 'UTF-8');

        if (empty($textoTrim)) {
            return $this->generarEstructuraVacia($texto, $empresaId);
        }

        // 1. Intentar análisis estructurado vía LLM (Gemini / OpenAI)
        $llmResult = $this->analizarConLLM($textoTrim);

        if ($llmResult && !empty($llmResult['items'])) {
            $tipoComprobante = $llmResult['tipo_comprobante'] ?? '01';
            $clienteNombreBusqueda = $llmResult['cliente'] ?? '';
            $itemsRaw = $llmResult['items'];
        } else {
            // Análisis heurístico basado en palabras clave reales
            $tipoComprobante = '01'; // Default: Factura
            if (str_contains($textoLower, 'boleta')) {
                $tipoComprobante = '03';
            } elseif (str_contains($textoLower, 'nota de crédito') || str_contains($textoLower, 'nota de credito')) {
                $tipoComprobante = '07';
            } elseif (str_contains($textoLower, 'nota de débito') || str_contains($textoLower, 'nota de debito')) {
                $tipoComprobante = '08';
            }

            $clienteNombreBusqueda = $textoLower;
            $itemsRaw = null;
        }

        // Mapear nombres de tipo de comprobante para SUNAT/NubeFact
        $mapaNombres = [
            '01' => ['nombre' => 'Factura', 'codigo_nubefact' => 1],
            '03' => ['nombre' => 'Boleta de Venta', 'codigo_nubefact' => 2],
            '07' => ['nombre' => 'Nota de Crédito', 'codigo_nubefact' => 3],
            '08' => ['nombre' => 'Nota de Débito', 'codigo_nubefact' => 4],
        ];

        $infoTipo = $mapaNombres[$tipoComprobante] ?? $mapaNombres['01'];
        $tipoNombre = $infoTipo['nombre'];
        $tipoCodigoNubefact = $infoTipo['codigo_nubefact'];

        // 2. Resolver Cliente ÚNICAMENTE si existe en la BD local o se extrajo
        $cliente = $this->resolverCliente($clienteNombreBusqueda, $textoLower);

        // 3. Resolver Productos ÚNICAMENTE si existen en la BD local o en la orden dictada
        $items = $this->resolverProductos($itemsRaw, $textoLower, $empresaId);

        // 4. Obtener Serie activa y correlativo de la BD
        $serieObj = Serie::where('tipo_comprobante', $tipoComprobante)
            ->where('activo', true)
            ->first();

        $serie = $serieObj ? $serieObj->serie : ($tipoComprobante === '01' ? 'F001' : 'B001');
        $correlativoSugerido = $serieObj ? ($serieObj->correlativo_actual + 1) : 1;

        // 5. Cálculos financieros (IGV 18% incluido)
        $totalGravada = 0;
        $totalIgv = 0;
        $totalVenta = 0;

        foreach ($items as &$item) {
            $precioUnitario = (float) $item['precio_unitario'];
            $cantidad = (float) $item['cantidad'];
            
            $totalItem = $precioUnitario * $cantidad;
            $valorUnitario = $precioUnitario / 1.18;
            $subtotalItem = $valorUnitario * $cantidad;
            $igvItem = $totalItem - $subtotalItem;

            $item['valor_unitario'] = round($valorUnitario, 4);
            $item['subtotal'] = round($subtotalItem, 2);
            $item['igv'] = round($igvItem, 2);
            $item['total'] = round($totalItem, 2);

            $totalGravada += $subtotalItem;
            $totalIgv += $igvItem;
            $totalVenta += $totalItem;
        }

        return [
            'empresa_id' => $empresaId,
            'tipo_de_comprobante' => $tipoCodigoNubefact,
            'tipo_comprobante_sunat' => $tipoComprobante,
            'tipo_comprobante_nombre' => $tipoNombre,
            'serie' => $serie,
            'numero' => $correlativoSugerido,
            'fecha_de_emision' => now()->format('Y-m-d'),
            'fecha_de_vencimiento' => now()->format('Y-m-d'),
            'moneda' => 1, // PEN
            'cliente' => $cliente,
            'cliente_tipo_de_documento' => $cliente['tipo_doc'] ?? null,
            'cliente_numero_de_documento' => $cliente['num_doc'] ?? null,
            'cliente_denominacion' => $cliente['razon_social'] ?? null,
            'cliente_direccion' => $cliente['direccion'] ?? null,
            'cliente_email' => $cliente['email'] ?? null,
            'items' => $items,
            'total_gravada' => round($totalGravada, 2),
            'total_igv' => round($totalIgv, 2),
            'total' => round($totalVenta, 2),
            'texto_original' => $texto,
        ];
    }

    /**
     * Normaliza palabras numéricas comunes a dígitos en el texto dictado por voz.
     */
    public function normalizarNumerosEnTexto(string $texto): string
    {
        $mapa = [
            '/\buno\b/ui'       => '1',
            '/\buna\b/ui'       => '1',
            '/\bun\b/ui'        => '1',
            '/\bdos\b/ui'       => '2',
            '/\btres\b/ui'      => '3',
            '/\bcuatro\b/ui'    => '4',
            '/\bcinco\b/ui'     => '5',
            '/\bseis\b/ui'      => '6',
            '/\bsiete\b/ui'     => '7',
            '/\bocho\b/ui'      => '8',
            '/\bnueve\b/ui'     => '9',
            '/\bdiez\b/ui'      => '10',
            '/\bonce\b/ui'      => '11',
            '/\bdoce\b/ui'      => '12',
        ];

        return preg_replace(array_keys($mapa), array_values($mapa), $texto);
    }

    /**
     * Extracción estructurada vía Gemini / OpenAI.
     */
    protected function analizarConLLM(string $texto): ?array
    {
        $geminiKey = config('services.gemini.key') ?? env('GEMINI_API_KEY');
        if (!$geminiKey) return null;

        try {
            $prompt = "Analiza este comando de voz de facturación peruana y responde ÚNICAMENTE un objeto JSON válido sin markdown:\n" .
                "Texto: \"{$texto}\"\n\n" .
                "JSON Schema:\n" .
                "{\n" .
                "  \"tipo_comprobante\": \"01\" (01 para factura, 03 para boleta, 07 para nota de crédito),\n" .
                "  \"cliente\": \"Nombre, RUC, DNI o Carnet de Extranjería mencionado (o null si no hay)\",\n" .
                "  \"items\": [\n" .
                "    { \"producto\": \"nombre del producto o servicio\", \"cantidad\": 1, \"precio\": 0.00 }\n" .
                "  ]\n" .
                "}";

            $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $geminiKey;
            
            $response = Http::timeout(5)->post($url, [
                'contents' => [
                    ['parts' => [['text' => $prompt]]]
                ]
            ]);

            if ($response->successful()) {
                $rawText = $response->json('candidates.0.content.parts.0.text') ?? '';
                $cleanJson = trim(preg_replace('/^```(?:json)?\s*|\s*```$/i', '', trim($rawText)));
                $data = json_decode($cleanJson, true);
                if (is_array($data)) {
                    return $data;
                }
            }
        } catch (Exception $e) {
            Log::warning('Error en consulta LLM VoiceIntentService: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Resolver cliente buscando ÚNICAMENTE coincidencias reales en la BD con búsqueda flexible.
     */
    protected function resolverCliente(string $busqueda, string $textoCompleto): ?array
    {
        // 1. Coincidencia por RUC / DNI / Carnet Extranjería (números o alfanuméricos)
        preg_match_all('/\b([A-Za-z0-9]{8,12})\b/', $textoCompleto, $docMatches);
        if (!empty($docMatches[0])) {
            foreach ($docMatches[0] as $posibleDoc) {
                $entidadPorDoc = Entidad::where(function ($q) use ($posibleDoc) {
                    $q->whereRaw('LOWER(numero_documento) = ?', [mb_strtolower($posibleDoc)])
                      ->orWhereRaw('LOWER(num_doc) = ?', [mb_strtolower($posibleDoc)]);
                })->first();

                if ($entidadPorDoc) {
                    return $this->formatEntidad($entidadPorDoc);
                }
            }
        }

        // 2. Coincidencia por Nombre / Razón Social en la base de datos
        $columnasNombre = array_filter(
            ['razon_social', 'nombre_razon_social', 'nombre', 'denominacion', 'alias', 'nombres'],
            fn($col) => Schema::hasColumn('entidades', $col)
        );

        if (empty($columnasNombre)) {
            return null;
        }

        // Colección de candidatos a buscar (priorizando lo que extrajo el LLM)
        $candidatos = [];
        $busquedaLimpia = trim($busqueda);

        if (!empty($busquedaLimpia)) {
            $candidatos[] = $busquedaLimpia;
        }

        // Si la búsqueda heurística usó todo el texto, filtramos palabras de comando
        $stopWords = ['emitir', 'factura', 'boleta', 'nota', 'de', 'credito', 'debito', 'para', 'el', 'la', 'cliente', 'por', 'soles', 'pen', 'laptop', 'laptops', 'servicio', 'a', 'un', 'una', 'dos', 'tres', 'cuatro', 'cinco'];
        $palabrasDelTexto = array_values(array_filter(
            explode(' ', preg_replace('/[^\w\s]/u', '', $textoCompleto)),
            fn($p) => mb_strlen($p) >= 3 && !in_array(mb_strtolower($p), $stopWords)
        ));

        if (!empty($palabrasDelTexto)) {
            $candidatos[] = implode(' ', $palabrasDelTexto);
        }

        foreach ($candidatos as $termino) {
            $terminoLower = mb_strtolower(trim($termino));
            if (mb_strlen($terminoLower) < 2) continue;

            // A) Coincidencia de la frase completa (insensible a mayúsculas/minúsculas)
            $entidad = Entidad::where(function ($query) use ($columnasNombre, $terminoLower) {
                foreach ($columnasNombre as $col) {
                    $query->orWhereRaw('LOWER(' . $col . ') LIKE ?', ['%' . $terminoLower . '%']);
                }
            })->first();

            if ($entidad) {
                return $this->formatEntidad($entidad);
            }

            // B) Coincidencia término por término (ej: si se dijo "John Smith", busca primero "John" o "Smith")
            $palabrasIndividuales = array_filter(explode(' ', $terminoLower), fn($w) => mb_strlen($w) >= 3);
            if (count($palabrasIndividuales) > 1) {
                foreach ($palabrasIndividuales as $palabra) {
                    $entidadSub = Entidad::where(function ($query) use ($columnasNombre, $palabra) {
                        foreach ($columnasNombre as $col) {
                            $query->orWhereRaw('LOWER(' . $col . ') LIKE ?', ['%' . $palabra . '%']);
                        }
                    })->first();

                    if ($entidadSub) {
                        return $this->formatEntidad($entidadSub);
                    }
                }
            }
        }

        return null;
    }

    /**
 * Resolver productos de la BD o extraer precios reales indicados en el dictado.
 */
protected function resolverProductos(?array $itemsLLM, string $textoCompleto, int $empresaId): array
{
    $itemsEncontrados = [];
    
    // Identificar dinámicamente la columna del nombre del producto
    $columnasNombrePosibles = ['nombre', 'descripcion', 'producto', 'titulo', 'item', 'nombre_producto'];
    $columnaNombreProd = null;
    foreach ($columnasNombrePosibles as $col) {
        if (Schema::hasColumn('productos', $col)) {
            $columnaNombreProd = $col;
            break;
        }
    }
    
    $columnaCodigoProd = Schema::hasColumn('productos', 'codigo') ? 'codigo' : null;
    $tieneEmpresaId = Schema::hasColumn('productos', 'empresa_id');

    // CASO A: Los ítems fueron identificados por el LLM
    if (!empty($itemsLLM) && is_array($itemsLLM)) {
        foreach ($itemsLLM as $itemLLM) {
            $nombreBuscado = mb_strtolower(trim((string) ($itemLLM['producto'] ?? '')), 'UTF-8');
            $cantidad = max(1, (int) ($itemLLM['cantidad'] ?? 1));
            $precioSugerido = (float) ($itemLLM['precio'] ?? 0);

            $prodCoincidente = null;

            if (!empty($nombreBuscado) && $columnaNombreProd) {
                // 1. Intentar Búsqueda Exacta / Frase Completa
                $queryBase = Producto::query();
                if ($tieneEmpresaId && $empresaId) {
                    $queryBase->where('empresa_id', $empresaId);
                }

                $prodCoincidente = (clone $queryBase)
                    ->whereNotNull($columnaNombreProd)
                    ->where(function ($query) use ($nombreBuscado, $columnaNombreProd, $columnaCodigoProd) {
                        $query->whereRaw('LOWER(' . $columnaNombreProd . ') LIKE ?', ['%' . $nombreBuscado . '%']);
                        if ($columnaCodigoProd) {
                            $query->orWhereRaw('LOWER(' . $columnaCodigoProd . ') LIKE ?', ['%' . $nombreBuscado . '%']);
                        }
                    })->first();

                // 2. Si falla, intentar Búsqueda Palabra por Palabra (Palabras Clave)
                if (!$prodCoincidente) {
                    $palabras = array_filter(explode(' ', $nombreBuscado), fn($w) => mb_strlen($w) >= 3);
                    
                    if (!empty($palabras)) {
                        $queryPalabras = clone $queryBase;
                        $queryPalabras->whereNotNull($columnaNombreProd);
                        
                        foreach ($palabras as $palabra) {
                            $queryPalabras->where(function ($q) use ($palabra, $columnaNombreProd, $columnaCodigoProd) {
                                $q->whereRaw('LOWER(' . $columnaNombreProd . ') LIKE ?', ['%' . $palabra . '%']);
                                if ($columnaCodigoProd) {
                                    $q->orWhereRaw('LOWER(' . $columnaCodigoProd . ') LIKE ?', ['%' . $palabra . '%']);
                                }
                            });
                        }
                        $prodCoincidente = $queryPalabras->first();
                    }
                }
            }

            if ($prodCoincidente) {
                $precioBase = (float) ($prodCoincidente->precio_unitario ?? $prodCoincidente->precio ?? $prodCoincidente->precio_venta ?? 0);

                $itemsEncontrados[] = [
                    'id' => $prodCoincidente->id,                           // Clave Primaria imprescindible
                    'producto_id' => $prodCoincidente->id,                  // Referencia para Eloquent / Facturación
                    'codigo' => $columnaCodigoProd ? ($prodCoincidente->{$columnaCodigoProd} ?? 'PROD-' . $prodCoincidente->id) : 'PROD-' . $prodCoincidente->id,
                    'descripcion' => $prodCoincidente->{$columnaNombreProd},
                    'unidad_de_medida' => $prodCoincidente->unidad_medida ?? $prodCoincidente->unidad_medida_codigo ?? 'NIU',
                    'cantidad' => $cantidad,
                    'precio_unitario' => $precioSugerido > 0 ? $precioSugerido : $precioBase,
                    'tipo_de_igv' => 1,
                    'en_inventario' => true,
                ];
            } elseif (!empty($nombreBuscado)) {
                // Producto fuera de inventario
                $itemsEncontrados[] = [
                    'id' => null,
                    'producto_id' => null,
                    'codigo' => 'PROD-VOICE',
                    'descripcion' => mb_convert_case($nombreBuscado, MB_CASE_TITLE, 'UTF-8'),
                    'unidad_de_medida' => 'NIU',
                    'cantidad' => $cantidad,
                    'precio_unitario' => $precioSugerido,
                    'tipo_de_igv' => 1,
                    'en_inventario' => false,
                ];
            }
        }
    }

    // CASO B: Fallback por Regex si el LLM no devolvió ítems
    if (empty($itemsEncontrados)) {
        if (preg_match('/(\d+(?:\.\d{1,2})?)\s*(?:soles|pen|so)/i', $textoCompleto, $pm)) {
            $precioExtraido = (float) $pm[1];

            preg_match('/(?:por|a)?\s*(\d+)\s+([a-zA-Z\s]+?)\s+(?:a|por|\d|\$|soles)/i', $textoCompleto, $m);
            
            $cantidad = isset($m[1]) ? (int) $m[1] : 1;
            $descripcionDictada = !empty($m[2]) ? trim($m[2]) : 'Venta por Comando de Voz';

            $itemsEncontrados[] = [
                'id' => null,
                'producto_id' => null,
                'codigo' => 'SERV-VOICE',
                'descripcion' => mb_convert_case($descripcionDictada, MB_CASE_TITLE, 'UTF-8'),
                'unidad_de_medida' => 'NIU',
                'cantidad' => $cantidad,
                'precio_unitario' => $precioExtraido,
                'tipo_de_igv' => 1,
                'en_inventario' => false,
            ];
        }
    }

    return $itemsEncontrados;
}

    protected function obtenerColumnaNombreEntidad(): ?string
    {
        $columnasPosibles = ['razon_social', 'nombre_razon_social', 'nombre', 'denominacion', 'alias', 'nombres'];
        
        foreach ($columnasPosibles as $columna) {
            if (Schema::hasColumn('entidades', $columna)) {
                return $columna;
            }
        }

        return null;
    }

    protected function formatEntidad(Entidad $entidad): array
    {
        $razonSocial = $entidad->razon_social
            ?? $entidad->nombre_razon_social
            ?? $entidad->nombre
            ?? $entidad->denominacion
            ?? $entidad->alias;

        $numDoc = $entidad->numero_documento
            ?? $entidad->num_doc
            ?? $entidad->documento;

        $tipoDocAttr = $entidad->tipo_documento ?? $entidad->tipo_doc ?? '6';
        $tipoDoc = ($tipoDocAttr === 'RUC' || strlen((string)$numDoc) === 11) ? '6' : '1';

        return [
            'id' => $entidad->id,
            'tipo_doc' => $tipoDoc,
            'num_doc' => (string) $numDoc,
            'razon_social' => (string) $razonSocial,
            'direccion' => $entidad->direccion ?? 'Sin dirección registrada',
            'email' => $entidad->email ?? null,
        ];
    }

    protected function generarEstructuraVacia(string $texto, int $empresaId): array
    {
        return [
            'empresa_id' => $empresaId,
            'tipo_de_comprobante' => 1,
            'tipo_comprobante_sunat' => '01',
            'tipo_comprobante_nombre' => 'Factura',
            'serie' => 'F001',
            'numero' => 1,
            'fecha_de_emision' => now()->format('Y-m-d'),
            'fecha_de_vencimiento' => now()->format('Y-m-d'),
            'moneda' => 1,
            'cliente' => null,
            'cliente_tipo_de_documento' => null,
            'cliente_numero_de_documento' => null,
            'cliente_denominacion' => null,
            'cliente_direccion' => null,
            'cliente_email' => null,
            'items' => [],
            'total_gravada' => 0.00,
            'total_igv' => 0.00,
            'total' => 0.00,
            'texto_original' => $texto,
        ];
    }
}