import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type DesgloseSummaryPanelProps } from '@/types';

export function DesgloseSummaryPanel({ title, items, children }: DesgloseSummaryPanelProps & { children?: React.ReactNode }) {
  return (
    <Card className="border-none bg-[hsl(var(--dashboard-dark))] text-white shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg font-semibold text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-white/80">{item.label}</span>
            <span
              className={`text-sm sm:text-base font-semibold ${
                item.highlight ? 'text-blue-300' : 'text-white'
              }`}
            >
              {item.value}
            </span>
          </div>
        ))}
        {children && <div className="mt-4">{children}</div>}
      </CardContent>
    </Card>
  );
}
