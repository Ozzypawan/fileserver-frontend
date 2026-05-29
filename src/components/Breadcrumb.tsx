import React from 'react';
import { FolderOpen } from 'lucide-react';
import type { BreadcrumbItem } from '../types';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (id: string | null) => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, onNavigate }) => {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm flex-wrap">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isFirst = index === 0;

        return (
          <React.Fragment key={item.id ?? '__root__'}>
            {/* Separator — shown before every item except the first */}
            {!isFirst && (
              <span className="text-slate-400 select-none" aria-hidden="true">
                /
              </span>
            )}

            {isLast ? (
              /* Last item: non-clickable, bold for emphasis */
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                {isFirst && (
                  <FolderOpen
                    size={16}
                    className="text-slate-500 shrink-0"
                    aria-hidden="true"
                  />
                )}
                {item.name}
              </span>
            ) : (
              /* Clickable item */
              <button
                type="button"
                onClick={() => onNavigate(item.id)}
                className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors duration-150 focus:outline-none focus-visible:underline"
              >
                {isFirst && (
                  <FolderOpen
                    size={16}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                )}
                {item.name}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
