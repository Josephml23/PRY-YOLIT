import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type MetricCardProps } from '@/types';
import { cn } from '@/lib/utils';

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  details,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn('hover:shadow-lg transition-shadow', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {details && details.length > 0 && (
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            {details.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
