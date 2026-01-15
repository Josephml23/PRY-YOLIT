<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CatalogoSunat extends Model
{
    use HasFactory;

    protected $table = 'catalogos_sunat';

    protected $fillable = [
        'catalogo',
        'codigo',
        'descripcion',
        'descripcion_larga',
        'activo',
        'metadata',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Scopes
     */
    public function scopePorCatalogo($query, $catalogo)
    {
        return $query->where('catalogo', $catalogo);
    }

    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    /**
     * Métodos estáticos auxiliares
     */
    public static function obtenerPorCatalogo($catalogo)
    {
        return static::where('catalogo', $catalogo)
            ->where('activo', true)
            ->orderBy('codigo')
            ->get();
    }

    public static function obtenerDescripcion($catalogo, $codigo)
    {
        $item = static::where('catalogo', $catalogo)
            ->where('codigo', $codigo)
            ->first();

        return $item ? $item->descripcion : null;
    }
}
