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
        Schema::create('cuentas_bancarias', function (Blueprint $table) {
            $table->id();
            $table->string('descripcion');
            $table->string('numero'); // Número de cuenta
            $table->decimal('balance', 15, 2)->default(0);
            $table->string('abreviatura')->nullable();
            $table->string('banco')->nullable();
            $table->string('moneda')->default('PEN'); // PEN, USD, etc.
            $table->boolean('activo')->default(true);
            $table->string('created_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cuentas_bancarias');
    }
};
