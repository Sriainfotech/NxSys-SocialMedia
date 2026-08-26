import { Grid3x3, List as ListIcon, LayoutList } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ViewMode } from '@/hooks/useViewMode';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
  /** Which modes to expose, in order. Defaults to all three. */
  modes?: ViewMode[];
}

const META: Record<ViewMode, { icon: React.ElementType; label: string }> = {
  grid: { icon: Grid3x3, label: 'Grid' },
  list: { icon: ListIcon, label: 'List' },
  detailed: { icon: LayoutList, label: 'Detailed' },
};

const ViewToggle = ({
  value,
  onChange,
  className,
  modes = ['grid', 'list', 'detailed'],
}: ViewToggleProps) => (
  <div
    role="tablist"
    aria-label="View mode"
    className={cn(
      'inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm',
      className
    )}
  >
    {modes.map((m) => {
      const Icon = META[m].icon;
      const active = value === m;
      return (
        <button
          key={m}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(m)}
          title={META[m].label}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-medium transition-colors',
            active
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm shadow-blue-500/30'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          <Icon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{META[m].label}</span>
        </button>
      );
    })}
  </div>
);

export default ViewToggle;
