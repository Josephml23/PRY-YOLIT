<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    protected $fillable = [
        'nombre',
        'identificador',
        'activo',
        'created_by',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];
}
