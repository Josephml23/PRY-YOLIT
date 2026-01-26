<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Producto;
use App\Models\Empresa;

class ProductosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener la primera empresa o crear una de prueba
        $empresa = Empresa::first();
        
        if (!$empresa) {
            echo "⚠️  No hay empresas en la base de datos. Por favor, cree una empresa primero.\n";
            return;
        }

        $productos = [
            [
                'codigo' => '0001',
                'descripcion' => 'CABLE USB',
                'unidad_medida' => 'NIU',
                'valor_venta_unitario' => 8.474576,
                'precio_venta_unitario' => 10.00,
                'tipo_afectacion_igv' => '10',
            ],
            [
                'codigo' => '0002',
                'descripcion' => 'CABLES HDMI',
                'unidad_medida' => 'NIU',
                'valor_venta_unitario' => 12.711864,
                'precio_venta_unitario' => 15.00,
                'tipo_afectacion_igv' => '10',
            ],
            [
                'codigo' => '0003',
                'descripcion' => 'BLISTER DE 5 PILAS',
                'unidad_medida' => 'NIU',
                'valor_venta_unitario' => 63.559322,
                'precio_venta_unitario' => 75.00,
                'tipo_afectacion_igv' => '10',
            ],
            [
                'codigo' => '0004',
                'descripcion' => 'CIGARRERAS AEREAS',
                'unidad_medida' => 'NIU',
                'valor_venta_unitario' => 8.474576,
                'precio_venta_unitario' => 10.00,
                'tipo_afectacion_igv' => '10',
            ],
            [
                'codigo' => '0006',
                'descripcion' => 'ACEITE DE TRANSMISION',
                'unidad_medida' => 'WG',
                'valor_venta_unitario' => 67.796610,
                'precio_venta_unitario' => 80.00,
                'tipo_afectacion_igv' => '10',
            ],
            [
                'codigo' => '0007',
                'descripcion' => 'ACEITE HIDROLINA',
                'unidad_medida' => 'NIU',
                'valor_venta_unitario' => 228.813559,
                'precio_venta_unitario' => 270.00,
                'tipo_afectacion_igv' => '10',
            ],
            [
                'codigo' => '0008',
                'descripcion' => 'ALICATE UNIVERSAL',
                'unidad_medida' => 'NIU',
                'valor_venta_unitario' => 16.949153,
                'precio_venta_unitario' => 20.00,
                'tipo_afectacion_igv' => '10',
            ],
            [
                'codigo' => '0009',
                'descripcion' => 'GRASA EP2',
                'unidad_medida' => 'NIU',
                'valor_venta_unitario' => 381.355932,
                'precio_venta_unitario' => 450.00,
                'tipo_afectacion_igv' => '10',
            ],
            [
                'codigo' => '0010',
                'descripcion' => 'JUEGO DE LLAVE MIXTA 14 PIEZAS',
                'unidad_medida' => 'NIU',
                'valor_venta_unitario' => 67.796610,
                'precio_venta_unitario' => 80.00,
                'tipo_afectacion_igv' => '10',
            ],
            [
                'codigo' => '0011',
                'descripcion' => 'LIQUIDO PARA FRENOS',
                'unidad_medida' => 'WG',
                'valor_venta_unitario' => 152.542373,
                'precio_venta_unitario' => 180.00,
                'tipo_afectacion_igv' => '10',
            ],
            [
                'codigo' => '0012',
                'descripcion' => 'LLAVE DE RUEDAS 41MM',
                'unidad_medida' => 'NIU',
                'valor_venta_unitario' => 88.983051,
                'precio_venta_unitario' => 105.00,
                'tipo_afectacion_igv' => '10',
            ],
            [
                'codigo' => '0013',
                'descripcion' => 'MARTILLO 16OZ',
                'unidad_medida' => 'NIU',
                'valor_venta_unitario' => 16.949153,
                'precio_venta_unitario' => 20.00,
                'tipo_afectacion_igv' => '10',
            ],
            [
                'codigo' => '0014',
                'descripcion' => 'REFRIGERANTE PARA RADIADOR',
                'unidad_medida' => 'WG',
                'valor_venta_unitario' => 245.762712,
                'precio_venta_unitario' => 290.00,
                'tipo_afectacion_igv' => '10',
            ],
            [
                'codigo' => '0015',
                'descripcion' => 'TRITURADORA',
                'unidad_medida' => 'NIU',
                'valor_venta_unitario' => 5762.711864,
                'precio_venta_unitario' => 6800.00,
                'tipo_afectacion_igv' => '10',
            ],
            [
                'codigo' => '1001',
                'descripcion' => 'MANTENIMIENTO PREVENTIVO DE CAMIÓN VOLQUETE',
                'unidad_medida' => 'NIU',
                'categoria' => 'SERVICIOS',
                'valor_venta_unitario' => 5923.728814,
                'precio_venta_unitario' => 6990.00,
                'tipo_afectacion_igv' => '10',
                'destacado' => true,
            ],
        ];

        foreach ($productos as $productoData) {
            Producto::create([
                'empresa_id' => $empresa->id,
                'codigo' => $productoData['codigo'],
                'descripcion' => $productoData['descripcion'],
                'categoria' => $productoData['categoria'] ?? null,
                'unidad_medida' => $productoData['unidad_medida'],
                'codigo_producto_sunat' => null,
                'moneda' => 'PEN',
                'valor_venta_unitario' => $productoData['valor_venta_unitario'],
                'precio_venta_unitario' => $productoData['precio_venta_unitario'],
                'costo_compra_unitario' => null,
                'precio_compra_unitario' => null,
                'tipo_afectacion_igv' => $productoData['tipo_afectacion_igv'],
                'destacado' => $productoData['destacado'] ?? false,
                'activo' => true,
                'stock_actual' => 0,
                'stock_minimo' => null,
                'stock_maximo' => null,
            ]);
        }

        echo "✅ Se crearon " . count($productos) . " productos de ejemplo.\n";
    }
}
