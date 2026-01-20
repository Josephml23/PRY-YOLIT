<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Serie extends Model
{
    use HasFactory;

    protected $table = 'series';

    protected $fillable = [
        'empresa_id',
        'tipo_comprobante',
        'serie',
        'correlativo_actual',
        'activo',
        'por_defecto',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'por_defecto' => 'boolean',
        'correlativo_actual' => 'integer',
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }
}
