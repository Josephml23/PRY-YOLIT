<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('compras', function (Blueprint $table) {
            $table->id();
            $table->string('actividad', 100); // Administrador, Usuario, etc.
            $table->timestamp('fecha_actividad');
            $table->unsignedBigInteger('proveedor_id');
            $table->string('proveedor_nombre', 200);
            $table->string('proveedor_ruc', 20);
            $table->string('estado', 50)->default('Pendiente de pago');
            $table->string('tipo_comprobante', 10); // F (Factura), B (Boleta), E (Otro)
            $table->string('serie_comprobante', 10);
            $table->string('numero_comprobante', 20);
            $table->string('comprobante_completo', 50); // F006-6177
            $table->string('tipo_comprobante_desc', 50)->default('FACTURA ELECTRONICA');
            $table->string('moneda', 10)->default('PEN');
            $table->decimal('total', 10, 2);
            $table->integer('cantidad_productos')->default(0);
            $table->boolean('activo')->default(true);
            $table->string('created_by', 100)->nullable();
            $table->timestamps();

            $table->index('activo');
            $table->index('estado');
            $table->index('proveedor_id');
            $table->index('fecha_actividad');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compras');
    }
};
