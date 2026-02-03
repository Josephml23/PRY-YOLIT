<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conductor extends Model
{
    protected $table = 'conductores';

    protected $fillable = [
        'tipo_documento',
        'numero_documento',
        'nombre',
        'licencia_conducir',
        'telefono',
        'activo',
        'created_by',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];
}
