"use client";

import { domainIcon } from "@/lib/favicon";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Favourite, FavouriteDraft } from "@/types/favourite";
import FiltersBar from "@/components/layout/FiltersBar";
import CollectionHeader from "@/components/layout/CollectionHeader";

import {
  ArrowDownAZ,
  ArrowUpZA,
  Clock3,
  History,
  LogIn,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import ThemeSelector, { Theme } from "@/components/common/ThemeSelector";
import Alerts from "@/components/layout/Alerts";
import Header from "@/components/layout/Header";
import SearchBar from "@/components/layout/SearchBar";
import FavouriteGrid from "@/components/layout/FavouriteGrid";
import AddFavouriteModal from "@/components/layout/AddFavouriteModal";

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
  {
    id: "demo-6",
    user_id: "demo",
    name: "Google",
    url: "https://google.com",
    icon: null,
    category: "Search",
    position: 5,
    visit_count: 32,
    last_visited_at: "2026-09-23T11:45:00.000Z",
    created_at: "2026-09-02T10:00:00.000Z",
    updated_at: "2026-09-23T11:45:00.000Z",
  },
  {
    id: "demo-7",
    user_id: "demo",
    name: "Reddit",
    url: "https://reddit.com",
    icon: null,
    category: "Social",
    position: 6,
    visit_count: 14,
    last_visited_at: "2026-09-22T21:10:00.000Z",
    created_at: "2026-09-06T13:00:00.000Z",
    updated_at: "2026-09-22T21:10:00.000Z",
  },
  {
    id: "demo-8",
    user_id: "demo",
    name: "LinkedIn",
    url: "https://linkedin.com",
    icon: null,
    category: "Work",
    position: 7,
    visit_count: 9,
    last_visited_at: "2026-09-23T07:30:00.000Z",
    created_at: "2026-09-08T15:00:00.000Z",
    updated_at: "2026-09-23T07:30:00.000Z",
  },
  {
    id: "demo-9",
    user_id: "demo",
    name: "Notion",
    url: "https://notion.so",
    icon: null,
    category: "Productivity",
    position: 8,
    visit_count: 11,
    last_visited_at: "2026-09-22T16:20:00.000Z",
    created_at: "2026-09-12T12:00:00.000Z",
    updated_at: "2026-09-22T16:20:00.000Z",
  },
  {
    id: "demo-10",
    user_id: "demo",
    name: "ChatGPT",
    url: "https://chatgpt.com",
    icon: null,
    category: "AI",
    position: 9,
    visit_count: 21,
    last_visited_at: "2026-09-23T09:50:00.000Z",
    created_at: "2026-09-18T14:00:00.000Z",
    updated_at: "2026-09-23T09:50:00.000Z",
  },
];

function normalizeUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

const sortOptions = [
  { value: "recent", label: "last added", icon: Clock3 },
  { value: "visited", label: "last visited", icon: History },
  { value: "popular", label: "Most used", icon: TrendingUp },
  { value: "az", label: "A → Z", icon: ArrowDownAZ },
  { value: "za", label: "Z → A", icon: ArrowUpZA },
];

export default function Home() {
  const [favourites, setFavourites] = useState<Favourite[]>(
    isSupabaseConfigured ? [] : demoFavourites
  );

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modalError, setModalError] = useState("");
  const [fetchingName, setFetchingName] = useState(false);

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

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("fh-theme") as Theme) || "system";
  });

  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const [newTab, setNewTab] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("fh-new-tab") === "true";
  });

  const actionMenuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

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

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const applySystemTheme = () => {
        root.classList.toggle("dark", mediaQuery.matches);
      };

      applySystemTheme();
      mediaQuery.addEventListener("change", applySystemTheme);
      localStorage.setItem("fh-theme", "system");

      return () => {
        mediaQuery.removeEventListener("change", applySystemTheme);
      };
    }

    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("fh-theme", theme);
  }, [theme]);

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
      const target = event.target as HTMLElement;

      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if (
        !dialog &&
        !isTyping &&
        (event.key === "ArrowDown" ||
          event.key === "ArrowUp" ||
          event.key === "ArrowLeft" ||
          event.key === "ArrowRight")
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

        if (bestCard) {
          (bestCard as HTMLElement).focus();
        }
      }

      if (event.key === "Escape") {
        setDialog(null);
        setActionMenuItem(null);
        setSortMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [dialog]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      // Close 3-dot action menu when clicking outside
      if (actionMenuRef.current && !actionMenuRef.current.contains(target)) {
        setActionMenuItem(null);
      }

      // Close sort menu when clicking outside
      if (sortMenuRef.current && !sortMenuRef.current.contains(target)) {
        setSortMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
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

  const fetchSiteName = async (value: string) => {
    const rawUrl = value.trim();

    if (!rawUrl) return;

    const url = normalizeUrl(rawUrl);

    try {
      new URL(url);
    } catch {
      return;
    }

    setFetchingName(true);

    try {
      const response = await fetch(
        `https://api.microlink.io/?url=${encodeURIComponent(url)}`
      );

      if (!response.ok) {
        throw new Error("Metadata request failed");
      }

      const result = await response.json();
      const data = result.data || {};

      const name = data.title || data.og?.title || data.meta?.title || "";

      if (name) {
        setDraft(current => ({
          ...current,
          url,
          name: current.name.trim() ? current.name : name,
        }));
      }
    } catch (error) {
      console.error("Metadata request failed:", error);
    } finally {
      setFetchingName(false);
    }
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
    setModalError("");

    const name = draft.name.trim();
    const url = normalizeUrl(draft.url);
    const category = draft.category?.trim()
      ? normalizeCategory(draft.category)
      : null;

    if (!name) {
      setModalError("Give this favourite a name.");
      return;
    }

    if (!url) {
      setModalError("Please enter a URL.");
      return;
    }

    try {
      new URL(url);
    } catch {
      return setModalError(
        "Enter a valid website URL, such as https://github.com."
      );
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
      if (!session) {
        setError("Please sign in before adding a favourite.");
        return;
      }
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

  const isSignedOut = isSupabaseConfigured && !session;

  return (
    <div className="min-h-screen">
      {/* TOP BAR */}
      <Header
        theme={theme}
        onThemeChange={setTheme}
        isSupabaseConfigured={isSupabaseConfigured}
        session={session}
        onSignIn={signIn}
        onSignOut={signOut}
      />

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
        <Alerts
          error={error}
          notice={notice}
          onClearError={() => setError("")}
          onClearNotice={() => setNotice("")}
        />

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
            <CollectionHeader count={favourites.length} onAdd={openAdd} />

            {/* FILTERS */}
            <FiltersBar
              categories={categories}
              category={category}
              onCategoryChange={setCategory}
              sort={sort}
              sortOptions={sortOptions}
              sortMenuOpen={sortMenuOpen}
              sortMenuRef={sortMenuRef}
              onToggleSortMenu={() => setSortMenuOpen(open => !open)}
              onSortChange={value => {
                setSort(value);
                setSortMenuOpen(false);
              }}
            />

            {/* CONTENT GRID */}
            <FavouriteGrid
              loading={loading}
              visible={visible}
              query={query}
              category={category}
              actionMenuItem={actionMenuItem}
              actionMenuRef={actionMenuRef}
              onTrackVisit={trackVisit}
              onEdit={openEdit}
              onDelete={removeFavourite}
              onToggleActionMenu={item => {
                setActionMenuItem(actionMenuItem?.id === item.id ? null : item);
              }}
              onAdd={openAdd}
            />
          </>
        )}

        {/* SEARCH FADE */}
        <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-[8] h-[200px] bg-[linear-gradient(to_bottom,transparent_0%,color-mix(in_srgb,var(--bg)_30%,transparent)_20%,color-mix(in_srgb,var(--bg)_65%,transparent)_45%,color-mix(in_srgb,var(--bg)_90%,transparent)_65%,var(--bg)_100%)]" />

        {/* SEARCH */}
        <SearchBar query={query} onQueryChange={setQuery} />
      </main>

      {/* ADD / EDIT MODAL */}
      <AddFavouriteModal
        dialog={dialog}
        editing={editing}
        draft={draft}
        categories={categories}
        modalError={modalError}
        fetchingName={fetchingName}
        onClose={() => setDialog(null)}
        onSubmit={saveFavourite}
        onDraftChange={setDraft}
        onClearError={() => setModalError("")}
        onFetchSiteName={fetchSiteName}
      />
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
