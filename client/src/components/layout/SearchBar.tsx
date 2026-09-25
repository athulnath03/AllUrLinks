"use client";

import { useEffect, useRef, useState } from "react";

export type SearchEngine =
  | "duckduckgo"
  | "google"
  | "brave"
  | "startpage"
  | "swisscows"
  | "mojeek";

const SEARCH_ENGINES = [
  {
    id: "brave",
    name: "Brave Search",
    domain: "search.brave.com",
    searchUrl: "https://search.brave.com/search?q=",
  },
  {
    id: "duckduckgo",
    name: "DuckDuckGo",
    domain: "duckduckgo.com",
    searchUrl: "https://duckduckgo.com/?q=",
  },
  {
    id: "google",
    name: "Google",
    domain: "google.com",
    searchUrl: "https://www.google.com/search?q=",
  },
  {
    id: "mojeek",
    name: "Mojeek",
    domain: "mojeek.com",
    searchUrl: "https://www.mojeek.com/search?q=",
  },
  {
    id: "startpage",
    name: "Startpage",
    domain: "startpage.com",
    searchUrl: "https://www.startpage.com/sp/search?query=",
  },
  {
    id: "swisscows",
    name: "Swisscows",
    domain: "swisscows.com",
    searchUrl: "https://swisscows.com/en/web?query=",
  },
] as const;

function engineIcon(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
}

export default function SearchBar({ query, onQueryChange }: SearchBarProps) {
  const [engine, setEngine] = useState<SearchEngine>(() => {
    if (typeof window === "undefined") return "duckduckgo";

    return (localStorage.getItem("fh-engine") as SearchEngine) || "duckduckgo";
  });

  const [searchMenuOpen, setSearchMenuOpen] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const searchMenuRef = useRef<HTMLDivElement>(null);

  const selectedEngine =
    SEARCH_ENGINES.find(item => item.id === engine) ?? SEARCH_ENGINES[0];

  useEffect(() => {
    localStorage.setItem("fh-engine", engine);
  }, [engine]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        searchMenuRef.current &&
        !searchMenuRef.current.contains(event.target as Node)
      ) {
        setSearchMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;

      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key === "Escape") {
        setSearchMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!query.trim()) return;

    window.location.href =
      selectedEngine.searchUrl + encodeURIComponent(query.trim());
  };

  return (
    <form
      className="fixed bottom-8 left-0 right-0 z-[9] mx-auto flex max-w-[620px] items-center gap-3 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] py-1.5 pl-[14px] pr-[7px] shadow-[0_10px_30px_rgba(26,35,29,0.045)] max-[520px]:left-5 max-[520px]:right-5 max-[520px]:mt-[72px]"
      onSubmit={submitSearch}
    >
      <div ref={searchMenuRef} className="relative grid flex-none place-items-center">
        <button
          type="button"
          className="inline-flex min-w-[100px] items-center gap-[7px] rounded-[8px] border-0 bg-transparent p-[7px] text-[11px] font-[750] text-[var(--ink)] hover:bg-[var(--accent-soft)] max-[520px]:w-9 max-[520px]:min-w-9 max-[520px]:justify-center"
          onClick={() => setSearchMenuOpen(open => !open)}
          aria-label={`Search engine: ${selectedEngine.name}`}
          aria-expanded={searchMenuOpen}
        >
          <img
            src={engineIcon(selectedEngine.domain)}
            alt=""
            className="h-[19px] w-[19px] flex-none rounded-[5px] object-contain"
          />

          <span className="overflow-hidden text-ellipsis max-[520px]:hidden">
            {selectedEngine.name}
          </span>
        </button>

        {searchMenuOpen && (
          <div className="absolute bottom-[calc(100%+16px)] left-0 z-[30] w-[140px] rounded-[13px] border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-[0_16px_40px_rgba(24,34,28,0.16)] max-[520px]:left-[-4px] max-[520px]:w-[178px]">
            <div className="pointer-events-none absolute bottom-[-6px] left-[25px] h-[11px] w-[11px] rotate-45 border-b border-r border-[var(--line)] bg-[var(--surface)]" />

            {SEARCH_ENGINES.map(searchEngine => (
              <button
                type="button"
                key={searchEngine.id}
                className={`flex w-full items-center gap-2 rounded-[8px] px-2 py-[7px] text-left text-[11px] font-[650] text-[var(--ink)] ${
                  engine === searchEngine.id
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : ""
                } hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]`}
                onClick={() => {
                  setEngine(searchEngine.id);
                  setSearchMenuOpen(false);
                }}
              >
                <img
                  src={engineIcon(searchEngine.domain)}
                  alt=""
                  className="h-[19px] w-[19px] flex-none rounded-[5px] object-contain"
                />

                <span>{searchEngine.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        ref={searchRef}
        value={query}
        onChange={e => onQueryChange(e.target.value)}
        placeholder="type in your query..."
        aria-label="Search the web"
        className="w-full min-w-0 border-0 bg-transparent text-[14px] text-[var(--ink)] outline-0 placeholder:text-[var(--muted)]"
      />

      <kbd className="rounded-[5px] border border-[var(--line)] px-1.5 py-[3px] text-[10px] text-[var(--muted)] max-[520px]:hidden">
        /
      </kbd>

      <button
        type="submit"
        className="rounded-[9px] border-0 bg-[var(--accent-soft)] px-[13px] py-[9px] text-[12px] font-[750] text-[var(--ink)]"
      >
        Search
      </button>
    </form>
  );
}
