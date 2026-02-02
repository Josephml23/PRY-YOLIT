import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type FilterBarProps } from '@/types';
import { cn } from '@/lib/utils';

export function FilterBar({
  children,
  onClear,
  clearLabel = 'Limpiar filtros',
  className,
}: FilterBarProps) {
  return (
    <Card className={cn('border-dashed bg-muted/40', className)}>
      <CardContent className="pt-4 pb-3">
        <div className="flex flex-col gap-3">
          {children}
          {onClear && (
            <div className="flex justify-end">
              <Button type="button" variant="outline" size="sm" onClick={onClear}>
                {clearLabel}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
