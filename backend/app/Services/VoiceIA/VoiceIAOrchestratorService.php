<?php

namespace App\Services\VoiceIA;

use App\Models\VoiceConversacion;
use App\Models\VoiceMensaje;
use App\Services\ComprobanteEmissionService;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

/**
 * Orquestador principal del flujo Voice IA sin simulaciones.
 * Conecta STT -> Intención (IA) -> Aclaración (si hace falta) -> Confirmación -> ComprobanteEmissionService.
 *
 * v2: antes, si el cliente no existía o el producto era ambiguo, el sistema
 * igual armaba un ítem genérico y pedía confirmar sin avisar del problema.
 * Ahora, cuando VoiceIntentService marca 'necesita_confirmacion_usuario', la
 * conversación entra en estado 'necesita_aclaracion' y se le hace al usuario
 * una pregunta concreta (elegir producto entre opciones parecidas, decidir
 * qué precio usar, o confirmar/corregir el cliente) antes de dejarlo emitir.
 */
class VoiceIAOrchestratorService
{
    protected SpeechToTextService $sttService;

    protected VoiceIntentService $intentService;

    protected TextToSpeechService $ttsService;

    protected ComprobanteEmissionService $emissionService;

    public function __construct(
        SpeechToTextService $sttService,
        VoiceIntentService $intentService,
        TextToSpeechService $ttsService,
        ComprobanteEmissionService $emissionService
    ) {
        $this->sttService = $sttService;
        $this->intentService = $intentService;
        $this->ttsService = $ttsService;
        $this->emissionService = $emissionService;
    }

    /**
     * Transcribir un archivo de audio directamente sin analizar intenciones ni guardar en BD.
     */
    public function transcribirAudio(UploadedFile $audioFile): string
    {
        $transcripcionData = $this->sttService->transcribir($audioFile);

        return trim($transcripcionData['texto'] ?? '');
    }

    /**
     * Procesar audio o texto de comando por voz. Según el estado de la
     * conversación pendiente (si hay una), decide si es un comando nuevo,
     * una confirmación, una cancelación, o la respuesta a una aclaración.
     */
    public function procesarComando(UploadedFile|string $input, ?int $conversacionIdPendiente = null, ?int $usuarioId = null): array
    {
        $startTime = microtime(true);

        if ($input instanceof UploadedFile) {
            $transcripcionData = $this->sttService->transcribir($input);
            $textoComando = trim($transcripcionData['texto'] ?? '');
            $tiempoSTT = $transcripcionData['duracion_ms'] ?? 0;
        } else {
            $textoComando = trim((string) $input);
            $tiempoSTT = 0;
        }

        if (empty($textoComando) || $textoComando === '(Audio procesado pero no se detectó texto claro)') {
            $mensajeErrorVoz = 'No logré escuchar lo que dijiste. Por favor, mantén presionado el botón y habla claramente.';

            return [
                'conversacion_id' => $conversacionIdPendiente,
                'estado' => 'audio_no_entendido',
                'transcripcion' => '',
                'asistente_respuesta' => $mensajeErrorVoz,
                'tts' => $this->ttsService->sintetizarVoz($mensajeErrorVoz),
                'intencion' => null,
                'tiempo_procesamiento_ms' => round((microtime(true) - $startTime) * 1000),
            ];
        }

        $textoLower = mb_strtolower($textoComando, 'UTF-8');

        // Si hay una conversación pendiente, decidir qué representa este mensaje
        if ($conversacionIdPendiente) {
            $conversacionPendiente = VoiceConversacion::find($conversacionIdPendiente);

            if ($conversacionPendiente && in_array($conversacionPendiente->estado, ['necesita_aclaracion', 'esperando_confirmacion'], true)) {
                $esCancelacion = in_array($textoLower, ['cancelar', 'no', 'anular'], true);

                if ($esCancelacion) {
                    $this->cancelarConversacion($conversacionIdPendiente);
                    $msg = 'Listo, cancelé la operación.';

                    return [
                        'conversacion_id' => $conversacionIdPendiente,
                        'estado' => 'cancelada',
                        'transcripcion' => $textoComando,
                        'asistente_respuesta' => $msg,
                        'tts' => $this->ttsService->sintetizarVoz($msg),
                        'intencion' => null,
                        'tiempo_procesamiento_ms' => round((microtime(true) - $startTime) * 1000),
                    ];
                }

                // La conversación está esperando que el usuario aclare algo
                // (cliente, producto ambiguo o precio) — esta respuesta es esa aclaración.
                if ($conversacionPendiente->estado === 'necesita_aclaracion') {
                    return $this->resolverAclaracion($conversacionIdPendiente, $textoComando, $startTime);
                }

                // Está esperando confirmación final para emitir
                $esComandoConfirmacion = in_array($textoLower, ['si', 'sí', 'confirmar', 'emitir', 'sí emitir', 'si emitir', 'sí confirmar', 'si confirmar', 'aceptar', 'proceder'], true)
                    || str_contains($textoLower, 'confirmar') || str_contains($textoLower, 'emitir');

                if ($esComandoConfirmacion) {
                    return $this->confirmarEmision($conversacionIdPendiente, null, $usuarioId);
                }
            }
        }

        // Comando nuevo: extraer la intención completa
        $intencion = $this->intentService->analizarIntencion($textoComando);
        $tiempoProcesamiento = round((microtime(true) - $startTime) * 1000);

        return $this->procesarIntencionNueva($intencion, $textoComando, $tiempoSTT, $tiempoProcesamiento, $input, $usuarioId);
    }

    /**
     * A partir de una intención recién extraída, decide si se puede pasar
     * directo a "esperando confirmación" o si hace falta aclarar algo primero.
     */
    protected function procesarIntencionNueva(array $intencion, string $textoComando, $tiempoSTT, $tiempoProcesamiento, $inputOriginal, ?int $usuarioId): array
    {
        // Si ni siquiera se pudo extraer un cliente candidato ni ningún producto,
        // no tiene sentido abrir una conversación: se le pide repetir el comando.
        if (empty($intencion['items']) && empty($intencion['texto_original'])) {
            $mensajeIncompleto = "Escuché: \"{$textoComando}\", pero no pude identificar nada claro. ¿Puedes repetirlo con el nombre del cliente y el producto?";

            return [
                'conversacion_id' => null,
                'estado' => 'intencion_incompleta',
                'transcripcion' => $textoComando,
                'asistente_respuesta' => $mensajeIncompleto,
                'tts' => $this->ttsService->sintetizarVoz($mensajeIncompleto),
                'intencion' => $intencion,
                'tiempo_procesamiento_ms' => $tiempoProcesamiento,
            ];
        }

        $estadoIa = $intencion['estado_ia'] ?? 'ok';
        
        if ($estadoIa === 'error_registro_no_encontrado') {
            $conversacion = VoiceConversacion::create([
                'usuario_id' => $usuarioId ?? auth()->id() ?? 1,
                'entidad_id' => null,
                'estado' => 'error',
                'tipo_comprobante_sugerido' => $intencion['tipo_comprobante_sunat'] ?? '01',
                'payload_intencion' => $intencion,
                'tiempo_transcripcion_ms' => $tiempoSTT,
                'tiempo_procesamiento_ms' => $tiempoProcesamiento,
                'error_mensaje' => $intencion['detalle_error'],
            ]);

            VoiceMensaje::create([
                'conversacion_id' => $conversacion->id,
                'rol' => 'user',
                'tipo' => $inputOriginal instanceof UploadedFile ? 'audio' : 'text',
                'texto' => $textoComando,
                'payload_intencion' => $intencion,
            ]);

            $asistenteRespuesta = $intencion['detalle_error'];
            VoiceMensaje::create([
                'conversacion_id' => $conversacion->id,
                'rol' => 'assistant',
                'tipo' => 'text',
                'texto' => $asistenteRespuesta,
            ]);

            return [
                'conversacion_id' => $conversacion->id,
                'estado' => 'error_registro_no_encontrado',
                'transcripcion' => $textoComando,
                'asistente_respuesta' => $asistenteRespuesta,
                'tts' => $this->ttsService->sintetizarVoz($asistenteRespuesta),
                'intencion' => $intencion,
                'tiempo_procesamiento_ms' => $tiempoProcesamiento,
            ];
        }

        if ($estadoIa === 'requiere_registro_producto') {
            $conversacion = VoiceConversacion::create([
                'usuario_id' => $usuarioId ?? auth()->id() ?? 1,
                'entidad_id' => $intencion['cliente']['id'] ?? null,
                'estado' => 'necesita_aclaracion',
                'tipo_comprobante_sugerido' => $intencion['tipo_comprobante_sunat'] ?? '01',
                'payload_intencion' => $intencion,
                'tiempo_transcripcion_ms' => $tiempoSTT,
                'tiempo_procesamiento_ms' => $tiempoProcesamiento,
                'error_mensaje' => $intencion['detalle_error'],
            ]);

            VoiceMensaje::create([
                'conversacion_id' => $conversacion->id,
                'rol' => 'user',
                'tipo' => $inputOriginal instanceof UploadedFile ? 'audio' : 'text',
                'texto' => $textoComando,
                'payload_intencion' => $intencion,
            ]);

            $asistenteRespuesta = $intencion['detalle_error'];
            VoiceMensaje::create([
                'conversacion_id' => $conversacion->id,
                'rol' => 'assistant',
                'tipo' => 'text',
                'texto' => $asistenteRespuesta,
            ]);

            return [
                'conversacion_id' => $conversacion->id,
                'estado' => 'requiere_registro_producto',
                'transcripcion' => $textoComando,
                'asistente_respuesta' => $asistenteRespuesta,
                'tts' => $this->ttsService->sintetizarVoz($asistenteRespuesta),
                'intencion' => $intencion,
                'tiempo_procesamiento_ms' => $tiempoProcesamiento,
            ];
        }

        if ($estadoIa === 'requiere_confirmacion_producto') {
            $conversacion = VoiceConversacion::create([
                'usuario_id' => $usuarioId ?? auth()->id() ?? 1,
                'entidad_id' => $intencion['cliente']['id'] ?? null,
                'estado' => 'necesita_aclaracion',
                'tipo_comprobante_sugerido' => $intencion['tipo_comprobante_sunat'] ?? '01',
                'payload_intencion' => $intencion,
                'tiempo_transcripcion_ms' => $tiempoSTT,
                'tiempo_procesamiento_ms' => $tiempoProcesamiento,
            ]);

            VoiceMensaje::create([
                'conversacion_id' => $conversacion->id,
                'rol' => 'user',
                'tipo' => $inputOriginal instanceof UploadedFile ? 'audio' : 'text',
                'texto' => $textoComando,
                'payload_intencion' => $intencion,
            ]);

            $opcionesNombres = collect($intencion['opciones_producto'])->pluck('descripcion')->implode(', ');
            $asistenteRespuesta = "Encontré varios productos parecidos: {$opcionesNombres}. ¿Cuál de ellos deseas usar?";
            
            VoiceMensaje::create([
                'conversacion_id' => $conversacion->id,
                'rol' => 'assistant',
                'tipo' => 'text',
                'texto' => $asistenteRespuesta,
            ]);

            return [
                'conversacion_id' => $conversacion->id,
                'estado' => 'requiere_confirmacion_producto',
                'transcripcion' => $textoComando,
                'asistente_respuesta' => $asistenteRespuesta,
                'opciones_producto' => $intencion['opciones_producto'],
                'tts' => $this->ttsService->sintetizarVoz($asistenteRespuesta),
                'intencion' => $intencion,
                'tiempo_procesamiento_ms' => $tiempoProcesamiento,
            ];
        }

        if ($estadoIa === 'advertencia_precio') {
            $conversacion = VoiceConversacion::create([
                'usuario_id' => $usuarioId ?? auth()->id() ?? 1,
                'entidad_id' => $intencion['cliente']['id'] ?? null,
                'estado' => 'necesita_aclaracion',
                'tipo_comprobante_sugerido' => $intencion['tipo_comprobante_sunat'] ?? '01',
                'payload_intencion' => $intencion,
                'tiempo_transcripcion_ms' => $tiempoSTT,
                'tiempo_procesamiento_ms' => $tiempoProcesamiento,
            ]);

            VoiceMensaje::create([
                'conversacion_id' => $conversacion->id,
                'rol' => 'user',
                'tipo' => $inputOriginal instanceof UploadedFile ? 'audio' : 'text',
                'texto' => $textoComando,
                'payload_intencion' => $intencion,
            ]);

            $pDesc = $intencion['advertencia_precio']['producto_descripcion'];
            $pOficial = number_format($intencion['advertencia_precio']['precio_oficial'], 2);
            $pDictado = number_format($intencion['advertencia_precio']['precio_dictado'], 2);
            
            $asistenteRespuesta = "Para el producto '{$pDesc}', el precio oficial en inventario es S/ {$pOficial}, pero mencionaste S/ {$pDictado}. ¿Deseas aplicar la tarifa especial dictada o mantener el precio oficial de lista?";
            
            VoiceMensaje::create([
                'conversacion_id' => $conversacion->id,
                'rol' => 'assistant',
                'tipo' => 'text',
                'texto' => $asistenteRespuesta,
            ]);

            return [
                'conversacion_id' => $conversacion->id,
                'estado' => 'advertencia_precio',
                'transcripcion' => $textoComando,
                'asistente_respuesta' => $asistenteRespuesta,
                'precio_oficial' => $intencion['advertencia_precio']['precio_oficial'],
                'precio_dictado' => $intencion['advertencia_precio']['precio_dictado'],
                'tts' => $this->ttsService->sintetizarVoz($asistenteRespuesta),
                'intencion' => $intencion,
                'tiempo_procesamiento_ms' => $tiempoProcesamiento,
            ];
        }

        $necesitaAclaracion = $intencion['necesita_confirmacion_usuario'] ?? false;

        $conversacion = VoiceConversacion::create([
            'usuario_id' => $usuarioId ?? auth()->id() ?? 1,
            'entidad_id' => $intencion['cliente']['id'] ?? null,
            'estado' => $necesitaAclaracion ? 'necesita_aclaracion' : 'esperando_confirmacion',
            'tipo_comprobante_sugerido' => $intencion['tipo_comprobante_sunat'] ?? '01',
            'payload_intencion' => $intencion,
            'tiempo_transcripcion_ms' => $tiempoSTT,
            'tiempo_procesamiento_ms' => $tiempoProcesamiento,
        ]);

        VoiceMensaje::create([
            'conversacion_id' => $conversacion->id,
            'rol' => 'user',
            'tipo' => $inputOriginal instanceof UploadedFile ? 'audio' : 'text',
            'texto' => $textoComando,
            'payload_intencion' => $intencion,
        ]);

        $respuestaAsistente = $necesitaAclaracion
            ? $this->construirMensajeAclaracion($intencion)
            : $this->construirResumenConfirmacion($intencion);

        $ttsData = $this->ttsService->sintetizarVoz($respuestaAsistente);

        VoiceMensaje::create([
            'conversacion_id' => $conversacion->id,
            'rol' => 'assistant',
            'tipo' => 'text',
            'texto' => $respuestaAsistente,
        ]);

        return [
            'conversacion_id' => $conversacion->id,
            'estado' => $conversacion->estado,
            'transcripcion' => $textoComando,
            'asistente_respuesta' => $respuestaAsistente,
            'tts' => $ttsData,
            'intencion' => $intencion,
            'tiempo_procesamiento_ms' => $tiempoProcesamiento,
        ];
    }

    /**
     * Interpreta la respuesta del usuario a una pregunta de aclaración
     * (qué producto es, qué precio usar, o quién es el cliente) y
     * recalcula si ya se puede pasar a "esperando confirmación".
     */
    public function resolverAclaracion(int $conversacionId, string $respuestaTexto, ?float $startTime = null): array
    {
        $startTime = $startTime ?? microtime(true);
        $conversacion = VoiceConversacion::findOrFail($conversacionId);
        $intencion = $conversacion->payload_intencion;
        $respuestaLower = mb_strtolower(trim($respuestaTexto), 'UTF-8');

        VoiceMensaje::create([
            'conversacion_id' => $conversacion->id,
            'rol' => 'user',
            'tipo' => 'text',
            'texto' => $respuestaTexto,
        ]);

        $motivosPrevios = $intencion['motivos_confirmacion'] ?? [];

        // 1. Resolver cliente si hacía falta: se intenta buscar de nuevo con lo que acaba de decir
        if (in_array('cliente_no_encontrado', $motivosPrevios, true) && empty($intencion['cliente'])) {
            $clienteNuevo = $this->intentService->buscarClientePorTexto($respuestaTexto);
            if ($clienteNuevo) {
                $intencion['cliente'] = $clienteNuevo;
                $intencion['cliente_encontrado'] = true;
                $intencion['cliente_tipo_de_documento'] = $clienteNuevo['tipo_doc'];
                $intencion['cliente_numero_de_documento'] = $clienteNuevo['num_doc'];
                $intencion['cliente_denominacion'] = $clienteNuevo['razon_social'];
                $intencion['cliente_direccion'] = $clienteNuevo['direccion'];
                $intencion['cliente_email'] = $clienteNuevo['email'];
            }
        }

        // 2. Resolver ítems pendientes (elegir opción de producto o elegir precio)
        $items = $intencion['items'] ?? [];

        foreach ($items as &$item) {
            $estado = $item['estado'] ?? 'exacto';

            if ($estado === 'requiere_confirmacion' && ! empty($item['opciones'])) {
                $elegido = $this->interpretarSeleccionOpcion($respuestaLower, $item['opciones']);

                if ($elegido) {
                    $item['id'] = $elegido['id'];
                    $item['producto_id'] = $elegido['id'];
                    $item['descripcion'] = $elegido['descripcion'];
                    $item['codigo'] = $elegido['codigo'] ?? $item['codigo'];
                    $item['precio_inventario'] = $elegido['precio_inventario'];
                    $item['en_inventario'] = true;

                    $precioInv = (float) ($elegido['precio_inventario'] ?? 0);
                    $precioDict = (float) ($item['precio_dictado'] ?? 0);
                    $requierePrecio = $precioDict > 0 && $precioInv > 0 && round($precioDict, 2) !== round($precioInv, 2);

                    $item['precio_unitario'] = $requierePrecio ? $precioInv : ($precioInv > 0 ? $precioInv : $precioDict);
                    $item['estado'] = $requierePrecio ? 'requiere_confirmacion_precio' : 'exacto';
                    unset($item['opciones']);
                }
            } elseif ($estado === 'requiere_confirmacion_precio') {
                if (str_contains($respuestaLower, 'inventario')) {
                    $item['precio_unitario'] = (float) $item['precio_inventario'];
                    $item['estado'] = 'exacto';
                } elseif (str_contains($respuestaLower, 'audio') || str_contains($respuestaLower, 'dije') || str_contains($respuestaLower, 'mio') || str_contains($respuestaLower, 'mío') || str_contains($respuestaLower, 'dictado')) {
                    $item['precio_unitario'] = (float) $item['precio_dictado'];
                    $item['estado'] = 'exacto';
                }
            } elseif ($estado === 'no_encontrado') {
                if (preg_match('/precio\s*(?:de\s+|del\s+|:\s*|=|\s+|s\/\.?|\$)*(\d+(?:\.\d+)?)/iu', $respuestaLower, $matchPrecio) &&
                    preg_match('/stock\s*(?:de\s+|del\s+|:\s*|=|\s+|unidades\s*)*(\d+(?:\.\d+)?)/iu', $respuestaLower, $matchStock)) {
                    
                    $precio = (float) $matchPrecio[1];
                    $stock = (float) $matchStock[1];
                    
                    // Create the product in the database
                    $nuevoProducto = \App\Models\Producto::create([
                        'empresa_id' => $intencion['empresa_id'] ?? 1,
                        'codigo' => 'PROD-' . strtoupper(substr(uniqid(), -6)),
                        'descripcion' => $item['descripcion'],
                        'categoria' => 'General',
                        'unidad_medida' => 'NIU',
                        'moneda' => 'PEN',
                        'precio_venta_unitario' => $precio,
                        'valor_venta_unitario' => round($precio / 1.18, 6),
                        'costo_compra_unitario' => 0.0,
                        'precio_compra_unitario' => 0.0,
                        'tipo_afectacion_igv' => '10', // Gravado
                        'destacado' => false,
                        'activo' => true,
                        'stock_actual' => $stock,
                        'stock_minimo' => 1,
                        'stock_maximo' => 1000,
                    ]);

                    $item['id'] = $nuevoProducto->id;
                    $item['producto_id'] = $nuevoProducto->id;
                    $item['codigo'] = $nuevoProducto->codigo;
                    $item['precio_unitario'] = $precio;
                    $item['en_inventario'] = true;
                    $item['estado'] = 'exacto';
                    
                    $intencion['mensaje_aclaracion_exito'] = "He registrado el producto '" . $item['descripcion'] . "' en el inventario con precio S/ " . number_format($precio, 2) . " y stock inicial de " . $stock . " unidades.";
                } else {
                    $asistenteRespuesta = "Para registrar el producto '" . $item['descripcion'] . "', por favor dime su precio y stock inicial (por ejemplo: 'registrar con precio 150 y stock 50').";
                    
                    VoiceMensaje::create([
                        'conversacion_id' => $conversacion->id,
                        'rol' => 'assistant',
                        'tipo' => 'text',
                        'texto' => $asistenteRespuesta,
                    ]);

                    return [
                        'conversacion_id' => $conversacion->id,
                        'estado' => 'requiere_registro_producto',
                        'transcripcion' => $respuestaTexto,
                        'asistente_respuesta' => $asistenteRespuesta,
                        'tts' => $this->ttsService->sintetizarVoz($asistenteRespuesta),
                        'intencion' => $intencion,
                        'tiempo_procesamiento_ms' => round((microtime(true) - $startTime) * 1000),
                    ];
                }
            }
        }
        unset($item);

        $intencion['items'] = $items;
        $intencion = $this->intentService->recalcularTotales($intencion);

        $clienteEncontrado = $intencion['cliente'] !== null;
        [$necesitaConfirmacion, $motivosRestantes] = $this->intentService->evaluarNecesidadDeConfirmacion($clienteEncontrado, $intencion['items']);
        $intencion['cliente_encontrado'] = $clienteEncontrado;
        $intencion['motivos_confirmacion'] = $motivosRestantes;

        // Recalcular estado_ia
        $estadoIa = 'ok';
        $detalleError = null;
        $opcionesProducto = null;
        $advertenciaPrecio = null;

        if (!$clienteEncontrado) {
            $estadoIa = 'error_registro_no_encontrado';
            $detalleError = "El cliente '" . ($intencion['cliente']['razon_social'] ?? 'desconocido') . "' no se encuentra registrado en la base de datos.";
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
        $intencion['necesita_confirmacion_usuario'] = $necesitaConfirmacion || ($estadoIa !== 'ok');

        $nuevoEstado = $estadoIa === 'error_registro_no_encontrado' ? 'error' : ($estadoIa !== 'ok' ? 'necesita_aclaracion' : 'esperando_confirmacion');

        $conversacion->update([
            'entidad_id' => $intencion['cliente']['id'] ?? $conversacion->entidad_id,
            'estado' => $nuevoEstado,
            'payload_intencion' => $intencion,
            'error_mensaje' => $detalleError ?? $conversacion->error_mensaje,
        ]);

        if ($estadoIa === 'error_registro_no_encontrado') {
            $asistenteRespuesta = $intencion['detalle_error'];
            VoiceMensaje::create([
                'conversacion_id' => $conversacion->id,
                'rol' => 'assistant',
                'tipo' => 'text',
                'texto' => $asistenteRespuesta,
            ]);

            return [
                'conversacion_id' => $conversacion->id,
                'estado' => 'error_registro_no_encontrado',
                'transcripcion' => $respuestaTexto,
                'asistente_respuesta' => $asistenteRespuesta,
                'tts' => $this->ttsService->sintetizarVoz($asistenteRespuesta),
                'intencion' => $intencion,
                'tiempo_procesamiento_ms' => round((microtime(true) - $startTime) * 1000),
            ];
        }

        if ($estadoIa === 'requiere_registro_producto') {
            $asistenteRespuesta = $intencion['detalle_error'];
            VoiceMensaje::create([
                'conversacion_id' => $conversacion->id,
                'rol' => 'assistant',
                'tipo' => 'text',
                'texto' => $asistenteRespuesta,
            ]);

            return [
                'conversacion_id' => $conversacion->id,
                'estado' => 'requiere_registro_producto',
                'transcripcion' => $respuestaTexto,
                'asistente_respuesta' => $asistenteRespuesta,
                'tts' => $this->ttsService->sintetizarVoz($asistenteRespuesta),
                'intencion' => $intencion,
                'tiempo_procesamiento_ms' => round((microtime(true) - $startTime) * 1000),
            ];
        }

        if ($estadoIa === 'requiere_confirmacion_producto') {
            $opcionesNombres = collect($intencion['opciones_producto'])->pluck('descripcion')->implode(', ');
            $asistenteRespuesta = "Encontré varios productos parecidos: {$opcionesNombres}. ¿Cuál de ellos deseas usar?";
            
            VoiceMensaje::create([
                'conversacion_id' => $conversacion->id,
                'rol' => 'assistant',
                'tipo' => 'text',
                'texto' => $asistenteRespuesta,
            ]);

            return [
                'conversacion_id' => $conversacion->id,
                'estado' => 'requiere_confirmacion_producto',
                'transcripcion' => $respuestaTexto,
                'asistente_respuesta' => $asistenteRespuesta,
                'opciones_producto' => $intencion['opciones_producto'],
                'tts' => $this->ttsService->sintetizarVoz($asistenteRespuesta),
                'intencion' => $intencion,
                'tiempo_procesamiento_ms' => round((microtime(true) - $startTime) * 1000),
            ];
        }

        if ($estadoIa === 'advertencia_precio') {
            $pDesc = $intencion['advertencia_precio']['producto_descripcion'];
            $pOficial = number_format($intencion['advertencia_precio']['precio_oficial'], 2);
            $pDictado = number_format($intencion['advertencia_precio']['precio_dictado'], 2);
            
            $asistenteRespuesta = "Para el producto '{$pDesc}', el precio oficial en inventario es S/ {$pOficial}, pero mencionaste S/ {$pDictado}. ¿Deseas aplicar la tarifa especial dictada o mantener el precio oficial de lista?";
            
            VoiceMensaje::create([
                'conversacion_id' => $conversacion->id,
                'rol' => 'assistant',
                'tipo' => 'text',
                'texto' => $asistenteRespuesta,
            ]);

            return [
                'conversacion_id' => $conversacion->id,
                'estado' => 'advertencia_precio',
                'transcripcion' => $respuestaTexto,
                'asistente_respuesta' => $asistenteRespuesta,
                'precio_oficial' => $intencion['advertencia_precio']['precio_oficial'],
                'precio_dictado' => $intencion['advertencia_precio']['precio_dictado'],
                'tts' => $this->ttsService->sintetizarVoz($asistenteRespuesta),
                'intencion' => $intencion,
                'tiempo_procesamiento_ms' => round((microtime(true) - $startTime) * 1000),
            ];
        }

        $respuestaAsistente = $necesitaConfirmacion
            ? $this->construirMensajeAclaracion($intencion)
            : $this->construirResumenConfirmacion($intencion);

        if (!empty($intencion['mensaje_aclaracion_exito'])) {
            $respuestaAsistente = $intencion['mensaje_aclaracion_exito'] . " " . $respuestaAsistente;
        }

        $ttsData = $this->ttsService->sintetizarVoz($respuestaAsistente);

        VoiceMensaje::create([
            'conversacion_id' => $conversacion->id,
            'rol' => 'assistant',
            'tipo' => 'text',
            'texto' => $respuestaAsistente,
        ]);

        return [
            'conversacion_id' => $conversacion->id,
            'estado' => $nuevoEstado,
            'transcripcion' => $respuestaTexto,
            'asistente_respuesta' => $respuestaAsistente,
            'tts' => $ttsData,
            'intencion' => $intencion,
            'tiempo_procesamiento_ms' => round((microtime(true) - $startTime) * 1000),
        ];
    }

    /**
     * Confirmar la emisión real del comprobante previa revisión.
     */
    public function confirmarEmision(int $conversacionId, ?array $overrideData = null, ?int $usuarioId = null): array
    {
        $conversacion = VoiceConversacion::findOrFail($conversacionId);

        if ($conversacion->estado === 'completada') {
            throw new Exception('Esta conversación ya fue completada y el comprobante ya está emitido.');
        }

        $payload = $overrideData ?? $conversacion->payload_intencion;
        $conversacion->update(['estado' => 'procesando']);

        try {
            $resultado = $this->emissionService->emitir($payload, null, $usuarioId ?? auth()->id());

            $conversacion->update([
                'comprobante_id' => $resultado['comprobante_id'] ?? null,
                'estado' => 'completada',
            ]);

            $numCompleto = $resultado['numero_completo'] ?? '';
            $mensajeExito = "Comprobante {$numCompleto} emitido exitosamente.";
            $ttsExito = $this->ttsService->sintetizarVoz($mensajeExito);

            VoiceMensaje::create([
                'conversacion_id' => $conversacion->id,
                'rol' => 'assistant',
                'tipo' => 'text',
                'texto' => $mensajeExito,
                'payload_intencion' => $resultado,
            ]);

            return [
                'success' => true,
                'conversacion_id' => $conversacion->id,
                'estado' => 'completada',
                'mensaje' => $mensajeExito,
                'asistente_respuesta' => $mensajeExito,
                'tts' => $ttsExito,
                'data' => $resultado,
            ];

        } catch (Exception $e) {
            $conversacion->update([
                'estado' => 'error',
                'error_mensaje' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Cancelar la conversación activa.
     */
    public function cancelarConversacion(int $conversacionId): bool
    {
        $conversacion = VoiceConversacion::findOrFail($conversacionId);
        $conversacion->update(['estado' => 'cancelada']);

        return true;
    }

    /**
     * Interpreta a cuál de las opciones parecidas se refiere el usuario:
     * por ordinal ("el segundo", "la primera", "2") o, si no dijo un
     * ordinal, por similitud de texto contra la descripción de cada opción.
     */
    protected function interpretarSeleccionOpcion(string $respuesta, array $opciones): ?array
    {
        $mapaOrdinal = [
            'primero' => 0, 'primera' => 0, 'uno' => 0, '1' => 0,
            'segundo' => 1, 'segunda' => 1, 'dos' => 1, '2' => 1,
            'tercero' => 2, 'tercera' => 2, 'tres' => 2, '3' => 2,
        ];

        foreach ($mapaOrdinal as $palabra => $idx) {
            if (preg_match('/\b'.preg_quote($palabra, '/').'\b/u', $respuesta) && isset($opciones[$idx])) {
                return $opciones[$idx];
            }
        }

        $mejor = null;
        $mejorPct = 0;

        foreach ($opciones as $op) {
            similar_text($respuesta, mb_strtolower((string) $op['descripcion'], 'UTF-8'), $pct);
            if ($pct > $mejorPct) {
                $mejorPct = $pct;
                $mejor = $op;
            }
        }

        return $mejorPct >= 40 ? $mejor : null;
    }

    /**
     * Arma la pregunta de aclaración según lo que falte: cliente, producto
     * ambiguo (con sus opciones), producto no encontrado, o precio en conflicto.
     */
    protected function construirMensajeAclaracion(array $intencion): string
    {
        $partes = [];
        $motivos = $intencion['motivos_confirmacion'] ?? [];

        if (in_array('cliente_no_encontrado', $motivos, true)) {
            $partes[] = 'no encontré a ese cliente registrado, ¿me confirmas su nombre completo o su RUC/DNI?';
        }

        foreach ($intencion['items'] as $item) {
            $estado = $item['estado'] ?? 'exacto';

            if ($estado === 'requiere_confirmacion' && ! empty($item['opciones'])) {
                $nombres = collect($item['opciones'])->pluck('descripcion')->implode(', ');
                $partes[] = "encontré varios productos parecidos a \"{$item['descripcion']}\": {$nombres}. ¿Cuál de esos es?";
            } elseif ($estado === 'no_encontrado') {
                $partes[] = "no encontré \"{$item['descripcion']}\" en el inventario. ¿Confirmas que lo facturamos igual con el precio que mencionaste, o prefieres cancelarlo?";
            } elseif ($estado === 'requiere_confirmacion_precio') {
                $inv = number_format((float) $item['precio_inventario'], 2);
                $dict = number_format((float) $item['precio_dictado'], 2);
                $partes[] = "para \"{$item['descripcion']}\" el precio en inventario es S/ {$inv}, pero mencionaste S/ {$dict}. ¿Uso el del inventario o el que dijiste?";
            }
        }

        if (empty($partes)) {
            return 'Necesito que confirmes algunos datos antes de continuar.';
        }

        return 'Antes de continuar: '.implode(' Además, ', $partes);
    }

    /**
     * Mensaje de resumen cuando ya no hace falta aclarar nada y se puede confirmar.
     */
    protected function construirResumenConfirmacion(array $intencion): string
    {
        $clienteNombre = $intencion['cliente_denominacion'] ?? 'el cliente';
        $tipoNombre = $intencion['tipo_comprobante_nombre'] ?? 'Factura';
        $totalFormatted = number_format((float) ($intencion['total'] ?? 0), 2);

        return "Entendido. He preparado la {$tipoNombre} para {$clienteNombre} por S/ {$totalFormatted}. Di 'confirmar' o presiona el botón para emitir.";
    }
}