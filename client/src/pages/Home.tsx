"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Favourite, FavouriteDraft } from "@/types/favourite";
import {
  ArrowDownAZ,
  ArrowUpZA,
  Check,
  Clock3,
  History,
  LogIn,
  LogOut,
  Moon,
  Pencil,
  Plus,
  Sparkles,
  Sun,
  TrendingUp,
  Trash2,
  X,
  MoreVertical,
} from "lucide-react";

type Theme = "system" | "light" | "dark";

type SearchEngine =
  | "duckduckgo"
  | "google"
  | "brave"
  | "startpage"
  | "swisscows"
  | "mojeek";

const SEARCH_ENGINES = [
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
    id: "brave",
    name: "Brave Search",
    domain: "search.brave.com",
    searchUrl: "https://search.brave.com/search?q=",
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
  {
    id: "mojeek",
    name: "Mojeek",
    domain: "mojeek.com",
    searchUrl: "https://www.mojeek.com/search?q=",
  },
] as const;

function engineIcon(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

const demoFavourites: Favourite[] = [
  {
    id: "demo-1",
    user_id: "demo",
    name: "GitHub",
    url: "https://github.com",
    icon: null,
    category: "Development",
    position: 0,
    visit_count: 12,
    last_visited_at: "2026-09-23T10:30:00.000Z",
    created_at: "2026-09-01T09:00:00.000Z",
    updated_at: "2026-09-23T10:30:00.000Z",
  },
  {
    id: "demo-2",
    user_id: "demo",
    name: "Linear",
    url: "https://linear.app",
    icon: null,
    category: "Work",
    position: 1,
    visit_count: 5,
    last_visited_at: "2026-09-23T08:15:00.000Z",
    created_at: "2026-09-05T11:00:00.000Z",
    updated_at: "2026-09-23T08:15:00.000Z",
  },
  {
    id: "demo-3",
    user_id: "demo",
    name: "YouTube",
    url: "https://youtube.com",
    icon: null,
    category: "Entertainment",
    position: 2,
    visit_count: 25,
    last_visited_at: "2026-09-22T18:45:00.000Z",
    created_at: "2026-09-10T14:30:00.000Z",
    updated_at: "2026-09-22T18:45:00.000Z",
  },
  {
    id: "demo-4",
    user_id: "demo",
    name: "Figma",
    url: "https://figma.com",
    icon: null,
    category: "Tools",
    position: 3,
    visit_count: 8,
    last_visited_at: "2026-09-21T12:20:00.000Z",
    created_at: "2026-09-15T16:00:00.000Z",
    updated_at: "2026-09-21T12:20:00.000Z",
  },
  {
    id: "demo-5",
    user_id: "demo",
    name: "Ashna AI",
    url: "https://app.ashna.ai",
    icon: null,
    category: "AI",
    position: 4,
    visit_count: 18,
    last_visited_at: "2026-09-20T09:10:00.000Z",
    created_at: "2026-09-20T17:30:00.000Z",
    updated_at: "2026-09-20T17:30:00.000Z",
  },
];

function domainIcon(url: string) {
  try {
    return `https://www.google.com/s2/favicons?domain=${
      new URL(url).hostname
    }&sz=128`;
  } catch {
    return null;
  }
}

function normalizeUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Home() {
  const [favourites, setFavourites] = useState<Favourite[]>(
    isSupabaseConfigured ? [] : demoFavourites
  );

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [notice, setNotice] = useState("");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const [dialog, setDialog] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Favourite | null>(null);

  const [actionMenuItem, setActionMenuItem] = useState<Favourite | null>(null);

  const [draft, setDraft] = useState<FavouriteDraft>({
    name: "",
    url: "",
    category: "",
    icon: "",
  });

  const [sort, setSort] = useState("recent");

  const sortOptions = [
    { value: "recent", label: "last added", icon: Clock3 },
    { value: "visited", label: "last visited", icon: History },
    { value: "popular", label: "Most used", icon: TrendingUp },
    { value: "az", label: "A → Z", icon: ArrowDownAZ },
    { value: "za", label: "Z → A", icon: ArrowUpZA },
  ];

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("fh-theme") as Theme) || "dark";
  });

  const [engine, setEngine] = useState<SearchEngine>(() => {
    if (typeof window === "undefined") return "duckduckgo";
    return (localStorage.getItem("fh-engine") as SearchEngine) || "duckduckgo";
  });

  const [searchMenuOpen, setSearchMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const selectedEngine =
    SEARCH_ENGINES.find(item => item.id === engine) ?? SEARCH_ENGINES[0];

  const [newTab, setNewTab] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("fh-new-tab") === "true";
  });

  const searchRef = useRef<HTMLInputElement>(null);

  const loadFavourites = async () => {
    if (!supabase) return;

    setLoading(true);

    const { data, error: loadError } = await supabase
      .from("favourites")
      .select("*")
      .order("position", { ascending: true });

    if (loadError) {
      setError(
        "We could not load your cloud favourites. Check your connection and try again."
      );
    } else {
      setFavourites(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    const root = document.documentElement;

    const resolved =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;

    root.classList.toggle("dark", resolved === "dark");
    localStorage.setItem("fh-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("fh-engine", engine);
  }, [engine]);

  useEffect(() => {
    localStorage.setItem("fh-new-tab", String(newTab));
  }, [newTab]);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);

      if (data.session) {
        loadFavourites();
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);

        if (nextSession) {
          loadFavourites();
        } else {
          setFavourites([]);
          setLoading(false);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight"
      ) {
        const cards = Array.from(
          document.querySelectorAll<HTMLElement>("[data-favourite-card]")
        );

        if (!cards.length) return;

        const current = document.activeElement as HTMLElement;
        const currentIndex = cards.indexOf(current);

        if (currentIndex === -1) {
          cards[0]?.focus();
          return;
        }

        event.preventDefault();

        const currentRect = current.getBoundingClientRect();

        let bestCard: HTMLElement | null = null;
        let bestDistance = Infinity;

        cards.forEach(card => {
          if (card === current) return;

          const rect = card.getBoundingClientRect();

          const dx = rect.left - currentRect.left;
          const dy = rect.top - currentRect.top;

          let valid = false;

          if (event.key === "ArrowRight") {
            valid = dx > 0 && Math.abs(dy) < currentRect.height;
          }

          if (event.key === "ArrowLeft") {
            valid = dx < 0 && Math.abs(dy) < currentRect.height;
          }

          if (event.key === "ArrowDown") {
            valid = dy > 0 && Math.abs(dx) < currentRect.width;
          }

          if (event.key === "ArrowUp") {
            valid = dy < 0 && Math.abs(dx) < currentRect.width;
          }

          if (valid) {
            const distance = Math.hypot(dx, dy);

            if (distance < bestDistance) {
              bestDistance = distance;
              bestCard = card;
            }
          }
        });

        bestCard?.focus();
      }

      if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key === "Escape") {
        setDialog(null);
        setActionMenuItem(null);
        setSearchMenuOpen(false);
        setSortMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const visible = useMemo(() => {
    const filtered = favourites.filter(item => {
      const search = query.trim().toLowerCase();

      const matchesCategory = category === "All" || item.category === category;

      if (!search) return matchesCategory;

      const name = item.name?.toLowerCase() ?? "";
      const url = item.url?.toLowerCase() ?? "";
      const itemCategory = item.category?.toLowerCase() ?? "";

      const matchesNameOrUrl = name.includes(search) || url.includes(search);

      const categoryWords = itemCategory.split(/[^a-z0-9]+/);

      const matchesCategoryName = categoryWords.some(word =>
        word.startsWith(search)
      );

      return matchesCategory && (matchesNameOrUrl || matchesCategoryName);
    });

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "az":
          return a.name.localeCompare(b.name);
        case "za":
          return b.name.localeCompare(a.name);
        case "visited":
          return (
            new Date(b.last_visited_at || 0).getTime() -
            new Date(a.last_visited_at || 0).getTime()
          );
        case "popular":
          return (b.visit_count || 0) - (a.visit_count || 0);
        case "recent":
        default:
          return (
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
          );
      }
    });
  }, [favourites, category, query, sort]);

  const categories = useMemo(() => {
    const customCategories = favourites
      .map(item => item.category)
      .filter((category): category is string => Boolean(category))
      .sort((a, b) => a.localeCompare(b));

    return ["All", ...Array.from(new Set(customCategories))];
  }, [favourites]);

  const signIn = async () => {
    if (!supabase) {
      return setNotice(
        "Add your Supabase environment variables to enable GitHub sign-in."
      );
    }

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (authError) {
      setError("GitHub sign-in could not start. Please try again.");
    }
  };

  const signOut = async () => {
    await supabase?.auth.signOut();
    setNotice("Signed out");
  };

  const openAdd = () => {
    setModalError("");
    setEditing(null);

    setDraft({
      name: "",
      url: "",
      category: "",
      icon: "",
    });

    setDialog("add");
  };

  const openEdit = (item: Favourite) => {
    setActionMenuItem(null);
    setModalError("");
    setEditing(item);

    setDraft({
      name: item.name,
      url: item.url,
      category: item.category ?? "",
      icon: item.icon ?? "",
    });

    setDialog("edit");
  };

  const trackVisit = async (item: Favourite) => {
    const now = new Date().toISOString();
    const visitCount = (item.visit_count || 0) + 1;

    setFavourites(items =>
      items.map(favourite =>
        favourite.id === item.id
          ? {
              ...favourite,
              visit_count: visitCount,
              last_visited_at: now,
            }
          : favourite
      )
    );

    if (!supabase || item.id.startsWith("demo-")) return;

    const { error } = await supabase
      .from("favourites")
      .update({
        visit_count: visitCount,
        last_visited_at: now,
      })
      .eq("id", item.id);

    if (error) {
      console.error("Could not track favourite visit:", error);
    }
  };

  function normalizeCategory(value: string) {
    return value
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\b\w/g, character => character.toUpperCase());
  }

  const saveFavourite = async (event: FormEvent) => {
    event.preventDefault();

    setError("");

    const name = draft.name.trim();
    const url = normalizeUrl(draft.url);
    const category = draft.category?.trim()
      ? normalizeCategory(draft.category)
      : null;

    if (!name || !url) {
      setError("Please enter a name and URL.");
      return;
    }

    try {
      new URL(url);
    } catch {
      return setModalError(
        "Enter a valid website URL, such as https://github.com."
      );
    }

    if (!name) {
      return setModalError("Give this favourite a name.");
    }

    const icon = draft.icon?.trim() || domainIcon(url);

    if (!supabase) {
      const local: Favourite = {
        id: editing?.id ?? `demo-${Date.now()}`,
        user_id: "demo",
        name,
        url,
        icon,
        category: category,
        position: editing?.position ?? favourites.length,
        visit_count: editing?.visit_count ?? 0,
        last_visited_at: editing?.last_visited_at ?? null,
        created_at: editing?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setFavourites(items =>
        editing
          ? items.map(item => (item.id === editing.id ? local : item))
          : [...items, local]
      );

      setDialog(null);

      setNotice(
        "Preview saved locally — connect Supabase to sync across devices."
      );

      return;
    }

    if (editing) {
      const previous = favourites;

      const updated = {
        ...editing,
        ...localFields(name, url, icon, category),
      } as Favourite;

      setFavourites(items =>
        items.map(item => (item.id === editing.id ? updated : item))
      );

      setDialog(null);

      const { error: updateError } = await supabase
        .from("favourites")
        .update(localFields(name, url, icon, category))
        .eq("id", editing.id);

      if (updateError) {
        setFavourites(previous);
        setError("We could not save that edit. Please try again.");
      }
    } else {
      const optimistic: Favourite = {
        id: `temp-${Date.now()}`,
        user_id: session.user.id,
        name,
        url,
        icon,
        category: category,
        position: favourites.length,
        visit_count: 0,
        last_visited_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setFavourites(items => [...items, optimistic]);
      setDialog(null);

      const { data, error: insertError } = await supabase
        .from("favourites")
        .insert({
          user_id: session.user.id,
          name,
          url,
          icon,
          category: category,
          position: optimistic.position,
        })
        .select()
        .single();

      if (insertError) {
        setFavourites(items => items.filter(item => item.id !== optimistic.id));
        setError("We could not add that favourite. Please try again.");
      } else {
        setFavourites(items =>
          items.map(item => (item.id === optimistic.id ? data : item))
        );
      }
    }
  };

  const removeFavourite = async (item: Favourite) => {
    setActionMenuItem(null);

    if (!window.confirm(`Remove ${item.name} from your favourites?`)) return;

    if (category === item.category) {
      const remainingInCategory = favourites.some(
        favourite =>
          favourite.id !== item.id && favourite.category === item.category
      );

      if (!remainingInCategory) {
        setCategory("All");
      }
    }

    const previous = favourites;

    setFavourites(items => items.filter(entry => entry.id !== item.id));

    if (supabase && !item.id.startsWith("temp-")) {
      const { error: deleteError } = await supabase
        .from("favourites")
        .delete()
        .eq("id", item.id);

      if (deleteError) {
        setFavourites(previous);
        setError("We could not remove that favourite.");
      }
    }
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();

    if (!query.trim()) return;

    const selected =
      SEARCH_ENGINES.find(item => item.id === engine) ?? SEARCH_ENGINES[0];

    window.location.href =
      selected.searchUrl + encodeURIComponent(query.trim());
  };

  const isSignedOut = isSupabaseConfigured && !session;

  return (
    <div className="min-h-screen">
      {/* TOP BAR */}
      <header className="relative mx-auto flex max-w-[1180px] items-center justify-between px-[34px] py-6 max-[520px]:px-[17px] max-[520px]:py-[18px]">
        <div className="flex items-center gap-[9px] text-[14px] font-[750] tracking-[-0.02em]">
          <span>LynkHive</span>
        </div>

        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-[30px] border border-[var(--line)] bg-[var(--accent-soft)] text-[var(--accent)] transition duration-[180ms] ease-in hover:-translate-y-px hover:brightness-105"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {isSupabaseConfigured ? (
            session ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] py-1 pl-1 pr-[10px] shadow-[0_4px_14px_rgba(27,38,31,0.04)] transition duration-[180ms] ease-in hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--line))] hover:bg-[var(--surface)] hover:shadow-[0_6px_18px_rgba(27,38,31,0.07)]">
                <button
                  className="h-[30px] w-[30px] flex-none overflow-hidden rounded-full border-0 bg-[var(--accent-soft)] p-0 text-[var(--accent)]"
                  title={
                    session.user.user_metadata?.user_name ||
                    session.user.user_metadata?.preferred_username ||
                    session.user.email ||
                    "GitHub user"
                  }
                >
                  <img
                    className="block h-full w-full object-cover"
                    src={
                      session.user.user_metadata?.avatar_url ||
                      session.user.user_metadata?.picture
                    }
                    alt={
                      session.user.user_metadata?.user_name ||
                      session.user.user_metadata?.preferred_username ||
                      "GitHub avatar"
                    }
                  />
                </button>

                <span className="block max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-[650] tracking-[-0.01em] text-[var(--ink)] max-[520px]:hidden">
                  @
                  {session.user.user_metadata?.user_name ||
                    session.user.user_metadata?.preferred_username ||
                    "user"}
                </span>

                <button
                  className="ml-0.5 grid h-[27px] w-[27px] place-items-center rounded-full border-0 bg-transparent text-[var(--muted)] transition duration-[180ms] ease-in hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                  onClick={signOut}
                  title="Sign out"
                >
                  <LogOut size={17} />
                </button>
              </div>
            ) : (
              <button
                className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] px-[14px] py-[10px] text-[13px] font-bold text-[var(--ink)] transition duration-[180ms] ease-in hover:border-[var(--accent)] active:scale-[0.97]"
                onClick={signIn}
              >
                <LogIn size={16} /> Sign in with Github
              </button>
            )
          ) : (
            <span className="rounded-[99px] bg-[var(--accent-soft)] px-[10px] py-[7px] text-[11px] font-bold tracking-[0.02em] text-[var(--accent)]">
              Preview mode
            </span>
          )}
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-[1200px] px-[34px] pb-[42px] pt-[50px] max-[800px]:pt-5 max-[520px]:px-[17px] max-[520px]:pb-[34px] max-[520px]:pt-[22px]">
        {/* HERO */}
        <section className="px-0 pb-[54px] pt-[34px] text-center max-[800px]:pb-[42px]">
          <p className="m-0 mb-[13px] text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">
            YOUR PERSONAL START PAGE
          </p>

          <p className="mt-[22px] text-[15px] text-[var(--muted)] max-[520px]:text-[13px]">
            A quiet place for the sites you return to every day.
          </p>
        </section>

        {/* ALERTS */}
        {error && (
          <div className="mx-auto mb-5 flex max-w-[700px] items-center justify-between gap-[9px] rounded-[10px] bg-[#fae9e7] px-[13px] py-[11px] text-[12px] text-[#98514b]">
            <span className="flex-1">{error}</span>

            <button
              className="border-0 bg-none text-current"
              onClick={() => setError("")}
            >
              <X size={15} />
            </button>
          </div>
        )}

        {notice && (
          <div className="mx-auto mb-5 flex max-w-[700px] items-center justify-between gap-[9px] rounded-[10px] bg-[var(--accent-soft)] px-[13px] py-[11px] text-[12px] text-[var(--accent)]">
            <Check size={15} />

            <span className="flex-1">{notice}</span>

            <button
              className="border-0 bg-none text-current"
              onClick={() => setNotice("")}
            >
              <X size={15} />
            </button>
          </div>
        )}

        {isSignedOut ? (
          <section className="rounded-[18px] border border-dashed border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] px-5 py-[50px] text-center">
            <div className="mx-auto mb-[17px] grid h-[47px] w-[47px] place-items-center rounded-[15px] bg-[var(--accent-soft)] text-[var(--accent)]">
              <Sparkles size={22} />
            </div>

            <h2 className="m-0 mb-2 font-serif text-[24px] font-medium">
              Your favourites, everywhere.
            </h2>

            <p className="mx-auto mb-5 max-w-[360px] text-[13px] text-[var(--muted)]">
              Sign in with Github to sync your personal start page across every
              device.
            </p>

            <button
              className="inline-flex items-center justify-center gap-2 rounded-[10px] border-0 bg-[var(--accent-soft)] px-[14px] py-[10px] text-[13px] font-bold text-[var(--ink)] shadow-[0_5px_15px_rgba(49,92,76,0.18)] transition duration-[180ms] ease-in hover:-translate-y-px hover:brightness-105 active:scale-[0.97]"
              onClick={signIn}
            >
              <LogIn size={16} /> Continue with Github
            </button>
          </section>
        ) : (
          <>
            {/* SECTION HEAD */}
            <section className="mb-[22px] flex items-end justify-between max-[520px]:items-center">
              <div>
                <p className="m-0 mb-[13px] text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">
                  Your collection (<span>{favourites.length}</span>)
                </p>
              </div>

              <button
                className="inline-flex items-center justify-center gap-2 rounded-[10px] border-0 bg-[var(--accent-soft)] px-[14px] py-[10px] text-[13px] font-bold text-[var(--ink)] shadow-[0_5px_15px_rgba(49,92,76,0.18)] transition duration-[180ms] ease-in hover:-translate-y-px hover:brightness-105 active:scale-[0.97] max-[520px]:px-[10px] max-[520px]:py-[9px] max-[520px]:text-[12px]"
                onClick={openAdd}
              >
                <Plus size={17} /> New
              </button>
            </section>

            {/* FILTERS */}
            <div className="mb-[18px] flex w-full min-w-0 items-center justify-between gap-2">
              <div className="flex w-full min-w-0 items-center justify-between gap-2">
                <div className="h-9 min-w-0 rounded-[12px] border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] p-1">
                  <div className="flex h-full min-w-0 items-center gap-1.5 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
                    {categories.map(item => (
                      <button
                        key={item}
                        className={`flex-none whitespace-nowrap rounded-[11px] border border-transparent px-[11px] py-1.5 text-[12px] font-[650] text-[var(--muted)] transition-[background,color,border-color] duration-[150ms] ease-[ease] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] ${
                          category === item
                            ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                            : ""
                        }`}
                        onClick={() => setCategory(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SORT */}
              <div
                className={`relative flex-none ${sortMenuOpen ? "open" : ""}`}
              >
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center gap-[7px] whitespace-nowrap rounded-[10px] border border-[var(--line)] bg-[var(--surface)] px-3 text-[12px] font-bold text-[var(--ink)] transition-[border-color,background,transform] duration-[180ms] ease-[ease] hover:border-[var(--accent)] active:scale-[0.97] max-[520px]:px-[10px]"
                  onClick={() => setSortMenuOpen(open => !open)}
                  aria-label="Sort favourites"
                  aria-expanded={sortMenuOpen}
                >
                  {(() => {
                    const selected =
                      sortOptions.find(option => option.value === sort) ??
                      sortOptions[0];

                    const Icon = selected.icon;

                    return (
                      <>
                        <Icon size={15} />
                        <span className="max-[520px]:hidden">
                          {selected.label}
                        </span>
                      </>
                    );
                  })()}
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
                        onClick={() => {
                          setSort(option.value);
                          setSortMenuOpen(false);
                        }}
                      >
                        <Icon size={15} />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CONTENT GRID */}
            {loading ? (
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
            ) : visible.length ? (
              <div className="mb-[100px] grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 max-[520px]:gap-[9px]">
                {visible.map(item => (
                  <article
                    data-favourite-card
                    key={item.id}
                    tabIndex={0}
                    onClick={event => {
                      // Don't open the link when clicking the options button
                      if ((event.target as HTMLElement).closest("button"))
                        return;

                      void trackVisit(item);
                      window.open(item.url, "_blank", "noopener,noreferrer");
                    }}
                    onKeyDown={event => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void trackVisit(item);
                        window.open(item.url, "_blank", "noopener,noreferrer");
                      }

                      if (event.key.toLowerCase() === "e") {
                        event.preventDefault();
                        openEdit(item);
                      }

                      if (event.key === "Delete") {
                        event.preventDefault();
                        void removeFavourite(item);
                      }
                    }}
                    className="relative flex cursor-pointer gap-2 rounded-[14px] border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] p-[11px_12px] shadow-[0_4px_15px_rgba(25,35,29,0.025)] transition-[transform,border-color,box-shadow] duration-200 ease-in hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--line))] hover:shadow-[var(--shadow)] focus:border-[var(--accent)] focus:outline-none focus:shadow-[0_0_0_3px_var(--accent-soft)] max-[520px]:rounded-[13px] max-[520px]:p-[10px]"
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
                        <h3 className="m-0 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold tracking-[-0.02em] text-[var(--ink)] max-[520px]:text-[12px]">
                          {item.name}
                        </h3>

                        <span className="flex text-[10px] font-semibold text-[var(--muted)] no-underline max-[520px]:text-[9px]">
                          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                            {item.category || "Uncategorized"}
                          </span>
                        </span>
                      </div>

                      <div className="relative">
                        <button
                          type="button"
                          className="grid h-[27px] w-[27px] flex-none place-items-center rounded-[7px] border-0 bg-transparent p-0 text-[var(--muted)] opacity-[0.65] transition-[background,color,opacity] duration-[150ms] ease-in hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] group-hover:opacity-100 max-[520px]:h-[25px] max-[520px]:w-[25px]"
                          aria-label={`Options for ${item.name}`}
                          title="More options"
                          onClick={event => {
                            event.stopPropagation();
                            setActionMenuItem(
                              actionMenuItem?.id === item.id ? null : item
                            );
                          }}
                        >
                          <MoreVertical size={17} />
                        </button>

                        {actionMenuItem?.id === item.id && (
                          <div
                            className="absolute right-0 top-[34px] z-[50] w-[150px] rounded-[11px] border border-[var(--line)] bg-[var(--surface)] p-[5px] shadow-[0_10px_30px_rgba(0,0,0,0.12)] animate-[actionModalIn_150ms_ease]"
                            onClick={event => event.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="flex w-full items-center gap-[9px] rounded-[7px] border-0 bg-transparent px-[9px] py-[8px] text-left text-[11px] font-[650] text-[var(--ink)] transition-[background,color] duration-[150ms] ease-in hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                              onClick={() => {
                                openEdit(item);
                                setActionMenuItem(null);
                              }}
                            >
                              <Pencil size={14} />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              className="flex w-full items-center gap-[9px] rounded-[7px] border-0 bg-transparent px-[9px] py-[8px] text-left text-[11px] font-[650] text-[var(--ink)] transition-[background,color] duration-[150ms] ease-in hover:bg-[#fae9e7] hover:text-[#b42318]"
                              onClick={() => {
                                void removeFavourite(item);
                                setActionMenuItem(null);
                              }}
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
            ) : (
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
                    onClick={openAdd}
                  >
                    <Plus size={16} /> Add favourite
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* SEARCH FADE */}
        <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-[8] h-[200px] bg-[linear-gradient(to_bottom,transparent_0%,color-mix(in_srgb,var(--bg)_30%,transparent)_20%,color-mix(in_srgb,var(--bg)_65%,transparent)_45%,color-mix(in_srgb,var(--bg)_90%,transparent)_65%,var(--bg)_100%)]" />

        {/* SEARCH */}
        <form
          className="fixed bottom-8 left-0 right-0 z-[9] mx-auto flex max-w-[620px] items-center gap-3 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] py-1.5 pl-[14px] pr-[7px] shadow-[0_10px_30px_rgba(26,35,29,0.045)] max-[520px]:left-5 max-[520px]:right-5 max-[520px]:mt-[72px]"
          onSubmit={submitSearch}
        >
          <div className="relative grid flex-none place-items-center">
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
                    className={`flex w-full items-center gap-[10px] rounded-[8px] border-0 bg-transparent px-[10px] py-[9px] text-left text-[12px] font-[650] text-[var(--ink)] ${
                      searchEngine.id === engine
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
            onChange={e => setQuery(e.target.value)}
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
      </main>

      {/* ADD / EDIT MODAL */}
      {dialog && (
        <div
          className="fixed inset-0 z-20 grid place-items-center bg-[rgba(19,25,21,0.36)] p-[18px] backdrop-blur-[5px]"
          onMouseDown={() => setDialog(null)}
        >
          <div
            className="w-[min(100%,450px)] rounded-[19px] bg-[var(--surface)] p-[22px] shadow-[0_25px_80px_rgba(0,0,0,0.2)]"
            onMouseDown={e => e.stopPropagation()}
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
                className="grid h-[35px] w-[35px] place-items-center rounded-[30px] border border-[var(--line)] bg-transparent text-[var(--muted)] transition duration-[180ms] ease-in hover:-translate-y-px hover:bg-[var(--surface)] hover:text-[var(--ink)]"
                onClick={() => setDialog(null)}
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
                  onClick={() => setModalError("")}
                >
                  <X size={15} />
                </button>
              </div>
            )}

            <form className="grid gap-[14px]" onSubmit={saveFavourite}>
              <label className="grid gap-1.5 text-[12px] font-bold text-[var(--muted)]">
                Name
                <input
                  autoFocus
                  value={draft.name}
                  onChange={e =>
                    setDraft({
                      ...draft,
                      name: e.target.value,
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
                  onChange={e =>
                    setDraft({
                      ...draft,
                      url: e.target.value,
                    })
                  }
                  onBlur={() => {
                    const url = draft.url.trim();

                    if (url && !/^https?:\/\//i.test(url)) {
                      setDraft({
                        ...draft,
                        url: `https://${url}`,
                      });
                    }
                  }}
                  placeholder="https://github.com"
                  className="w-full rounded-[9px] border border-[var(--line)] bg-[var(--bg)] px-3 py-[11px] text-[13px] text-[var(--ink)] outline-0 focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
                />
              </label>

              <label className="grid gap-1.5 text-[12px] font-bold text-[var(--muted)]">
                Category
                <input
                  list="category-suggestions"
                  value={draft.category || ""}
                  onChange={e =>
                    setDraft({
                      ...draft,
                      category: e.target.value,
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
                  onChange={e =>
                    setDraft({
                      ...draft,
                      icon: e.target.value,
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
                  onClick={() => setDialog(null)}
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
      )}
    </div>
  );
}

function localFields(
  name: string,
  url: string,
  icon: string | null,
  category: string | null
) {
  return {
    name,
    url,
    icon,
    category: category || null,
    updated_at: new Date().toISOString(),
  };
}
