/**
 * The head of every page: the estate's shared metadata, plus the three things a PUBLICATION needs
 * that no other surface does.
 *
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 * THIS DOES NOT REIMPLEMENT `@cloudsforge/ui/seo`, AND THE RESTRAINT IS THE WHOLE POINT.
 *
 * That module opens by recording what it was created to end: the estate's SEO was not missing, it
 * was SIXTEEN INDEPENDENT COPIES, and they had already drifted inside a single repository. A
 * publication is exactly the surface that feels entitled to its own — it has titles, cards,
 * canonicals and a feed, and every one of those is a plausible excuse for a seventeenth copy.
 *
 * So the title, the description, the canonical path, the robots directive and the whole Open Graph
 * and Twitter block are composed by `surfaceMeta()` and `metaTags()` upstream, from the registry
 * row. What is added here is only what a shared module for thirteen apps could not reasonably know:
 *
 *   1. `og:type: article` and the `article:*` tags, for a page that IS a piece of writing.
 *   2. JSON-LD — `Article`, `BreadcrumbList`, `WebSite` with a real `SearchAction`.
 *   3. A STRING renderer. Upstream applies tags to a live DOM, and says plainly that it "does not
 *      pre-render" and that link-preview fetchers therefore get whatever the shell carries. This
 *      surface is the one where that trade is unacceptable, so `renderHead()` produces the same
 *      tags as text for `scripts/prerender.ts` to write into a file.
 *
 * Item 3 is a genuine gap upstream rather than a special case, and if a second surface ever
 * prerenders, this function is what moves up rather than what gets copied.
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * ── `__CF_ORIGIN__` ──────────────────────────────────────────────────────────────────────────────
 *
 * A canonical link, an `og:url` and a JSON-LD `@id` must be ABSOLUTE; there is no relative form the
 * standards accept. At build time there is no host to write. Baking one in is the failure that does
 * not look like one — a canonical tag naming another origin does not break the page, it hands every
 * search engine a signed statement that the real copy of this article lives somewhere else, and a
 * preview deployment quietly claims to be production.
 *
 * So the placeholder is written to disk and nginx replaces it with `https://$host` on the way out,
 * per request (see `nginx.conf`). In the browser the same builders are called with the real origin,
 * so the tags the reader ends up with are the ones already in the file.
 */
import {
  applyHead as applySurfaceHead,
  canonicalHref,
  metaTags,
  surfaceMeta,
  type MetaTag,
  type SurfaceMeta,
} from '@cloudsforge/ui/seo'
import type { Article, Tag } from '../content/types.ts'
import { articlePath, topicPath } from './routes.ts'

/** What the prerender writes where an origin belongs. Replaced by nginx, never by a bundler. */
export const ORIGIN_PLACEHOLDER = '__CF_ORIGIN__'

/** The two markers `index.html` carries and `scripts/prerender.ts` replaces between. */
export const HEAD_START = '<!-- cf:head:start -->'
export const HEAD_END = '<!-- cf:head:end -->'

/** The publication's own name, for the places a publication is named rather than the company. */
export const PUBLICATION = 'Forge Journal'

export interface ArticleTags {
  readonly publishedAt: string
  readonly modifiedAt: string
  readonly sections: readonly string[]
}

export interface PageHead {
  /** Everything the registry already knows how to say about a page on this surface. */
  readonly meta: SurfaceMeta
  /** `article` only on `/a/<slug>`. Everything else on a publication is still a `website`. */
  readonly kind: 'website' | 'article'
  /** Present exactly when `kind` is `article`. */
  readonly article: ArticleTags | null
  /** Structured data, one object per `<script type="application/ld+json">`. */
  readonly jsonLd: readonly Record<string, unknown>[]
}

function absolute(path: string, origin: string): string {
  return origin === '' ? path : `${origin}${path}`
}

/**
 * The publisher, as schema.org understands it.
 *
 * No `url` field, and that is not an omission. Every other absolute URL on this surface is the
 * origin serving THIS page, which nginx knows; the marketing site's address is a DIFFERENT host,
 * derived at runtime from the surface registry, and there is nothing at build time that could write
 * it down. A publisher with a name and a logo is valid; one with a guessed URL would be confidently
 * wrong on every origin but one.
 */
function publisher(origin: string): Record<string, unknown> {
  return {
    '@type': 'Organization',
    name: 'CloudsForge',
    logo: {
      '@type': 'ImageObject',
      url: absolute('/favicon-512x512.png', origin),
      width: 512,
      height: 512,
    },
  }
}

function breadcrumb(
  trail: readonly (readonly [string, string])[],
  origin: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, path], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: absolute(path, origin),
    })),
  }
}

export function homeHead(description: string, origin: string = ORIGIN_PLACEHOLDER): PageHead {
  return {
    meta: surfaceMeta('journal', { description, path: '/' }),
    kind: 'website',
    article: null,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${absolute('/', origin)}#site`,
        name: PUBLICATION,
        alternateName: 'CloudsForge Journal',
        url: absolute('/', origin),
        description,
        inLanguage: 'en-GB',
        publisher: publisher(origin),
        // The search box a result page may offer beneath the site's own entry. It is honest here in
        // a way it usually is not: `/search` is a real prerendered page and the parameter really
        // is `q`, so a reader sent straight there by a search engine lands somewhere that works.
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${absolute('/search', origin)}?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }
}

/**
 * What an `Article` block needs that an `Article` record does not carry.
 *
 * `authorId` and `tags` are ids; schema.org wants the NAMES a reader would recognise, and resolving
 * them here would make this module import the author table and the tag table for the sake of two
 * strings. Passed in from the one caller that already holds both.
 */
export interface ArticleFacts {
  readonly wordCount: number
  readonly authorName: string
  readonly sectionNames: readonly string[]
}

export function articleHead(
  article: Article,
  facts: ArticleFacts,
  origin: string = ORIGIN_PLACEHOLDER,
): PageHead {
  const path = articlePath(article.slug)
  const url = absolute(path, origin)
  // An unedited article reports its publication day as its modification day. Omitting the field is
  // the alternative and it is worse: a crawler with no modification date falls back to guessing
  // from HTTP headers, which change on every deploy of every article at once.
  const modifiedAt = article.updatedAt ?? article.publishedAt
  return {
    meta: surfaceMeta('journal', {
      title: article.title,
      description: article.description,
      path,
      image: article.card,
    }),
    kind: 'article',
    article: { publishedAt: article.publishedAt, modifiedAt, sections: facts.sectionNames },
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        '@id': `${url}#article`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        headline: article.title,
        description: article.description,
        image: [absolute(article.card, origin)],
        datePublished: article.publishedAt,
        dateModified: modifiedAt,
        author: { '@type': 'Organization', name: facts.authorName },
        publisher: publisher(origin),
        articleSection: facts.sectionNames,
        keywords: facts.sectionNames.join(', '),
        wordCount: facts.wordCount,
        inLanguage: 'en-GB',
        isPartOf: { '@id': `${absolute('/', origin)}#site` },
        isAccessibleForFree: true,
      },
      breadcrumb(
        [
          ['Latest', '/'],
          [article.title, path],
        ],
        origin,
      ),
    ],
  }
}

export function topicHead(tag: Tag, count: number, origin: string = ORIGIN_PLACEHOLDER): PageHead {
  const path = topicPath(tag.slug)
  return {
    meta: surfaceMeta('journal', { title: tag.name, description: tag.blurb, path }),
    kind: 'website',
    article: null,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${absolute(path, origin)}#collection`,
        name: tag.name,
        description: tag.blurb,
        url: absolute(path, origin),
        inLanguage: 'en-GB',
        isPartOf: { '@id': `${absolute('/', origin)}#site` },
        publisher: publisher(origin),
        mainEntity: { '@type': 'ItemList', numberOfItems: count },
      },
      breadcrumb(
        [
          ['Latest', '/'],
          ['Topics', '/topics'],
          [tag.name, path],
        ],
        origin,
      ),
    ],
  }
}

export function topicsHead(description: string, origin: string = ORIGIN_PLACEHOLDER): PageHead {
  return {
    meta: surfaceMeta('journal', { title: 'Topics', description, path: '/topics' }),
    kind: 'website',
    article: null,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${absolute('/topics', origin)}#collection`,
        name: 'Topics',
        description,
        url: absolute('/topics', origin),
        inLanguage: 'en-GB',
        isPartOf: { '@id': `${absolute('/', origin)}#site` },
        publisher: publisher(origin),
      },
      breadcrumb(
        [
          ['Latest', '/'],
          ['Topics', '/topics'],
        ],
        origin,
      ),
    ],
  }
}

export function aboutHead(description: string, origin: string = ORIGIN_PLACEHOLDER): PageHead {
  return {
    meta: surfaceMeta('journal', { title: 'About', description, path: '/about' }),
    kind: 'website',
    article: null,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        '@id': `${absolute('/about', origin)}#about`,
        name: 'About Forge Journal',
        description,
        url: absolute('/about', origin),
        inLanguage: 'en-GB',
        isPartOf: { '@id': `${absolute('/', origin)}#site` },
        publisher: publisher(origin),
      },
      breadcrumb(
        [
          ['Latest', '/'],
          ['About', '/about'],
        ],
        origin,
      ),
    ],
  }
}

/**
 * The search page and the 404, both `noindex`, for two different reasons.
 *
 * Search results are generated from a query somebody typed, so indexing them files every typo and
 * every scraped query string as a page of this publication — the classic way an archive of forty
 * pages acquires four thousand, and the classic way it then gets treated as one. The 404 is
 * `noindex` because it is not a page; the status code says so already and the tag says it again for
 * a crawler that ignored the status.
 *
 * `follow` on both. A reader who lands on either should still pass the crawler along to the real
 * pages linked from it; `nofollow` would strand the whole archive behind a dead end.
 */
export function searchHead(description: string, _origin: string = ORIGIN_PLACEHOLDER): PageHead {
  return {
    meta: surfaceMeta('journal', {
      title: 'Search',
      description,
      path: '/search',
      robots: 'noindex, follow',
    }),
    kind: 'website',
    article: null,
    jsonLd: [],
  }
}

export function notFoundHead(description: string, _origin: string = ORIGIN_PLACEHOLDER): PageHead {
  return {
    meta: surfaceMeta('journal', {
      title: 'Page not found',
      description,
      path: '/404',
      robots: 'noindex, follow',
    }),
    kind: 'website',
    article: null,
    jsonLd: [],
  }
}

/**
 * Every tag for a page: the estate's, with this surface's corrections applied.
 *
 * `metaTags()` hard-codes `og:type: website`, which is right for thirteen surfaces and wrong for
 * the one that publishes articles. It is REPLACED here rather than appended to — two `og:type`
 * tags in one document is not a smaller error than the wrong one, because which of them wins is
 * decided by whichever crawler is reading.
 */
export function headTags(page: PageHead, origin: string): readonly MetaTag[] {
  const base = metaTags(page.meta, origin).map((tag) =>
    tag.key === 'og:type' ? { ...tag, content: page.kind } : tag,
  )
  if (page.article === null) return base
  return [
    ...base,
    { kind: 'property', key: 'article:published_time', content: page.article.publishedAt },
    { kind: 'property', key: 'article:modified_time', content: page.article.modifiedAt },
    ...page.article.sections.map((section) => ({
      kind: 'property' as const,
      key: 'article:section',
      content: section,
    })),
  ]
}

/**
 * `&`, `<`, `>` and `"` in an attribute value.
 *
 * `'` is deliberately absent: every attribute this file emits is double-quoted, so an apostrophe is
 * already a literal, and escaping it anyway would put `&#39;` into the middle of prose that a
 * link-preview fetcher shows verbatim. A title with an apostrophe in it is not an edge case on this
 * surface, it is most of them.
 */
export function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * JSON, safe to sit inside a `<script>` element.
 *
 * The parser reading a `<script>` body looks for the literal `</script`, case-insensitively, and
 * stops there — inside a string, inside a comment, anywhere. So every `<` is written as its JSON
 * unicode escape, which a JSON parser reads back as `<` and the HTML tokeniser never sees at all.
 * Standard, and spelled out because this file is the ONLY place on this surface that composes raw
 * markup: everything else a reader sees goes through React, which escapes text on its own.
 */
export function jsonLdText(value: Record<string, unknown>): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

/**
 * The head block, exactly as it appears between the two markers in `index.html`.
 *
 * Four-space indent, one tag per line, no attribute wrapping — a fixed shape, because
 * `test/seo.test.ts` compares the output of this function against the bytes committed in
 * `index.html` and a formatter's opinion about line length would turn that check into noise.
 * Nothing in this repository reformats HTML, and the `//assets` note in package.json explains why
 * nothing in it runs a formatter over generated output either.
 */
export function renderHead(page: PageHead, origin: string = ORIGIN_PLACEHOLDER): string {
  const lines: string[] = [`<title>${escapeAttribute(page.meta.title)}</title>`]
  for (const tag of headTags(page, origin)) {
    lines.push(`<meta ${tag.kind}="${tag.key}" content="${escapeAttribute(tag.content)}" />`)
  }
  lines.push(`<link rel="canonical" href="${escapeAttribute(canonicalHref(page.meta, origin))}" />`)
  for (const block of page.jsonLd) {
    lines.push(`<script type="application/ld+json">${jsonLdText(block)}</script>`)
  }
  return lines.map((line) => `    ${line}`).join('\n')
}

/**
 * The same tags, applied to a live document as the reader navigates.
 *
 * The shared `applyHead()` does the title, the canonical and the thirteen tags it owns, updating
 * each IN PLACE — which is the property that stops a single-page app accumulating nine canonicals.
 * What is left for this function is what it does not know about: the `og:type` correction, the
 * `article:*` tags, and the JSON-LD.
 *
 * `article:section` is the one tag that repeats, so it cannot be updated in place by selector like
 * the others; every one is removed and rewritten. Leaving a stale section behind would tag a piece
 * about wallets with the topic of the article the reader was on before it.
 */
export function applyPageHead(page: PageHead, doc: Document, origin: string): void {
  applySurfaceHead(page.meta, origin)
  setMeta(doc, 'property', 'og:type', page.kind)
  setMeta(doc, 'property', 'article:published_time', page.article?.publishedAt ?? null)
  setMeta(doc, 'property', 'article:modified_time', page.article?.modifiedAt ?? null)
  for (const stale of Array.from(doc.head.querySelectorAll('meta[property="article:section"]'))) {
    stale.remove()
  }
  for (const section of page.article?.sections ?? []) {
    const element = doc.createElement('meta')
    element.setAttribute('property', 'article:section')
    element.setAttribute('content', section)
    doc.head.appendChild(element)
  }
  setJsonLd(doc, page.jsonLd)
}

function setMeta(doc: Document, attr: 'name' | 'property', key: string, value: string | null): void {
  const existing = doc.head.querySelector(`meta[${attr}="${key}"]`)
  if (value === null) {
    existing?.remove()
    return
  }
  if (existing) {
    existing.setAttribute('content', value)
    return
  }
  const element = doc.createElement('meta')
  element.setAttribute(attr, key)
  element.setAttribute('content', value)
  doc.head.appendChild(element)
}

/**
 * The structured-data blocks, replaced wholesale.
 *
 * Marked with `data-cf-ld` so this function can find the ones IT wrote and leave anything else
 * alone. Nothing else writes one today; the attribute costs a few bytes and means the day something
 * does — a third-party widget, a future shared module — this does not silently delete it.
 */
function setJsonLd(doc: Document, blocks: readonly Record<string, unknown>[]): void {
  for (const stale of Array.from(doc.head.querySelectorAll('script[data-cf-ld]'))) stale.remove()
  for (const block of blocks) {
    const element = doc.createElement('script')
    element.setAttribute('type', 'application/ld+json')
    element.setAttribute('data-cf-ld', '')
    element.textContent = jsonLdText(block)
    doc.head.appendChild(element)
  }
}
