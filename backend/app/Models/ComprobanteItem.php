<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComprobanteItem extends Model
{
    use HasFactory;

    protected $table = 'comprobante_items';

    protected $fillable = [
        'comprobante_id',
        'item',
        'codigo_producto',
        'descripcion',
        'unidad',
        'cantidad',
        'mto_valor_unitario',
        'mto_precio_unitario',
        'mto_valor_venta',
        'mto_base_igv',
        'porcentaje_igv',
        'igv',
        'tip_afe_igv',
        'isc',
        'tip_sis_isc',
        'total_impuestos',
        'descuento',
    ];

    protected $casts = [
        'item' => 'integer',
        'cantidad' => 'decimal:3',
        'mto_valor_unitario' => 'decimal:6',
        'mto_precio_unitario' => 'decimal:6',
        'mto_valor_venta' => 'decimal:2',
        'mto_base_igv' => 'decimal:2',
        'porcentaje_igv' => 'decimal:2',
        'igv' => 'decimal:2',
        'isc' => 'decimal:2',
        'total_impuestos' => 'decimal:2',
        'descuento' => 'decimal:2',
    ];

    /**
     * Relaciones
     */
    public function comprobante()
    {
        return $this->belongsTo(Comprobante::class);
    }

    /**
     * Accessors
     */
    public function getTipoAfectacionNombreAttribute()
    {
        $tipos = [
            '10' => 'Gravado - Operación Onerosa',
            '11' => 'Gravado – Retiro por premio',
            '12' => 'Gravado – Retiro por donación',
            '13' => 'Gravado – Retiro',
            '14' => 'Gravado – Retiro por publicidad',
            '15' => 'Gravado – Bonificaciones',
            '16' => 'Gravado – Retiro por entrega a trabajadores',
            '17' => 'Gravado – IVAP',
            '20' => 'Exonerado - Operación Onerosa',
            '21' => 'Exonerado – Transferencia Gratuita',
            '30' => 'Inafecto - Operación Onerosa',
            '31' => 'Inafecto – Retiro por Bonificación',
            '32' => 'Inafecto – Retiro',
            '33' => 'Inafecto – Retiro por Muestras Médicas',
            '34' => 'Inafecto - Retiro por Convenio Colectivo',
            '35' => 'Inafecto – Retiro por premio',
            '36' => 'Inafecto - Retiro por publicidad',
            '40' => 'Exportación',
        ];

        return $tipos[$this->tip_afe_igv] ?? 'Desconocido';
    }
}
