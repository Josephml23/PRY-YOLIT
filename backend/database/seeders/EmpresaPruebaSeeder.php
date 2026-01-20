<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Empresa;

class EmpresaPruebaSeeder extends Seeder
{
    public function run()
    {
        // Crear empresa de prueba compatible con NubeFact
        // El RUC key está configurado en .env (NUBEFACT_RUC)
        Empresa::create([
            'ruc' => '20000000001',
            'razon_social' => 'EMPRESA DE PRUEBA NUBEFACT SAC',
            'nombre_comercial' => 'NUBEFACT TEST',
            'ubigeo' => '150101',
            'departamento' => 'LIMA',
            'provincia' => 'LIMA',
            'distrito' => 'LIMA',
            'direccion' => 'Av. Prueba 123, Oficina 456',
            'sol_user' => null, // No usa SOL, usa NubeFact API
            'sol_password' => null,
            'modo' => 'beta', // MODO BETA
            'activo' => true,
        ]);
    }
}
