"use client";

import { Plus } from "lucide-react";

interface CollectionHeaderProps {
  count: number;
  onAdd: () => void;
}

export default function CollectionHeader({
  count,
  onAdd,
}: CollectionHeaderProps) {
  return (
    <section className="mb-[22px] flex items-end justify-between max-[520px]:items-center">
      <div>
        <p className="m-0 mb-[13px] text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">
          Your collection (<span>{count}</span>)
        </p>
      </div>

      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 rounded-[10px] border-0 bg-[var(--accent-soft)] px-[14px] py-[10px] text-[13px] font-bold text-[var(--ink)] shadow-[0_5px_15px_rgba(49,92,76,0.18)] transition duration-[180ms] ease-in hover:-translate-y-px hover:brightness-105 active:scale-[0.97] max-[520px]:px-[10px] max-[520px]:py-[9px] max-[520px]:text-[12px]"
        onClick={onAdd}
      >
        <Plus size={17} />
        New
      </button>
    </section>
  );
}