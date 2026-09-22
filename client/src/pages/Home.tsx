import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { CATEGORY_OPTIONS, Favourite, FavouriteDraft } from '@/types/favourite'
import { ArrowUpRight, Check, GripVertical, LogIn, LogOut, Moon, Pencil, Plus, Search, Settings2, Sparkles, Sun, Trash2, X } from 'lucide-react'

type Theme = 'system' | 'light' | 'dark'
type SearchEngine = 'google' | 'duckduckgo' | 'bing'

const demoFavourites: Favourite[] = [
  { id: 'demo-1', user_id: 'demo', name: 'GitHub', url: 'https://github.com', icon: null, category: 'Development', position: 0, created_at: '', updated_at: '' },
  { id: 'demo-2', user_id: 'demo', name: 'Linear', url: 'https://linear.app', icon: null, category: 'Work', position: 1, created_at: '', updated_at: '' },
  { id: 'demo-3', user_id: 'demo', name: 'YouTube', url: 'https://youtube.com', icon: null, category: 'Entertainment', position: 2, created_at: '', updated_at: '' },
  { id: 'demo-4', user_id: 'demo', name: 'Figma', url: 'https://figma.com', icon: null, category: 'Work', position: 3, created_at: '', updated_at: '' },
]

function domainIcon(url: string) {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128` } catch { return null }
}
function normalizeUrl(value: string) { return /^https?:\/\//i.test(value) ? value : `https://${value}` }
function initials(name: string) { return name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() }

export default function Home() {
  const [favourites, setFavourites] = useState<Favourite[]>(isSupabaseConfigured ? [] : demoFavourites)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [dialog, setDialog] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Favourite | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [draft, setDraft] = useState<FavouriteDraft>({ name: '', url: '', category: '', icon: '' })
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('fh-theme') as Theme) || 'system')
  const [engine, setEngine] = useState<SearchEngine>(() => (localStorage.getItem('fh-engine') as SearchEngine) || 'google')
  const [newTab, setNewTab] = useState(() => localStorage.getItem('fh-new-tab') === 'true')
  const [dragId, setDragId] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const loadFavourites = async () => {
    if (!supabase) return
    setLoading(true)
    const { data, error: loadError } = await supabase.from('favourites').select('*').order('position', { ascending: true })
    if (loadError) setError('We could not load your cloud favourites. Check your connection and try again.')
    else setFavourites(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    const root = document.documentElement
    const resolved = theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme
    root.classList.toggle('dark', resolved === 'dark')
    localStorage.setItem('fh-theme', theme)
  }, [theme])
  useEffect(() => { localStorage.setItem('fh-engine', engine) }, [engine])
  useEffect(() => { localStorage.setItem('fh-new-tab', String(newTab)) }, [newTab])
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); if (data.session) loadFavourites(); else setLoading(false) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { setSession(nextSession); if (nextSession) loadFavourites(); else { setFavourites([]); setLoading(false) } })
    return () => listener.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') { event.preventDefault(); searchRef.current?.focus() }
      if (event.key === 'Escape') { setDialog(null); setSettingsOpen(false) }
    }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [])

  const visible = useMemo(() => favourites.filter((item) => (category === 'All' || item.category === category) && `${item.name} ${item.url}`.toLowerCase().includes(query.toLowerCase())), [favourites, category, query])
  const categories = useMemo(() => ['All', ...Array.from(new Set(favourites.map((item) => item.category).filter(Boolean) as string[]))], [favourites])

  const signIn = async () => {
    if (!supabase) return setNotice('Add your Supabase environment variables to enable GitHub sign-in.')
    const { error: authError } = await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: window.location.origin } })
    if (authError) setError('GitHub sign-in could not start. Please try again.')
  }
  const signOut = async () => { await supabase?.auth.signOut(); setNotice('Signed out') }
  const openAdd = () => { setEditing(null); setDraft({ name: '', url: '', category: '', icon: '' }); setDialog('add') }
  const openEdit = (item: Favourite) => { setEditing(item); setDraft({ name: item.name, url: item.url, category: item.category ?? '', icon: item.icon ?? '' }); setDialog('edit') }

  const saveFavourite = async (event: FormEvent) => {
    event.preventDefault(); setError('')
    const name = draft.name.trim(); const url = normalizeUrl(draft.url.trim())
    try { new URL(url) } catch { return setError('Enter a valid website URL, such as https://github.com.') }
    if (!name) return setError('Give this favourite a name.')
    const icon = draft.icon?.trim() || domainIcon(url)
    if (!supabase) {
      const local: Favourite = { id: editing?.id ?? `demo-${Date.now()}`, user_id: 'demo', name, url, icon, category: draft.category || null, position: editing?.position ?? favourites.length, created_at: '', updated_at: '' }
      setFavourites((items) => editing ? items.map((item) => item.id === editing.id ? local : item) : [...items, local]); setDialog(null); setNotice('Preview saved locally — connect Supabase to sync across devices.'); return
    }
    if (editing) {
      const previous = favourites; const updated = { ...editing, ...localFields(name, url, icon, draft.category) } as Favourite
      setFavourites((items) => items.map((item) => item.id === editing.id ? updated : item)); setDialog(null)
      const { error: updateError } = await supabase.from('favourites').update(localFields(name, url, icon, draft.category)).eq('id', editing.id)
      if (updateError) { setFavourites(previous); setError('We could not save that edit. Please try again.') }
    } else {
      const optimistic: Favourite = { id: `temp-${Date.now()}`, user_id: session.user.id, name, url, icon, category: draft.category || null, position: favourites.length, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      setFavourites((items) => [...items, optimistic]); setDialog(null)
      const { data, error: insertError } = await supabase.from('favourites').insert({ name, url, icon, category: draft.category || null, position: optimistic.position }).select().single()
      if (insertError) { setFavourites((items) => items.filter((item) => item.id !== optimistic.id)); setError('We could not add that favourite. Please try again.') } else setFavourites((items) => items.map((item) => item.id === optimistic.id ? data : item))
    }
  }
  const removeFavourite = async (item: Favourite) => {
    if (!window.confirm(`Remove ${item.name} from your favourites?`)) return
    const previous = favourites; setFavourites((items) => items.filter((entry) => entry.id !== item.id))
    if (supabase && !item.id.startsWith('temp-')) { const { error: deleteError } = await supabase.from('favourites').delete().eq('id', item.id); if (deleteError) { setFavourites(previous); setError('We could not remove that favourite.') } }
  }
  const persistOrder = async (items: Favourite[]) => {
    setFavourites(items.map((item, index) => ({ ...item, position: index })))
    const client = supabase
    if (client) {
      const results = await Promise.all(items.map((item, index) => client.from('favourites').update({ position: index }).eq('id', item.id)))
      if (results.some((result) => result.error)) { setError('The new order could not be synced. Please refresh and try again.'); loadFavourites() }
    }
  }
  const dropOn = (targetId: string) => {
    if (!dragId || dragId === targetId) return
    const next = [...favourites]; const from = next.findIndex((item) => item.id === dragId); const to = next.findIndex((item) => item.id === targetId)
    const [moved] = next.splice(from, 1); next.splice(to, 0, moved); setDragId(null); persistOrder(next)
  }
  const submitSearch = (event: FormEvent) => { event.preventDefault(); const providers: Record<SearchEngine, string> = { google: 'https://www.google.com/search?q=', duckduckgo: 'https://duckduckgo.com/?q=', bing: 'https://www.bing.com/search?q=' }; if (query.trim()) window.location.href = providers[engine] + encodeURIComponent(query.trim()) }

  const isSignedOut = isSupabaseConfigured && !session
  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><Sparkles size={15} /></div><span>Favourites</span><span className="brand-dot">Home</span></div>
      <div className="top-actions">
        {isSupabaseConfigured ? (session ? <div className="account"><button className="avatar" title={session.user.email}>{(session.user.user_metadata?.full_name || session.user.email || 'U').slice(0, 1).toUpperCase()}</button><button className="icon-button" onClick={signOut} title="Sign out"><LogOut size={17} /></button></div> : <button className="button secondary" onClick={signIn}><LogIn size={16} /> Sign in with Google</button>) : <span className="preview-pill">Preview mode</span>}
        <button className="icon-button" onClick={() => setSettingsOpen((open) => !open)} aria-label="Open settings"><Settings2 size={18} /></button>
      </div>
      {settingsOpen && <div className="settings-popover"><div className="settings-heading">Quick settings <button onClick={() => setSettingsOpen(false)}><X size={15} /></button></div><label>Theme<select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label><label>Search engine<select value={engine} onChange={(e) => setEngine(e.target.value as SearchEngine)}><option value="google">Google</option><option value="duckduckgo">DuckDuckGo</option><option value="bing">Bing</option></select></label><label className="switch-row">Open links in a new tab <input type="checkbox" checked={newTab} onChange={(e) => setNewTab(e.target.checked)} /></label></div>}
    </header>
    <main className="main-content">
      <section className="hero"><p className="eyebrow">YOUR PERSONAL START PAGE</p><h1>Everything you need,<br /><em>one click away.</em></h1><p className="hero-copy">A quiet place for the sites you return to every day.</p></section>
      {error && <div className="alert error"><span>{error}</span><button onClick={() => setError('')}><X size={15} /></button></div>}
      {notice && <div className="alert success"><Check size={15} /><span>{notice}</span><button onClick={() => setNotice('')}><X size={15} /></button></div>}
      {isSignedOut ? <section className="auth-card"><div className="auth-icon"><Sparkles size={22} /></div><h2>Your favourites, everywhere.</h2><p>Sign in with Github to sync your personal start page across every device.</p><button className="button primary" onClick={signIn}><LogIn size={16} /> Continue with Github</button></section> : <>
        <section className="section-head"><div><p className="section-kicker">Your collection</p><h2>Favourites <span>{favourites.length}</span></h2></div><button className="button primary" onClick={openAdd}><Plus size={17} /> Add favourite</button></section>
        <div className="filters">{categories.map((item) => <button key={item} className={category === item ? 'filter active' : 'filter'} onClick={() => setCategory(item)}>{item}</button>)}</div>
        {loading ? <div className="skeleton-grid">{[1,2,3,4].map((item) => <div className="skeleton" key={item} />)}</div> : visible.length ? <div className="favourite-grid">{visible.map((item) => <article key={item.id} className="favourite-card" draggable onDragStart={() => setDragId(item.id)} onDragOver={(e) => e.preventDefault()} onDrop={() => dropOn(item.id)}><div className="card-top"><span className="drag-handle" title="Drag to reorder"><GripVertical size={15} /></span><div className="card-actions"><button onClick={() => openEdit(item)} title="Edit"><Pencil size={14} /></button><button onClick={() => removeFavourite(item)} title="Delete"><Trash2 size={14} /></button></div></div><a className="favourite-link" href={item.url} target={newTab ? '_blank' : undefined} rel={newTab ? 'noreferrer' : undefined}><div className="favicon-wrap"><img src={item.icon || domainIcon(item.url) || ''} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }} /><span className="favicon-fallback hidden">{initials(item.name)}</span></div><h3>{item.name}</h3><p>{item.category || 'Uncategorized'}</p><ArrowUpRight className="arrow" size={17} /></a></article>)}</div> : <div className="empty-state"><div className="empty-icon"><Sparkles size={20} /></div><h3>{query || category !== 'All' ? 'Nothing matches that filter.' : 'No favourites yet.'}</h3><p>{query || category !== 'All' ? 'Try another search or category.' : 'Add your first website to get started.'}</p>{!query && category === 'All' && <button className="button secondary" onClick={openAdd}><Plus size={16} /> Add favourite</button>}</div>}
      </>}
      <form className="search-wrap" onSubmit={submitSearch}><Search size={19} /><input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the web..." aria-label="Search the web" /><kbd>/</kbd><button type="submit">Search</button></form>
      <p className="privacy-note">Your favourites are stored securely in your Supabase account.</p>
    </main>
    {dialog && <div className="modal-backdrop" onMouseDown={() => setDialog(null)}><div className="modal" onMouseDown={(e) => e.stopPropagation()}><div className="modal-heading"><div><p className="section-kicker">{editing ? 'Refine your shortcut' : 'Add to your collection'}</p><h2>{editing ? 'Edit favourite' : 'New favourite'}</h2></div><button className="icon-button" onClick={() => setDialog(null)}><X size={18} /></button></div><form onSubmit={saveFavourite}><label>Name<input autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="GitHub" /></label><label>URL<input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://github.com" /></label><label>Category<select value={draft.category || ''} onChange={(e) => setDraft({ ...draft, category: e.target.value })}><option value="">No category</option>{CATEGORY_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></label><label>Custom icon URL <span className="optional">optional</span><input value={draft.icon || ''} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} placeholder="Automatically detected from the URL" /></label><div className="modal-actions"><button type="button" className="button secondary" onClick={() => setDialog(null)}>Cancel</button><button type="submit" className="button primary">{editing ? 'Save changes' : 'Add favourite'}</button></div></form></div></div>}
  </div>
}
function localFields(name: string, url: string, icon: string | null, category: string | null) { return { name, url, icon, category: category || null, updated_at: new Date().toISOString() } }
