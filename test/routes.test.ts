/**
 * The route table, the router and the web server, cross-checked as text.
 *
 * ── WHY THIS IS A TEXT TEST RATHER THAN A RENDER TEST ─────────────────────────────────────────────
 *
 * Four separate artefacts decide which addresses this bundle answers, and only three of them are
 * JavaScript:
 *
 *   `src/lib/routes.ts`    — `ROUTES`, which the navigation and the nginx cross-check derive from
 *   `src/routes-tree.tsx`  — the `<Route>` elements the router actually mounts
 *   `src/lib/heads.ts`     — `pageEntries()`, the files the prerender writes (checked next door, in
 *                            `test/prerender.test.ts`, because that pairing is about `dist`)
 *   `nginx.conf`           — which decides the HTTP STATUS
 *
 * A render test can see the first two disagree. Nothing that runs in this process can see the last
 * at all: nginx is not imported, it is not typechecked, and a route added to the router without a
 * matching file still renders perfectly in every test in this directory. It fails only in
 * production, and it fails QUIETLY — the address answers 404, a page is served under it by
 * `error_page`, React renders something reasonable, and the only symptom is that a crawler and an
 * uptime check both believe a working page is missing. That is a defect nobody reports.
 *
 * So the config is read as a string. It is the only way this repository can hold nginx to anything.
 *
 * ── AND ON THIS SURFACE THERE IS NOTHING TO ENUMERATE ─────────────────────────────────────────────
 *
 * Every other frontend in the estate lists its routes in `nginx.conf`, one `location` per route,
 * and this file's largest job elsewhere is keeping that list in step. Here `scripts/prerender.ts`
 * writes a real file per address, so `try_files $uri $uri/index.html` finds what exists and 404s
 * what does not, with no list at all. What is left to check is that the SHAPE of that has not been
 * walked back: no SPA fallback, a real 404 page, and the origin substitution intact.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  ARTICLE_PREFIX,
  FEED_PATH,
  NAV,
  NON_INDEX_PATHS,
  ROUTES,
  articlePath,
  searchPath,
  topicPath,
} from '../src/lib/routes.ts'
import { read, stripComments } from './sources.ts'

const nginx = stripComments(read('nginx.conf'), 'nginx')
const app = stripComments(read('src/app.tsx'), 'ts')
const tree = stripComments(read('src/routes-tree.tsx'), 'ts')

/**
 * Every `path=` on a `<Route>` in routes-tree.tsx, plus `''` for the index route.
 *
 * TWO FORMS, because the article prefix is a constant rather than a string: `path="topics"` and
 * ``path={`${ARTICLE_PREFIX}/:slug`}``. The template form is resolved here against the same import
 * the module uses, so this reader cannot disagree with it about what `a` is — and anything else
 * interpolated into a path is caught by the assertion below rather than silently producing a route
 * with a `${` in it that then matches nothing.
 */
function routerPaths(): string[] {
  const paths: string[] = []
  for (const match of tree.matchAll(/<Route\s+path=(?:"([^"]+)"|\{`([^`]+)`\})/g)) {
    const literal = match[1]
    if (literal !== undefined) {
      paths.push(literal)
      continue
    }
    paths.push((match[2] ?? '').replaceAll('${ARTICLE_PREFIX}', ARTICLE_PREFIX))
  }
  for (const path of paths) {
    assert.ok(
      !path.includes('${'),
      `src/routes-tree.tsx builds ${JSON.stringify(path)} from something this test cannot resolve; ` +
        `every cross-check below would silently pass on a route that does not exist`,
    )
  }
  if (/<Route\s+index\b/.test(tree)) paths.unshift('')
  return paths
}

test('every route in the table is mounted by the router', () => {
  const mounted = routerPaths()
  for (const route of ROUTES) {
    const matches = mounted.filter((p) => p === route.path || p.startsWith(`${route.path}/`))
    assert.ok(
      matches.length > 0,
      `ROUTES declares ${JSON.stringify(route.path)} but no <Route> in src/routes-tree.tsx mounts ` +
        `it, so the navigation links to an address that renders the not-found page`,
    )
  }
})

test('the router mounts nothing the table does not declare', () => {
  for (const path of routerPaths()) {
    // The catch-all is not a route; it is what happens when none of them matched.
    if (path === '*') continue
    const head = path.split('/')[0] ?? ''
    assert.ok(
      ROUTES.some((route) => route.path === head),
      `src/routes-tree.tsx mounts ${JSON.stringify(path)}, which is not in ROUTES — so the ` +
        `prerender writes no file for it and the address answers 404 in production while passing ` +
        `every render test here`,
    )
  }
})

test('WILDCARD IS NOT DECORATION: it is what says an address comes from content', () => {
  // On the surfaces that enumerate their routes in nginx this flag decides the `location` form. Here
  // it decides something more useful: a wildcard route is one whose addresses come from CONTENT, so
  // `test/prerender.test.ts` requires at least one written file beneath it and a plain route
  // requires exactly one. Getting it backwards means either an article with no page or a page that
  // is written twice.
  for (const route of ROUTES) {
    const hasChildren = routerPaths().some((p) => p.startsWith(`${route.path}/`))
    assert.equal(
      route.wildcard,
      hasChildren,
      `ROUTES says ${JSON.stringify(route.path)} wildcard=${route.wildcard}, but ` +
        `src/routes-tree.tsx ${hasChildren ? 'does' : 'does not'} mount children beneath it`,
    )
  }
})

test('THE SPA FALLBACK IS ABSENT, AND THE 404 IS A PAGE OF ITS OWN', () => {
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // The single most important line in nginx.conf, asserted as an absence because it is the default
  // everybody reaches for. `try_files $uri /index.html` answers 200 for every address in existence:
  // a mistyped link becomes a successful blank page, a crawler indexes as many not-found pages as
  // there are ways to be wrong, and a deploy that dropped half the archive looks healthy.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  assert.doesNotMatch(
    nginx,
    /try_files\s+\$uri\s+(\$uri\/\s+)?\/index\.html/,
    'nginx.conf has the SPA fallback, which makes "page not found" a 200 — see its own header',
  )

  // What replaces it: the prerendered directory lookup. `$uri/index.html` is what turns `/a/<slug>`
  // into the file written at `a/<slug>/index.html` WITHOUT a redirect, so the address a reader was
  // given is the address they keep.
  assert.match(nginx, /try_files\s+\$uri\s+\$uri\/index\.html\s+\$uri\/\s+=404/)

  // And a 404 page that is a FILE rather than the shell. `/404.html` is in `pageEntries()` with a
  // head of its own; serving `/index.html` under a 404 instead would give every missing address the
  // archive's title and the archive's description in a crawler's index.
  assert.match(nginx, /error_page\s+404\s+\/404\.html/)
  assert.doesNotMatch(nginx, /error_page\s+404\s+\/index\.html/)
})

test('THE ORIGIN SUBSTITUTION IS INTACT, INCLUDING THE TWO LINES NOBODY REMEMBERS', () => {
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // The prerender writes `__CF_ORIGIN__` wherever an absolute URL belongs and nginx fills it in per
  // request. Three things make that work and each fails silently on its own:
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  assert.match(nginx, /sub_filter\s+'__CF_ORIGIN__'\s+'\$scheme:\/\/\$host'/)

  // ONCE OFF. The default is `on`, which replaces the FIRST match in a response and no others. An
  // article carries a dozen — canonical, og:url, twitter:url, the JSON-LD @id, the author @id, the
  // publisher logo, every image — so the default substitutes the canonical and ships the rest raw.
  assert.match(nginx, /sub_filter_once\s+off/)

  // TYPES. The default is text/html alone, and the three files whose whole content is absolute URLs
  // are not HTML. Each is asserted by name because each is a different failure: a feed nobody can
  // subscribe to, a sitemap every entry of which is rejected, and a robots.txt whose Sitemap line
  // points at a host called `__CF_ORIGIN__`.
  const types = /sub_filter_types([^;]+);/.exec(nginx)?.[1] ?? ''
  for (const type of ['text/html', 'application/xml', 'application/rss+xml', 'text/plain']) {
    assert.ok(types.includes(type), `sub_filter_types does not cover ${type}`)
  }

  // AND `gzip_static` IS ABSENT. It is the obvious optimisation for a directory of static files and
  // it disables every substitution above: a pre-compressed file is passed through untouched,
  // because the filter runs on the body and cannot see inside a deflate stream. The page then ships
  // with `__CF_ORIGIN__` visible in the markup, which no test that renders React can ever catch.
  assert.doesNotMatch(nginx, /gzip_static/)
})

test('THE SITEMAP AND THE FEED ARE FILES, NOT STRINGS IN THE WEB SERVER', () => {
  // Every other surface in the estate composes its sitemap with `return 200 '<?xml …'` in nginx,
  // because it has four addresses and they are known when the config is written. This one has one
  // entry per article and per topic, each carrying a `lastmod` from the article's own front matter,
  // and nginx knows none of that. `src/lib/syndication.ts` builds both from `content/index.ts`, so a
  // new article is in the sitemap because it exists rather than because somebody remembered.
  //
  // Asserted as an absence, because the `return 200` version is what this file was forked from and
  // it would keep working — it would just freeze the sitemap at the four addresses it was written
  // with, and quietly stop declaring every article published after that.
  const sitemap = nginx.slice(nginx.indexOf('location = /sitemap.xml'))
  assert.doesNotMatch(sitemap.slice(0, 600), /return\s+200\s+'<\?xml/)

  // Both are served with a type that is decided rather than inherited from the `.xml` in the URI.
  assert.match(nginx, /location = \/feed\.xml[\s\S]{0,400}?default_type application\/rss\+xml/)
  assert.match(nginx, /location = \/sitemap\.xml[\s\S]{0,400}?default_type application\/xml/)

  // The feed's path is a constant in routes.ts because it is quoted in the head, in the footer and
  // on the about page; nginx has to serve the same one.
  assert.equal(FEED_PATH, '/feed.xml')
})

test('A NON-MAINNET ARCHIVE IS NOT INDEXED, AND THE THREE GATES ALL SAY SO', () => {
  // Every article is byte-identical on both networks — there is no chain data in an essay — so the
  // two archives are not similar pages, they are THE SAME PAGE at two addresses. A search engine
  // picks one canonical and suppresses the other, and which one it picks is not ours to decide.
  //
  // Three gates, because a crawler that ignores one still meets the next: no sitemap to read, no
  // feed to subscribe to, and a robots.txt that refuses everything.
  const gated = [...nginx.matchAll(/location = \/(sitemap\.xml|feed\.xml)\b([\s\S]*?)\n    \}/g)]
  assert.equal(gated.length, 2, 'the sitemap and the feed are not both present as exact locations')
  for (const [, name, body] of gated) {
    assert.match(body ?? '', /if \(\$cf_env\) \{ return 404; \}/, `/${name} is not gated on $cf_env`)
  }

  // The robots gate is a `return`, and its body is written across REAL LINES. nginx does not process
  // backslash escapes in a quoted string, so `'Disallow: /\n'` emits a literal backslash and an n.
  const robots = nginx.slice(nginx.indexOf('location = /robots.txt'))
  assert.match(robots.slice(0, 1200), /if \(\$cf_env\) \{ return 200 'User-agent: \*\nDisallow: \//)
})

test('THIS CONTAINER PROXIES NOTHING, AND HAS NOTHING TO PROXY TO', () => {
  // Elsewhere in the estate this line means "the gateway routes /v1 to the service". Here it means
  // there is no service: an article is committed source, `src/content/` is the whole backend, and
  // what this container serves is files that went through a pull request. A `proxy_pass` appearing
  // is the first visible sign that somebody has given the archive a database.
  assert.doesNotMatch(nginx, /proxy_pass/)
})

test('NOTHING ON THIS SURFACE IS GATED, THOUGH SOMEBODY IS SIGNED IN', () => {
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // The provider exists so the estate's bar can greet a reader by name and show an operator the
  // operator entries in the switcher. It gates NOTHING and may gate nothing: a sign-in wall in
  // front of an article is a wall in front of the only thing this surface has, and a page a crawler
  // cannot read is a page that does not exist.
  //
  // Comments are stripped first, because src/app.tsx names what it refuses in order to explain it.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  for (const forbidden of ['ProtectedRoute', 'RequireAuth', 'RequireSession', 'redirectToLogin']) {
    assert.ok(
      !app.includes(forbidden),
      `src/app.tsx references ${forbidden}; every route on this surface renders for everybody`,
    )
  }
  assert.match(app, /<AuthProvider>/)

  // Not one `<Route>` may name a guard or a `loader` that could refuse. Read off the route MODULE
  // rather than off app.tsx, because that is where the routes now live — and read as text, so a
  // provider in the file above cannot satisfy it.
  for (const forbidden of [/signedIn/, /useSession/, /loader=/]) {
    assert.doesNotMatch(
      tree,
      forbidden,
      'a route in src/routes-tree.tsx branches on the session; every page here is public writing',
    )
  }

  // And the prerender is the proof rather than the promise: it renders these same routes with no
  // DOM, no session and no network. A route that needed any of the three would fail the build.
  assert.match(read('scripts/prerender.ts'), /routeChildren/)
})

test('the navigation is derived from the table and cannot drift from it', () => {
  assert.deepEqual(
    NAV.map((item) => item.to),
    ROUTES.filter((r) => r.label !== null).map((r) => `/${r.path}`),
  )
  // Every navigation target is an address the prerender writes a file for. A link in the masthead
  // that 404s is the easiest of these failures to ship and the most embarrassing to find.
  for (const item of NAV) {
    const path = item.to.replace(/^\//, '')
    assert.ok(path === '' || NON_INDEX_PATHS.includes(path))
  }
  // `search` and `a` are routes and are NOT in the navigation, for opposite reasons: search is
  // reached from the field in the masthead, and an article is reached from a link to it. A menu
  // entry called "Articles" pointing at `/a` would lead to an address that has no page at all.
  assert.equal(
    NAV.some((item) => item.to === '/search' || item.to === `/${ARTICLE_PREFIX}`),
    false,
  )
})

test('AN ARTICLE’S ADDRESS IS THE ONE THING HERE THAT CAN NEVER CHANGE', () => {
  // It is the address somebody has already shared, in a message this repository will never see. So
  // the builder is trivial by design — the slug goes in as it is written in `content/`, with no
  // date, no id, no category segment and no normalisation that could differ from the one the
  // prerender used when it chose a directory name.
  assert.equal(articlePath('why-we-built-our-own-chain'), '/a/why-we-built-our-own-chain')
  // One letter, because the prefix is in every link anybody shares and `/articles/` is nine
  // characters of nothing on every one of them. It is also NOT `/blog/`, which is a word about the
  // publisher rather than about the piece.
  assert.equal(ARTICLE_PREFIX, 'a')
  assert.equal(topicPath('staying-safe'), '/topics/staying-safe')
})

test('SEARCH IS A QUERY, AND THAT IS THE DISTINCTION THE ROUTE TABLE DRAWS', () => {
  // `/topics/staying-safe` identifies a resource that exists whether or not anybody asked for it.
  // `?q=wallet` identifies a question somebody typed. Putting the query in the path would put every
  // typo a reader makes into the sitemap's shape of address, and robots.txt would have to exclude a
  // path prefix rather than a parameter.
  assert.equal(searchPath('wallet'), '/search?q=wallet')
  assert.equal(searchPath('  '), '/search')
  // Encoded, because this argument is a reader's own keystrokes.
  assert.equal(searchPath('a b&c'), '/search?q=a+b%26c')
})

test('THERE IS NO AUTHOR PAGE, NO YEAR ARCHIVE AND NO PAGINATION, AND THAT IS A DECISION', () => {
  // Each would be a sitemap entry with one or two items on it — the shape a crawler calls thin and a
  // reader experiences as a corridor. They earn their existence from volume and there is none yet.
  // Written as a test rather than a comment because the reason expires: at fifty articles the
  // pagination argument reverses, and whoever reverses it should have to delete this.
  for (const route of ROUTES) {
    assert.ok(!/^(authors?|archive|page|tag|category)$/.test(route.path), route.path)
  }
})

test('routes.ts imports nothing, so the prerender can read it without a bundler', () => {
  // The module's own claim, checked. An import of a `.css` or of `@cloudsforge/ui` here would make
  // it unloadable under plain Node — which is where `scripts/prerender.ts` runs — and the build
  // would fail with a message about a stylesheet.
  assert.doesNotMatch(read('src/lib/routes.ts'), /^\s*import\s/m)
})
