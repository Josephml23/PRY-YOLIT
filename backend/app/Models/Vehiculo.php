<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehiculo extends Model
{
    protected $fillable = [
        'placa',
        'modelo',
        'marca',
        'activo',
        'created_by',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];
}
