"use client";

import { FormEvent } from "react";
import { X } from "lucide-react";

import type { Favourite, FavouriteDraft } from "@/types/favourite";

interface AddFavouriteModalProps {
  dialog: "add" | "edit" | null;
  editing: Favourite | null;
  draft: FavouriteDraft;
  categories: string[];
  modalError: string;
  fetchingName: boolean;

  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  onDraftChange: (draft: FavouriteDraft) => void;
  onClearError: () => void;
  onFetchSiteName: (url: string) => void;
}

export default function AddFavouriteModal({
  dialog,
  editing,
  draft,
  categories,
  modalError,
  fetchingName,
  onClose,
  onSubmit,
  onDraftChange,
  onClearError,
  onFetchSiteName,
}: AddFavouriteModalProps) {
  if (!dialog) return null;

  return (
    <div
      className="fixed inset-0 z-20 grid place-items-center bg-[rgba(19,25,21,0.36)] p-[18px] backdrop-blur-[5px]"
      onMouseDown={onClose}
    >
      <div
        className="w-[min(100%,450px)] rounded-[19px] bg-[var(--surface)] p-[22px] shadow-[0_25px_80px_rgba(0,0,0,0.2)]"
        onMouseDown={event => event.stopPropagation()}
      >
        <div className="mb-[22px] flex justify-between">
          <div>
            <p className="m-0 mb-[13px] text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">
              {editing ? "Refine your shortcut" : "Add to your collection"}
            </p>

            <h2 className="m-0 font-serif text-[27px] font-medium">
              {editing ? "Edit favourite" : "New favourite"}
            </h2>
          </div>

          <button
            type="button"
            className="grid h-[35px] w-[35px] place-items-center rounded-[30px] border border-[var(--line)] bg-transparent text-[var(--muted)] transition duration-[180ms] ease-in hover:-translate-y-px hover:bg-[var(--surface)] hover:text-[var(--ink)]"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {modalError && (
          <div className="mb-5 flex items-center justify-between gap-[9px] rounded-[10px] bg-[#fae9e7] px-[13px] py-[11px] text-[12px] text-[#98514b]">
            <span className="flex-1">{modalError}</span>

            <button
              type="button"
              className="border-0 bg-none text-current"
              onClick={onClearError}
            >
              <X size={15} />
            </button>
          </div>
        )}

        <form className="grid gap-[14px]" onSubmit={onSubmit}>
          <label className="grid gap-1.5 text-[12px] font-bold text-[var(--muted)]">
            Name

            <input
              autoFocus
              value={draft.name}
              onChange={event =>
                onDraftChange({
                  ...draft,
                  name: event.target.value,
                })
              }
              placeholder="GitHub"
              className="w-full rounded-[9px] border border-[var(--line)] bg-[var(--bg)] px-3 py-[11px] text-[13px] text-[var(--ink)] outline-0 focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
          </label>

          <label className="grid gap-1.5 text-[12px] font-bold text-[var(--muted)]">
            URL

            <input
              value={draft.url}
              onChange={event =>
                onDraftChange({
                  ...draft,
                  url: event.target.value,
                })
              }
              onPaste={event => {
                const pastedUrl = event.clipboardData
                  .getData("text")
                  .trim();

                if (pastedUrl) {
                  onFetchSiteName(pastedUrl);
                }
              }}
              onBlur={() => {
                const url = draft.url.trim();

                if (!url) return;

                const normalizedUrl = /^https?:\/\//i.test(url)
                  ? url
                  : `https://${url}`;

                onDraftChange({
                  ...draft,
                  url: normalizedUrl,
                });

                onFetchSiteName(normalizedUrl);
              }}
              placeholder="https://github.com"
              className="w-full rounded-[9px] border border-[var(--line)] bg-[var(--bg)] px-3 py-[11px] text-[13px] text-[var(--ink)] outline-0 focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />

            {fetchingName && (
              <span className="text-[10px] font-semibold text-[var(--muted)]">
                Fetching site name...
              </span>
            )}
          </label>

          <label className="grid gap-1.5 text-[12px] font-bold text-[var(--muted)]">
            Category

            <input
              list="category-suggestions"
              value={draft.category || ""}
              onChange={event =>
                onDraftChange({
                  ...draft,
                  category: event.target.value,
                })
              }
              placeholder="e.g. Google, Government, Research"
              maxLength={50}
              className="w-full rounded-[9px] border border-[var(--line)] bg-[var(--bg)] px-3 py-[11px] text-[13px] text-[var(--ink)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />

            <datalist id="category-suggestions">
              {categories
                .filter(item => item !== "All")
                .map(item => (
                  <option key={item} value={item} />
                ))}
            </datalist>
          </label>

          <label className="grid gap-1.5 text-[12px] font-bold text-[var(--muted)]">
            Custom icon URL{" "}
            <span className="font-medium opacity-70">optional</span>

            <input
              value={draft.icon || ""}
              onChange={event =>
                onDraftChange({
                  ...draft,
                  icon: event.target.value,
                })
              }
              placeholder="Automatically detected from the URL"
              className="w-full rounded-[9px] border border-[var(--line)] bg-[var(--bg)] px-3 py-[11px] text-[13px] text-[var(--ink)] outline-0 focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
          </label>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] px-[14px] py-[10px] text-[13px] font-bold text-[var(--ink)] transition duration-[180ms] ease-in hover:border-[var(--accent)] active:scale-[0.97]"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-[10px] border-0 bg-[var(--accent-soft)] px-[14px] py-[10px] text-[13px] font-bold text-[var(--ink)] shadow-[0_5px_15px_rgba(49,92,76,0.18)] transition duration-[180ms] ease-in hover:-translate-y-px hover:brightness-105 active:scale-[0.97]"
            >
              {editing ? "Save changes" : "Add favourite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}