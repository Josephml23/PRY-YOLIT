<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('comprobante_items', function (Blueprint $table) {
            // Cambiar descripcion de string(255) a text para permitir descripciones largas
            $table->text('descripcion')->change();
        });
    }

    public function down(): void
    {
        Schema::table('comprobante_items', function (Blueprint $table) {
            // Revertir a string(255) si fuera necesario
            $table->string('descripcion')->change();
        });
    }
};
