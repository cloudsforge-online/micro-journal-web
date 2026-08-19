/**
 * What machines read: the feed and the sitemap.
 *
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 * BOTH ARE FUNCTIONS OF AN ORIGIN, FOR THE REASON `@cloudsforge/ui/sitemap` ALREADY GIVES.
 *
 * A `<loc>` and a feed `<link>` must each be ABSOLUTE — the specs require it and a crawler discards
 * a relative one — and nothing built in this estate is allowed to name a hostname. So these take the
 * origin as an argument, `scripts/prerender.ts` passes the `__CF_ORIGIN__` placeholder, and nginx
 * substitutes the real one per request. `sub_filter_types` in `nginx.conf` therefore has to cover
 * `application/xml` and `application/rss+xml` as well as HTML, which is the sort of thing that is
 * obvious once and invisible forever after; `test/seo.test.ts` asserts every generated file's
 * content type is in that list.
 *
 * ── AND ABSOLUTE MEANS PUBLIC, WHICH IS THE SECOND HALF AND THE NEWER ONE ────────────────────────
 *
 * This publication is mounted at `/journal` on the apex rather than served from a hostname of its
 * own. An origin plus a router path is a URL that resolves to the marketing site — so every address
 * composed below goes through `publicPath()` first. See `BASE` in `src/lib/routes.ts` for the
 * distinction; `robotsTxt()` used to be here and the move is what deleted it, argued at the bottom
 * of this file.
 *
 * THE ESTATE SITEMAP IS A DIFFERENT DOCUMENT AND IT IS NOT REPLACED HERE. `@cloudsforge/ui/sitemap`
 * lists one URL per SURFACE and is served by the apex. This one lists one URL per ARTICLE and is
 * served by this container, which is the only thing that knows what has been published. Both exist;
 * neither contains the other; the journal's front door is the single entry they share.
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 */
import type { Article, Block, Tag } from '../content/types.ts'
import { isExternal, stripInline, tokenizeInline } from './inline.tsx'
import { PUBLICATION } from './meta.ts'
import { toRfc822 } from './reading.ts'
import { articlePath, FEED_PATH, publicPath, topicPath } from './routes.ts'

/** The five characters XML requires escaping. Used for both element text and attribute values. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * The inline markup as a string of HTML, for a feed item's body.
 *
 * ── THIS IS THE ONLY PLACE IN THE REPOSITORY THAT COMPOSES MARKUP BY HAND ────────────────────────
 *
 * Everything a reader sees in a browser goes through React, which escapes text as a property of
 * how it works rather than as a discipline anybody has to keep. A feed cannot: an item's body is a
 * STRING, and there is no way to hand a reader's feed application a React element. So this function
 * escapes every piece of text it emits, before wrapping it, and the wrappers are five fixed tags
 * with no attributes but `href`. The href has already been judged by `isAllowedHref` inside the
 * tokeniser — a rejected one never reaches here as a link at all.
 *
 * `target="_blank"` is deliberately absent, unlike the page renderer. A feed reader is not a
 * browser and has its own idea of where a link opens; the attribute is at best ignored and at worst
 * honoured by an embedded webview that then has no way back.
 */
export function inlineHtml(text: string): string {
  return tokenizeInline(text)
    .map((token) => {
      const escaped = escapeXml(token.text)
      switch (token.kind) {
        case 'strong':
          return `<strong>${escaped}</strong>`
        case 'em':
          return `<em>${escaped}</em>`
        case 'code':
          return `<code>${escaped}</code>`
        case 'link':
          return `<a href="${escapeXml(token.href)}"${
            isExternal(token.href) ? ' rel="noopener noreferrer"' : ''
          }>${escaped}</a>`
        default:
          return escaped
      }
    })
    .join('')
}

/**
 * An article's body as HTML, for `content:encoded`.
 *
 * ── THE FEED GETS A DIFFERENT SHAPE, WHICH IS WHY THE BODY IS BLOCKS RATHER THAN HTML ────────────
 *
 * `content/types.ts` opens by predicting this file. A `figure` on the page is a figure with its
 * caption set in the margin; here it is an `<img>` followed by a small paragraph, because most feed
 * readers apply almost no stylesheet and a caption that relies on one is a second sentence of body
 * text with no explanation. A `callout` on the page is an aside in a tinted box; here it is a
 * `<blockquote>` with a bolded title, for the same reason.
 *
 * Relative image sources are made absolute against the origin, because a feed item is read
 * somewhere else entirely — that is the whole point of it — and `/articles/x/hero.png` resolves
 * against the feed reader's own host, where it is a 404. `publicPath()` is what puts the mount in
 * front of it: the artwork ships inside this bundle, so it is served at `/journal/articles/…`, and
 * an absolute URL missing that prefix is a 404 on the marketing site instead — the same grey box,
 * one origin closer.
 */
export function blocksHtml(blocks: readonly Block[], origin: string): string {
  return blocks
    .map((block) => {
      switch (block.kind) {
        case 'h2':
          return `<h2 id="${escapeXml(block.id)}">${inlineHtml(block.text)}</h2>`
        case 'h3':
          return `<h3 id="${escapeXml(block.id)}">${inlineHtml(block.text)}</h3>`
        case 'lead':
        case 'p':
          return `<p>${inlineHtml(block.text)}</p>`
        case 'ul':
          return `<ul>${block.items.map((item) => `<li>${inlineHtml(item)}</li>`).join('')}</ul>`
        case 'ol':
          return `<ol>${block.items.map((item) => `<li>${inlineHtml(item)}</li>`).join('')}</ol>`
        case 'quote':
          return `<blockquote><p>${inlineHtml(block.text)}</p>${
            block.cite === undefined ? '' : `<p><cite>${escapeXml(block.cite)}</cite></p>`
          }</blockquote>`
        case 'callout':
          return `<blockquote><p><strong>${escapeXml(block.title)}</strong></p><p>${inlineHtml(
            block.text,
          )}</p></blockquote>`
        default:
          return `<p><img src="${escapeXml(`${origin}${publicPath(block.src)}`)}" alt="${escapeXml(
            block.alt,
          )}" /></p><p><small>${escapeXml(block.caption)}</small></p>`
      }
    })
    .join('')
}

/**
 * The feed.
 *
 * ── RSS 2.0 RATHER THAN ATOM, AND FULL TEXT RATHER THAN A SUMMARY ────────────────────────────────
 *
 * RSS because every reader implements it and half of them still implement Atom badly; the two carry
 * the same facts here and there is nothing to be gained by being right about the better format.
 *
 * Full text because the alternative is a truncated paragraph and a link, which is a feed that exists
 * to advertise a page rather than to deliver an article. This archive has nothing on it to sell — no
 * account to open, no advertisement to serve, and analytics that a reader has to consent to before
 * it reports anything. There is therefore nothing left that a partial feed would protect, and the
 * reader who subscribed asked for the writing.
 *
 * `<lastBuildDate>` is the newest article's date rather than the moment of the build. Every deploy
 * of every article would otherwise move it, telling a reader's client that something changed when
 * nothing did — and `src/lib/reading.ts` records that no `Date` object is constructed anywhere on
 * this surface, which is also what keeps the build byte-for-byte reproducible.
 */
export function feedXml(
  articles: readonly Article[],
  description: string,
  origin: string,
  authorName: string,
  tagName: (slug: string) => string,
): string {
  const newest = articles[0]
  const items = articles
    .map((article) => {
      const url = `${origin}${publicPath(articlePath(article.slug))}`
      return [
        '    <item>',
        `      <title>${escapeXml(article.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        // `isPermaLink="true"` and the guid IS the URL: an article's address never changes once
        // published (`content/types.ts` on `slug`), so there is no second identifier to invent.
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${toRfc822(article.updatedAt ?? article.publishedAt)}</pubDate>`,
        `      <dc:creator>${escapeXml(authorName)}</dc:creator>`,
        ...article.tags.map((slug) => `      <category>${escapeXml(tagName(slug))}</category>`),
        `      <description>${escapeXml(stripInline(article.dek))}</description>`,
        `      <content:encoded>${escapeXml(
          `<p><img src="${origin}${publicPath(article.hero.src)}" alt="${
            article.hero.alt
          }" /></p>${blocksHtml(
            article.body,
            origin,
          )}`,
        )}</content:encoded>`,
        '    </item>',
      ].join('\n')
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(PUBLICATION)}</title>
    <link>${escapeXml(`${origin}${publicPath('/')}`)}</link>
    <description>${escapeXml(description)}</description>
    <language>en-GB</language>
    <atom:link href="${escapeXml(`${origin}${FEED_PATH}`)}" rel="self" type="application/rss+xml" />
${newest === undefined ? '' : `    <lastBuildDate>${toRfc822(newest.updatedAt ?? newest.publishedAt)}</lastBuildDate>\n`}${items}
  </channel>
</rss>
`
}

export interface SitemapEntry {
  /** PUBLIC — `/journal/a/<slug>`. A `<loc>` is resolved against the origin, never against a mount. */
  readonly path: string
  readonly lastmod: string
}

/**
 * This surface's own sitemap.
 *
 * `<lastmod>` is present here and absent from the estate sitemap, and the difference is that this
 * one can be honest: an article carries the day it was published and the day it was last edited, so
 * the value is a fact rather than a guess. `<changefreq>` and `<priority>` are absent for the reason
 * `@cloudsforge/ui/sitemap` gives — Google has said publicly that it ignores both, and a field that
 * is ignored can only be wrong.
 *
 * `/search` and the 404 are not in it. Both are `noindex, follow`, and a sitemap is an invitation:
 * inviting a crawler to a page that then tells it to leave is the sort of contradiction that gets a
 * whole sitemap discounted.
 *
 * EVERY ENTRY IS PUBLIC, and on a sitemap that is a rule rather than a convention. A sitemap served
 * from `/journal/sitemap.xml` may only declare URLs at or below `/journal/` — that is what makes a
 * sitemap outside the origin root legal at all — so a mount-relative `<loc>` here is not merely a
 * broken link, it is a cross-path submission every crawler discards, taking the valid entries
 * around it with it.
 */
export function journalSitemap(
  articles: readonly Article[],
  tags: readonly Tag[],
  lastChanged: string,
): readonly SitemapEntry[] {
  const dateOf = (article: Article): string => article.updatedAt ?? article.publishedAt
  const newestIn = (slug: string): string => {
    const dates = articles.filter((a) => a.tags.includes(slug)).map(dateOf).sort()
    return dates[dates.length - 1] ?? lastChanged
  }
  return [
    { path: publicPath('/'), lastmod: lastChanged },
    { path: publicPath('/topics'), lastmod: lastChanged },
    { path: publicPath('/about'), lastmod: lastChanged },
    ...tags.map((tag) => ({ path: publicPath(topicPath(tag.slug)), lastmod: newestIn(tag.slug) })),
    ...articles.map((article) => ({
      path: publicPath(articlePath(article.slug)),
      lastmod: dateOf(article),
    })),
  ]
}

export function sitemapXml(entries: readonly SitemapEntry[], origin: string): string {
  const urls = entries
    .map(
      (entry) =>
        `  <url><loc>${escapeXml(`${origin}${entry.path}`)}</loc><lastmod>${
          entry.lastmod
        }</lastmod></url>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

/*
 * ── THERE WAS A `robotsTxt()` HERE, AND MOVING TO A FOLDER IS WHAT DELETED IT ────────────────────
 *
 * It emitted `Disallow: /search` and a `Sitemap:` line, and it was correct for as long as this
 * publication was a hostname of its own.
 *
 * `robots.txt` IS READ AT THE ORIGIN ROOT AND NOWHERE ELSE. There is no such thing as a robots file
 * for a subdirectory: `/journal/robots.txt` is a document no crawler will ever request. Keeping it
 * would have been worse than deleting it — the only copy of the `Disallow: /search` rule would sit
 * in a file nothing reads, while `/journal/search?q=…` became crawlable for the first time, which
 * is the exact way an archive of forty pages acquires four thousand and is then treated as one.
 *
 * Both lines moved to the apex's own robots.txt in micro-site, which is the document that governs
 * this path now:
 *
 *     Disallow: /journal/search
 *     Sitemap: https://<host>/journal/sitemap.xml
 *
 * The `$cf_env` gate went with them and is better there. The apex already answers `Disallow: /` on
 * every non-mainnet hostname, so the testnet copy of this archive is refused by the host serving it
 * rather than by a rule this repository has to remember to keep — and the duplicate-content
 * argument that rule exists for was never about the journal in particular.
 *
 * `sitemap.xml` did NOT move, and the asymmetry is not an oversight: a sitemap may live at any path
 * as long as every URL in it sits under that path, and this one is built from `content/index.ts`,
 * which is here.
 */
