import { type UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

type ComprobanteFormValues = {
  detraccion?: boolean;
};

interface Totales {
  total_gravada: number;
  total_igv: number;
  total: number;
}

interface ResumenTotalesCardProps {
  form: UseFormReturn<ComprobanteFormValues>;
  totales: Totales;
  requiereDocumento: boolean;
}

export function ResumenTotalesCard({ form, totales, requiereDocumento }: ResumenTotalesCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Resumen de totales</CardTitle>
        <CardDescription className="text-xs">
          Revisa los montos antes de emitir el comprobante.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 text-xs sm:text-sm">
        <div className="flex justify-between">
          <span>Gravada S/</span>
          <span>{totales.total_gravada.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>IGV S/</span>
          <span>{totales.total_igv.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Exonerada S/</span>
          <span>0.00</span>
        </div>
        <div className="flex justify-between">
          <span>Inafecta S/</span>
          <span>0.00</span>
        </div>
        <div className="flex justify-between font-semibold border-t pt-2 mt-1 text-sm">
          <span>Total S/</span>
          <span>{totales.total.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between pt-2 mt-1 border-t">
          <span className="text-sm">¿Detracción?</span>
          <Switch
            checked={!!form.watch('detraccion')}
            onCheckedChange={(checked) => form.setValue('detraccion', checked)}
          />
        </div>
        {!requiereDocumento && totales.total >= 700 && (
          <p className="text-xs text-amber-600 pt-2">
            ⚠ Para montos ≥ S/ 700 se requiere documento del cliente
          </p>
        )}
      </CardContent>
    </Card>
  );
}

