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
        Schema::create('vendedores', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('email')->nullable();
            $table->string('telefono')->nullable();
            $table->decimal('porcentaje_comision', 5, 2)->default(0);
            $table->boolean('activo')->default(true);
            $table->string('created_by')->nullable();
            $table->decimal('ventas_cpe', 10, 2)->default(0);
            $table->decimal('ventas_nv', 10, 2)->default(0);
            $table->decimal('total_ventas', 10, 2)->default(0);
            $table->decimal('total_comision', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendedores');
    }
};
