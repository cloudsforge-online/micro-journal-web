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
  BASE,
  FEED_PATH,
  NAV,
  NON_INDEX_PATHS,
  ROUTES,
  articlePath,
  publicPath,
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
  assert.match(nginx, /try_files\s+\$uri\s+\$uri\/index\.html\s+=404/)

  // AND NO `$uri/` ELEMENT. It reads as "also accept a trailing slash" and it is the only element
  // that matches a DIRECTORY — including `dist/a/`, which has no `index.html` because nothing is
  // published at `/a`. With it in the chain `/a` answered 301 and `/a/` answered 403: two ways of
  // not saying "there is nothing here", both of which a crawler follows. Nothing needs it, because
  // a request for `/topics/` is served by `$uri/index.html` — a doubled slash in a filesystem path
  // is one slash — and `$uri` alone can never match a directory, since try_files reads the trailing
  // slash from the LITERAL in nginx.conf at parse time rather than from the expanded value.
  assert.doesNotMatch(
    nginx,
    /try_files[^;]*\$uri\/\s/,
    'nginx.conf matches a directory again; an address that was never written would 301, not 404',
  )

  // And a 404 page that is a FILE rather than the shell. `/journal/404.html` is in `pageEntries()`
  // with a head of its own; serving the shell under a 404 instead would give every missing address
  // the archive's title and the archive's description in a crawler's index.
  //
  // MOUNTED, and `error_page` is the one directive where that is easy to get wrong in a way nothing
  // else catches: it takes a URI and RE-ENTERS location matching with it, so an unprefixed
  // `/404.html` would be matched by `location /` — which answers 404 — and nginx would serve its own
  // built-in error body instead of the designed page, on every miss, forever.
  assert.match(nginx, new RegExp(`error_page\\s+404\\s+${BASE}/404\\.html`))
  assert.doesNotMatch(nginx, /error_page\s+404\s+\/404\.html/)
  assert.doesNotMatch(nginx, /error_page\s+404\s+\/index\.html/)
})

test('THE ORIGIN SUBSTITUTION IS INTACT, INCLUDING THE TWO LINES NOBODY REMEMBERS', () => {
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // The prerender writes `__CF_ORIGIN__` wherever an absolute URL belongs and nginx fills it in per
  // request. Three things make that work and each fails silently on its own:
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  assert.match(nginx, /sub_filter\s+'__CF_ORIGIN__'\s+'https:\/\/\$host'/)

  // THE SCHEME IS A LITERAL AND NOT `$scheme`. TLS ends at Cloudflare, the tunnel and the gateway
  // both speak plain HTTP to this container, so `$scheme` is `http` on every request a reader ever
  // makes — and a canonical of `http://journal.<apex>/…` names a different URL to a search engine,
  // one that 301s the moment it is followed. `X-Forwarded-Proto` is no better: the gateway sets no
  // `forwardedHeaders.trustedIPs`, so Traefik overwrites it with its own entrypoint's scheme.
  assert.doesNotMatch(nginx, /sub_filter\s+'__CF_ORIGIN__'\s+'\$scheme/)

  // ONCE OFF. The default is `on`, which replaces the FIRST match in a response and no others. An
  // article carries a dozen — canonical, og:url, twitter:url, the JSON-LD @id, the author @id, the
  // publisher logo, every image — so the default substitutes the canonical and ships the rest raw.
  assert.match(nginx, /sub_filter_once\s+off/)

  // TYPES. The default is text/html alone, and the two files whose whole content is absolute URLs
  // are not HTML. Each is asserted by name because each is a different failure: a feed nobody can
  // subscribe to, and a sitemap every entry of which is rejected.
  //
  // `text/plain` was a third entry here, for the `robots.txt` this surface no longer serves — see
  // the test below on why the folder deleted it rather than prefixing it. It stays in the list
  // because `location = /healthz` declares `default_type text/plain` and the cost of covering a
  // two-byte response is nothing, while a type dropped from this line is invisible until somebody
  // reads a feed.
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
  const sitemap = nginx.slice(nginx.indexOf(`location = ${BASE}/sitemap.xml`))
  assert.doesNotMatch(sitemap.slice(0, 600), /return\s+200\s+'<\?xml/)

  // Both are served with a type that is decided rather than inherited from the `.xml` in the URI.
  assert.match(
    nginx,
    new RegExp(`location = ${BASE}/feed\\.xml[\\s\\S]{0,400}?default_type application/rss\\+xml`),
  )
  assert.match(
    nginx,
    new RegExp(`location = ${BASE}/sitemap\\.xml[\\s\\S]{0,400}?default_type application/xml`),
  )

  // The feed's path is a constant in routes.ts because it is quoted in the head, in the footer and
  // on the about page; nginx has to serve the same one. PUBLIC, unlike every other path in that
  // module — the feed is a file rather than a route, so `basename` never sees it and it carries the
  // mount itself.
  assert.equal(FEED_PATH, '/journal/feed.xml')
  assert.equal(FEED_PATH, `${BASE}/feed.xml`)
})

test('A NON-MAINNET ARCHIVE IS NOT INDEXED, AND THE TWO GATES LEFT HERE SAY SO', () => {
  // Every article is byte-identical on both networks — there is no chain data in an essay — so the
  // two archives are not similar pages, they are THE SAME PAGE at two addresses. A search engine
  // picks one canonical and suppresses the other, and which one it picks is not ours to decide.
  //
  // TWO gates rather than three, and the third did not weaken — it moved. The robots.txt gate is
  // now the apex's, which already answers `Disallow: /` on every non-mainnet hostname, so the
  // testnet archive is refused by the host that serves it instead of by a rule this repository has
  // to remember to keep. These two stay here because they are files a machine asks for BY NAME
  // under this mount, and nothing outside this container knows they exist.
  const gated = [
    ...nginx.matchAll(
      new RegExp(`location = ${BASE}/(sitemap\\.xml|feed\\.xml)\\b([\\s\\S]*?)\\n    \\}`, 'g'),
    ),
  ]
  assert.equal(gated.length, 2, 'the sitemap and the feed are not both present as exact locations')
  for (const [, name, body] of gated) {
    assert.match(body ?? '', /if \(\$cf_env\) \{ return 404; \}/, `/${name} is not gated on $cf_env`)
  }
})

test('THERE IS NO robots.txt IN THIS FILE, AND DELETING IT WAS THE POINT OF THE FOLDER', () => {
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // A CRAWLER READS robots.txt AT THE ORIGIN ROOT AND NOWHERE ELSE.
  //
  // There is no such thing as a robots file for a subdirectory. So the two candidate moves were
  // both worse than deletion, and the second is the one somebody will reach for:
  //
  //   `location = /robots.txt` KEPT UNPREFIXED — this image would then answer for an apex address
  //   it does not own, contradicting micro-site's own robots.txt on whichever of them the gateway
  //   happened to route. Two documents disagreeing about what may be crawled is worse than either.
  //
  //   `location = /journal/robots.txt` — prefixed like everything else, and a file nothing will
  //   ever request. The only copy of the `Disallow: /search` rule would sit in a document no
  //   machine opens, while `/journal/search?q=…` became crawlable for the first time in this
  //   publication's life. A search page mints a distinct address for every string anybody has
  //   typed, so forty pieces of writing get indexed as four thousand near-empty results.
  //
  // Both lines are in micro-site's apex robots.txt now: `Disallow: /journal/search`, and a second
  // `Sitemap:` naming the file this container still serves. `robotsTxt()` in `src/lib/syndication.ts`
  // went with them, and `test/prerender.test.ts` asserts nothing writes the file into `dist`.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  assert.doesNotMatch(
    nginx,
    /location\s*=?\s*[^;{]*robots\.txt/,
    'nginx.conf serves a robots.txt again; at the root it contradicts the apex, and under the ' +
      'mount it is a document no crawler will ever open',
  )
  assert.doesNotMatch(stripComments(read('src/lib/syndication.ts'), 'ts'), /robotsTxt/)
})

test('EVERY location IS UNDER THE MOUNT, AND THE ONE THAT IS NOT BELONGS TO THE CONTAINER', () => {
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // The check that catches a half-migrated file, which is the failure mode of a change like this
  // one: a `location` left at the root answers for an address that belongs to micro-site, and the
  // gateway routes those elsewhere — so it is dead config that reads as live, until the day a
  // router changes and this container starts answering for the marketing site.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  const paths = [...nginx.matchAll(/^\s*location\s+(?:(=|\^~|~\*?)\s+)?(\S+)\s*\{/gm)].map(
    ([, modifier, path]) => ({ modifier: modifier ?? '', path: path ?? '' }),
  )
  assert.ok(paths.length >= 8, 'nginx.conf has lost its locations, or their shape has changed')

  for (const { modifier, path } of paths) {
    // `location /` is the catch-all that answers 404 for everything outside the mount, and
    // `/healthz` is the container's own probe: it is dialled by the Dockerfile's HEALTHCHECK and by
    // the deployment's readiness probe, both of which reach the pod on 8080 directly and neither of
    // which knows or should know where the gateway mounts this bundle. A `/journal/healthz` would
    // also be a PUBLIC address answering 200 to anything that asked.
    if (path === '/' || path === '/healthz') continue
    const mounted = modifier.startsWith('~') ? path.startsWith(`^${BASE}/`) : path.startsWith(BASE)
    assert.ok(mounted, `nginx.conf serves ${path}, which is outside ${BASE}`)
  }

  // AND THE CATCH-ALL RETURNS 404 RATHER THAN REDIRECTING TO THE MOUNT. A redirect would make this
  // container answer plausibly for addresses it does not own, which is the failure micro-org#428
  // recorded: a stale Traefik router pointing at the wrong backend is invisible for as long as the
  // wrong backend replies with something that looks like a page.
  assert.match(nginx, /location \/ \{\s*return 404;\s*\}/)

  // ── AND NOT ONE PREFIX IS `^~`, WHICH IS THE ORDERING TRAP THIS FILE'S HEADER ARGUES ABOUT ─────
  //
  // nginx picks a location by: exact `=` first and it wins outright; then the LONGEST matching
  // prefix; then — unless that prefix carried `^~` — every regex in file order, and a regex that
  // matches beats the prefix. `^~ /journal/` is the natural-looking way to say "everything under
  // the mount is mine" and it would silently take the favicon regex out of the running: the share
  // card would be served by the catch-all with `no-store` instead of a week, so every link-preview
  // fetcher that ever draws a card for this publication would re-fetch the picture, forever, for
  // every paste. Invisible in a browser, and it is not the sort of thing anybody measures.
  assert.doesNotMatch(
    nginx,
    /location\s+\^~/,
    'a `^~` prefix suppresses the favicon regex below it, and the share card loses its cache',
  )
})

test('THE FRONT DOOR HAS NO TRAILING SLASH AND DOES NOT REDIRECT TO ONE', () => {
  // `/journal` is the address on the tile, in the product menu, in the estate's footer and in every
  // link from the rest of the estate. A 301 on the publication's front door is a hop every crawler,
  // every link checker and every share-card fetcher pays on the way in, and the estate's own links
  // would all be pointing at the redirect rather than the page.
  //
  // nginx would normally see the URI map to a directory and emit the slash-redirect itself. It
  // never gets the chance: an EXACT location wins outright, and `try_files` with a LITERAL filename
  // is a file lookup rather than a directory test — try_files decides "this element is a directory
  // test" from the trailing slash written in the config at parse time, not from what a variable
  // expands to at request time.
  assert.match(nginx, new RegExp(`location = ${BASE} \\{[\\s\\S]{0,200}?try_files ${BASE}/index\\.html =404;`))

  // The canonical, the sitemap's first entry and the feed's channel link are all the same string,
  // and it is the one with no slash on the end. Two addresses with a redirect between them is the
  // shape this whole surface avoids.
  assert.equal(publicPath('/'), BASE)
  assert.doesNotMatch(nginx, new RegExp(`return\\s+30\\d\\s+${BASE}/`))
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
