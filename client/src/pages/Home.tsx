"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { CATEGORY_OPTIONS, Favourite, FavouriteDraft } from "@/types/favourite";
import {
  ArrowUpRight,
  Check,
  Clock3,
  History,
  LogIn,
  LogOut,
  Moon,
  MoreHorizontal,
  Pencil,
  Plus,
  Sparkles,
  Sun,
  Trash2,
  TrendingUp,
  X,
  ArrowDownAZ,
  ArrowUpZA,
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
    return `https://www.google.com/s2/favicons?domain=${new URL(
      url
    ).hostname}&sz=128`;
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

  const [actionMenuItem, setActionMenuItem] = useState<Favourite | null>(
    null
  );

  const [draft, setDraft] = useState<FavouriteDraft>({
    name: "",
    url: "",
    category: "",
    icon: "",
  });

  const [sort, setSort] = useState("recent");

  const sortOptions = [
    {
      value: "recent",
      label: "last added",
      icon: Clock3,
    },
    {
      value: "visited",
      label: "last visited",
      icon: History,
    },
    {
      value: "popular",
      label: "Most used",
      icon: TrendingUp,
    },
    {
      value: "az",
      label: "A → Z",
      icon: ArrowDownAZ,
    },
    {
      value: "za",
      label: "Z → A",
      icon: ArrowUpZA,
    },
  ];

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";

    return (
      (localStorage.getItem("fh-theme") as Theme) || "dark"
    );
  });

  const [engine, setEngine] = useState<SearchEngine>(() => {
    if (typeof window === "undefined") return "duckduckgo";

    return (
      (localStorage.getItem("fh-engine") as SearchEngine) ||
      "duckduckgo"
    );
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
        event.key === "/" &&
        document.activeElement?.tagName !== "INPUT"
      ) {
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

      const matchesCategory =
        category === "All" || item.category === category;

      if (!search) {
        return matchesCategory;
      }

      const name = item.name?.toLowerCase() ?? "";
      const url = item.url?.toLowerCase() ?? "";
      const itemCategory = item.category?.toLowerCase() ?? "";

      const matchesNameOrUrl =
        name.includes(search) || url.includes(search);

      const categoryWords = itemCategory.split(/[^a-z0-9]+/);

      const matchesCategoryName = categoryWords.some(word =>
        word.startsWith(search)
      );

      return (
        matchesCategory &&
        (matchesNameOrUrl || matchesCategoryName)
      );
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

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          favourites
            .map(item => item.category)
            .filter(Boolean) as string[]
        )
      ),
    ],
    [favourites]
  );

  const signIn = async () => {
    if (!supabase) {
      return setNotice(
        "Add your Supabase environment variables to enable GitHub sign-in."
      );
    }

    const { error: authError } =
      await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: window.location.origin,
        },
      });

    if (authError) {
      setError(
        "GitHub sign-in could not start. Please try again."
      );
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

    if (!supabase || item.id.startsWith("demo-")) {
      return;
    }

    const { error } = await supabase
      .from("favourites")
      .update({
        visit_count: visitCount,
        last_visited_at: now,
      })
      .eq("id", item.id);

    if (error) {
      console.error(
        "Could not track favourite visit:",
        error
      );
    }
  };

  const saveFavourite = async (event: FormEvent) => {
    event.preventDefault();

    setError("");

    const name = draft.name.trim();
    const url = normalizeUrl(draft.url.trim());

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
        category: draft.category || null,
        position: editing?.position ?? favourites.length,
        visit_count: editing?.visit_count ?? 0,
        last_visited_at: editing?.last_visited_at ?? null,
        created_at: editing?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setFavourites(items =>
        editing
          ? items.map(item =>
              item.id === editing.id ? local : item
            )
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
        ...localFields(
          name,
          url,
          icon,
          draft.category
        ),
      } as Favourite;

      setFavourites(items =>
        items.map(item =>
          item.id === editing.id ? updated : item
        )
      );

      setDialog(null);

      const { error: updateError } = await supabase
        .from("favourites")
        .update(
          localFields(
            name,
            url,
            icon,
            draft.category
          )
        )
        .eq("id", editing.id);

      if (updateError) {
        setFavourites(previous);
        setError(
          "We could not save that edit. Please try again."
        );
      }
    } else {
      const optimistic: Favourite = {
        id: `temp-${Date.now()}`,
        user_id: session.user.id,
        name,
        url,
        icon,
        category: draft.category || null,
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
          category: draft.category || null,
          position: optimistic.position,
        })
        .select()
        .single();

      if (insertError) {
        setFavourites(items =>
          items.filter(item => item.id !== optimistic.id)
        );

        setError(
          "We could not add that favourite. Please try again."
        );
      } else {
        setFavourites(items =>
          items.map(item =>
            item.id === optimistic.id ? data : item
          )
        );
      }
    }
  };

  const removeFavourite = async (item: Favourite) => {
    setActionMenuItem(null);

    if (
      !window.confirm(
        `Remove ${item.name} from your favourites?`
      )
    ) {
      return;
    }

    const previous = favourites;

    setFavourites(items =>
      items.filter(entry => entry.id !== item.id)
    );

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
      SEARCH_ENGINES.find(item => item.id === engine) ??
      SEARCH_ENGINES[0];

    window.location.href =
      selected.searchUrl +
      encodeURIComponent(query.trim());
  };

  const isSignedOut =
    isSupabaseConfigured && !session;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span>LynkHive</span>
        </div>

        <div className="top-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={() =>
              setTheme(
                theme === "dark" ? "light" : "dark"
              )
            }
            aria-label={
              theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            title={
              theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {theme === "dark" ? (
              <Sun size={16} />
            ) : (
              <Moon size={16} />
            )}
          </button>

          {isSupabaseConfigured ? (
            session ? (
              <div className="account">
                <button
                  className="avatar"
                  title={
                    session.user.user_metadata?.user_name ||
                    session.user.user_metadata
                      ?.preferred_username ||
                    session.user.email ||
                    "GitHub user"
                  }
                >
                  <img
                    src={
                      session.user.user_metadata?.avatar_url ||
                      session.user.user_metadata?.picture
                    }
                    alt={
                      session.user.user_metadata?.user_name ||
                      session.user.user_metadata
                        ?.preferred_username ||
                      "GitHub avatar"
                    }
                  />
                </button>

                <span className="username">
                  @
                  {session.user.user_metadata?.user_name ||
                    session.user.user_metadata
                      ?.preferred_username ||
                    "user"}
                </span>

                <button
                  className="icon-button"
                  onClick={signOut}
                  title="Sign out"
                >
                  <LogOut size={17} />
                </button>
              </div>
            ) : (
              <button
                className="button secondary"
                onClick={signIn}
              >
                <LogIn size={16} /> Sign in with Github
              </button>
            )
          ) : (
            <span className="preview-pill">
              Preview mode
            </span>
          )}
        </div>
      </header>

      <main className="main-content">
        <section className="hero">
          <p className="eyebrow">
            YOUR PERSONAL START PAGE
          </p>

          <p className="hero-copy">
            A quiet place for the sites you return to every
            day.
          </p>
        </section>

        {error && (
          <div className="alert error">
            <span>{error}</span>

            <button onClick={() => setError("")}>
              <X size={15} />
            </button>
          </div>
        )}

        {notice && (
          <div className="alert success">
            <Check size={15} />

            <span>{notice}</span>

            <button onClick={() => setNotice("")}>
              <X size={15} />
            </button>
          </div>
        )}

        {isSignedOut ? (
          <section className="auth-card">
            <div className="auth-icon">
              <Sparkles size={22} />
            </div>

            <h2>Your favourites, everywhere.</h2>

            <p>
              Sign in with Github to sync your personal start
              page across every device.
            </p>

            <button
              className="button primary"
              onClick={signIn}
            >
              <LogIn size={16} /> Continue with Github
            </button>
          </section>
        ) : (
          <>
            <section className="section-head">
              <div>
                <p className="eyebrow">
                  Your collection (
                  <span>{favourites.length}</span>)
                </p>
              </div>

              <button
                className="button primary"
                onClick={openAdd}
              >
                <Plus size={17} /> New
              </button>
            </section>

            <div className="filters">
              <div className="category-filter-wrapper">
                <div className="category-filters">
                  {categories.map(item => (
                    <button
                      key={item}
                      className={
                        category === item
                          ? "filter active"
                          : "filter"
                      }
                      onClick={() => setCategory(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className={`sort-menu ${
                  sortMenuOpen ? "open" : ""
                }`}
              >
                <button
                  type="button"
                  className="sort-trigger"
                  onClick={() =>
                    setSortMenuOpen(open => !open)
                  }
                  aria-label="Sort favourites"
                  aria-expanded={sortMenuOpen}
                >
                  {(() => {
                    const selected =
                      sortOptions.find(
                        option => option.value === sort
                      ) ?? sortOptions[0];

                    const Icon = selected.icon;

                    return (
                      <>
                        <Icon size={15} />
                        <span>{selected.label}</span>
                      </>
                    );
                  })()}
                </button>

                <div className="sort-dropdown">
                  {sortOptions.map(option => {
                    const Icon = option.icon;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={
                          sort === option.value
                            ? "active"
                            : ""
                        }
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

            {loading ? (
              <div className="skeleton-grid">
                {[1, 2, 3, 4, 5].map(item => (
                  <div
                    className="skeleton-card"
                    key={item}
                  >
                    <div className="skeleton-card-top">
                      <div className="skeleton-icon" />

                      <div className="skeleton-name" />

                      <div className="skeleton-menu" />
                    </div>

                    <div className="skeleton-card-bottom">
                      <div className="skeleton-category" />
                      <div className="skeleton-arrow" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visible.length ? (
              <div className="favourite-grid">
                {visible.map(item => (
                  <article
                    key={item.id}
                    className="favourite-card"
                  >
                    <div className="favourite-card-top">
                      <a
                        className="favourite-main"
                        href={item.url}
                        target={
                          newTab ? "_blank" : undefined
                        }
                        rel={
                          newTab
                            ? "noreferrer"
                            : undefined
                        }
                        onClick={async event => {
                          if (!newTab) {
                            event.preventDefault();

                            await trackVisit(item);

                            window.location.href =
                              item.url;
                          } else {
                            void trackVisit(item);
                          }
                        }}
                      >
                        <div className="favicon-wrap">
                          <img
                            src={
                              item.icon ||
                              domainIcon(item.url) ||
                              ""
                            }
                            alt=""
                            onError={e => {
                              e.currentTarget.style.display =
                                "none";

                              e.currentTarget.nextElementSibling?.classList.remove(
                                "hidden"
                              );
                            }}
                          />

                          <span className="favicon-fallback hidden">
                            {initials(item.name)}
                          </span>
                        </div>

                        <h3>{item.name}</h3>
                      </a>

                      <button
                        type="button"
                        className="more-button"
                        aria-label={`Options for ${item.name}`}
                        title="More options"
                        onClick={() =>
                          setActionMenuItem(item)
                        }
                      >
                        <MoreVertical size={17} />
                      </button>
                    </div>

                    <a
                      className="favourite-bottom"
                      href={item.url}
                      target={
                        newTab ? "_blank" : undefined
                      }
                      rel={
                        newTab ? "noreferrer" : undefined
                      }
                      onClick={async event => {
                        if (!newTab) {
                          event.preventDefault();

                          await trackVisit(item);

                          window.location.href =
                            item.url;
                        } else {
                          void trackVisit(item);
                        }
                      }}
                    >
                      <span>
                        {item.category ||
                          "Uncategorized"}
                      </span>

                      {/* <ArrowUpRight
                        className="arrow"
                        size={16}
                      /> */}
                    </a>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <Sparkles size={20} />
                </div>

                <h3>
                  {query || category !== "All"
                    ? "Nothing matches that filter."
                    : "No favourites yet."}
                </h3>

                <p>
                  {query || category !== "All"
                    ? "Try another search or category."
                    : "Add your first website to get started."}
                </p>

                {!query && category === "All" && (
                  <button
                    className="button secondary"
                    onClick={openAdd}
                  >
                    <Plus size={16} /> Add favourite
                  </button>
                )}
              </div>
            )}
          </>
        )}

        <div className="search-fade" />

        <form
          className="search-wrap"
          onSubmit={submitSearch}
        >
          <div className="search-engine-picker">
            <button
              type="button"
              className="search-engine-trigger"
              onClick={() =>
                setSearchMenuOpen(open => !open)
              }
              aria-label={`Search engine: ${selectedEngine.name}`}
              aria-expanded={searchMenuOpen}
            >
              <img
                src={engineIcon(selectedEngine.domain)}
                alt=""
                className="search-engine-icon"
              />

              <span className="search-engine-name">
                {selectedEngine.name}
              </span>
            </button>

            {searchMenuOpen && (
              <div className="search-engine-menu">
                {SEARCH_ENGINES.map(searchEngine => (
                  <button
                    type="button"
                    key={searchEngine.id}
                    className={
                      searchEngine.id === engine
                        ? "search-engine-option active"
                        : "search-engine-option"
                    }
                    onClick={() => {
                      setEngine(searchEngine.id);
                      setSearchMenuOpen(false);
                    }}
                  >
                    <img
                      src={engineIcon(
                        searchEngine.domain
                      )}
                      alt=""
                      className="search-engine-icon"
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
          />

          <kbd>/</kbd>

          <button type="submit">
            Search
          </button>
        </form>
      </main>

      {/* =====================================================
          Favourite Actions Modal
          ===================================================== */}

      {actionMenuItem && (
        <div
          className="action-modal-backdrop"
          onMouseDown={() => setActionMenuItem(null)}
        >
          <div
            className="action-modal"
            onMouseDown={event =>
              event.stopPropagation()
            }
          >
            <div className="action-modal-heading">
              <div>
                <span className="action-modal-kicker">
                  Favourite
                </span>

                <h3>{actionMenuItem.name}</h3>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() =>
                  setActionMenuItem(null)
                }
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="action-modal-options">
              <button
                type="button"
                onClick={() =>
                  openEdit(actionMenuItem)
                }
              >
                <Pencil size={16} />
                <span>Edit</span>
              </button>

              <button
                type="button"
                className="danger-option"
                onClick={() =>
                  removeFavourite(actionMenuItem)
                }
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          Add / Edit Modal
          ===================================================== */}

      {dialog && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setDialog(null)}
        >
          <div
            className="modal"
            onMouseDown={e =>
              e.stopPropagation()
            }
          >
            <div className="modal-heading">
              <div>
                <p className="section-kicker">
                  {editing
                    ? "Refine your shortcut"
                    : "Add to your collection"}
                </p>

                <h2>
                  {editing
                    ? "Edit favourite"
                    : "New favourite"}
                </h2>
              </div>

              <button
                className="icon-button"
                onClick={() => setDialog(null)}
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="alert error">
                <span>{modalError}</span>

                <button
                  type="button"
                  onClick={() =>
                    setModalError("")
                  }
                >
                  <X size={15} />
                </button>
              </div>
            )}

            <form onSubmit={saveFavourite}>
              <label>
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
                />
              </label>

              <label>
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

                    if (
                      url &&
                      !/^https?:\/\//i.test(url)
                    ) {
                      setDraft({
                        ...draft,
                        url: `https://${url}`,
                      });
                    }
                  }}
                  placeholder="https://github.com"
                />
              </label>

              <label>
                Category

                <div className="category-pills">
                  <button
                    type="button"
                    className={`category-pill ${
                      !draft.category
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        category: "",
                      })
                    }
                  >
                    No category
                  </button>

                  {CATEGORY_OPTIONS.map(option => (
                    <button
                      key={option}
                      type="button"
                      className={`category-pill ${
                        draft.category === option
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setDraft({
                          ...draft,
                          category: option,
                        })
                      }
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </label>

              <label>
                Custom icon URL{" "}
                <span className="optional">
                  optional
                </span>

                <input
                  value={draft.icon || ""}
                  onChange={e =>
                    setDraft({
                      ...draft,
                      icon: e.target.value,
                    })
                  }
                  placeholder="Automatically detected from the URL"
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() =>
                    setDialog(null)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="button primary"
                >
                  {editing
                    ? "Save changes"
                    : "Add favourite"}
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