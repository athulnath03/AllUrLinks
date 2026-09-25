"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";

import type { Favourite } from "@/types/favourite";
import { domainIcon } from "@/lib/favicon";

interface FavouriteGridProps {
  loading: boolean;
  visible: Favourite[];
  query: string;
  category: string;
  actionMenuItem: Favourite | null;
  actionMenuRef: React.RefObject<HTMLDivElement | null>;

  onTrackVisit: (item: Favourite) => void;
  onEdit: (item: Favourite) => void;
  onDelete: (item: Favourite) => void;
  onToggleActionMenu: (item: Favourite) => void;
  onAdd: () => void;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ScrollingTitle({ name }: { name: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const text = textRef.current;

      if (!container || !text) return;

      const overflow =
        text.getBoundingClientRect().width -
        container.getBoundingClientRect().width;

      setDistance(Math.max(0, overflow));
    };

    measure();

    const observer = new ResizeObserver(measure);

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [name]);

  return (
    <div
      ref={containerRef}
      className="min-w-0 overflow-hidden whitespace-nowrap max-w-[110px]"
    >
      <span
        ref={textRef}
        className="inline-block"
        style={
          distance > 0
            ? ({
                "--scroll-distance": `-${distance}px`,
                animation: "title-scroll 5s ease-in-out infinite alternate",
              } as React.CSSProperties)
            : undefined
        }
      >
        {name}
      </span>
    </div>
  );
}

export default function FavouriteGrid({
  loading,
  visible,
  query,
  category,
  actionMenuItem,
  actionMenuRef,
  onTrackVisit,
  onEdit,
  onDelete,
  onToggleActionMenu,
  onAdd,
}: FavouriteGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-[repeat(5,minmax(0,1fr))] gap-3 max-[800px]:grid-cols-[repeat(2,minmax(0,1fr))] max-[520px]:gap-[9px]">
        {[1, 2, 3, 4, 5].map(item => (
          <div
            className="flex h-[72px] gap-2 rounded-[14px] border border-[var(--line)] bg-[linear-gradient(90deg,var(--surface),color-mix(in_srgb,var(--line)_45%,var(--surface)),var(--surface))] bg-[length:200%_100%] p-[11px_12px] animate-[shimmer_1.5s_infinite] max-[520px]:h-[68px] max-[520px]:rounded-[13px] max-[520px]:p-[10px]"
            key={item}
          >
            <div className="h-10 w-10 flex-none rounded-[9px] bg-[color-mix(in_srgb,var(--line)_65%,var(--surface))] max-[520px]:h-8 max-[520px]:w-8" />

            <div className="flex min-w-0 w-full items-center justify-between">
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="h-[10px] w-[65px] rounded-[99px] bg-[color-mix(in_srgb,var(--line)_70%,var(--surface))]" />
                <div className="h-2 w-[58px] rounded-[99px] bg-[color-mix(in_srgb,var(--line)_65%,var(--surface))]" />
              </div>

              <div className="h-[27px] w-[27px] flex-none rounded-[7px] bg-[color-mix(in_srgb,var(--line)_55%,var(--surface))]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (visible.length) {
    return (
      <div className="mb-[100px] grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 max-[520px]:gap-[9px]">
        {visible.map(item => (
          <article
            data-favourite-card
            key={item.id}
            tabIndex={0}
            onClick={event => {
              if ((event.target as HTMLElement).closest("button")) return;

              onTrackVisit(item);
              window.open(item.url, "_blank", "noopener,noreferrer");
            }}
            onKeyDown={event => {
              if (event.key === "Enter") {
                event.preventDefault();
                onTrackVisit(item);
                window.open(item.url, "_blank", "noopener,noreferrer");
              }

              if (event.key.toLowerCase() === "e") {
                event.preventDefault();
                onEdit(item);
              }

              if (event.key === "Delete") {
                event.preventDefault();
                onDelete(item);
              }
            }}
            className={`relative ${
              actionMenuItem?.id === item.id ? "z-20" : "z-0"
            } flex cursor-pointer gap-2 rounded-[14px] border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] p-[11px_12px] shadow-[0_4px_15px_rgba(25,35,29,0.025)] transition-[transform,border-color,box-shadow] duration-200 ease-in hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--line))] hover:shadow-[var(--shadow)] focus:border-[var(--accent)] focus:outline-none focus:shadow-[0_0_0_3px_var(--accent-soft)] max-[520px]:rounded-[13px] max-[520px]:p-[10px]`}
          >
            <div className="grid h-10 w-10 flex-none place-items-center rounded-[9px] bg-[var(--accent-soft)] max-[520px]:h-8 max-[520px]:w-8">
              <img
                className="h-6 w-6 rounded-[5px] object-contain"
                src={item.icon || domainIcon(item.url) || ""}
                alt=""
                onError={e => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden"
                  );
                }}
              />

              <span className="hidden text-[9px] font-extrabold text-[var(--accent)]">
                {initials(item.name)}
              </span>
            </div>

            <div className="flex w-full items-center justify-between">
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="min-w-0 overflow-hidden text-[13px] font-bold tracking-[-0.02em] text-[var(--ink)] max-[520px]:text-[12px]">
                  <ScrollingTitle name={item.name} />
                </div>

                <span className="flex text-[10px] font-semibold text-[var(--muted)] no-underline max-[520px]:text-[9px]">
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                    {item.category || "Uncategorized"}
                  </span>
                </span>
              </div>

              <div className="relative z-10">
                <button
                  type="button"
                  className="grid h-[27px] w-[27px] flex-none place-items-center rounded-[7px] border-0 bg-transparent p-0 text-[var(--muted)] opacity-[0.65] transition-[background,color,opacity] duration-[150ms] ease-in hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] group-hover:opacity-100 max-[520px]:h-[25px] max-[520px]:w-[25px]"
                  aria-label={`Options for ${item.name}`}
                  title="More options"
                  onClick={event => {
                    event.stopPropagation();
                    onToggleActionMenu(item);
                  }}
                >
                  <MoreVertical size={17} />
                </button>

                {actionMenuItem?.id === item.id && (
                  <div
                    ref={actionMenuRef}
                    className="absolute right-0 top-[34px] z-[9999] w-[150px] rounded-[11px] border border-[var(--line)] bg-[var(--surface)] p-[5px] shadow-[0_10px_30px_rgba(0,0,0,0.12)] animate-[actionModalIn_150ms_ease]"
                    onClick={event => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-[9px] rounded-[7px] border-0 bg-transparent px-[9px] py-[8px] text-left text-[11px] font-[650] text-[var(--ink)] transition-[background,color] duration-[150ms] ease-in hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                      onClick={() => onEdit(item)}
                    >
                      <Pencil size={14} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      className="flex w-full items-center gap-[9px] rounded-[7px] border-0 bg-transparent px-[9px] py-[8px] text-left text-[11px] font-[650] text-[var(--ink)] transition-[background,color] duration-[150ms] ease-in hover:bg-[#fae9e7] hover:text-[#b42318]"
                      onClick={() => onDelete(item)}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-[18px] border border-dashed border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] px-5 py-[50px] text-center">
      <div className="mx-auto mb-[17px] grid h-[47px] w-[47px] place-items-center rounded-[15px] bg-[var(--accent-soft)] text-[var(--accent)]">
        <Sparkles size={20} />
      </div>

      <h3 className="m-0 mb-2 font-serif text-[24px] font-medium">
        {query || category !== "All"
          ? "Nothing matches that filter."
          : "No favourites yet."}
      </h3>

      <p className="mx-auto mb-5 max-w-[360px] text-[13px] text-[var(--muted)]">
        {query || category !== "All"
          ? "Try another search or category."
          : "Add your first website to get started."}
      </p>

      {!query && category === "All" && (
        <button
          className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] px-[14px] py-[10px] text-[13px] font-bold text-[var(--ink)] transition duration-[180ms] ease-in hover:border-[var(--accent)] active:scale-[0.97]"
          onClick={onAdd}
        >
          <Plus size={16} /> Add favourite
        </button>
      )}
    </div>
  );
}
