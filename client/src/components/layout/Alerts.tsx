"use client";

import { CheckCircle2, X } from "lucide-react";

interface AlertsProps {
  error: string;
  notice: string;
  onClearError: () => void;
  onClearNotice: () => void;
}

export default function Alerts({
  error,
  notice,
  onClearError,
  onClearNotice,
}: AlertsProps) {
  return (
    <>
      {error && (
        <div className="mb-[18px] flex items-center justify-between gap-[10px] rounded-[10px] bg-[#fae9e7] px-[13px] py-[11px] text-[12px] text-[#98514b]">
          <span>{error}</span>

          <button
            type="button"
            onClick={onClearError}
            className="border-0 bg-transparent text-current"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {notice && (
        <div className="mb-[18px] flex items-center justify-between gap-[10px] rounded-[10px] bg-[var(--accent-soft)] px-[13px] py-[11px] text-[12px] text-[var(--accent)]">
          <span className="flex items-center gap-[7px]">
            <CheckCircle2 size={15} />
            {notice}
          </span>

          <button
            type="button"
            onClick={onClearNotice}
            className="border-0 bg-transparent text-current"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </>
  );
}