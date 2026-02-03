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
        Schema::create('vehiculos', function (Blueprint $table) {
            $table->id();
            $table->string('placa', 20);
            $table->string('modelo', 100);
            $table->string('marca', 100);
            $table->boolean('activo')->default(true);
            $table->string('created_by', 100)->nullable();
            $table->timestamps();

            $table->index('activo');
            $table->index('placa');
            $table->index('marca');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehiculos');
    }
};
