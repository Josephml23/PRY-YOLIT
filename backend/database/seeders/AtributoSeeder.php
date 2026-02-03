<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Atributo;

class AtributoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $atributos = [
            ['codigo' => '3001', 'descripcion' => 'Detergentes-Recursos Hidrologicos-Matrícula a la enamorización', 'activo' => true, 'created_by' => 'Administrador'],
            ['codigo' => '3002', 'descripcion' => 'Detergentes-Recursos Hidrologicos-Atentis a la enamorización', 'activo' => true, 'created_by' => 'Administrador'],
            ['codigo' => '3003', 'descripcion' => 'Detergentes-Recursos Hidrologicos-Tipo de espaice vendida', 'activo' => true, 'created_by' => 'Administrador'],
            ['codigo' => '3004', 'descripcion' => 'Detergentes-Recursos Hidrologicos-Lugar de descarga', 'activo' => true, 'created_by' => 'Administrador'],
        ];

        foreach ($atributos as $atributo) {
            Atributo::create($atributo);
        }
    }
}
