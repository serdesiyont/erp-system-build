import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({
  title,
  description,
  children,
  action,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
