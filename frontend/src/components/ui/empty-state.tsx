import { type EmptyStateProps } from '@/types';
import { cn } from '@/lib/utils';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps & { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-8 text-center text-muted-foreground',
        className
      )}
      role="status"
      aria-label={title}
    >
      <Icon className="h-12 w-12 mb-4 opacity-50" aria-hidden />
      <p className="font-medium text-foreground">{title}</p>
      {description && <p className="text-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
