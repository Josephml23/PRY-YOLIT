<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seeders principales
        $this->call([
            CatalogosSunatSeeder::class,
        ]);

        // Usuario administrador por defecto
        User::factory()->create([
            'name' => 'Administrador',
            'email' => 'admin@facturacion.pe',
            'password' => bcrypt('password'),
            'rol' => 'admin',
            'activo' => true,
        ]);

        // Usuario operador de prueba
        User::factory()->create([
            'name' => 'Operador',
            'email' => 'operador@facturacion.pe',
            'password' => bcrypt('password'),
            'rol' => 'operador',
            'activo' => true,
        ]);
    }
}
