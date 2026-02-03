<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Compra extends Model
{
    protected $table = 'compras';

    protected $fillable = [
        'actividad',
        'fecha_actividad',
        'proveedor_id',
        'proveedor_nombre',
        'proveedor_ruc',
        'estado',
        'tipo_comprobante',
        'serie_comprobante',
        'numero_comprobante',
        'comprobante_completo',
        'tipo_comprobante_desc',
        'moneda',
        'total',
        'cantidad_productos',
        'activo',
        'created_by',
    ];

    protected $casts = [
        'fecha_actividad' => 'datetime',
        'total' => 'decimal:2',
        'activo' => 'boolean',
    ];
}
