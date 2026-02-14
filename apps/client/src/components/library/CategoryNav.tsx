import { Bone, Activity, Move, Clipboard, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ClinicalCategory } from '@/types/library';

interface CategoryNavProps {
  categories: ClinicalCategory[];
  selectedCategoryId?: string;
  onSelectCategory: (id: string | undefined) => void;
}

const iconMap: Record<string, LucideIcon> = {
  bone: Bone,
  muscle: Activity,
  activity: Activity,
  move: Move,
  clipboard: Clipboard,
};

export function CategoryNav({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryNavProps) {
  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
      <div className="flex gap-3 min-w-max px-2">
        {categories.map((category) => {
          const Icon = iconMap[category.icon] || Activity;
          const isSelected = selectedCategoryId === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(isSelected ? undefined : category.id)}
              className={cn(
                'group flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-300 text-sm font-bold tracking-tight shadow-sm',
                isSelected
                  ? 'bg-teal-600 text-white border-teal-600 shadow-teal-200 dark:shadow-teal-900/20 scale-105 z-10'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50/50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:border-teal-500'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-lg transition-colors',
                isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/40'
              )}>
                <Icon className="h-4 w-4" />
              </div>
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
