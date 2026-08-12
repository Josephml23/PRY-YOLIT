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
 *
 * Reglas de negocio (v3):
 * - El cliente DEBE existir en la BD. Si no se encuentra, no se inventa: se marca
 *   'cliente_encontrado' => false y 'cliente_no_encontrado' en los motivos de
 *   confirmación, para que el orquestador le pida al usuario aclarar o registrar.
 * - Los productos se buscan por SIMILITUD de texto contra el inventario real
 *   (no solo substring). Si hay una coincidencia clara, se usa directo. Si hay
 *   varias parecidas, se devuelven como 'opciones' para que el usuario confirme
 *   cuál es ("¿Es LAPTOP LENOVO THINKPAD 9485?"). Si el precio dictado por voz
 *   difiere del precio de inventario, se marca para que el usuario elija cuál usar.
 */
class VoiceIntentService
{
    /**
     * Analizar el texto transcrito y extraer los datos estructurados.
     */
    public function analizarIntencion(string $texto, ?int $empresaId = 1): array
    {
        $textoNormalizado = $this->normalizarNumerosEnTexto($texto);
        $textoTrim = trim($textoNormalizado);
        $textoLower = mb_strtolower($textoTrim, 'UTF-8');

        if (empty($textoTrim)) {
            return $this->generarEstructuraVacia($texto, $empresaId);
        }

        // 1. Intentar análisis estructurado vía LLM (Gemini / OpenAI)
        $llmResult = $this->analizarConLLM($textoTrim);

        if ($llmResult && ! empty($llmResult['items'])) {
            $tipoComprobante = $llmResult['tipo_comprobante'] ?? '01';
            $clienteNombreBusqueda = $llmResult['cliente'] ?? '';
            $itemsRaw = $llmResult['items'];
        } else {
            $heuristica = $this->extraerSegmentosHeuristico($textoNormalizado);
            $tipoComprobante = $heuristica['tipo_comprobante'];
            $clienteNombreBusqueda = $heuristica['cliente'] ?? '';
            $itemsRaw = $heuristica['items'];
        }

        $mapaNombres = [
            '01' => ['nombre' => 'Factura', 'codigo_nubefact' => 1],
            '03' => ['nombre' => 'Boleta de Venta', 'codigo_nubefact' => 2],
            '07' => ['nombre' => 'Nota de Crédito', 'codigo_nubefact' => 3],
            '08' => ['nombre' => 'Nota de Débito', 'codigo_nubefact' => 4],
        ];

        $infoTipo = $mapaNombres[$tipoComprobante] ?? $mapaNombres['01'];
        $tipoNombre = $infoTipo['nombre'];
        $tipoCodigoNubefact = $infoTipo['codigo_nubefact'];

        // 2. Resolver Cliente ÚNICAMENTE si existe en la BD local
        $cliente = $this->resolverCliente($clienteNombreBusqueda, $textoLower);
        $clienteEncontrado = $cliente !== null;

        // 3. Resolver Productos por similitud contra el inventario real
        $items = $this->resolverProductos($itemsRaw, $textoLower, $empresaId);

        // 4. Obtener Serie activa y correlativo de la BD
        $serieObj = Serie::where('tipo_comprobante', $tipoComprobante)
            ->where('activo', true)
            ->first();

        $serie = $serieObj ? $serieObj->serie : ($tipoComprobante === '01' ? 'F001' : 'B001');
        $correlativoSugerido = $serieObj ? ($serieObj->correlativo_actual + 1) : 1;

        $intencion = [
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
            'cliente_encontrado' => $clienteEncontrado,
            'cliente_tipo_de_documento' => $cliente['tipo_doc'] ?? null,
            'cliente_numero_de_documento' => $cliente['num_doc'] ?? null,
            'cliente_denominacion' => $cliente['razon_social'] ?? null,
            'cliente_direccion' => $cliente['direccion'] ?? null,
            'cliente_email' => $cliente['email'] ?? null,
            'items' => $items,
            'texto_original' => $texto,
        ];

        // 5. Cálculos financieros (IGV 18% incluido en el precio unitario)
        $intencion = $this->recalcularTotales($intencion);

        // 6. Validar estrictamente e identificar estados/errores
        $estadoIa = 'ok';
        $detalleError = null;
        $opcionesProducto = null;
        $advertenciaPrecio = null;

        if (!$clienteEncontrado) {
            $estadoIa = 'error_registro_no_encontrado';
            $detalleError = "El cliente '" . ($clienteNombreBusqueda ?: 'desconocido') . "' no se encuentra registrado en la base de datos.";
        } else {
            foreach ($intencion['items'] as $item) {
                if (($item['estado'] ?? '') === 'no_encontrado') {
                    $estadoIa = 'requiere_registro_producto';
                    $detalleError = "El producto '" . $item['descripcion'] . "' no está registrado en el inventario. ¿Deseas registrarlo? Por favor, indícame su precio y stock inicial (por ejemplo: 'registrar con precio 150 y stock 50').";
                    break;
                }
            }

            if ($estadoIa === 'ok') {
                foreach ($intencion['items'] as $item) {
                    if (($item['estado'] ?? '') === 'requiere_confirmacion') {
                        $estadoIa = 'requiere_confirmacion_producto';
                        $opcionesProducto = $item['opciones'] ?? [];
                        break;
                    }
                }
            }

            if ($estadoIa === 'ok') {
                foreach ($intencion['items'] as $item) {
                    if (($item['estado'] ?? '') === 'requiere_confirmacion_precio') {
                        $estadoIa = 'advertencia_precio';
                        $advertenciaPrecio = [
                            'precio_oficial' => $item['precio_inventario'],
                            'precio_dictado' => $item['precio_dictado'],
                            'producto_descripcion' => $item['descripcion'],
                            'producto_id' => $item['id']
                        ];
                        break;
                    }
                }
            }
        }

        $intencion['estado_ia'] = $estadoIa;
        $intencion['detalle_error'] = $detalleError;
        $intencion['opciones_producto'] = $opcionesProducto;
        $intencion['advertencia_precio'] = $advertenciaPrecio;

        // 7. Determinar si se necesita confirmación del usuario antes de emitir
        [$necesitaConfirmacion, $motivos] = $this->evaluarNecesidadDeConfirmacion($clienteEncontrado, $intencion['items']);
        $intencion['necesita_confirmacion_usuario'] = $necesitaConfirmacion || ($estadoIa !== 'ok');
        $intencion['motivos_confirmacion'] = $motivos;

        return $intencion;
    }

    /**
     * Recalcula subtotal/IGV/total de cada ítem y los totales generales.
     * Público porque el orquestador lo vuelve a llamar tras resolver una
     * aclaración (cambio de producto elegido o de precio).
     */
    public function recalcularTotales(array $intencion): array
    {
        $totalGravada = 0;
        $totalIgv = 0;
        $totalVenta = 0;

        $items = $intencion['items'] ?? [];

        foreach ($items as &$item) {
            $precioUnitario = (float) ($item['precio_unitario'] ?? 0);
            $cantidad = (float) ($item['cantidad'] ?? 1);

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
        unset($item);

        $intencion['items'] = $items;
        $intencion['total_gravada'] = round($totalGravada, 2);
        $intencion['total_igv'] = round($totalIgv, 2);
        $intencion['total'] = round($totalVenta, 2);

        return $intencion;
    }

    /**
     * Decide si hace falta pedirle algo más al usuario antes de poder emitir,
     * y por qué (para que el orquestador arme la pregunta correcta).
     * Público: el orquestador lo reutiliza al resolver una aclaración.
     */
    public function evaluarNecesidadDeConfirmacion(bool $clienteEncontrado, array $items): array
    {
        $motivos = [];

        if (! $clienteEncontrado) {
            $motivos[] = 'cliente_no_encontrado';
        }

        if (empty($items)) {
            $motivos[] = 'sin_productos';
        }

        foreach ($items as $item) {
            $estado = $item['estado'] ?? 'exacto';
            if ($estado === 'requiere_confirmacion' && ! in_array('producto_ambiguo', $motivos, true)) {
                $motivos[] = 'producto_ambiguo';
            }
            if ($estado === 'requiere_confirmacion_precio' && ! in_array('precio_diferente', $motivos, true)) {
                $motivos[] = 'precio_diferente';
            }
            if ($estado === 'no_encontrado' && ! in_array('producto_no_encontrado', $motivos, true)) {
                $motivos[] = 'producto_no_encontrado';
            }
        }

        return [! empty($motivos), $motivos];
    }

    /**
     * Reintenta resolver el cliente a partir de una nueva frase (usada por el
     * orquestador cuando el usuario responde a "¿me confirmas el cliente?").
     */
    public function buscarClientePorTexto(string $texto): ?array
    {
        return $this->resolverCliente($texto, mb_strtolower($texto, 'UTF-8'));
    }

    /**
     * Normaliza palabras numéricas comunes a dígitos en el texto dictado por voz.
     *
     * "un/una/uno" son ambiguos: también funcionan como artículos ("una factura").
     * Solo se normalizan a "1" cuando aparecen inmediatamente después de una
     * preposición que indica cantidad ("por una laptop", "de un producto").
     * El resto de palabras (dos..doce) son mucho menos ambiguas y se reemplazan
     * en cualquier posición.
     */
    public function normalizarNumerosEnTexto(string $texto): string
    {
        $texto = preg_replace('/\b(por|de)\s+(un|una|uno)\b/ui', '$1 1', $texto);

        $mapaNumeros = [
            '/\bdos\b/ui' => '2',
            '/\btres\b/ui' => '3',
            '/\bcuatro\b/ui' => '4',
            '/\bcinco\b/ui' => '5',
            '/\bseis\b/ui' => '6',
            '/\bsiete\b/ui' => '7',
            '/\bocho\b/ui' => '8',
            '/\bnueve\b/ui' => '9',
            '/\bdiez\b/ui' => '10',
            '/\bonce\b/ui' => '11',
            '/\bdoce\b/ui' => '12',
        ];

        return preg_replace(array_keys($mapaNumeros), array_values($mapaNumeros), $texto);
    }

    /**
     * Modificar la intención actual con ayuda de LLM.
     */
    public function modificarIntencionConLLM(array $intencionActual, string $textoModificacion): ?array
    {
        $geminiKey = config('services.gemini.key') ?? env('GEMINI_API_KEY');
        if (! $geminiKey) {
            return null;
        }

        $itemsSimplificados = [];
        $items = $intencionActual['items'] ?? [];
        foreach ($items as $item) {
            $itemsSimplificados[] = [
                'producto' => $item['descripcion'] ?? '',
                'cantidad' => $item['cantidad'] ?? 1,
                'precio' => $item['precio_unitario'] ?? $item['precio_dictado'] ?? 0.0,
            ];
        }

        $clienteActual = $intencionActual['cliente']['razon_social'] ?? $intencionActual['cliente_denominacion'] ?? null;

        $datosActuales = [
            'tipo_comprobante' => $intencionActual['tipo_comprobante_sunat'] ?? '01',
            'cliente' => $clienteActual,
            'items' => $itemsSimplificados,
        ];

        try {
            $prompt = "Eres un asistente de facturación electrónica. Tienes una factura/boleta actual con los siguientes datos:\n".
                json_encode($datosActuales, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n".
                "El usuario ha solicitado la siguiente modificación mediante voz/texto:\n".
                "\"{$textoModificacion}\"\n\n".
                "Aplica los cambios solicitados (agregar productos, eliminar productos, cambiar cantidades, precios o el cliente) y responde ÚNICAMENTE con la nueva estructura en formato JSON. No incluyas explicaciones ni markdown:\n".
                "{\n".
                "  \"tipo_comprobante\": \"01\" (factura) o \"03\" (boleta),\n".
                "  \"cliente\": \"nombre del cliente o null\",\n".
                "  \"items\": [\n".
                "    { \"producto\": \"nombre del producto\", \"cantidad\": 1, \"precio\": 0.00 }\n".
                "  ]\n".
                "}";

            $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key='.$geminiKey;

            $response = Http::timeout(15)->post($url, [
                'contents' => [
                    ['parts' => [['text' => $prompt]]],
                ],
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
            Log::warning('Error en modificarIntencionConLLM: '.$e->getMessage());
        }

        return null;
    }

    /**
     * Extracción estructurada vía Gemini / OpenAI.
     */
    protected function analizarConLLM(string $texto): ?array
    {
        $geminiKey = config('services.gemini.key') ?? env('GEMINI_API_KEY');
        if (! $geminiKey) {
            return null;
        }

        try {
            $prompt = "Analiza este comando de voz de facturación peruana y responde ÚNICAMENTE un objeto JSON válido sin markdown:\n".
                "Texto: \"{$texto}\"\n\n".
                "JSON Schema:\n".
                "{\n".
                "  \"tipo_comprobante\": \"01\" (01 para factura, 03 para boleta, 07 para nota de crédito),\n".
                "  \"cliente\": \"Nombre, RUC, DNI o Carnet de Extranjería mencionado (o null si no hay)\",\n".
                "  \"items\": [\n".
                "    { \"producto\": \"nombre del producto o servicio\", \"cantidad\": 1, \"precio\": 0.00 }\n".
                "  ]\n".
                '}';

            $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key='.$geminiKey;

            // Timeout ampliado a 15s: con 5s el free tier de Gemini a veces no
            // alcanza a responder y el servicio caía silenciosamente al heurístico.
            $response = Http::timeout(15)->post($url, [
                'contents' => [
                    ['parts' => [['text' => $prompt]]],
                ],
            ]);

            if ($response->successful()) {
                $rawText = $response->json('candidates.0.content.parts.0.text') ?? '';
                $cleanJson = trim(preg_replace('/^```(?:json)?\s*|\s*```$/i', '', trim($rawText)));
                $data = json_decode($cleanJson, true);
                if (is_array($data)) {
                    return $data;
                }

                Log::warning('Gemini devolvió una respuesta que no se pudo parsear como JSON', [
                    'raw' => $rawText,
                ]);
            } else {
                Log::warning('Gemini respondió con error en VoiceIntentService', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        } catch (Exception $e) {
            Log::warning('Error en consulta LLM VoiceIntentService: '.$e->getMessage());
        }

        return null;
    }

    /**
     * Extrae de forma heurística estructurada los segmentos en español: tipo, cliente, cantidad, producto, precio.
     */
    public function extraerSegmentosHeuristico(string $texto): array
    {
        $textoLower = mb_strtolower($texto, 'UTF-8');
        
        $tipoComprobante = '01'; // Default: Factura
        if (str_contains($textoLower, 'boleta')) {
            $tipoComprobante = '03';
        } elseif (str_contains($textoLower, 'nota de crédito') || str_contains($textoLower, 'nota de credito')) {
            $tipoComprobante = '07';
        } elseif (str_contains($textoLower, 'nota de débito') || str_contains($textoLower, 'nota de debito')) {
            $tipoComprobante = '08';
        }

        // Extraer Cliente
        $clienteNombre = null;
        if (preg_match('/(?:para|a favor de|al cliente|a)\s+([a-z0-9áéíóúñü\s.-]+?)\s+(?:por|con|de|\b\d+\b)/ui', $texto, $matches)) {
            $clienteNombre = trim($matches[1]);
        } elseif (preg_match('/(?:para|a favor de|al cliente|a)\s+([a-z0-9áéíóúñü\s.-]+)$/ui', $texto, $matches)) {
            $clienteNombre = trim($matches[1]);
        }

        // Extraer Producto, Cantidad y Precio del texto restante
        $textoRestante = $texto;
        if ($clienteNombre) {
            $textoRestante = preg_replace('/(?:para|a favor de|al cliente|a)\s+' . preg_quote($clienteNombre, '/') . '/ui', '', $texto);
        }

        $items = [];
        if (preg_match('/\b(\d+)\s+(.+?)\s+(?:a|por|al precio de|a un precio de|cada una|cada uno)\s+(\d+(?:[.,]\d{1,2})?)\b/ui', $textoRestante, $m)) {
            $items[] = [
                'producto' => trim($m[2]),
                'cantidad' => max(1, (int) $m[1]),
                'precio' => (float) str_replace(',', '.', $m[3])
            ];
        } elseif (preg_match('/\b(\d+)\s+(.+)/ui', $textoRestante, $m)) {
            $items[] = [
                'producto' => trim($m[2]),
                'cantidad' => max(1, (int) $m[1]),
                'precio' => 0.0
            ];
        }

        return [
            'tipo_comprobante' => $tipoComprobante,
            'cliente' => $clienteNombre,
            'items' => $items
        ];
    }

    /**
     * Resolver cliente buscando ÚNICAMENTE coincidencias reales en la BD.
     * Devuelve null si no hay ninguna coincidencia — nunca se inventa un cliente.
     */
    protected function resolverCliente(?string $busqueda, string $textoCompleto): ?array
    {
        if (empty($busqueda)) {
            return null;
        }

        $columnasDocumento = array_values(array_filter(
            ['num_doc', 'numero_documento', 'documento'],
            fn ($col) => Schema::hasColumn('entidades', $col)
        ));

        if (! empty($columnasDocumento)) {
            preg_match_all('/\b([A-Za-z0-9]{8,12})\b/', $textoCompleto, $docMatches);

            foreach ($docMatches[0] ?? [] as $posibleDoc) {
                $entidadPorDoc = Entidad::where(function ($q) use ($posibleDoc, $columnasDocumento) {
                    foreach ($columnasDocumento as $col) {
                        $q->orWhereRaw('LOWER('.$col.') = ?', [mb_strtolower($posibleDoc)]);
                    }
                })->first();

                if ($entidadPorDoc) {
                    return $this->formatEntidad($entidadPorDoc);
                }
            }
        }

        $columnasNombre = array_values(array_filter(
            ['razon_social', 'nombre_razon_social', 'nombre', 'denominacion', 'razon_comercial', 'alias', 'nombres'],
            fn ($col) => Schema::hasColumn('entidades', $col)
        ));

        if (empty($columnasNombre)) {
            return null;
        }

        $stopWords = ['emitir', 'factura', 'boleta', 'nota', 'de', 'credito', 'crédito', 'debito', 'débito', 'para', 'el', 'la', 'cliente', 'por', 'soles', 'pen', 'servicio', 'a', 'un', 'una', 'dos', 'tres', 'cuatro', 'cinco'];
        $tokens = array_values(array_filter(
            explode(' ', preg_replace('/[^\w\s]/u', '', mb_strtolower($busqueda))),
            fn ($p) => mb_strlen($p) >= 2 && ! in_array($p, $stopWords, true)
        ));

        if (empty($tokens)) {
            return null;
        }

        $query = Entidad::query();
        $query->where(function ($q) use ($tokens, $columnasNombre) {
            foreach ($tokens as $token) {
                $q->where(function ($sq) use ($token, $columnasNombre) {
                    foreach ($columnasNombre as $col) {
                        $sq->orWhereRaw('LOWER(' . $col . ') LIKE ?', ['%' . $token . '%']);
                    }
                });
            }
        });

        $entidad = $query->first();
        if ($entidad) {
            return $this->formatEntidad($entidad);
        }

        return null;
    }

    /**
     * Resolver productos contra el inventario real usando similitud de texto,
     * no solo coincidencia exacta de substring. Si hay ambigüedad o el precio
     * dictado no coincide con el de inventario, el ítem queda marcado para que
     * el orquestador le pregunte al usuario antes de emitir.
     */
    protected function resolverProductos(?array $itemsLLM, string $textoCompleto, int $empresaId): array
    {
        $itemsEncontrados = [];

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
        $columnaPrecio = null;
        foreach (['precio_venta_unitario', 'precio_unitario', 'precio', 'precio_venta'] as $col) {
            if (Schema::hasColumn('productos', $col)) {
                $columnaPrecio = $col;
                break;
            }
        }

        $itemsCrudos = [];

        if (! empty($itemsLLM) && is_array($itemsLLM)) {
            foreach ($itemsLLM as $itemLLM) {
                $nombre = trim((string) ($itemLLM['producto'] ?? ''));
                if ($nombre === '') {
                    continue;
                }
                $itemsCrudos[] = [
                    'nombre' => $nombre,
                    'cantidad' => max(1, (int) ($itemLLM['cantidad'] ?? 1)),
                    'precio_dictado' => (float) ($itemLLM['precio'] ?? 0),
                ];
            }
        }

        if (empty($itemsCrudos)) {
            if (preg_match('/por\s+(\d+)\s+([a-z0-9áéíóúñü\s.-]+?)\s+(?:a|por|al precio de|a un precio de|cada una|cada uno)\s+(\d+(?:[.,]\d{1,2})?)\s*(?:soles|pen|so|usd)?/ui', $textoCompleto, $m)) {
                $itemsCrudos[] = [
                    'nombre' => trim($m[2]),
                    'cantidad' => max(1, (int) $m[1]),
                    'precio_dictado' => (float) str_replace(',', '.', $m[3]),
                ];
            } elseif (preg_match('/por\s+(\d+)\s+([a-z0-9áéíóúñü\s.-]+?)(?:$|\s+para|\s+a\s+\d+)/ui', $textoCompleto, $m)) {
                $itemsCrudos[] = [
                    'nombre' => trim($m[2]),
                    'cantidad' => max(1, (int) $m[1]),
                    'precio_dictado' => 0.0,
                ];
            }
        }

        if (! $columnaNombreProd) {
            foreach ($itemsCrudos as $crudo) {
                $itemsEncontrados[] = $this->itemFueraDeInventario($crudo);
            }
            return $itemsEncontrados;
        }

        foreach ($itemsCrudos as $crudo) {
            $nombreBuscado = mb_strtolower($crudo['nombre'], 'UTF-8');

            $stopWords = ['de', 'para', 'con', 'un', 'una', 'dos', 'tres', 'soles', 'cada', 'una', 'por', 'emitir', 'factura', 'boleta'];
            $tokens = array_values(array_filter(
                explode(' ', preg_replace('/[^\w\s]/u', '', $nombreBuscado)),
                fn ($w) => mb_strlen($w) >= 2 && ! in_array($w, $stopWords, true)
            ));

            if (empty($tokens)) {
                $itemsEncontrados[] = $this->itemFueraDeInventario($crudo);
                continue;
            }

            $query = Producto::query();
            if ($tieneEmpresaId && $empresaId) {
                $query->where('empresa_id', $empresaId);
            }
            if (Schema::hasColumn('productos', 'activo')) {
                $query->where('activo', true);
            }

            $query->where(function ($q) use ($tokens, $columnaNombreProd, $columnaCodigoProd) {
                foreach ($tokens as $token) {
                    $q->where(function ($sq) use ($token, $columnaNombreProd, $columnaCodigoProd) {
                        $sq->whereRaw('LOWER(' . $columnaNombreProd . ') LIKE ?', ['%' . $token . '%']);
                        if ($columnaCodigoProd) {
                            $sq->orWhereRaw('LOWER(' . $columnaCodigoProd . ') LIKE ?', ['%' . $token . '%']);
                        }
                    });
                }
            });

            $candidatos = $query->get();

            if ($candidatos->isEmpty()) {
                $itemsEncontrados[] = $this->itemFueraDeInventario($crudo);
                continue;
            }

            if ($candidatos->count() === 1) {
                $itemsEncontrados[] = $this->itemDesdeProducto(
                    $candidatos->first(),
                    $crudo,
                    $columnaNombreProd,
                    $columnaCodigoProd,
                    $columnaPrecio
                );
            } else {
                $opciones = $candidatos->map(function ($prod) use ($columnaNombreProd, $columnaCodigoProd, $columnaPrecio) {
                    return [
                        'id' => $prod->id,
                        'descripcion' => $prod->{$columnaNombreProd},
                        'codigo' => $columnaCodigoProd ? $prod->{$columnaCodigoProd} : null,
                        'precio_oficial' => $columnaPrecio ? (float) $prod->{$columnaPrecio} : null,
                    ];
                })->values()->all();

                $itemsEncontrados[] = [
                    'id' => null,
                    'producto_id' => null,
                    'codigo' => 'PROD-VOICE',
                    'descripcion' => mb_convert_case($nombreBuscado, MB_CASE_TITLE, 'UTF-8'),
                    'unidad_de_medida' => 'NIU',
                    'cantidad' => $crudo['cantidad'],
                    'precio_unitario' => $crudo['precio_dictado'],
                    'precio_dictado' => $crudo['precio_dictado'] ?: null,
                    'precio_inventario' => null,
                    'tipo_de_igv' => 1,
                    'en_inventario' => false,
                    'estado' => 'requiere_confirmacion',
                    'opciones' => $opciones,
                ];
            }
        }

        return $itemsEncontrados;
    }

    protected function itemDesdeProducto($prod, array $crudo, string $columnaNombreProd, ?string $columnaCodigoProd, ?string $columnaPrecio): array
    {
        $precioInventario = $columnaPrecio ? (float) $prod->{$columnaPrecio} : 0.0;
        $precioDictado = $crudo['precio_dictado'];

        $requiereConfirmacionPrecio = $precioDictado > 0
            && $precioInventario > 0
            && round($precioDictado, 2) !== round($precioInventario, 2);

        $precioAUsar = $precioInventario > 0 ? $precioInventario : $precioDictado;

        return [
            'id' => $prod->id,
            'producto_id' => $prod->id,
            'codigo' => $columnaCodigoProd ? ($prod->{$columnaCodigoProd} ?? ('PROD-'.$prod->id)) : ('PROD-'.$prod->id),
            'descripcion' => $prod->{$columnaNombreProd},
            'unidad_de_medida' => $prod->unidad_medida ?? 'NIU',
            'cantidad' => $crudo['cantidad'],
            'precio_unitario' => $precioAUsar,
            'precio_dictado' => $precioDictado ?: null,
            'precio_inventario' => $precioInventario ?: null,
            'tipo_de_igv' => 1,
            'en_inventario' => true,
            'estado' => $requiereConfirmacionPrecio ? 'requiere_confirmacion_precio' : 'exacto',
        ];
    }

    protected function itemFueraDeInventario(array $crudo): array
    {
        return [
            'id' => null,
            'producto_id' => null,
            'codigo' => 'PROD-VOICE',
            'descripcion' => mb_convert_case(mb_strtolower($crudo['nombre'], 'UTF-8'), MB_CASE_TITLE, 'UTF-8'),
            'unidad_de_medida' => 'NIU',
            'cantidad' => $crudo['cantidad'],
            'precio_unitario' => $crudo['precio_dictado'],
            'precio_dictado' => $crudo['precio_dictado'] ?: null,
            'precio_inventario' => null,
            'tipo_de_igv' => 1,
            'en_inventario' => false,
            'estado' => 'no_encontrado',
        ];
    }

    protected function formatEntidad(Entidad $entidad): array
    {
        $razonSocial = $entidad->razon_social
            ?? $entidad->nombre_razon_social
            ?? $entidad->nombre
            ?? $entidad->denominacion
            ?? $entidad->razon_comercial
            ?? $entidad->alias;

        $numDoc = $entidad->num_doc
            ?? $entidad->numero_documento
            ?? $entidad->documento;

        $tipoDocAttr = $entidad->tipo_doc ?? $entidad->tipo_documento ?? '6';
        $tipoDoc = ($tipoDocAttr === 'RUC' || strlen((string) $numDoc) === 11) ? '6' : (string) $tipoDocAttr;

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
            'cliente_encontrado' => false,
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
            'necesita_confirmacion_usuario' => true,
            'motivos_confirmacion' => ['sin_productos'],
        ];
    }
}