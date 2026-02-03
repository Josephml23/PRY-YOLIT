<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Atributo extends Model
{
    protected $fillable = [
        'codigo',
        'descripcion',
        'activo',
        'created_by',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];
}
