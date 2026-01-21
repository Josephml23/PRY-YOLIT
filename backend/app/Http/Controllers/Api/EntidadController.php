<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Entidad;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class EntidadController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Entidad::query()->where('es_cliente', true);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('denominacion', 'like', "%{$search}%")
                    ->orWhere('num_doc', 'like', "%{$search}%")
                    ->orWhere('razon_comercial', 'like', "%{$search}%");
            });
        }

        $clientes = $query->orderBy('denominacion')->paginate(15);

        return response()->json($clientes);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tipo_doc' => 'required|string|max:2',
            'num_doc' => 'required|string|max:20',
            'denominacion' => 'required|string|max:255',
            'razon_comercial' => 'nullable|string|max:255',
            'direccion' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        $empresaId = Auth::user()->empresa_id ?? null;

        $entidad = Entidad::updateOrCreate(
            [
                'empresa_id' => $empresaId,
                'tipo_doc' => $data['tipo_doc'],
                'num_doc' => $data['num_doc'],
            ],
            [
                'denominacion' => $data['denominacion'],
                'razon_comercial' => $data['razon_comercial'] ?? null,
                'direccion' => $data['direccion'] ?? null,
                'email' => $data['email'] ?? null,
                'telefono' => $data['telefono'] ?? null,
                'es_cliente' => true,
                'es_proveedor' => false,
            ]
        );

        return response()->json([
            'success' => true,
            'data' => $entidad,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $entidad = Entidad::where('es_cliente', true)->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $entidad,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $entidad = Entidad::where('es_cliente', true)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'tipo_doc' => 'sometimes|string|max:2',
            'num_doc' => 'sometimes|string|max:20',
            'denominacion' => 'sometimes|string|max:255',
            'razon_comercial' => 'nullable|string|max:255',
            'direccion' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:50',
            'es_cliente' => 'boolean',
            'es_proveedor' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        $entidad->update($data);

        return response()->json([
            'success' => true,
            'data' => $entidad,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $entidad = Entidad::where('es_cliente', true)->findOrFail($id);
        $entidad->delete();

        return response()->json([
            'success' => true,
        ]);
    }
}
