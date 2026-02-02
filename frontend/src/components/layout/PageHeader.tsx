import { type PageHeaderProps } from '@/types';

/**
 * PageHeader Component
 * 
 * Displays a page title with optional description and action buttons.
 * Responsive layout: stacks vertically on mobile, horizontal on desktop.
 * 
 * @param title - Main heading text (required)
 * @param description - Optional subtitle or description
 * @param actions - Optional React node for action buttons (e.g., "New", "Export")
 * 
 * @example
 * <PageHeader 
 *   title="Clientes" 
 *   description="Manage your customers"
 *   actions={<Button>New Client</Button>}
 * />
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
