/**
 * Every article, as one list.
 *
 * ── THE IMPORTS ARE WRITTEN OUT, AND THAT IS DELIBERATE ──────────────────────────────────────────
 *
 * Vite offers `import.meta.glob('./articles/*.ts')`, which would make this file two lines and make
 * every article discoverable by existing. It is not used, for three reasons that all point the same
 * way:
 *
 *   - `scripts/prerender.ts` runs under plain Node with tsx, not under vite. `import.meta.glob` is
 *     a vite transform; under Node it is `undefined` and the prerender would emit an empty site
 *     with a green build.
 *   - The ORDER of a glob is the filesystem's. This list is sorted by date below, but a glob makes
 *     the file NAME load-bearing in a way nobody writes down, and renaming a draft would silently
 *     reorder the archive.
 *   - A file that is not imported is not published. Dropping a half-written article into the folder
 *     should do nothing at all until somebody adds the line here — that is what makes the folder
 *     safe to work in.
 *
 * Eight lines of imports against a category of silent failure is a good trade.
 */
import type { Article } from './types.ts'
import { TAGS } from './tags.ts'
import { article as cryptoWithoutTheCryptoWords } from './articles/crypto-without-the-crypto-words.ts'
import { article as whyWeBuiltOurOwnChain } from './articles/why-we-built-our-own-chain.ts'
import { article as aTourOfCloudsforge } from './articles/a-tour-of-cloudsforge.ts'
import { article as theHealthyWayToHoldCrypto } from './articles/the-healthy-way-to-hold-crypto.ts'
import { article as nineWaysPeopleLoseCrypto } from './articles/nine-ways-people-lose-crypto.ts'

/**
 * The archive, newest first.
 *
 * Sorted HERE rather than by the order of the imports, so that the published order is a property of
 * the dates in the articles and not of anybody's diff. `publishedAt` is an ISO date, which sorts
 * lexicographically, so the comparison needs no Date object — and a Date object is exactly what a
 * prerender must not depend on, because two builds of one commit have to produce identical bytes.
 */
export const ARTICLES: readonly Article[] = [
  cryptoWithoutTheCryptoWords,
  whyWeBuiltOurOwnChain,
  aTourOfCloudsforge,
  theHealthyWayToHoldCrypto,
  nineWaysPeopleLoseCrypto,
]
  .slice()
  .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0))

export function articleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug)
}

/** Every article carrying a tag, newest first. */
export function articlesByTag(tagSlug: string): readonly Article[] {
  return ARTICLES.filter((a) => a.tags.includes(tagSlug))
}

/**
 * The most recent date anything was published or edited.
 *
 * Used for the feed's `lastBuildDate` and nothing else. Derived from the content rather than from
 * the clock, because a build stamped with the build time makes every rebuild look like new content
 * to a feed reader — which is how a blog that has not changed in a month lands in somebody's unread
 * pile eight times.
 */
export function lastChangedAt(): string {
  return ARTICLES.map((a) => a.updatedAt ?? a.publishedAt).reduce((a, b) => (a > b ? a : b))
}

/**
 * Up to three more to read, for the foot of an article.
 *
 * Ranked by shared tags, then by recency, and NEVER including the article itself. Written as a
 * plain sort rather than anything cleverer because the archive is small: at five articles a
 * similarity model and `filter(sort(...))` produce identical output, and only one of them can be
 * read in a code review.
 *
 * It always returns something — falling back to the newest others — because a related-articles
 * block that renders empty on the one article nobody else shares a tag with is a hole in the page
 * exactly where a reader is deciding whether to stay.
 */
export function relatedTo(article: Article, limit = 3): readonly Article[] {
  const shared = (other: Article): number =>
    other.tags.filter((tag) => article.tags.includes(tag)).length
  return ARTICLES.filter((other) => other.slug !== article.slug)
    .slice()
    .sort((a, b) => {
      const byShared = shared(b) - shared(a)
      if (byShared !== 0) return byShared
      return a.publishedAt < b.publishedAt ? 1 : -1
    })
    .slice(0, limit)
}

/**
 * The tags that actually have articles, in the order `TAGS` declares them.
 *
 * `test/content.test.ts` asserts this is the whole of `TAGS` — an empty topic page is a dead end in
 * the sitemap — so in a green tree this is `TAGS`. It is computed anyway, because the thing that
 * must never happen is the topics INDEX linking a page with nothing on it, and a derivation that
 * cannot do that is better than a test that says nobody did.
 */
export function populatedTags(): readonly { slug: string; name: string; count: number }[] {
  return TAGS.map((tag) => ({
    slug: tag.slug,
    name: tag.name,
    count: articlesByTag(tag.slug).length,
  })).filter((tag) => tag.count > 0)
}

/**
 * Everything an article's text says, flattened, for the client-side search.
 *
 * ── THE SEARCH IS IN THE BROWSER, AND THAT IS THE WHOLE DESIGN ───────────────────────────────────
 *
 * There is no search service and no search API, because there is nothing to ask: the entire corpus
 * is five articles that are already in the bundle the reader has downloaded. A round trip to ask a
 * server about text the browser is holding would be slower, would need a service to deploy, and
 * would put a log of what every reader searched for on a machine we own. None of those is a cost
 * worth paying at this size, and the day the archive is large enough for it to be, the shape of
 * this function is what changes rather than the shape of the page.
 */
export function searchText(article: Article): string {
  const blocks = article.body
    .map((block) => {
      switch (block.kind) {
        case 'ul':
        case 'ol':
          return block.items.join(' ')
        case 'quote':
          return `${block.text} ${block.cite ?? ''}`
        case 'callout':
          return `${block.title} ${block.text}`
        case 'figure':
          return `${block.alt} ${block.caption}`
        default:
          return block.text
      }
    })
    .join(' ')
  return `${article.title} ${article.dek} ${article.description} ${article.tags.join(' ')} ${blocks}`
}

/**
 * Articles matching a query, best first.
 *
 * Scored rather than filtered: a word in the title says more than the same word in the ninth
 * paragraph, and a reader typing two words means both. Every term must appear SOMEWHERE for a
 * result to count, which is the difference between a search and a list of vaguely related things.
 */
export function search(query: string): readonly Article[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 1)
  if (terms.length === 0) return []

  return ARTICLES.map((article) => {
    const title = article.title.toLowerCase()
    const haystack = searchText(article).toLowerCase()
    let score = 0
    for (const term of terms) {
      if (!haystack.includes(term)) return { article, score: 0 }
      score += title.includes(term) ? 10 : 1
    }
    return { article, score }
  })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((hit) => hit.article)
}
