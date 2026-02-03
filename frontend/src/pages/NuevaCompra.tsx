import { useState } from 'react';
import { Plus, Upload, RotateCcw, X } from 'lucide-react';
import { NubofactHeader } from '@/components/layout/NubofactHeader';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NuevaCompra() {
  const [tipoComprobante, setTipoComprobante] = useState('');
  const [serie, setSerie] = useState('');
  const [numero, setNumero] = useState('');
  const [fechaEmision, setFechaEmision] = useState('2026-04-15');
  const [fechaVencimiento, setFechaVencimiento] = useState('2026-04-15');
  const [tipoCambio, setTipoCambio] = useState('0');
  const [moneda, setMoneda] = useState('');
  const [incluyeIgv, setIncluyeIgv] = useState(true);
  const [agregarPagos, setAgregarPagos] = useState(false);
  const [proveedor, setProveedor] = useState('');

  const handleResetForm = () => {
    setTipoComprobante('');
    setSerie('');
    setNumero('');
    setFechaEmision('2026-04-15');
    setFechaVencimiento('2026-04-15');
    setTipoCambio('0');
    setMoneda('');
    setIncluyeIgv(true);
    setAgregarPagos(false);
    setProveedor('');
    toast.success('Formulario reiniciado');
  };

  const handleCancel = () => {
    toast.info('Operación cancelada');
    handleResetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Funcionalidad de guardar compra en desarrollo');
  };

  return (
    <div className="min-h-screen bg-background">
      <NubofactHeader />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-primary text-primary-foreground rounded-t-lg px-4 py-3">
          <h1 className="text-lg font-semibold">Nueva Compra</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-b-lg">
          <div className="p-6 space-y-6">
            {/* Comprobante de Compra Section */}
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <h2 className="text-sm font-semibold mb-4 text-foreground">Comprobante de Compra</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_comprobante">Tipo de Comprobante</Label>
                  <Select value={tipoComprobante} onValueChange={setTipoComprobante}>
                    <SelectTrigger id="tipo_comprobante" className="bg-background">
                      <SelectValue placeholder="Seleccione tipo de comprobante" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="factura">Factura</SelectItem>
                      <SelectItem value="boleta">Boleta</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serie">Serie</Label>
                  <Input
                    id="serie"
                    value={serie}
                    onChange={(e) => setSerie(e.target.value)}
                    className="bg-background"
                    placeholder="Ingrese serie"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    className="bg-background"
                    placeholder="Ingrese número"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha_emision">F. Emisión</Label>
                  <Input
                    id="fecha_emision"
                    type="date"
                    value={fechaEmision}
                    onChange={(e) => setFechaEmision(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_vencimiento">F. Venc</Label>
                  <Input
                    id="fecha_vencimiento"
                    type="date"
                    value={fechaVencimiento}
                    onChange={(e) => setFechaVencimiento(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo_cambio">T.C.</Label>
                  <Input
                    id="tipo_cambio"
                    type="number"
                    step="0.001"
                    value={tipoCambio}
                    onChange={(e) => setTipoCambio(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moneda">Moneda</Label>
                  <Select value={moneda} onValueChange={setMoneda}>
                    <SelectTrigger id="moneda" className="bg-background">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PEN">PEN - Soles</SelectItem>
                      <SelectItem value="USD">USD - Dólares</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incluye_igv">Incluye IGV</Label>
                  <div className="flex items-center h-10">
                    <button
                      type="button"
                      onClick={() => setIncluyeIgv(!incluyeIgv)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        incluyeIgv ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          incluyeIgv ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="agregar_pagos"
                  checked={agregarPagos}
                  onChange={(e) => setAgregarPagos(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="agregar_pagos" className="cursor-pointer">
                  ¿Desea agregar pagos a esta compra?
                </Label>
              </div>
            </div>

            {/* Proveedor Section */}
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">Proveedor</h2>
                <Button
                  type="button"
                  onClick={() => toast.info('Funcionalidad de agregar proveedor en desarrollo')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nuevo
                </Button>
              </div>
              <div className="space-y-2">
                <Select value={proveedor} onValueChange={setProveedor}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proveedor1">Proveedor 1</SelectItem>
                    <SelectItem value="proveedor2">Proveedor 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Productos Section - Placeholder */}
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  type="button"
                  onClick={() => toast.info('Funcionalidad de agregar producto en desarrollo')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Producto
                </Button>
                <Button
                  type="button"
                  onClick={() => toast.info('Funcionalidad de importar items en desarrollo')}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Importar Items
                </Button>
              </div>
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No hay productos agregados. Haga clic en "Agregar Producto" o "Importar Items" para comenzar.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                onClick={handleResetForm}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                variant="destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
