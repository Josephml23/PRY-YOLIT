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
        Schema::create('entidades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');

            $table->string('tipo_doc', 1); // 6,1,-,4,7,A,0, etc.
            $table->string('num_doc', 15);
            $table->string('denominacion');
            $table->string('razon_comercial')->nullable();
            $table->string('direccion')->nullable();
            $table->string('email')->nullable();
            $table->string('email_2')->nullable();
            $table->string('email_3')->nullable();
            $table->string('telefono')->nullable();
            $table->string('codigo_cliente')->nullable();
            $table->string('licencia_conducir')->nullable();
            $table->string('placa_vehiculo')->nullable();

            $table->boolean('es_cliente')->default(true);
            $table->boolean('es_proveedor')->default(false);

            $table->timestamps();

            $table->unique(['empresa_id', 'tipo_doc', 'num_doc']);
            $table->index('denominacion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entidades');
    }
};
