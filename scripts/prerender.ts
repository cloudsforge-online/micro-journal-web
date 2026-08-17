/**
 * Turn one bundle into a directory of real HTML files — one per address, each complete.
 *
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 * WHAT THIS IS FOR
 *
 * `vite build` produces a bundle and a single `index.html` whose body is `<div id="root"></div>`.
 * That is the right shape for a wallet and the wrong shape for an archive, because an archive earns
 * its readers from two arrivals that a shell serves badly:
 *
 *   - A LINK-PREVIEW FETCHER — the thing that draws the card when somebody pastes a URL into a chat
 *     app — runs no JavaScript at all, ever. Against a shell, every article in this publication
 *     shows the same title and the same picture, which is indistinguishable from having no cards.
 *   - A CRAWLER runs JavaScript late, on a budget, and re-queues the page for a second pass it may
 *     not get to. Against a shell, an article is a blank page on the first pass.
 *
 * So every route is rendered here, at build time, and written to disk with its own title, its own
 * description, its own card and its own JSON-LD. `dist/a/<slug>/index.html` is the article: the
 * headline, the standfirst, the byline, the whole body, the topic links and the related pieces, in
 * the markup, before a byte of JavaScript arrives. The bundle then loads and takes over.
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * ── IT RUNS WITH NO DOM, AND THAT IS ENFORCED RATHER THAN HOPED FOR ──────────────────────────────
 *
 * There is no happy-dom here, no `global.window`, no fake `location`. `src/routes-tree.tsx` carries
 * the argument in full: `app.tsx` reaches the estate's bar, which touches `window` while its modules
 * evaluate, so it is not imported — the route table is, and `components/static-shell.tsx` is passed
 * in as the layout. Installing a fake DOM would let those modules load, and the markup on disk would
 * then be a second browser implementation's opinion of the estate chrome, baked to one hostname.
 *
 * The practical consequence for anybody adding a page: if it reads `window` during RENDER, this
 * build fails. Read it in an effect, as `components/share.tsx` and `components/toc.tsx` do.
 *
 * ── THE OUTPUT IS BYTE-DETERMINISTIC ─────────────────────────────────────────────────────────────
 *
 * Nothing here reads the clock. `<lastBuildDate>` in the feed comes from the newest article's own
 * date (`content/index.ts`), and the sitemap's `lastmod` from each article's. Two builds of one
 * commit produce identical bytes — which is what makes a rebuilt image comparable to the one CI
 * tested, and what stops every rebuild looking like new content to a feed reader.
 *
 * ── AND IT NAMES NO HOST ─────────────────────────────────────────────────────────────────────────
 *
 * Every absolute URL is written as the literal `__CF_ORIGIN__`, which nginx replaces with
 * `https://$host` on the way out. `vite.config.ts` has the long version; the short version is that
 * a canonical tag naming the mainnet host inside the testnet archive does not break anything a
 * person can see, it just quietly hands every search engine a signed statement that the real copy
 * lives on an origin the reader was never on.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Route, Routes, StaticRouter } from 'react-router-dom'
import { StaticShell } from '../src/components/static-shell.tsx'
import { AUTHORS } from '../src/content/authors.ts'
import { ARTICLES, lastChangedAt } from '../src/content/index.ts'
import { TAGS, tagBySlug } from '../src/content/tags.ts'
import { pageEntries } from '../src/lib/heads.ts'
import { SURFACE_DESCRIPTION } from '../src/lib/hosts.ts'
import { HEAD_END, HEAD_START, ORIGIN_PLACEHOLDER, PUBLICATION, renderHead } from '../src/lib/meta.ts'
import { feedXml, journalSitemap, robotsTxt, sitemapXml } from '../src/lib/syndication.ts'
import { routeChildren } from '../src/routes-tree.tsx'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const dist = join(root, 'dist')

/**
 * `StaticRouter` rather than a router with a memory history, because this is the only router React
 * Router ships that takes a location as a plain string and never looks for a `window` to read one
 * from. The layout is `StaticShell`; everything below it is the same `routeChildren()` the browser
 * renders, which is what keeps the two from drifting.
 */
function renderRoute(path: string): string {
  return renderToStaticMarkup(
    createElement(
      StaticRouter,
      { location: path },
      createElement(Routes, null, createElement(Route, { element: createElement(StaticShell) }, routeChildren())),
    ),
  )
}

/**
 * Splice a route's own head and body into the shell vite produced.
 *
 * The shell is used as the TEMPLATE rather than composed from nothing, because it is the file vite
 * rewrote: the hashed script and stylesheet names are in it, and nothing else knows them. Two
 * replacements are made and no more — the head block between the markers, and the empty root div.
 *
 * `<div id="root">` is matched as a literal rather than by a parser. A regex over HTML is usually a
 * mistake; here the string being matched is emitted by vite from a file in this repository, is
 * asserted to appear exactly once, and the alternative is a DOM implementation the note at the top
 * of this file spends a paragraph refusing.
 */
function compose(template: string, head: string, body: string): string {
  const start = template.indexOf(HEAD_START)
  const end = template.indexOf(HEAD_END)
  if (start === -1 || end === -1) {
    throw new Error(`index.html is missing ${HEAD_START} / ${HEAD_END}`)
  }
  const withHead =
    template.slice(0, start + HEAD_START.length) + '\n' + head + '\n    ' + template.slice(end)

  const marker = '<div id="root"></div>'
  if (withHead.split(marker).length !== 2) {
    throw new Error(`expected exactly one ${marker} in index.html`)
  }
  return withHead.replace(marker, `<div id="root">${body}</div>`)
}

function write(relative: string, contents: string): void {
  const target = join(dist, relative)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, contents)
  process.stdout.write(`  ${relative}\n`)
}

const template = readFileSync(join(dist, 'index.html'), 'utf8')

process.stdout.write('prerender: pages\n')
for (const entry of pageEntries()) {
  write(entry.file, compose(template, renderHead(entry.head), renderRoute(entry.path)))
}

/*
 * The three files that are for machines only.
 *
 * The FEED carries every article in full — `content:encoded` with the whole body — rather than an
 * extract. An extract exists to make a reader click through to see advertising, and there is none
 * here; a feed reader that shows the whole piece is simply a better way to read it.
 *
 * The SITEMAP is this publication's own, and does not replace the estate's. The shared
 * `@cloudsforge/ui/sitemap` lists one URL per SURFACE — thirteen of them — which is the right
 * document for the marketing site to point at and says nothing about the forty addresses here.
 *
 * ROBOTS disallows `/search` and nothing else. The `noindex` on that page stops the indexing and the
 * disallow stops the fetch; both are needed, because a crawler has to fetch a page to read a tag.
 */
process.stdout.write('prerender: syndication\n')
write(
  'feed.xml',
  feedXml(
    ARTICLES,
    SURFACE_DESCRIPTION,
    ORIGIN_PLACEHOLDER,
    AUTHORS[0]?.name ?? PUBLICATION,
    (slug) => tagBySlug(slug)?.name ?? slug,
  ),
)
write(
  'sitemap.xml',
  sitemapXml(journalSitemap(ARTICLES, TAGS, lastChangedAt()), ORIGIN_PLACEHOLDER),
)
write('robots.txt', robotsTxt(ORIGIN_PLACEHOLDER))

process.stdout.write(`prerender: ${pageEntries().length} pages, 3 machine files\n`)
