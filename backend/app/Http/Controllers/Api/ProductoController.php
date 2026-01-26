<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ProductoController extends Controller
{
    /**
     * Listar productos con filtros
     */
    public function index(Request $request): JsonResponse
    {
        $query = Producto::with('empresa');

        // Filtro por empresa
        if ($request->has('empresa_id')) {
            $query->where('empresa_id', $request->empresa_id);
        }

        // Filtro por categoría
        if ($request->has('categoria')) {
            $query->where('categoria', $request->categoria);
        }

        // Filtro por destacados
        if ($request->has('destacado')) {
            $query->where('destacado', $request->destacado);
        }

        // Filtro por activos
        if ($request->has('activo')) {
            $query->where('activo', $request->activo);
        } else {
            // Por defecto, solo activos
            $query->where('activo', true);
        }

        // Búsqueda por código o descripción
        if ($request->has('buscar')) {
            $query->buscar($request->buscar);
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'codigo');
        $sortOrder = $request->get('sort_order', 'asc');
        
        // Ordenamiento case-insensitive para código y descripción
        if ($sortBy === 'codigo' || $sortBy === 'descripcion') {
            $query->orderByRaw("LOWER({$sortBy}) {$sortOrder}");
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Paginación o listado completo
        if ($request->has('per_page')) {
            $productos = $query->paginate($request->per_page);
        } else {
            $productos = $query->get();
        }

        return response()->json($productos);
    }

    /**
     * Obtener un producto específico
     */
    public function show(string $id): JsonResponse
    {
        $producto = Producto::with('empresa')->findOrFail($id);
        return response()->json($producto);
    }

    /**
     * Crear un nuevo producto
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'empresa_id' => 'required|exists:empresas,id',
            'codigo' => 'nullable|string|max:50',
            'descripcion' => 'required|string',
            'categoria' => 'nullable|string|max:100',
            'unidad_medida' => 'required|string|max:10',
            'codigo_producto_sunat' => 'nullable|string|max:20',
            'moneda' => 'nullable|string|max:3',
            'valor_venta_unitario' => 'nullable|numeric|min:0',
            'precio_venta_unitario' => 'nullable|numeric|min:0',
            'costo_compra_unitario' => 'nullable|numeric|min:0',
            'precio_compra_unitario' => 'nullable|numeric|min:0',
            'tipo_afectacion_igv' => 'nullable|string|max:2',
            'destacado' => 'nullable|boolean',
            'activo' => 'nullable|boolean',
            'stock_actual' => 'nullable|numeric|min:0',
            'stock_minimo' => 'nullable|numeric|min:0',
            'stock_maximo' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $producto = Producto::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Producto creado exitosamente',
            'data' => $producto->load('empresa')
        ], 201);
    }

    /**
     * Actualizar un producto
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $producto = Producto::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'empresa_id' => 'sometimes|exists:empresas,id',
            'codigo' => 'sometimes|nullable|string|max:50',
            'descripcion' => 'sometimes|string',
            'categoria' => 'sometimes|nullable|string|max:100',
            'unidad_medida' => 'sometimes|string|max:10',
            'codigo_producto_sunat' => 'sometimes|nullable|string|max:20',
            'moneda' => 'sometimes|nullable|string|max:3',
            'valor_venta_unitario' => 'sometimes|nullable|numeric|min:0',
            'precio_venta_unitario' => 'sometimes|nullable|numeric|min:0',
            'costo_compra_unitario' => 'sometimes|nullable|numeric|min:0',
            'precio_compra_unitario' => 'sometimes|nullable|numeric|min:0',
            'tipo_afectacion_igv' => 'sometimes|nullable|string|max:2',
            'destacado' => 'sometimes|boolean',
            'activo' => 'sometimes|boolean',
            'stock_actual' => 'sometimes|nullable|numeric|min:0',
            'stock_minimo' => 'sometimes|nullable|numeric|min:0',
            'stock_maximo' => 'sometimes|nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $producto->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Producto actualizado exitosamente',
            'data' => $producto->load('empresa')
        ]);
    }

    /**
     * Eliminar un producto (soft delete: marcar como inactivo)
     */
    public function destroy(string $id): JsonResponse
    {
        $producto = Producto::findOrFail($id);
        $producto->update(['activo' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Producto desactivado exitosamente'
        ]);
    }

    /**
     * Restaurar un producto
     */
    public function restore(string $id): JsonResponse
    {
        $producto = Producto::findOrFail($id);
        $producto->update(['activo' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Producto activado exitosamente',
            'data' => $producto->load('empresa')
        ]);
    }

    /**
     * Toggle destacado
     */
    public function toggleDestacado(string $id): JsonResponse
    {
        $producto = Producto::findOrFail($id);
        $producto->update(['destacado' => !$producto->destacado]);

        return response()->json([
            'success' => true,
            'message' => $producto->destacado ? 'Producto marcado como destacado' : 'Producto desmarcado como destacado',
            'data' => $producto
        ]);
    }

    /**
     * Obtener productos destacados
     */
    public function destacados(Request $request): JsonResponse
    {
        $empresaId = $request->get('empresa_id');
        
        $query = Producto::destacado()->activo();
        
        if ($empresaId) {
            $query->where('empresa_id', $empresaId);
        }

        $productos = $query->orderBy('descripcion', 'asc')->get();

        return response()->json($productos);
    }

    /**
     * Importar productos desde CSV
     */
    public function importar(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'empresa_id' => 'required|exists:empresas,id',
            'archivo' => 'required|file|mimes:csv,txt',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // TODO: Implementar lógica de importación CSV
        
        return response()->json([
            'success' => false,
            'message' => 'Funcionalidad de importación en desarrollo'
        ], 501);
    }
}
