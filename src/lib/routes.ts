/**
 * The route table, as data.
 *
 * This module imports NOTHING. FOUR things have to agree about which addresses this app answers —
 * this table, `src/app.tsx`, the enumerated `location` blocks in `nginx.conf`, and the list
 * `scripts/prerender.ts` writes a file for — and `test/routes.test.ts` reads all of them and
 * cross-checks. It can only do that if this file is readable without a bundler, which is also what
 * lets the prerender script import it under plain Node.
 *
 * The nginx side is the half that fails quietly. `try_files $uri /index.html` answers 200 for every
 * address in existence, so a typo in a link becomes a blank page with a successful status and a
 * crawler indexes every one of them. The routes are therefore enumerated there, and
 * `error_page 404 /404.html` is what serves the shell UNDER the real status.
 *
 * ── ON THIS SURFACE THERE IS A FIFTH THING, AND IT IS THE ONE THAT MATTERS MOST ──────────────────
 *
 * Every address below has a REAL FILE behind it in `dist`, written by the prerender. An article is
 * not a route the client fills in — it is `/a/<slug>/index.html`, complete, with its own title, its
 * own description, its own card and its own JSON-LD, served to a crawler that runs no JavaScript
 * and to a reader on a slow connection who gets the words before the bundle arrives. That is the
 * entire reason this surface exists as its own repository rather than as a section of the marketing
 * site, and it is why `nginx.conf` serves `$uri/index.html` before it falls back to anything.
 */

/**
 * ── WHERE THIS BUNDLE IS MOUNTED, AND WHY THE TWO KINDS OF PATH BELOW ARE NOT THE SAME KIND ──────
 *
 * This publication used to be a hostname. It is now a FOLDER on the apex: `/journal`, wave 1 of the
 * consolidation argued in micro-deploy `docs/apex-consolidation.md`. The registry row says the same
 * thing in one line — `subdomain: ''`, `basePath: '/journal'` — and everything the estate composes
 * about this surface comes from there.
 *
 * Inside this repository the move splits every address into two, and getting the pair the wrong way
 * round is the failure mode of the whole change:
 *
 *   A ROUTER PATH is what `react-router` matches, and it is relative to the mount. `/a/<slug>`.
 *     Every `<Link to>`, every `<Route path>`, `NAV`, `searchPath()`, `articlePath()`, `topicPath()`.
 *     `basename` in `src/app.tsx` and in `scripts/prerender.ts` puts the prefix back on the way out,
 *     so a router path that already carries it renders `/journal/journal/a/<slug>`.
 *
 *   A PUBLIC PATH is what a reader's address bar shows and what a crawler is handed. `/journal/a/…`.
 *     Every canonical, `og:url`, JSON-LD `@id`, feed `<link>`, sitemap `<loc>`, plain `<a href>` and
 *     every `location` in `nginx.conf`. A crawler resolves these against the ORIGIN, not against the
 *     mount, so a router path published as a public one names an address on the marketing site.
 *
 * `publicPath()` is the one crossing, and it is the only place `BASE` is concatenated.
 */
export const BASE = '/journal'

/**
 * A router path as a public one.
 *
 * The index is `/journal` rather than `/journal/` — no trailing slash anywhere on this surface, so
 * the canonical, the sitemap entry and the `location` in `nginx.conf` are one address rather than
 * two with a redirect between them.
 */
export function publicPath(path: string): string {
  return path === '/' ? BASE : `${BASE}${path}`
}

/** The prefix every article sits under. One letter, because it appears in every shared link. */
export const ARTICLE_PREFIX = 'a'

export interface AppRoute {
  /** The path segment, without a leading slash. The index route is the empty string. */
  readonly path: string
  /** What the navigation calls it, or null when it is not a navigation destination. */
  readonly label: string | null
  /** True when the router genuinely has children beneath this path. Decides the nginx form. */
  readonly wildcard: boolean
}

/**
 * Five routes:
 *
 *   `''`        — the archive. Every article, newest first, with the newest given the whole width.
 *   `a`         — one article. `/a/<slug>`, and the slug never changes once published, because it
 *                 is the address somebody has already shared.
 *   `topics`    — the six topics, and one page each. Closed set; see `content/tags.ts`.
 *   `about`     — what this is, who writes it, and how to subscribe without an account.
 *   `search`    — the whole corpus, searched in the reader's own browser. See `content/index.ts`.
 *
 * There is deliberately no `/authors/<id>`, no `/archive/<year>` and no pagination. Each would be a
 * page in the sitemap with one or two items on it, which is the shape a crawler calls thin and a
 * reader experiences as a corridor. They earn their existence from volume, and there is none yet.
 */
export const ROUTES: readonly AppRoute[] = [
  { path: '', label: 'Latest', wildcard: false },
  { path: ARTICLE_PREFIX, label: null, wildcard: true },
  { path: 'topics', label: 'Topics', wildcard: true },
  { path: 'about', label: 'About', wildcard: false },
  { path: 'search', label: null, wildcard: false },
]

/** The header navigation, in order. Derived, so a route cannot be added without deciding this. */
export const NAV: readonly { readonly to: string; readonly label: string }[] = ROUTES.filter(
  (route): route is AppRoute & { label: string } => route.label !== null,
).map((route) => ({ to: `/${route.path}`, label: route.label }))

/** Every non-index path, for the nginx cross-check. */
export const NON_INDEX_PATHS: readonly string[] = ROUTES.filter((route) => route.path !== '').map(
  (route) => route.path,
)

export function articlePath(slug: string): string {
  return `/${ARTICLE_PREFIX}/${slug}`
}

export function topicPath(slug: string): string {
  return `/topics/${slug}`
}

/**
 * The search page, carrying a query.
 *
 * A QUERY STRING, not a segment, and the distinction is the same one every route table has to make:
 * `/topics/hearth` identifies a resource that exists whether or not anybody asked for it, and
 * `?q=wallet` identifies a question somebody typed. Putting a query in the path would put every
 * typo a reader makes into the sitemap's shape of address, and `robots.txt` would have to exclude
 * a path prefix rather than a parameter.
 */
export function searchPath(query: string): string {
  const trimmed = query.trim()
  if (trimmed === '') return '/search'
  return `/search?${new URLSearchParams({ q: trimmed }).toString()}`
}

/**
 * The feed. A constant, because it is quoted in three places and typed in none of them.
 *
 * PUBLIC, unlike everything above it. The three places are a `<link rel="alternate">` in
 * `index.html` and two plain `<a href>`s — none of them a `<Link>`, because the feed is a FILE
 * rather than a route: nothing in the router matches it, `basename` never sees it, and a reader who
 * clicks it leaves this bundle for their own feed application. So it carries the mount itself.
 */
export const FEED_PATH = `${BASE}/feed.xml`
