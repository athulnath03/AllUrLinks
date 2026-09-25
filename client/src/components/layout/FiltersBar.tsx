"use client";

import type { RefObject } from "react";
import type { LucideIcon } from "lucide-react";

export interface SortOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

interface FiltersBarProps {
  categories: string[];
  category: string;
  onCategoryChange: (category: string) => void;

  sort: string;
  sortOptions: SortOption[];
  sortMenuOpen: boolean;
  sortMenuRef: RefObject<HTMLDivElement | null>;
  onToggleSortMenu: () => void;
  onSortChange: (sort: string) => void;
}

export default function FiltersBar({
  categories,
  category,
  onCategoryChange,
  sort,
  sortOptions,
  sortMenuOpen,
  sortMenuRef,
  onToggleSortMenu,
  onSortChange,
}: FiltersBarProps) {
  const selected =
    sortOptions.find(option => option.value === sort) ?? sortOptions[0];

  const SelectedIcon = selected.icon;

  return (
    <div className="mb-[18px] flex w-full min-w-0 items-center justify-between gap-2">
      <div className="flex w-full min-w-0 items-center justify-between gap-2">
        <div className="h-9 min-w-0 rounded-[12px] border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] p-1">
          <div className="flex h-full min-w-0 items-center gap-1.5 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
            {categories.map(item => (
              <button
                key={item}
                type="button"
                className={`flex-none whitespace-nowrap rounded-[11px] border border-transparent px-[11px] py-1.5 text-[12px] font-[650] text-[var(--muted)] transition-[background,color,border-color] duration-[150ms] ease-[ease] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] ${
                  category === item
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : ""
                }`}
                onClick={() => onCategoryChange(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={sortMenuRef}
        className={`relative flex-none ${sortMenuOpen ? "open" : ""}`}
      >
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center gap-[7px] whitespace-nowrap rounded-[10px] border border-[var(--line)] bg-[var(--surface)] px-3 text-[12px] font-bold text-[var(--ink)] transition-[border-color,background,transform] duration-[180ms] ease-[ease] hover:border-[var(--accent)] active:scale-[0.97] max-[520px]:px-[10px]"
          onClick={onToggleSortMenu}
          aria-label="Sort favourites"
          aria-expanded={sortMenuOpen}
        >
          <SelectedIcon size={15} />

          <span className="max-[520px]:hidden">
            {selected.label}
          </span>
        </button>

        <div
          className={`absolute right-0 top-[calc(100%+8px)] z-[30] w-[130px] rounded-[11px] border border-[var(--line)] bg-[var(--surface)] p-1 shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-[transform,opacity] duration-[150ms] [transform-origin:top_right] ${
            sortMenuOpen
              ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
              : "pointer-events-none -translate-y-1 scale-95 opacity-0"
          }`}
        >
          {sortOptions.map(option => {
            const Icon = option.icon;

            return (
              <button
                key={option.value}
                type="button"
                className={`inline-flex h-9 w-full min-w-[34px] flex-none items-center justify-start gap-[7px] rounded-[7px] border-0 bg-transparent px-[9px] text-[11px] text-[var(--ink)] transition-[background,color] duration-[150ms] ease-in hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] max-[520px]:flex max-[520px]:h-auto max-[520px]:w-full max-[520px]:justify-start max-[520px]:gap-[9px] max-[520px]:rounded-lg max-[520px]:px-[10px] max-[520px]:py-[9px] max-[520px]:text-[12px] ${
                  sort === option.value
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : ""
                }`}
                onClick={() => onSortChange(option.value)}
              >
                <Icon size={15} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}