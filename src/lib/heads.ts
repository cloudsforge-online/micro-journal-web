/**
 * Every page this surface writes to disk, paired with the head that belongs to it.
 *
 * ── WHY THIS EXISTS SEPARATELY FROM THE PAGES ────────────────────────────────────────────────────
 *
 * `renderToStaticMarkup` returns a BODY. It runs no effects, and `components/head.tsx` applies its
 * tags in one — deliberately, because the alternative is React 19's native `<title>` hoisting, which
 * mutates a document the prerender does not have. So the head cannot be recovered from the render;
 * it has to be computed beside it.
 *
 * The obvious place to compute it is inside `scripts/prerender.ts`, and that is the version that
 * drifts. The script would hold its own opinion of which builder each address uses and which
 * description goes with it, nothing would compare the two, and the first symptom would be an article
 * shared on a chat app showing the archive's title — visible to strangers, invisible to us.
 *
 * So the pairing lives here, in `src`, next to the constants it uses; the script consumes it, and
 * `test/seo.test.ts` walks `dist` and asserts that every file's head is byte-identical to
 * `renderHead()` of the entry below that claims it. The pages go on calling the builders directly
 * with the same imported constants, which is what leaves nothing for the two copies to disagree
 * about.
 *
 * ── `/404` IS IN THE LIST AND IS NOT A ROUTE ─────────────────────────────────────────────────────
 *
 * It is a file, `dist/404.html`, that nginx serves under a real 404 status — see `nginx.conf`. It
 * carries a canonical of `/404`, which no crawler will ever request and which is better than the
 * alternatives: no canonical at all leaves the tag inherited from `index.html` by anyone who copies
 * the file, and a canonical pointing at `/` would tell a search engine the archive and the error page
 * are the same document.
 */
import { authorById } from '../content/authors.ts'
import { ARTICLES, articlesByTag } from '../content/index.ts'
import { TAGS, tagBySlug } from '../content/tags.ts'
import type { Article } from '../content/types.ts'
import { SURFACE_DESCRIPTION } from './hosts.ts'
import {
  aboutHead,
  articleHead,
  homeHead,
  notFoundHead,
  searchHead,
  topicHead,
  topicsHead,
  type PageHead,
} from './meta.ts'
import { wordCount } from './reading.ts'
import { ABOUT_DESCRIPTION } from '../pages/about.tsx'
import { NOT_FOUND_DESCRIPTION } from '../pages/not-found.tsx'
import { SEARCH_DESCRIPTION } from '../pages/search.tsx'
import { TOPICS_DESCRIPTION } from '../pages/topics.tsx'

/**
 * One article's head, composed exactly as `pages/article.tsx` composes it.
 *
 * The three facts are resolutions the head builder deliberately does not do for itself — it would
 * have to import the author table and the tag table for the sake of two strings — so they are
 * resolved by whoever already holds both. There are two such callers, and this is the one the
 * prerender uses.
 */
export function articlePageHead(article: Article): PageHead {
  return articleHead(article, {
    wordCount: wordCount(article),
    authorName: authorById(article.authorId).name,
    sectionNames: article.tags.map((slug) => tagBySlug(slug)?.name ?? slug),
  })
}

export interface PageEntry {
  /** The address, with a leading slash and no trailing one except at the root. */
  readonly path: string
  /**
   * Where the file goes, relative to `dist`. Every route is a DIRECTORY with an `index.html` in it,
   * so `/a/slug` is served at `/a/slug` and at `/a/slug/` without a redirect between them — except
   * the 404, which nginx names directly and which therefore cannot be one.
   */
  readonly file: string
  readonly head: PageHead
}

/**
 * Every file the prerender writes, in the order it writes them.
 *
 * `test/prerender.test.ts` cross-checks this against `ROUTES` in `routes.ts`: every non-wildcard
 * route appears exactly once, and every wildcard route has at least one child here. That is the
 * check that catches an article added to `content/index.ts` and never given a page, and a route
 * added to the table that the build silently never writes a file for.
 */
export function pageEntries(): readonly PageEntry[] {
  const entries: PageEntry[] = [
    { path: '/', file: 'index.html', head: homeHead(SURFACE_DESCRIPTION) },
    { path: '/topics', file: 'topics/index.html', head: topicsHead(TOPICS_DESCRIPTION) },
    { path: '/about', file: 'about/index.html', head: aboutHead(ABOUT_DESCRIPTION) },
    { path: '/search', file: 'search/index.html', head: searchHead(SEARCH_DESCRIPTION) },
    { path: '/404', file: '404.html', head: notFoundHead(NOT_FOUND_DESCRIPTION) },
  ]
  for (const article of ARTICLES) {
    entries.push({
      path: `/a/${article.slug}`,
      file: `a/${article.slug}/index.html`,
      head: articlePageHead(article),
    })
  }
  for (const tag of TAGS) {
    if (articlesByTag(tag.slug).length === 0) continue
    entries.push({
      path: `/topics/${tag.slug}`,
      file: `topics/${tag.slug}/index.html`,
      head: topicHead(tag, articlesByTag(tag.slug).length),
    })
  }
  return entries
}
