<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentoDigitalizado extends Model
{
    use HasFactory;

    protected $table = 'documentos_digitalizados';

    protected $fillable = [
        'nombre_archivo',
        'ruta_archivo',
        'tipo_archivo',
        'tamano_archivo',
        'tipo_operacion',
        'estado_procesamiento',
        'error_mensaje',
        'datos_extraidos',
        'tipo_comprobante',
        'serie',
        'numero',
        'comprobante_completo',
        'fecha_emision',
        'entidad_tipo_doc',
        'entidad_num_doc',
        'entidad_razon_social',
        'entidad_direccion',
        'moneda',
        'subtotal',
        'igv',
        'total',
        'items_extraidos',
        'confianza_ocr',
        'requiere_validacion',
        'validado',
        'fecha_validacion',
        'validado_por',
        'compra_id',
        'venta_id',
        'activo',
        'created_by',
    ];

    protected $casts = [
        'fecha_emision' => 'date',
        'datos_extraidos' => 'array',
        'items_extraidos' => 'array',
        'subtotal' => 'decimal:2',
        'igv' => 'decimal:2',
        'total' => 'decimal:2',
        'confianza_ocr' => 'decimal:2',
        'requiere_validacion' => 'boolean',
        'validado' => 'boolean',
        'fecha_validacion' => 'datetime',
        'activo' => 'boolean',
        'tamano_archivo' => 'integer',
    ];

    /**
     * Relación con Compra
     */
    public function compra()
    {
        return $this->belongsTo(Compra::class);
    }

    /**
     * Relación con Venta (cuando se cree el modelo)
     */
    // public function venta()
    // {
    //     return $this->belongsTo(Venta::class);
    // }
}
