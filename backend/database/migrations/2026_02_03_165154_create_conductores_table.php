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
        Schema::create('conductores', function (Blueprint $table) {
            $table->id();
            $table->string('tipo_documento', 20);
            $table->string('numero_documento', 20);
            $table->string('nombre', 200);
            $table->string('licencia_conducir', 50)->nullable();
            $table->string('telefono', 20)->nullable();
            $table->boolean('activo')->default(true);
            $table->string('created_by', 100)->nullable();
            $table->timestamps();

            $table->index('activo');
            $table->index('tipo_documento');
            $table->index('numero_documento');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conductores');
    }
};
