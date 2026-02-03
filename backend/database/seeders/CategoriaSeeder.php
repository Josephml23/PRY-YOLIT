<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Categoria;

class CategoriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categorias = [
            ['nombre' => 'DELIVERY', 'identificador' => null, 'activo' => true, 'created_by' => null],
            ['nombre' => 'INSUMO', 'identificador' => null, 'activo' => true, 'created_by' => null],
            ['nombre' => 'PRODUCTO', 'identificador' => null, 'activo' => true, 'created_by' => null],
            ['nombre' => 'SEÑOR/DAHLAR PRODUCTO', 'identificador' => null, 'activo' => true, 'created_by' => null],
            ['nombre' => 'SEÑOR/DAHLAR SERVICIO', 'identificador' => null, 'activo' => true, 'created_by' => null],
            ['nombre' => 'SEÑOR/DEHIM PRODUCTO', 'identificador' => null, 'activo' => true, 'created_by' => null],
            ['nombre' => 'SEÑOR/DEHIM SERVICIO', 'identificador' => null, 'activo' => true, 'created_by' => null],
            ['nombre' => 'SEÑOR/DETEB: PRODUCTO', 'identificador' => null, 'activo' => true, 'created_by' => null],
            ['nombre' => 'SEÑOR/DETEB: SERVICIO', 'identificador' => null, 'activo' => true, 'created_by' => null],
            ['nombre' => 'SERVICIO ENCABINA', 'identificador' => null, 'activo' => true, 'created_by' => null],
            ['nombre' => 'SERVICIO ENPISO', 'identificador' => null, 'activo' => true, 'created_by' => null],
            ['nombre' => 'SEÑOR/SALUS SERVICIO', 'identificador' => 'Administrador', 'activo' => true, 'created_by' => 'Administrador'],
            ['nombre' => 'SEÑOR/SALUS PRODUCTO', 'identificador' => 'Administrador', 'activo' => true, 'created_by' => 'Administrador'],
            ['nombre' => 'MATERIAL', 'identificador' => 'Administrador', 'activo' => true, 'created_by' => 'Administrador'],
        ];

        foreach ($categorias as $categoria) {
            Categoria::create($categoria);
        }
    }
}
