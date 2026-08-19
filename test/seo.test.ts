/**
 * What a crawler and a link-preview fetcher are told, and the three places it is written.
 *
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 * ON EVERY OTHER SURFACE THIS FILE GUARDS A SENTENCE. HERE IT GUARDS THE PRODUCT.
 *
 * A search result is not a channel this publication uses; it is the front door. Nobody navigates to
 * an archive of five essays — they arrive on ONE of them, from a search, from a link somebody sent
 * them in a chat window. So the title, the description and the card are not metadata about the
 * page: for most readers they ARE the page, and the page is what they get if those three worked.
 *
 * That is why this repository prerenders at all, and why the checks below are shaped differently
 * from their ancestors on `exchange-web` and `pool-web`. Those surfaces have ONE head, written once
 * in `index.html`, and the only thing that can go wrong is that it drifts from the constant beside
 * it. This one has FORTY-ODD, one per file `scripts/prerender.ts` writes, and the thing that goes
 * wrong is subtler and completely invisible from inside a browser: every article shows a stranger
 * the archive's title and the archive's card. Nothing errors. Nothing looks wrong to us. The links
 * simply stop working as links, in somebody else's chat window, for as long as it takes to notice.
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * ── THE NON-MAINNET HOSTNAMES REFUSE EVERY CRAWLER, AND THAT MATTERS MORE HERE ────────────────
 *
 * Two deployments of one image on two hostnames. On the exchange the argument was danger — a
 * stranger landing on the testnet copy signs a real transaction for worthless coins. Here it is
 * arithmetic, and it is worse in one specific way: an essay contains no chain data, so the mainnet
 * and testnet archives are not similar pages, they are THE SAME PAGE at two addresses. That is
 * textbook duplicate content, a search engine picks one canonical and suppresses the other, and
 * which one it picks is not ours to decide. `Disallow: /` on every non-mainnet hostname settles the
 * question before it is asked, so the labels nginx recognises are checked against the registry's
 * own `ENV_LABELS` rather than trusted.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ENV_LABELS } from '@cloudsforge/ui/surfaces'
import { ARTICLES, articlesByTag } from '../src/content/index.ts'
import { TAGS } from '../src/content/tags.ts'
import { SURFACE_DESCRIPTION } from '../src/lib/hosts.ts'
import { pageEntries } from '../src/lib/heads.ts'
import { HEAD_END, HEAD_START, ORIGIN_PLACEHOLDER, renderHead } from '../src/lib/meta.ts'
import { BASE, FEED_PATH, publicPath } from '../src/lib/routes.ts'
import { journalSitemap, sitemapXml } from '../src/lib/syndication.ts'
import { read, stripComments } from './sources.ts'

/** RAW, not stripped: the two markers this file's first test looks between ARE HTML comments. */
const INDEX_HTML = read('index.html')
const HTML = stripComments(INDEX_HTML, 'html')
const NGINX = stripComments(read('nginx.conf'), 'nginx')

/**
 * One `location` block, whole.
 *
 * Brace-counted rather than sliced to the next `}`, which is the version that silently returns four
 * lines: `types { }` closes before the location does, and every check below it then passes over a
 * fragment. That failure is invisible — the assertions still run, against nothing.
 *
 * THE ARGUMENT IS MOUNT-RELATIVE AND THE MOUNT IS APPLIED HERE, so a caller writes `/feed.xml` — the
 * name of the file as this repository thinks of it — and cannot accidentally look up a location that
 * does not exist. `assert.notEqual(start, -1)` is what makes that safe rather than merely tidy: a
 * path this file gets wrong fails loudly here instead of returning a block from somewhere else.
 */
function locationBlock(path: string): string {
  const start = NGINX.indexOf(`location = ${publicPath(path)} {`)
  assert.notEqual(start, -1, `nginx.conf has no location for ${publicPath(path)}`)
  let depth = 0
  for (let i = start; i < NGINX.length; i += 1) {
    if (NGINX[i] === '{') depth += 1
    else if (NGINX[i] === '}') {
      depth -= 1
      if (depth === 0) return NGINX.slice(start, i + 1)
    }
  }
  throw new Error(`the location for ${path} is unclosed`)
}

/** The block `scripts/prerender.ts` replaces, exactly as committed. */
function committedHead(): string {
  const start = INDEX_HTML.indexOf(HEAD_START)
  const end = INDEX_HTML.indexOf(HEAD_END)
  assert.ok(start !== -1 && end > start, 'index.html has lost one of the cf:head markers')
  return INDEX_HTML.slice(start + HEAD_START.length, end)
    .replace(/^\r?\n/, '')
    .replace(/\s+$/, '')
}

test('THE HEAD COMMITTED IN index.html IS THE ONE THE PRERENDER WOULD WRITE', () => {
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // The check that keeps the DEV server honest.
  //
  // `vite dev` serves `index.html` unmodified — the prerender is a build step — so the head a
  // developer sees for months is the one committed here, and the head every reader sees is the one
  // `renderHead()` produces. Nothing compares them at runtime. A head that only exists in
  // production is a head nobody looks at until it is wrong, and this surface's whole output is
  // heads.
  //
  // Byte for byte, including the indent, because the alternative — parsing both sides and comparing
  // tag sets — is a second implementation of the thing under test. `lib/meta.ts` documents the fixed
  // shape this depends on and package.json records why nothing reformats generated markup.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  const entry = pageEntries().find((page) => page.path === '/')
  assert.ok(entry, 'pageEntries() no longer writes the archive')
  assert.equal(
    committedHead(),
    renderHead(entry.head),
    'index.html and renderHead() disagree. Re-run `pnpm build` and paste the head from ' +
      'dist/index.html between the two cf:head markers, or fix the builder — but do not edit one ' +
      'side alone: the dev server serves this file and every reader gets the other.',
  )
})

test('THE STATIC DESCRIPTION IS BYTE-IDENTICAL TO THE ONE REACT WRITES', () => {
  // The attribute is on one line, but the value is unwrapped before comparison anyway — the bytes
  // that matter are the ones a fetcher receives, not the ones in the file.
  const raw = /<meta\s+name="description"\s+content="([\s\S]*?)"\s*\/>/.exec(HTML)?.[1]
  assert.ok(raw, 'index.html has no description meta')
  assert.equal(
    raw.replace(/\s+/g, ' ').trim(),
    SURFACE_DESCRIPTION,
    'index.html and SURFACE_DESCRIPTION disagree. A link-preview fetcher does not run JavaScript, ' +
      'so it reads only the static one; a crawler that does run it reads only the other. The ' +
      'difference between them is a sentence nobody is reading.',
  )

  // And the sentence makes the two promises a stranger is actually guarding against, in the order
  // a truncated search result preserves. Somebody who searches a crypto question and sees a result
  // from a company that sells crypto has already decided what this is; the description is the only
  // thing on the page that gets to argue, and it has about eight words in which to do it.
  assert.match(SURFACE_DESCRIPTION, /^Plain-language crypto writing/)
  assert.match(SURFACE_DESCRIPTION, /No jargon, no price talk, nothing to sign up for\.$/)

  // The og card carries the same sentence, and that is not a duplication to tidy up: the card is
  // read WITHOUT the surrounding page, in a chat window, next to links to services that do hold
  // people's money. `metaTags()` upstream composes both from one value, so this asserts the
  // composition rather than a copy.
  const og = /property="og:description"\s+content="([\s\S]*?)"/.exec(HTML)?.[1]?.replace(/\s+/g, ' ')
  assert.equal(og, SURFACE_DESCRIPTION)
})

test('EVERY PAGE CARRIES ITS OWN TITLE, ITS OWN SENTENCE AND ITS OWN PICTURE', () => {
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // THE DEFECT THIS SURFACE EXISTS TO AVOID, ASSERTED DIRECTLY.
  //
  // A single shared head is what a client-rendered archive ships by default, and it is invisible
  // from inside a browser — the reader sees the right article, because React ran. What a crawler
  // and every link-preview fetcher see is five copies of the archive's title, five copies of its
  // description and five copies of its card. The articles are then not merely unshareable, they are
  // duplicate content in each other's way.
  //
  // Checked over `pageEntries()` rather than over `dist`, so it fails in the two seconds before a
  // build rather than after one — and `test/prerender.test.ts` is what ties `pageEntries()` to the
  // files that actually get written.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  const entries = pageEntries()
  assert.ok(entries.length >= ARTICLES.length + 5, 'pageEntries() has lost pages')

  const titles = entries.map((page) => page.head.meta.title)
  assert.equal(new Set(titles).size, titles.length, `two pages share a title: ${titles.join(' | ')}`)

  const descriptions = entries.map((page) => page.head.meta.description)
  assert.equal(new Set(descriptions).size, descriptions.length, 'two pages share a description')
  assert.deepEqual(
    entries.filter((page) => page.head.meta.description === SURFACE_DESCRIPTION).map((p) => p.path),
    ['/'],
    'a page other than the archive is describing itself with the surface default',
  )

  // Every article's card is its own file. The default share card is the FALLBACK for the pages that
  // have no artwork — the archive, topics, about, search — and an article falling back to it is the
  // exact symptom above, one step short of it.
  //
  // ── AND THE CARD IS MOUNTED, WHICH IS THE HALF THAT BROKE SILENTLY WHEN THIS BECAME A FOLDER ────
  //
  // `article.card` is written mount-relative in `content/`, because that is the address the page
  // itself uses. `og:image` is resolved by a machine in somebody else's chat window against the
  // ORIGIN, so an unmounted one names `<apex>/articles/<slug>/card.png` — an address that belongs to
  // the marketing site and answers 404. The link still unfurls, with no picture, which is not a
  // failure anybody reports.
  for (const article of ARTICLES) {
    const page = entries.find((entry) => entry.path === `/a/${article.slug}`)
    assert.ok(page, `${article.slug} has no page entry`)
    assert.equal(page.head.meta.image, publicPath(article.card))
    assert.match(article.card, new RegExp(`^/articles/${article.slug}/card\\.png$`))
    assert.equal(page.head.kind, 'article', 'an article is not og:type article')
  }
  for (const path of ['/', '/topics', '/about', '/search', '/404']) {
    const page = entries.find((entry) => entry.path === path)
    assert.ok(page, `${path} has no page entry`)
    // `surfaceMeta()` upstream defaults a missing image to `DEFAULT_OG_IMAGE`, which is
    // `/og-1200x630.png` — the apex's own card, at the apex's own address. `journalMeta()` in
    // `src/lib/meta.ts` passes the default in explicitly so the mount is applied to it, and this is
    // the assertion that says so: without that line five of this publication's pages would unfurl
    // with the marketing site's picture on them, and every one of them would still render perfectly.
    assert.equal(page.head.meta.image, `${BASE}/og-1200x630.png`)
    assert.equal(page.head.kind, 'website', `${path} claims to be an article`)
  }
})

test('THE ABSOLUTE URLs ARE A PLACEHOLDER, IN EVERY TAG THAT NEEDS ONE', () => {
  // A canonical, an `og:url`, an `og:image` and every JSON-LD `@id` must be absolute — no standard
  // accepts a relative one, and the fetchers that read og:image mostly do not resolve one at all.
  // At build time there is no host, so the placeholder is what gets written and nginx substitutes
  // `https://$host` per request. The scheme is a literal because TLS ends at Cloudflare: `$scheme`
  // is `http` on every request that reaches the container, and an http canonical is a URL that 301s.
  //
  // The failure this catches is the one that does not look like a failure: a baked-in host renders
  // perfectly and quietly tells every search engine that the real copy of this article lives on
  // another origin. A preview deployment then claims to be production, and the testnet archive
  // de-indexes itself in favour of a host the reader was never on.
  assert.equal(ORIGIN_PLACEHOLDER, '__CF_ORIGIN__')
  for (const page of pageEntries()) {
    const rendered = renderHead(page.head)
    assert.doesNotMatch(rendered, /cloudsforge\.online/, `${page.path} names a hostname`)
    assert.doesNotMatch(rendered, /localhost/, `${page.path} names localhost`)
    for (const attribute of ['og:url', 'og:image', 'twitter:image']) {
      const value = new RegExp(`"${attribute}" content="([^"]*)"`).exec(rendered)?.[1]
      // Presence first, and as its own assertion: `assert.ok(value?.startsWith(…))` narrows the
      // EXPRESSION rather than `value`, so the mount check below would not compile — and a missing
      // tag would report itself as "relative", which is a different defect than the one it is.
      assert.ok(value !== undefined, `${page.path} has no ${attribute} at all`)
      assert.ok(value.startsWith(ORIGIN_PLACEHOLDER), `${page.path} has a relative ${attribute}`)
      // AND THE MOUNT IS BETWEEN THE ORIGIN AND THE PATH. `origin + routerPath` is a URL that
      // resolves — to the marketing site — so this is the failure that produces a valid-looking
      // absolute address pointing at the wrong surface. Checked on every tag rather than on the
      // canonical alone, because `og:image` and `twitter:image` are read by a machine that will
      // never render the page and never report what it got.
      assert.ok(
        value.startsWith(`${ORIGIN_PLACEHOLDER}${BASE}/`) ||
          value === `${ORIGIN_PLACEHOLDER}${BASE}`,
        `${page.path} composes ${attribute} as ${value}, which is outside ${BASE}`,
      )
    }
    assert.match(rendered, new RegExp(`<link rel="canonical" href="__CF_ORIGIN__${BASE}`))
  }
})

test('THE SEARCH PAGE AND THE 404 ARE noindex, AND NOTHING ELSE IS', () => {
  // Search results are generated from a string somebody typed, so indexing them files every typo
  // and every scraped query as a page of this publication — which is how an archive of forty pages
  // becomes an archive of four thousand and then gets treated as one. The 404 is `noindex` because
  // it is not a page.
  //
  // `follow` on both, and that is the half that is easy to get wrong. A crawler that lands on either
  // should still be passed along to the real pages linked from it; `nofollow` would strand the whole
  // archive behind whichever dead end it happened to arrive at.
  // ONE call, held. `pageEntries()` builds fresh objects every time, so filtering one call and
  // testing membership against another compares identities that can never match — the second loop
  // then asserts `index, follow` over the two pages that are deliberately `noindex`. It failed
  // loudly here; the version of this mistake that does not is a `.filter()` that silently keeps
  // everything, and that is the one worth leaving a note about.
  const entries = pageEntries()
  const noindex = entries.filter((page) => page.head.meta.robots.startsWith('noindex'))
  assert.deepEqual(noindex.map((page) => page.path).sort(), ['/404', '/search'])
  for (const page of noindex) assert.equal(page.head.meta.robots, 'noindex, follow')

  for (const page of entries) {
    if (noindex.includes(page)) continue
    assert.equal(page.head.meta.robots, 'index, follow, max-image-preview:large', page.path)
  }

  // `max-image-preview:large` is the registry's default and it is worth more here than anywhere
  // else in the estate: it is what lets a search result show the article's own card at full width
  // instead of a thumbnail. Every article has one, drawn by `scripts/make-assets.ts`.
  assert.match(HTML, /<meta name="robots" content="index, follow, max-image-preview:large" \/>/)
})

test('no page hands a head builder a literal', () => {
  // Each description is an exported constant shared by the page that renders it and by
  // `lib/heads.ts`, which is what the prerender consumes. A literal in either place is a second
  // copy of a sentence, and the copy that goes stale is always the one nobody is reading — here,
  // whichever of the two a link-preview fetcher happens to get.
  for (const page of ['about', 'home', 'not-found', 'search', 'topics', 'topic', 'article']) {
    const source = stripComments(read(`src/pages/${page}.tsx`), 'ts')
    assert.doesNotMatch(
      source,
      /Head\(\s*['"`]/,
      `src/pages/${page}.tsx passes a literal to a head builder instead of a shared constant`,
    )
  }
})

test('THE ENVIRONMENT LABELS NGINX KNOWS ARE THE REGISTRY’S OWN', () => {
  // The alternation in the `map` decides which hostnames refuse every crawler. A label the registry
  // reserves and nginx does not know is a second archive competing with mainnet for the search
  // result of every article in it.
  const map = /~\^\(\?:\[\^.\]\+-\)\?\(\?:([a-z|]+)\)\\\./.exec(NGINX)?.[1]
  assert.ok(map, 'nginx.conf has no environment map, or its shape has changed')
  assert.deepEqual(
    map.split('|').sort(),
    [...ENV_LABELS].sort(),
    'nginx.conf and @cloudsforge/ui/surfaces disagree about which first labels name an environment',
  )
})

test('the environment map catches BOTH hostname shapes', () => {
  // `(?:[^.]+-)?` is what makes it match `journal-testnet.<apex>` as well as `testnet.<apex>`, for
  // the same reason `splitEnvLabel()` upstream resolves both: the environment is a suffix on the
  // first label now and was an apex prefix before. Environment-as-suffix exists because Cloudflare's
  // SSL wildcard matches exactly ONE label, so `journal.testnet.<apex>` has no certificate at all.
  assert.match(NGINX, /\(\?:\[\^\.\]\+-\)\?/)
})

test('a non-mainnet hostname has no sitemap and no feed', () => {
  assert.match(locationBlock('/feed.xml'), /if \(\$cf_env\) \{ return 404; \}/)
  assert.match(locationBlock('/sitemap.xml'), /if \(\$cf_env\) \{ return 404; \}/)

  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // THE THIRD GATE WAS A `location = /robots.txt` AND IT DID NOT WEAKEN — IT MOVED.
  //
  // A crawler reads robots.txt at the ORIGIN ROOT and nowhere else, so a publication served from a
  // FOLDER has no robots file of its own to serve: `/journal/robots.txt` is a document nothing will
  // ever request. Prefixing that block like every other one in nginx.conf would therefore have put
  // the only copy of the `Disallow: /search` rule into a file no machine opens, while
  // `/journal/search?q=…` became crawlable for the first time — forty pieces of writing indexed as
  // four thousand near-empty result pages, all of them competing with the articles.
  //
  // Both lines are in micro-site's apex robots.txt now, and the `$cf_env` gate is STRICTLY BETTER
  // there: the apex already answers `Disallow: /` whole on every non-mainnet hostname, so the
  // testnet archive is refused by the host that serves it rather than by a rule this repository has
  // to remember to keep. What is asserted here is only that it did not come back.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  assert.doesNotMatch(NGINX, /robots\.txt/, 'nginx.conf serves a robots.txt again — see above')

  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // AND THE BACKSLASH RULE OUTLIVED THE BLOCK THAT PROMPTED IT, WHICH IS WHY IT IS STILL HERE.
  //
  // nginx does not process backslash escapes inside a quoted string; it emits the two characters.
  // `'User-agent: *\nDisallow: /\n'` produces a ONE-LINE file reading that text literally, in which
  // a strict parser sees one unknown directive and no `Disallow` at all — so the hostname that was
  // supposed to refuse every crawler invites them. exchange-web shipped exactly that, harmlessly,
  // because its `Disallow: /` is on the same line as the junk; MICRO-SITE'S APEX robots.txt HAS THE
  // SAME DEFECT TODAY and this move is what makes it matter, because that file is now the one
  // governing this path. Fixed there in the same wave.
  //
  // Across the WHOLE file, not one block. `location = /healthz` had this defect too — a probe
  // answering `ok\n` with a literal backslash in it — ten lines under the comment explaining why
  // not to, which is how a rule that lives only in prose gets broken by the person who wrote it.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  assert.doesNotMatch(
    NGINX,
    /return\s+\d+\s+['"][^'"]*\\n/,
    'a backslash-n in an nginx string is two characters, not a newline',
  )
})

test('THE SITEMAP IS A FILE THE BUILD WROTE, NOT A STRING NGINX COMPOSES', () => {
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // The inversion of what every other surface in the estate does, and the reason is the corpus.
  //
  // Elsewhere a sitemap is a `return 200` string of five fixed paths, and composing it in nginx is
  // right: nginx is the component that knows `$host`. Here it has one entry per ARTICLE and per
  // TOPIC, each with a `lastmod` taken from that article's own front matter — facts that live in
  // `src/content/` and that nginx cannot know. A hand-maintained list in this file would be a list
  // somebody has to remember, and the thing they would forget is the article they just published.
  //
  // So `scripts/prerender.ts` writes both, from the content, and they get `$host` from the same
  // `sub_filter` as everything else.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  const sitemap = locationBlock('/sitemap.xml')
  assert.doesNotMatch(sitemap, /<loc>/, 'the sitemap is composed in nginx again')
  assert.doesNotMatch(sitemap, /return 200/)
  assert.doesNotMatch(NGINX, /cloudsforge\.online/)

  const xml = sitemapXml(journalSitemap(ARTICLES, TAGS, '2026-08-17'), ORIGIN_PLACEHOLDER)
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1] ?? '')
  for (const loc of locs) assert.ok(loc.startsWith(`${ORIGIN_PLACEHOLDER}/`), `${loc} is relative`)

  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // EVERY `<loc>` SITS UNDER THE MOUNT, AND ON A SITEMAP THAT IS A RULE RATHER THAN A CONVENTION.
  //
  // A sitemap outside the origin root is legal on exactly one condition: every URL it declares is at
  // or below the path it is served from. `/journal/sitemap.xml` declaring `<apex>/a/<slug>` is not a
  // sitemap with a few broken links in it — it is a CROSS-PATH SUBMISSION, which a crawler discards
  // wholesale, taking the valid entries beside it. The archive would then have no mechanical way of
  // announcing itself at all, and the symptom is silence.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  for (const loc of locs) {
    const path = loc.slice(ORIGIN_PLACEHOLDER.length)
    assert.ok(path === BASE || path.startsWith(`${BASE}/`), `${loc} is outside ${BASE}`)
  }

  const paths = locs.map((loc) => loc.slice(ORIGIN_PLACEHOLDER.length))
  const populated = TAGS.filter((tag) => articlesByTag(tag.slug).length > 0)
  assert.deepEqual(
    paths.sort(),
    [
      '/',
      '/topics',
      '/about',
      ...populated.map((tag) => `/topics/${tag.slug}`),
      ...ARTICLES.map((article) => `/a/${article.slug}`),
    ]
      .map(publicPath)
      .sort(),
  )

  // A sitemap is an INVITATION, so the two `noindex` pages are not in it. Inviting a crawler to a
  // page that then tells it to leave is the sort of contradiction that gets a whole sitemap
  // discounted, and it costs an archive its only mechanical way of announcing itself.
  assert.ok(!paths.includes(publicPath('/search')) && !paths.includes(publicPath('/404')))
  // Every entry carries a real day rather than the moment of the build. `<lastmod>` moving on every
  // deploy of every article at once is how a crawler learns to stop believing it.
  assert.equal([...xml.matchAll(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g)].length, locs.length)
})

test('THE TWO MACHINE-READABLE FILES ARE INSIDE sub_filter_types', () => {
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // The one-line omission that would ship every absolute URL in this repository as the literal
  // string `__CF_ORIGIN__`.
  //
  // `sub_filter_types` defaults to `text/html` ALONE. The feed and the sitemap are the responses
  // whose entire content is absolute URLs, and each declares its own `default_type` precisely so
  // nginx does not guess — which also takes both out of the default. A feed whose every `<link>`
  // reads `__CF_ORIGIN__/journal/a/…` is not a feed with a cosmetic problem; it is a subscription in
  // which no article can be opened.
  //
  // TWO rather than three: robots.txt was the third and the move to a folder deleted it, since a
  // crawler reads that file at the origin root and nowhere else. `text/plain` stays in the declared
  // list for `location = /healthz` — filtering a two-byte body costs nothing, and a type quietly
  // dropped from this line is invisible until somebody opens a feed.
  //
  // Derived from the file rather than listed here, so a location that changes its content type
  // fails this instead of quietly falling out of the filter.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  const declared = /sub_filter_types ([^;]+);/.exec(NGINX)?.[1]?.split(/\s+/)
  assert.ok(declared, 'nginx.conf no longer declares sub_filter_types')
  assert.ok(declared.includes('text/html'), 'text/html is implicit but is listed for the reader')

  for (const location of ['/feed.xml', '/sitemap.xml']) {
    const block = locationBlock(location)
    // `types { }` empties the mime table FOR THIS LOCATION so `default_type` is what applies.
    // Without it nginx maps the extension in the URI to its own table and the `default_type` line
    // is inert — a declaration that reads as a decision and is not one.
    assert.match(block, /types \{ \}/, `${location} lets nginx guess its content type`)
    const type = /default_type ([^;]+);/.exec(block)?.[1]
    assert.ok(type, `${location} declares no default_type`)
    assert.ok(
      declared.includes(type),
      `${location} is served as ${type}, which sub_filter_types does not cover — its ` +
        `__CF_ORIGIN__ placeholders would ship raw`,
    )
  }

  // AND WHAT IS ABSENT. `gzip_static` is the obvious optimisation for a directory of static files
  // and it would silently defeat every substitution above: a pre-compressed `.gz` is passed through
  // untouched, because the filter runs on the response body and cannot see inside a deflate stream.
  // nginx's ordinary `gzip` is applied AFTER the filter and is safe. Nobody guesses that difference
  // correctly, which is why it is a test rather than a comment.
  assert.doesNotMatch(NGINX, /gzip_static/)
  assert.match(NGINX, /sub_filter_once off;/)
})

test('this surface asks to be indexed', () => {
  // The opposite of the operator console, and the one surface in the estate where being found IS
  // the function. `X-Robots-Tag: noindex` is a header that would quietly cause the reverse of that
  // while every meta tag in the bundle still said `index, follow`.
  assert.doesNotMatch(NGINX, /X-Robots-Tag/i)

  // And the feed is declared where a reader's browser and their feed reader both look for it —
  // relative, because it resolves against whichever origin served the page. It is the only
  // subscription this publication offers; there is no mailing list to fall back on.
  //
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // THE MOUNT IS TYPED OUT IN index.html, AND THAT IS NOT AN INCONSISTENCY WITH THE FAVICONS ABOVE.
  //
  // The four icon hrefs a few lines up are root-relative in source and the mount is applied by
  // VITE, which rewrites asset references in `index.html` against `base`. It does that for `.png`
  // and it does NOT do it for `.xml` — settled by building and reading `dist/index.html` rather than
  // by reading vite's documentation, which does not say. So the feed link is the one href in this
  // file that has to carry `/journal` itself, and the two shapes side by side are each correct.
  //
  // Asserted against `FEED_PATH` rather than a literal so the file and `src/lib/routes.ts` cannot
  // drift, and the failure this catches is a subscribe button that 404s in a reader's feed app —
  // where nobody who hits it has any way to tell us.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  assert.match(
    HTML,
    new RegExp(
      `<link rel="alternate" type="application/rss\\+xml" title="Forge Journal" ` +
        `href="${FEED_PATH}" />`,
    ),
  )

  // AND THE FOUR ICONS ARE ROOT-RELATIVE, which is the other half of the same fact: written mounted
  // they would come out of the build as `/journal/journal/favicon-32x32.png`, because vite rewrites
  // them and does not check whether somebody already did.
  for (const size of ['32x32', '192x192', '512x512']) {
    assert.match(HTML, new RegExp(`href="/favicon-${size}\\.png"`))
    assert.doesNotMatch(HTML, new RegExp(`href="${BASE}/favicon-${size}\\.png"`))
  }
})
