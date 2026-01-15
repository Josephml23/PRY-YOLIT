<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alerta extends Model
{
    use HasFactory;

    protected $table = 'alertas';

    protected $fillable = [
        'oportunidad_id',
        'usuario_id',
        'tipo',
        'prioridad',
        'titulo',
        'mensaje',
        'leido',
        'leido_en',
        'metadata',
    ];

    protected $casts = [
        'leido' => 'boolean',
        'leido_en' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Relaciones
     */
    public function oportunidad()
    {
        return $this->belongsTo(Oportunidad::class);
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    /**
     * Scopes
     */
    public function scopeNoLeidas($query)
    {
        return $query->where('leido', false);
    }

    public function scopeLeidas($query)
    {
        return $query->where('leido', true);
    }

    public function scopePorPrioridad($query, $prioridad)
    {
        return $query->where('prioridad', $prioridad);
    }

    public function scopeCriticas($query)
    {
        return $query->where('prioridad', 'critica');
    }

    /**
     * Métodos auxiliares
     */
    public function marcarComoLeida()
    {
        $this->update([
            'leido' => true,
            'leido_en' => now(),
        ]);
    }
}
