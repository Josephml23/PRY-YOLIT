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
      <CardHeader className="bg-[hsl(var(--nubofact-primary))] text-white px-4 py-3">
        <CardTitle className="text-sm font-semibold">CPE</CardTitle>
      </CardHeader>
      <CardContent className="bg-gray-200 dark:bg-gray-800 p-4 min-h-[280px]">
        <div className="space-y-2">
          {data.map((item, index) => {
            const barWidth = item.percentage 
              ? item.percentage 
              : typeof item.value === 'number' ? (item.value / maxValue) * 100 : 0;
            
            return (
              <div key={index} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-gray-700 w-6">{index + 1}</span>
                  <span className="text-gray-800 flex-1">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 w-12 text-right">{item.value}</span>
                  <div className="w-20 h-2 bg-white rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[hsl(var(--nubofact-primary))] transition-all duration-300"
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
