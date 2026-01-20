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
        Schema::create('series', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->string('tipo_comprobante', 2); // 01, 03, 07, 08, etc.
            $table->string('serie', 10);
            $table->unsignedBigInteger('correlativo_actual')->default(0);
            $table->boolean('activo')->default(true);
            $table->boolean('por_defecto')->default(false);
            $table->timestamps();

            $table->unique(['empresa_id', 'tipo_comprobante', 'serie']);
            $table->index(['empresa_id', 'tipo_comprobante']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('series');
    }
};
