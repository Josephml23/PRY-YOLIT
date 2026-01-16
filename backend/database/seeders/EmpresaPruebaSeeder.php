<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Empresa;

class EmpresaPruebaSeeder extends Seeder
{
    public function run()
    {
        // Crear empresa de prueba con credenciales de modo beta SUNAT
        Empresa::create([
            'ruc' => '20000000001',
            'razon_social' => 'GREEN SAC',
            'nombre_comercial' => 'GREEN',
            'ubigeo' => '150101',
            'departamento' => 'LIMA',
            'provincia' => 'LIMA',
            'distrito' => 'LIMA',
            'direccion' => 'Av. Villa Nueva 221',
            'sol_user' => 'MODDATOS',
            'sol_password' => 'MODDATOS',
            'modo' => 'beta', // MODO BETA
            'activo' => true,
        ]);
    }
}
