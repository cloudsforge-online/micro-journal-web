/**
 * The files the build actually wrote, checked against the list that claims to describe them.
 *
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 * EVERY OTHER TEST HERE READS SOURCE. THIS ONE READS OUTPUT, AND THAT IS THE WHOLE POINT.
 *
 * `pageEntries()` is a list of intentions. `scripts/prerender.ts` is what turns them into files, and
 * between the two sit a React render, a string splice and a filesystem — three places where an
 * article can become a blank page that nothing in this repository would notice, because every other
 * check would still pass. The bundle is fine. The route table is fine. The head builder is fine.
 * The file on disk has `<div id="root"></div>` in it and a crawler sees nothing at all.
 *
 * That failure has a specific shape worth naming: `compose()` splices a rendered body into vite's
 * shell, and a component that throws during `renderToStaticMarkup` does not produce a broken file —
 * it produces a build error, which is the good case. The bad case is a component that renders
 * NOTHING: a page whose content depends on a hook that returns undefined without a browser, an
 * effect that never ran, a `typeof window` guard that takes the empty branch. Those write a valid
 * HTML file with a valid head and an empty body, and the surface's entire reason to exist is gone
 * with no error anywhere.
 *
 * So this walks `dist` and asserts the WORDS are in it.
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * ── IT SKIPS WITHOUT A BUILD, AND CI IS WHERE THAT MATTERS ────────────────────────────────────────
 *
 * `pnpm test` on a fresh checkout has no `dist`, and a test that fails there teaches everybody to
 * ignore it. `.github/workflows/ci.yml` runs `pnpm build` BEFORE `pnpm test` for exactly this
 * reason, so the skip below cannot become a permanent silence on the runner — which is the only
 * place it would matter. The first test in the file needs no build at all and never skips.
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { test } from 'node:test'
import { ARTICLES, articlesByTag } from '../src/content/index.ts'
import { TAGS } from '../src/content/tags.ts'
import { pageEntries } from '../src/lib/heads.ts'
import { HEAD_END, HEAD_START, ORIGIN_PLACEHOLDER, renderHead } from '../src/lib/meta.ts'
import { ARTICLE_PREFIX, ROUTES } from '../src/lib/routes.ts'
import { ROOT } from './sources.ts'

const DIST = join(ROOT, 'dist')

/** Whether there is a build to read, and the reason to print when there is not. */
const BUILT = existsSync(join(DIST, 'index.html'))
const NO_BUILD = 'dist/ has no index.html — run `pnpm build` first (CI does)'

function distFile(relativePath: string): string {
  return readFileSync(join(DIST, relativePath), 'utf8')
}

/** The head block of a written file, exactly as `compose()` spliced it. */
function headOf(html: string): string {
  const start = html.indexOf(HEAD_START)
  const end = html.indexOf(HEAD_END)
  assert.ok(start !== -1 && end > start, 'a written file has lost its head markers')
  return html.slice(start + HEAD_START.length, end).replace(/^\r?\n/, '').replace(/\s+$/, '')
}

/**
 * The longest stretch of a paragraph that survives BOTH renderers unchanged, so that finding it in
 * the markup is evidence about the body rather than about the tokeniser.
 *
 * A paragraph is not a string by the time it reaches disk. `**The rule:**` has become a `<strong>`,
 * `[a link](…)` an `<a>`, and React has escaped every apostrophe to `&#x27;` and every ampersand to
 * `&amp;` — so a naive "first six words" straddles a tag and fails on an article whose body is
 * perfectly fine. That false alarm is worse than no test: it trains the next person to delete this.
 *
 * So: cut on everything that either introduces markup or gets escaped, and take the longest piece
 * left. Prose gives up thirty-odd characters of ordinary words, which is plenty to be unique.
 */
function plainRun(text: string): string {
  const runs = text
    .split(/[*`[\]()&<>"'‘’“”]+/)
    .map((piece) => piece.trim())
    .filter((piece) => piece.length >= 25)
  const longest = runs.sort((a, b) => b.length - a.length)[0]
  assert.ok(longest, `no run of plain prose in: ${text.slice(0, 80)}…`)
  return longest
}

/** Every `.html` under `dist`, relative to it, sorted. */
function writtenPages(): string[] {
  const found: string[] = []
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) walk(full)
      else if (entry.endsWith('.html')) found.push(relative(DIST, full))
    }
  }
  walk(DIST)
  return found.sort()
}

test('EVERY ROUTE HAS A FILE AND EVERY FILE HAS A ROUTE', () => {
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // The cross-check `lib/heads.ts` promises, and it runs without a build because it is about two
  // lists rather than about output.
  //
  // Both directions matter and they catch different mistakes. A route with no entry is an address
  // the router answers in a browser and nginx 404s on a cold arrival — which is every arrival from
  // a search result, so the page works for us and for nobody else. An entry with no route is a file
  // that serves a shell the client router then has nothing to draw into.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  const paths = pageEntries().map((entry) => entry.path)
  assert.equal(new Set(paths).size, paths.length, 'two entries claim the same address')

  for (const route of ROUTES) {
    const address = `/${route.path}`
    if (route.wildcard) {
      // `a` and `topics` have children rather than a page of their own — except `/topics`, which is
      // both. What must be true is that SOMETHING under the prefix got written; a wildcard with no
      // children is a section of the site that exists only in the route table.
      assert.ok(
        paths.some((path) => path === address || path.startsWith(`${address}/`)),
        `no page is written under the ${address} route`,
      )
      continue
    }
    assert.ok(paths.includes(address), `the ${address} route has no page entry`)
  }

  // And nothing is written that the router cannot serve. `/404` is the deliberate exception: it is a
  // FILE nginx names directly under a real status, not an address anybody routes to.
  const known = new Set(ROUTES.map((route) => `/${route.path}`))
  for (const path of paths) {
    if (path === '/404') continue
    const top = `/${path.split('/')[1] ?? ''}`
    assert.ok(known.has(top), `${path} is written and no route in ROUTES covers it`)
  }

  // Every article and every populated topic, by name. This is the check that catches a piece added
  // to `content/index.ts` and never given a page — the failure mode of a content directory, and one
  // that looks like nothing at all until somebody asks where their article went.
  for (const article of ARTICLES) {
    assert.ok(paths.includes(`/${ARTICLE_PREFIX}/${article.slug}`), `${article.slug} has no page`)
  }
  for (const tag of TAGS) {
    const has = paths.includes(`/topics/${tag.slug}`)
    assert.equal(
      has,
      articlesByTag(tag.slug).length > 0,
      `topic ${tag.slug} ${has ? 'has a page with no articles on it' : 'has articles and no page'}`,
    )
  }
})

test('THE FILES EXIST WHERE nginx WILL LOOK FOR THEM', (t) => {
  if (!BUILT) return t.skip(NO_BUILD)
  // `try_files $uri $uri/index.html $uri/ =404` is the whole route table, so a directory with no
  // `index.html` in it is a 404 with a correct-looking build log. The 404 is the one file that is
  // NOT a directory, because nginx names it directly in `error_page`.
  for (const entry of pageEntries()) {
    assert.ok(existsSync(join(DIST, entry.file)), `${entry.file} was not written`)
    if (entry.path === '/404') assert.equal(entry.file, '404.html')
    else assert.match(entry.file, /index\.html$/, `${entry.path} is not served as a directory index`)
  }
  assert.deepEqual(
    writtenPages(),
    pageEntries().map((entry) => entry.file).sort(),
    'dist contains a page nothing claims, or is missing one — a renamed slug leaves the old ' +
      'directory behind and it ships in the image forever with nothing pointing at it',
  )
  for (const file of ['feed.xml', 'sitemap.xml', 'robots.txt']) {
    assert.ok(existsSync(join(DIST, file)), `${file} was not written`)
  }
})

test('EACH FILE CARRIES ITS OWN HEAD, SPLICED FROM ITS OWN ENTRY', (t) => {
  if (!BUILT) return t.skip(NO_BUILD)
  // The head on disk is compared with `renderHead()` of the entry that claims it. That is the join
  // between the list and the output, and it is what makes every assertion in `seo.test.ts` — which
  // reads entries, not files — a statement about what a crawler will actually receive.
  for (const entry of pageEntries()) {
    assert.equal(headOf(distFile(entry.file)), renderHead(entry.head), `${entry.file} has a foreign head`)
  }
})

test('THE ARTICLES ARE IN THE MARKUP, WHICH IS THE ONLY REASON ANY OF THIS EXISTS', (t) => {
  if (!BUILT) return t.skip(NO_BUILD)
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // A valid file with an empty root div passes every other check in this repository.
  //
  // So: the headline, the standfirst, the byline and a sentence from the MIDDLE of the body. The
  // middle one is deliberate — a truncating renderer, a body that stops at the first block, a
  // component that bails after the lead — all of those leave the opening paragraph in place, which
  // is the part a spot check reads.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  for (const article of ARTICLES) {
    const html = distFile(`a/${article.slug}/index.html`)
    assert.ok(html.includes('<div id="root"><'), `${article.slug} was written with an empty root`)

    const paragraphs = article.body.filter((block) => block.kind === 'p')
    const middle = paragraphs[Math.floor(paragraphs.length / 2)]
    assert.ok(middle, `${article.slug} has no paragraphs`)
    const run = plainRun(middle.text)
    assert.ok(
      html.includes(run),
      `the middle of ${article.slug} is not in the file. Its head is right and its body stops ` +
        `early, which is a page that looks correct in a browser and is empty to a crawler.`,
    )

    // The reader-facing furniture that only the static render produces. A crawler and a
    // link-preview fetcher both stop at this markup, so anything not in it does not exist to them.
    assert.ok(html.includes(article.title.replace(/&/g, '&amp;')), `${article.slug} has no headline`)
    assert.ok(html.includes(`/articles/${article.slug}/hero.png`), `${article.slug} has no hero`)
  }

  // And the archive lists them all, so the one page a crawler is given as an entry point leads to
  // every other one without JavaScript.
  const home = distFile('index.html')
  for (const article of ARTICLES) {
    assert.ok(home.includes(`/a/${article.slug}`), `the archive does not link ${article.slug}`)
  }
})

test('NOTHING WRITTEN TO DISK NAMES A HOST', (t) => {
  if (!BUILT) return t.skip(NO_BUILD)
  // The placeholder is the only correct form at build time, and this is where "correct in every
  // environment" stops being an argument and becomes a measurement. A single baked hostname in a
  // canonical tag de-indexes an entire archive in favour of an origin its readers were never on.
  for (const file of [...writtenPages(), 'feed.xml', 'sitemap.xml', 'robots.txt']) {
    const contents = distFile(file)
    assert.doesNotMatch(contents, /cloudsforge\.online/, `${file} names a hostname`)
    assert.doesNotMatch(contents, /https?:\/\/localhost/, `${file} names localhost`)
  }
  // And the placeholder really is there to be substituted — an article carries about a dozen, which
  // is why `sub_filter_once off` is load-bearing in `nginx.conf`.
  const article = distFile(`a/${ARTICLES[0]?.slug ?? ''}/index.html`)
  assert.ok(
    [...article.matchAll(new RegExp(ORIGIN_PLACEHOLDER, 'g'))].length >= 8,
    'an article carries almost no origin placeholders, which means its absolute URLs went missing ' +
      'rather than becoming relative',
  )
})

test('THE BUILD IS DETERMINISTIC ENOUGH TO REBUILD, WHICH MEANS IT READ NO CLOCK', (t) => {
  if (!BUILT) return t.skip(NO_BUILD)
  // `<lastBuildDate>` comes from the newest article's own date and every `<lastmod>` from its
  // article's. If either came from the moment of the build, two builds of one commit would differ,
  // a rebuilt image would stop being comparable to the one CI tested, and every deploy would look
  // like new content to a feed reader — which is how a subscriber learns to stop opening the feed.
  const feed = distFile('feed.xml')
  const dates = [...feed.matchAll(/<(?:pubDate|lastBuildDate)>([^<]+)</g)].map((match) => match[1] ?? '')
  assert.ok(dates.length > ARTICLES.length, 'the feed has no dates')
  // RFC 822 as RSS wants it, and `GMT` rather than `+0000` because that is the form every reader
  // has parsed since 1999. The midnight is the assertion that matters.
  for (const date of dates) assert.match(date, /^\w{3}, \d{2} \w{3} \d{4} 00:00:00 GMT$/)

  // Every timestamp is midnight UTC, so nothing here is a moment — they are days, taken from front
  // matter. A real clock would leave a time in one of them.
  const sitemap = distFile('sitemap.xml')
  const stamps = [...sitemap.matchAll(/<lastmod>([^<]+)</g)].map((match) => match[1] ?? '')
  assert.ok(stamps.length > 0)
  const known = new Set(ARTICLES.flatMap((a) => [a.publishedAt, a.updatedAt].filter(Boolean)))
  for (const stamp of stamps) {
    assert.match(stamp, /^\d{4}-\d{2}-\d{2}$/)
    assert.ok(known.has(stamp), `${stamp} in the sitemap belongs to no article`)
  }
})
