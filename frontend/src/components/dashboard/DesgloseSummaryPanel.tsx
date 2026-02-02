import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type DesgloseSummaryPanelProps } from '@/types';

/**
 * DesgloseSummaryPanel - Financial breakdown with ledger-style precision
 * 
 * Design Principles:
 * - Signature: Document receipt strip on left (evokes fiscal document authenticity)
 * - Typography: tabular-nums for decimal alignment like accounting books
 * - Craft: Subtle borders, quiet hierarchy, professional feel
 */
export function DesgloseSummaryPanel({ title, items, children }: DesgloseSummaryPanelProps & { children?: React.ReactNode }) {
  return (
    <Card className="border bg-[hsl(var(--dashboard-dark))] text-[hsl(var(--dashboard-dark-foreground))] shadow-lg dark:border-none border-l-[3px] border-l-primary/60 relative overflow-hidden">
      {/* Signature Element: Document Receipt Strip */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-0.75 opacity-40"
        style={{
          background: 'linear-gradient(to bottom, hsl(142 76% 36%), hsl(221 83% 53%))',
        }}
        aria-hidden="true"
      />
      
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <span className="text-xs sm:text-sm opacity-70 shrink-0">{item.label}</span>
            <span
              className={`text-sm sm:text-base font-semibold text-right tabular-nums tracking-tight ${
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

