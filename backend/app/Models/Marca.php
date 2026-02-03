<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Marca extends Model
{
    protected $fillable = [
        'nombre',
        'activo',
        'created_by',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];
}
