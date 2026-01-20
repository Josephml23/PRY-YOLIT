<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GuiaRemisionItem extends Model
{
    protected $fillable = [
        'guia_remision_id',
        'item',
        'unidad_medida',
        'codigo',
        'descripcion',
        'cantidad',
        'codigo_dam',
    ];

    protected $casts = [
        'cantidad' => 'decimal:3',
    ];

    public function guiaRemision(): BelongsTo
    {
        return $this->belongsTo(GuiaRemision::class);
    }
}
