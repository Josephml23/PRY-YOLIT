<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Personal extends Model
{
    use HasFactory;

    protected $table = 'personal';

    protected $fillable = [
        'nombre',
        'numero',
        'puesto_asignado',
        'salario_base',
        'email',
        'telefono',
        'activo',
        'created_by',
    ];

    protected $casts = [
        'salario_base' => 'decimal:2',
        'activo' => 'boolean',
    ];
}
