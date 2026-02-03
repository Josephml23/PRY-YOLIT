<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\UnidadMedida;

class UnidadMedidaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $unidades = [
            ['codigo' => 'ZZ', 'descripcion' => 'SERVICIO', 'simbolo' => 'SERV', 'activo' => true],
            ['codigo' => 'BX', 'descripcion' => 'CAJA', 'simbolo' => 'CAJA', 'activo' => true],
            ['codigo' => 'GLI', 'descripcion' => 'GALÓN', 'simbolo' => 'GAL', 'activo' => true],
            ['codigo' => 'GRM', 'descripcion' => 'GRAMOS', 'simbolo' => 'GR', 'activo' => true],
            ['codigo' => 'KGM', 'descripcion' => 'KILOGRAMO', 'simbolo' => 'KG', 'activo' => true],
        ];

        foreach ($unidades as $unidad) {
            UnidadMedida::create($unidad);
        }
    }
}
