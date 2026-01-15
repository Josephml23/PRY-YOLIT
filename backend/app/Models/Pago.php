<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pago extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pagos';

    protected $fillable = [
        'oportunidad_id',
        'comprobante_id',
        'usuario_id',
        'fecha_pago',
        'monto',
        'moneda',
        'medio_pago',
        'nro_operacion',
        'banco',
        'comprobante_path',
        'estado',
        'observaciones',
    ];

    protected $casts = [
        'fecha_pago' => 'date',
        'monto' => 'decimal:2',
    ];

    /**
     * Relaciones
     */
    public function oportunidad()
    {
        return $this->belongsTo(Oportunidad::class);
    }

    public function comprobante()
    {
        return $this->belongsTo(Comprobante::class);
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    /**
     * Scopes
     */
    public function scopeVerificados($query)
    {
        return $query->where('estado', 'verificado');
    }

    public function scopeConciliados($query)
    {
        return $query->where('estado', 'conciliado');
    }

    public function scopePendientes($query)
    {
        return $query->where('estado', 'registrado');
    }
}
