import type { CategoriaClinica } from '../types';
import { clsx } from 'clsx';
import { Activity, Move, Clipboard, Bone, HelpCircle } from 'lucide-react';

interface CategoryNavProps {
  categorias: CategoriaClinica[];
  selectedCategoryId?: string;
  onSelectCategory: (id: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  bone: Bone,
  muscle: Activity,
  activity: Activity,
  move: Move,
  clipboard: Clipboard,
};

export function CategoryNav({
  categorias,
  selectedCategoryId,
  onSelectCategory,
}: CategoryNavProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
      {categorias.map((cat) => {
        const Icon = ICON_MAP[cat.icon] || HelpCircle;
        const isSelected = selectedCategoryId === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={clsx(
              'flex flex-col items-center gap-2 p-4 min-w-[120px] rounded-xl border transition-all duration-200',
              isSelected
                ? 'bg-teal-50 border-teal-200 text-teal-900 shadow-sm dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-100'
                : 'bg-white border-slate-200 text-slate-600 hover:border-teal-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-750',
            )}
          >
            <div
              className={clsx(
                'p-2 rounded-full transition-colors',
                isSelected
                  ? 'bg-teal-100 text-teal-700 dark:bg-teal-800 dark:text-teal-200'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
              )}
            >
              <Icon size={20} strokeWidth={2} />
            </div>
            <span className="text-xs font-medium text-center leading-tight">
              {cat.nombre}
            </span>
          </button>
        );
      })}
    </div>
  );
}
