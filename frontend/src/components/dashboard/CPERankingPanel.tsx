import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CPERankingItem {
  name: string;
  value: number | string;
  percentage?: number; // Para la barra de progreso (0-100)
}

interface CPERankingPanelProps {
  data: CPERankingItem[];
  className?: string;
}

/**
 * CPERankingPanel Component
 * Panel de ranking de CPE con barras de progreso (diseño Nubofact)
 */
// Vercel Best Practice: Memoize expensive calculations
export function CPERankingPanel({ data, className }: CPERankingPanelProps) {
  // Calcular el máximo para las barras de progreso si no viene porcentaje
  const maxValue = Math.max(...data.map(item => typeof item.value === 'number' ? item.value : 0));

  return (
    <Card className={`overflow-hidden shadow-md ${className}`}>
      <CardHeader className="bg-primary text-primary-foreground px-4 py-3">
        <CardTitle className="text-sm font-semibold">CPE</CardTitle>
      </CardHeader>
      <CardContent className="bg-muted p-4 min-h-70">
        <div className="space-y-2">
          {data.map((item, index) => {
            const barWidth = item.percentage 
              ? item.percentage 
              : typeof item.value === 'number' ? (item.value / maxValue) * 100 : 0;
            
            return (
              <div key={index} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-foreground w-6">{index + 1}</span>
                  <span className="text-foreground font-medium flex-1">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-foreground w-12 text-right">{item.value}</span>
                  <div className="w-20 h-2 bg-secondary/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${Math.min(barWidth, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
