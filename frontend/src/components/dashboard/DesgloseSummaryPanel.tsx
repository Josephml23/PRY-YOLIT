import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type DesgloseSummaryPanelProps } from '@/types';

export function DesgloseSummaryPanel({ title, items, children }: DesgloseSummaryPanelProps & { children?: React.ReactNode }) {
  return (
    <Card className="border bg-[hsl(var(--dashboard-dark))] text-[hsl(var(--dashboard-dark-foreground))] shadow-lg dark:border-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <span className="text-xs sm:text-sm opacity-70 flex-shrink-0">{item.label}</span>
            <span
              className={`text-sm sm:text-base font-semibold text-right break-words ${
                item.highlight ? 'text-blue-600 dark:text-blue-300' : ''
              }`}
            >
              {item.value}
            </span>
          </div>
        ))}
        {children && <div className="mt-4 pt-3 border-t dark:border-white/10">{children}</div>}
      </CardContent>
    </Card>
  );
}
